'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Info,
  X,
  QrCode,
  Maximize2,
  Minimize2,
  AlertCircle,
  CheckCircle2,
  WifiOff,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { detectCapabilities, type DeviceCapabilities, arFallbackMode, vrFallbackMode } from '@/lib/xr/capabilities';

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
    <div className="flex items-center justify-center h-full bg-[#0A0A0B]">
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
  const [activeSlug, setActiveSlug] = useState<string>(
    initial && servicesWithContent.some((s) => s.slug === initial)
      ? initial
      : servicesWithContent[0]?.slug || ''
  );
  const [caps, setCaps] = useState<DeviceCapabilities | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [shared, setShared] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    detectCapabilities().then(setCaps).catch(() => setCaps(null));
  }, []);

  const active = useMemo(
    () => servicesWithContent.find((s) => s.slug === activeSlug) || servicesWithContent[0] || null,
    [servicesWithContent, activeSlug]
  );

  const activeExperience = active?.experiences[0] || null;

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
    const drawTiming = () => {
      for (let i = 8; i < gridSize - 8; i++) {
        grid[6][i] = i % 2;
        grid[i][6] = i % 2;
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
    ctx.fillStyle = '#09090B';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#FAFAFA';
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (grid[y][x]) {
          const modSize = size / gridSize;
          ctx.fillRect(x * (size / gridSize), y * (size / gridSize), size / gridSize, size / gridSize);
        }
      }
    }
  }, []);

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

  const showQrCode = () => {
    generateQr(window.location.href);
    setShowQr(true);
  };

  const active = useMemo(
    () => servicesWithContent.find((s) => s.slug === activeSlug) || servicesWithContent[0] || null,
    [servicesWithContent, activeSlug]
  );

  const activeExperience = active?.experiences[0] || null;

  const capabilityNote = useMemo(() => {
    if (!caps) return null;
    if (activeSlug === 'virtual-reality') {
      return caps.webxrVR ? 'Headset detected — Enter VR available.' : 'No headset on this device — desktop preview shown.';
    }
    if (activeSlug === 'webar') {
      const mode = arFallbackMode(caps);
      return mode === 'immersive'
        ? 'AR ready on this device.'
        : mode === 'quicklook'
          ? 'AR Quick Look available (iOS).'
          : 'AR not supported here — interactive 3D preview shown.';
    }
    return null;
  }, [caps, activeSlug]);

  return (
    <main className="min-h-screen flex flex-col bg-[#09090B] text-[#FAFAFA]">
      {/* Header */}
      <header className="shrink-0 border-b border-zinc-800/80 bg-[#0C0C0E]/95 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold truncate">{project.name}</h1>
            <span className="shrink-0 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/30">
              Published
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 truncate">Project Experience · One unified destination</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowInfo((v) => !v)}
            className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
            aria-label="Project information"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={share}
            className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
            aria-label="Share project"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              generateQr(window.location.href);
              setShowQr(true);
            }}
            className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
            aria-label="Show QR code"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Info drawer */}
      {showInfo && (
        <aside className="shrink-0 border-b border-zinc-800 bg-[#0C0C0E] px-4 sm:px-6 py-4 relative">
          <button
            onClick={() => setShowInfo(false)}
            className="absolute top-3 right-3 text-zinc-500 hover:text-white"
            aria-label="Close project info"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-bold mb-1">{project.name}</h2>
          <p className="text-xs text-zinc-400 max-w-2xl">
            {project.description || 'Immersive project experiences by VizTR.'}
          </p>
          {shared && <p className="text-[11px] text-[#3ECF8E] mt-2">Link copied to clipboard.</p>}
        </aside>
      )}

      {/* Service switcher */}
      <nav className="shrink-0 border-b border-zinc-800/80 px-4 sm:px-6 py-2 flex gap-2 overflow-x-auto" aria-label="Services">
        {servicesWithContent.map((s) => {
          const Icon = SERVICE_ICONS[s.slug] || Box;
          const isActive = s.slug === active?.slug;
          return (
            <button
              key={s.projectServiceId}
              onClick={() => setActiveSlug(s.slug)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors border ${
                isActive
                  ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/40'
                  : 'text-zinc-400 border-zinc-800 hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {s.name}
            </button>
          );
        })}
      </nav>

      {/* Capability banner */}
      {capabilityNote && (
        <div className="shrink-0 px-4 sm:px-6 py-2 bg-zinc-900/60 border-b border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
          {activeSlug === 'virtual-reality' && <Headset className="w-3.5 h-3.5 text-[#3ECF8E]" />}
          {activeSlug === 'webar' && <Camera className="w-3.5 h-3.5 text-[#3ECF8E]" />}
          <span className="font-mono">{capabilityNote}</span>
        </div>
      )}

      {/* Active experience area */}
      <section className="flex-1 min-h-0 relative">
        {active?.slug === 'gallery-media' ? (
          <GalleryGrid items={gallery} onOpenLightbox={(url, type) => setLightbox({ url, type })} />
        ) : activeExperience ? (
          <div className="absolute inset-0">
            <ExperienceViewer
              experience={{ id: activeExperience.id, title: activeExperience.title }}
              config={{ config: activeExperience.config || {} }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-zinc-500 font-mono text-sm mb-1">No published experience for this service yet.</p>
              <p className="text-zinc-600 text-xs">VizTR will notify you when it goes live.</p>
            </div>
          </div>
        )}
      </section>

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
          <div className="bg-[#18181B] rounded-xl p-6 max-w-sm w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Share via QR Code</h3>
              <button onClick={() => setShowQr(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <canvas ref={qrCanvasRef} className="mx-auto" width={256} height={256} />
            <p className="text-center text-xs text-zinc-500 mt-3">Scan to open on mobile</p>
            <button onClick={() => setShowQr(false)} className="mt-4 w-full px-4 py-2 rounded-lg bg-[#00F0FF] text-black font-mono text-xs uppercase tracking-wider">
              Close
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setShowQr(false)}>
          <div className="bg-[#18181B] rounded-xl p-6 max-w-sm w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Share via QR Code</h3>
              <button onClick={() => setShowQr(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <canvas ref={qrCanvasRef} className="mx-auto" width={256} height={256} />
            <p className="text-center text-xs text-zinc-500 mt-3">Scan to open on mobile</p>
            <button onClick={() => setShowQr(false)} className="mt-4 w-full px-4 py-2 rounded-lg bg-[#00F0FF] text-black font-mono text-xs uppercase tracking-wider">
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
    <div className="h-full overflow-y-auto p-4 sm:p-6">
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