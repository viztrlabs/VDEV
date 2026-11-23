'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import {
  Share2,
  Box,
  Images,
  Globe,
  Headset,
  Camera,
  Cuboid,
  MonitorPlay,
  Compass,
  RotateCcw,
  Info,
  X,
  QrCode,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { detectCapabilities, type DeviceCapabilities, arFallbackMode, canRequestXR, launchQuickLook, requestARSession, requestVRSession } from '@/lib/xr/capabilities';
import { getServiceViewer } from '@/lib/xr/service-viewers';
import { useAppStore } from '@/lib/store';

export interface HubExperience {
  id: string;
  title: string;
  slug: string;
  config: Record<string, any> | null;
}

export interface HubService {
  projectServiceId: string;
  slug: string;
  name: string;
  icon: string;
  experiences: HubExperience[];
}

export interface HubProject {
  id: string;
  name: string;
  description: string;
}

export interface HubGalleryItem {
  id: string;
  url: string;
  type: 'image' | 'video';
}

const ExperienceViewer = dynamic(
  () => import('@/components/xr/ExperienceViewer').then((m) => m.ExperienceViewer),
  { ssr: false, loading: () => <RuntimeLoading /> }
);

function RuntimeLoading() {
  return (
    <div className="flex items-center justify-center h-full bg-[#131314]">
      <div className="text-zinc-500 font-mono text-xs animate-pulse">Loading runtime…</div>
    </div>
  );
}

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  webxr: Box,
  webar: Camera,
  'virtual-reality': Headset,
  'virtual-tour': Globe,
  'gaussian-splat': Cuboid,
  'pixel-streaming': MonitorPlay,
  'gallery-media': Images,
};

type IconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

/** The five canonical XR World services, always rendered in the HUD. */
const XR_SERVICES: Array<{
  slug: string;
  name: string;
  short: string;
  icon: IconComponent;
  accent: string;
}> = [
  { slug: 'webxr', name: 'WebXR', short: 'WebXR', icon: Box, accent: '#00E5FF' },
  { slug: 'webar', name: 'WebAR', short: 'AR', icon: Camera, accent: '#00E5FF' },
  { slug: 'virtual-reality', name: 'Virtual Reality', short: 'VR', icon: Headset, accent: '#FFB800' },
  { slug: 'virtual-tour', name: 'Virtual Tour', short: 'Tour', icon: Compass, accent: '#3ECF8E' },
  { slug: 'gaussian-splat', name: 'Gaussian Splat', short: 'Splat', icon: Cuboid, accent: '#3ECF8E' },
];

export default function ProjectExperienceHub({
  project,
  services,
  gallery,
}: {
  project: HubProject;
  services: HubService[];
  gallery: HubGalleryItem[];
}) {
  const searchParams = useSearchParams();
  const initial = searchParams.get('service');
  const servicesWithContent = services.filter(
    (s) => s.experiences.length > 0 || s.slug === 'gallery-media'
  );
  const contentSlugs = useMemo(
    () => new Set(servicesWithContent.map((s) => s.slug)),
    [servicesWithContent]
  );

  const [activeSlug, setActiveSlug] = useState<string>(
    initial && services.some((s) => s.slug === initial)
      ? initial
      : servicesWithContent[0]?.slug || services[0]?.slug || ''
  );
  const [caps, setCaps] = useState<DeviceCapabilities | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [shared, setShared] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [resetNonce, setResetNonce] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  // Bottom HUD bar doubles as the dom-overlay root so "Exit AR" stays tappable.
  const hudRef = useRef<HTMLDivElement>(null);

  // Immersive launch state lives in the store so the deep ExperienceViewer tree
  // can start a real XR session without losing the user-gesture context.
  const xrMode = useAppStore((s) => s.xrMode);
  const xrSession = useAppStore((s) => s.xrSession);
  const startXR = useAppStore((s) => s.startXR);
  const endXR = useAppStore((s) => s.endXR);
  const setXRError = useAppStore((s) => s.setXRError);

  useEffect(() => {
    detectCapabilities().then(setCaps).catch(() => setCaps(null));
  }, []);

  // Keep the URL service param in sync without a navigation/refetch.
  useEffect(() => {
    if (!activeSlug || typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('service') === activeSlug) return;
    url.searchParams.set('service', activeSlug);
    window.history.replaceState({}, '', url.toString());
  }, [activeSlug]);

  // The selected service (may have no published content yet).
  const active = useMemo(
    () => services.find((s) => s.slug === activeSlug) || servicesWithContent[0] || null,
    [services, servicesWithContent, activeSlug]
  );
  const activeExperience = active?.experiences[0] || null;

  // Service-driven viewer + launch mode (single source of truth).
  const serviceViewer = getServiceViewer(activeSlug);
  const launchMode = serviceViewer?.mode ?? null;
  const isAR = launchMode === 'immersive-ar';
  const isVR = launchMode === 'immersive-vr';

  // Best-effort USDZ asset for iOS AR Quick Look across common config shapes.
  const usdzUrl = useMemo(() => {
    const c = (activeExperience?.config || {}) as Record<string, any>;
    const url = c.usdz || c.quickLook?.usdz || c.ar?.usdz || c.ios?.quickLookUrl;
    return (url as string) || null;
  }, [activeExperience]);

  const selectService = useCallback(
    (slug: string) => {
      if (slug === activeSlug) return;
      if (xrMode) endXR();
      setLaunchError(null);
      setActiveSlug(slug);
    },
    [activeSlug, xrMode, endXR]
  );

  /**
   * Launch (or exit) an immersive session. MUST run from a click handler so the
   * browser's requestSession() keeps the user-gesture / camera-permission prompt.
   */
  const handleLaunchImmersive = useCallback(
    async (target: 'ar' | 'vr') => {
      setLaunchError(null);
      const xr = (navigator as any).xr;

      // iOS Quick Look (AR only) — requires a .usdz asset.
      if (target === 'ar' && caps?.ios && usdzUrl) {
        if (launchQuickLook(usdzUrl)) return;
        const m = 'AR Quick Look could not be opened on this device.';
        setLaunchError(m);
        setXRError(m);
        return;
      }

      const activeMode = target === 'ar' ? 'immersive-ar' : 'immersive-vr';
      if (xrMode === activeMode) {
        endXR();
        return;
      }

      const supported =
        target === 'ar' ? (caps?.webxrAR ?? canRequestXR()) : (caps?.webxrVR ?? canRequestXR());

      if (canRequestXR() && supported) {
        try {
          // requestARSession/requestVRSession call navigator.xr.requestSession
          // synchronously as their first action, preserving the gesture context.
          // The bottom HUD bar is the dom-overlay root so "Exit AR" stays tappable.
          const session =
            target === 'ar'
              ? await requestARSession(hudRef.current)
              : await requestVRSession();
          startXR(activeMode, session);
          return;
        } catch (e: any) {
          const m = e?.message || `Failed to start ${activeMode}.`;
          setLaunchError(m);
          setXRError(m);
          return;
        }
      }

      const m =
        !xr || !canRequestXR()
          ? 'WebXR is not available in this browser. Showing the interactive 3D preview instead.'
          : target === 'ar'
            ? 'Immersive AR is not supported on this device. Showing the 3D preview — scan the QR code to open on an AR-capable phone.'
            : 'Immersive VR is not supported on this device. Showing the 3D preview instead.';
      setLaunchError(m);
      setXRError(m);
    },
    [caps, usdzUrl, xrMode, startXR, endXR, setXRError]
  );

  // Minimal QR code generator (simplified visual pattern)
  const generateQr = useCallback((url: string) => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 256;
    const gridSize = 21;
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    const drawFinder = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const isDark = y <= 1 || y >= 5 || x <= 1 || x >= 5;
          grid[oy + y][ox + x] = isDark ? 1 : 0;
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(gridSize - 7, 0);
    drawFinder(0, gridSize - 7);
    for (let i = 8; i < gridSize - 8; i++) {
      grid[6][i] = i % 2;
      grid[i][6] = i % 2;
    }
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = '#131314';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#e5e2e3';
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (grid[y][x]) {
          const cell = size / gridSize;
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }
  }, []);

  // Draw the QR once the modal (and its canvas) has mounted.
  useEffect(() => {
    if (showQr) generateQr(window.location.href);
  }, [showQr, generateQr]);

  const share = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: project.name, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* user cancelled */
    }
  };

  const showQrCode = () => setShowQr(true);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const p = document.documentElement.requestFullscreen?.();
      if (p) p.then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      const p = document.exitFullscreen?.();
      if (p) p.then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const capabilityNote = useMemo(() => {
    if (!caps) return null;
    if (isVR) {
      return caps.webxrVR
        ? 'Headset detected — Enter VR available.'
        : 'No headset on this device — desktop preview shown.';
    }
    if (isAR) {
      const mode = arFallbackMode(caps);
      return mode === 'immersive'
        ? 'AR ready — live camera passthrough on this device.'
        : mode === 'quicklook'
          ? 'AR Quick Look available (iOS Safari).'
          : 'AR not supported here — interactive 3D preview + QR handoff.';
    }
    return null;
  }, [caps, isAR, isVR]);

  // Engine / mode badge for the left zone.
  const engineBadge = xrMode === 'immersive-ar'
    ? 'IWSDK • AR'
    : xrMode === 'immersive-vr'
      ? 'IWSDK • VR'
      : serviceViewer
        ? `${serviceViewer.engine.toUpperCase()}${serviceViewer.mode === 'immersive-ar' ? ' • AR' : serviceViewer.mode === 'immersive-vr' ? ' • VR' : ''}`
        : '—';

  const xrReady = !!(caps?.webxrAR || caps?.webxrVR || caps?.quickLook);
  const readyDotClass = xrMode
    ? 'bg-emerald-400 animate-pulse'
    : xrReady
      ? 'bg-emerald-400'
      : 'bg-amber-400';

  const extraServices = servicesWithContent.filter(
    (s) => !XR_SERVICES.some((x) => x.slug === s.slug)
  );

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#131314] text-[#e5e2e3]">
      {/* Full-bleed experience canvas */}
      <section className="absolute inset-0">
        {active?.slug === 'gallery-media' ? (
          <GalleryGrid items={gallery} onOpenLightbox={(url, type) => setLightbox({ url, type })} />
        ) : activeExperience ? (
          <div className="absolute inset-0">
            <ExperienceViewer
              key={`${project.id}-${activeSlug}-${activeExperience.id}-${xrMode ?? 'preview'}-${xrSession ? 'session' : 'preview'}-${resetNonce}`}
              experience={{ id: activeExperience.id, title: activeExperience.title }}
              config={{ config: activeExperience.config || {} }}
              serviceSlug={activeSlug}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm px-6">
              <p className="text-zinc-400 font-mono text-sm mb-1">
                No published experience for {active?.name || 'this service'} yet.
              </p>
              <p className="text-zinc-600 text-xs">
                VizTR will notify you when it goes live. You can still explore the other services below.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Info drawer (floating overlay) */}
      {showInfo && (
        <aside className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md z-40 rounded-xl border border-[#27272A] bg-[#080808]/95 backdrop-blur-xl p-4 shadow-2xl">
          <button
            onClick={() => setShowInfo(false)}
            className="absolute top-2.5 right-2.5 text-zinc-500 hover:text-white"
            aria-label="Close project info"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-bold mb-1 pr-6">{project.name}</h2>
          <p className="text-xs text-zinc-400">
            {project.description || 'Immersive project experiences by VizTR.'}
          </p>
          {shared && <p className="text-[11px] text-[#00E5FF] mt-2">Link copied to clipboard.</p>}
        </aside>
      )}

      {/* Bottom-docked Spatial HUD */}
      <div className="absolute bottom-0 left-0 right-0 z-40 px-2 pb-2 sm:px-4 sm:pb-4 pointer-events-none">
        {/* Launch error / status pill */}
        {(launchError || xrMode) && (
          <div className="mx-auto mb-2 max-w-3xl w-fit pointer-events-auto">
            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-mono backdrop-blur-md ${
                launchError
                  ? 'border-rose-500/50 bg-rose-950/80 text-rose-200'
                  : 'border-emerald-500/40 bg-emerald-950/70 text-emerald-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${launchError ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="truncate max-w-[70vw]">
                {launchError || (xrMode === 'immersive-ar' ? 'AR live — camera passthrough' : 'VR live')}
              </span>
              {launchError && (
                <button onClick={() => setLaunchError(null)} className="text-rose-300 hover:text-white px-0.5" aria-label="Dismiss">
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        <div
          ref={hudRef}
          className="pointer-events-auto mx-auto max-w-6xl rounded-2xl border border-[#27272A] bg-[#080808]/90 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2">
            {/* LEFT — project & engine status */}
            <div className="flex items-center gap-2 min-w-0 shrink-0">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 shrink-0">
                <Box className="w-4 h-4 text-[#00E5FF]" />
                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#080808] ${readyDotClass}`} />
              </div>
              <div className="min-w-0 hidden sm:block">
                <div className="truncate text-xs font-semibold leading-tight max-w-[160px]">{project.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#00E5FF] whitespace-nowrap">
                    {engineBadge}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 truncate max-w-[110px]">
                    {activeExperience?.title || active?.name || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* CENTER — 5 XR World service keys */}
            <nav
              className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1 min-w-0"
              aria-label="XR World services"
            >
              {XR_SERVICES.map((svc) => {
                const Icon = svc.icon;
                const isActive = activeSlug === svc.slug;
                const hasContent = contentSlugs.has(svc.slug);
                return (
                  <button
                    key={svc.slug}
                    onClick={() => selectService(svc.slug)}
                    title={svc.name}
                    aria-label={svc.name}
                    aria-pressed={isActive}
                    className={`group relative flex items-center gap-1.5 px-2 sm:px-2.5 py-2 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-white/[0.07] border-white/20'
                        : 'border-transparent hover:bg-white/[0.05]'
                    }`}
                    style={isActive ? { borderColor: `${svc.accent}66`, boxShadow: `0 0 0 1px ${svc.accent}22` } : undefined}
                  >
                    <span className="relative flex items-center justify-center">
                      <Icon
                        className="w-4 h-4"
                        style={{ color: isActive ? svc.accent : undefined }}
                      />
                      <span
                        className={`absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full border border-[#080808] ${
                          hasContent ? 'bg-[#3ECF8E]' : 'bg-[#FFB800]'
                        }`}
                      />
                    </span>
                    <span
                      className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-wider whitespace-nowrap ${
                        isActive ? 'inline text-white' : 'hidden md:group-hover:inline text-zinc-400'
                      }`}
                    >
                      {svc.short}
                    </span>
                  </button>
                );
              })}

              {extraServices.map((s) => {
                const Icon = SERVICE_ICONS[s.slug] || Box;
                const isActive = activeSlug === s.slug;
                return (
                  <button
                    key={s.projectServiceId}
                    onClick={() => selectService(s.slug)}
                    title={s.name}
                    aria-label={s.name}
                    className={`group relative hidden sm:flex items-center gap-1.5 px-2.5 py-2 rounded-xl border transition-all ${
                      isActive ? 'bg-white/[0.07] border-white/20 text-white' : 'border-transparent text-zinc-400 hover:bg-white/[0.05]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase tracking-wider whitespace-nowrap">
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* RIGHT — contextual primary action + utilities */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {launchMode && activeExperience && (
                <button
                  onClick={() => handleLaunchImmersive(isAR ? 'ar' : 'vr')}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#00d4e6] text-black text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isAR ? <Camera className="w-3.5 h-3.5" /> : <Headset className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">
                    {xrMode
                      ? 'Exit AR/VR'
                      : isAR
                        ? caps?.ios && usdzUrl
                          ? 'Open in AR'
                          : 'Launch AR Camera'
                        : 'Enter VR'}
                  </span>
                  <span className="sm:hidden">{xrMode ? 'Exit' : isAR ? 'AR' : 'VR'}</span>
                </button>
              )}

              <button
                onClick={showQrCode}
                title="QR mobile handoff"
                aria-label="QR mobile handoff"
                className="p-2 rounded-xl border border-[#27272A] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
              </button>
              <button
                onClick={() => setResetNonce((n) => n + 1)}
                title="Reset camera"
                aria-label="Reset camera"
                className="p-2 rounded-xl border border-[#27272A] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                aria-label="Toggle fullscreen"
                className="p-2 rounded-xl border border-[#27272A] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 transition-colors cursor-pointer"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={share}
                title="Share project"
                aria-label="Share project"
                className="p-2 rounded-xl border border-[#27272A] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 transition-colors cursor-pointer hidden sm:block"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowInfo((v) => !v)}
                title="Project info"
                aria-label="Project information"
                className="p-2 rounded-xl border border-[#27272A] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 transition-colors cursor-pointer hidden sm:block"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Capability note strip (only when relevant) */}
          {capabilityNote && (
            <div className="px-3 pb-2 -mt-0.5 text-[9px] font-mono text-zinc-500 truncate">
              {capabilityNote}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95" onClick={() => setLightbox(null)}>
          <div className="relative max-w-5xl max-h-[90vh] w-full h-[90vh] mx-4 my-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)} className="absolute -top-12 right-0 z-10 text-zinc-500 hover:text-white p-1">
              <X className="w-8 h-8" />
            </button>
            {lightbox.type === 'image' ? (
              <img src={lightbox.url} alt="" className="max-w-full max-h-[80vh] object-contain" />
            ) : (
              <video src={lightbox.url} controls autoPlay className="max-w-full max-h-[80vh]" />
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setShowQr(false)}>
          <div className="bg-[#201f20] rounded-xl p-6 max-w-sm w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Share via QR Code</h3>
              <button onClick={() => setShowQr(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <canvas ref={qrCanvasRef} className="mx-auto" width={256} height={256} />
            <p className="text-center text-xs text-zinc-500 mt-3">Scan to open on mobile</p>
            <button onClick={() => setShowQr(false)} className="mt-4 w-full px-4 py-2 rounded-lg bg-[#00E5FF] text-black font-mono text-xs uppercase tracking-wider">
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function GalleryGrid({ items, onOpenLightbox }: { items: HubGalleryItem[]; onOpenLightbox: (url: string, type: 'image' | 'video') => void }) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Images className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500 font-mono text-sm">No media published yet.</p>
          <p className="text-[11px] text-zinc-600 mt-1">Upload images or videos in the Builder.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 pb-28">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {items.map((item) =>
          item.type === 'image' ? (
            <div
              key={item.id}
              onClick={() => onOpenLightbox(item.url, 'image')}
              className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-[4/3] cursor-pointer"
            >
              <img src={item.url} alt="" loading="lazy" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-8 h-8 text-white mx-auto" />
              </div>
            </div>
          ) : (
            <div key={item.id} className="relative rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-[4/3]">
              <video src={item.url} controls preload="metadata" className="w-full h-full object-cover" onClick={(e) => e.stopPropagation()} />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-[10px] text-zinc-400 text-center">Click to play</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}