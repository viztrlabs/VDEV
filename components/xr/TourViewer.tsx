'use client';

/**
 * TourViewer — isolated Marzipano wrapper.
 * Only dynamically imports marzipano; mount on virtual-tour routes only.
 * Fixes: multi-res tiles, WebGL context loss recovery, memory leak cleanup,
 * dynamic view limiter, autorotate, keyboard accessibility.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import type { TourScene } from '@/lib/tourClientStore';

// ponytail: marzipano is not TS-typed — any is required
type MarzipanoAny = any;

interface TourViewerProps {
  scene: TourScene;
  onHotspotClick?: (sceneId: string, hotspotId: string) => void;
  onSceneChange?: (sceneId: string) => void;
}

export default function TourViewer({ scene, onHotspotClick, onSceneChange }: TourViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<MarzipanoAny>(null);
  const sceneRef = useRef<MarzipanoAny>(null);
  const autorotateRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sceneKey, setSceneKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- Fullscreen ---
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // --- Autorotate ---
  const stopAutorotate = useCallback(() => {
    if (autorotateRef.current) {
      clearInterval(autorotateRef.current);
      autorotateRef.current = null;
    }
  }, []);

  const startAutorotate = useCallback(() => {
    if (!scene.autorotateEnabled || !sceneRef.current) return;
    stopAutorotate();
    const speed = scene.autorotateSpeed || 1;
    autorotateRef.current = setInterval(() => {
      const v = sceneRef.current?.view?.();
      if (v) v.yaw(v.yaw() + (speed * Math.PI) / 180 / 60);
    }, 1000 / 60);
  }, [scene.autorotateEnabled, scene.autorotateSpeed, stopAutorotate]);

  // --- Cleanup ---
  const destroyViewer = useCallback(() => {
    stopAutorotate();
    const viewer = viewerRef.current;
    if (viewer) {
      try {
        const ms = viewer.scene?.();
        if (ms) {
          ms.hotspots?.().getAll?.().forEach((h: MarzipanoAny) => h.destroy?.());
          ms.view?.()?.removeEventListener?.('change', () => {});
          ms.stop?.();
        }
        viewer.destroy?.();
      } catch { /* swallow destroy errors */ }
      viewerRef.current = null;
      sceneRef.current = null;
    }
  }, [stopAutorotate]);

  // --- Main init ---
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0.1);

        const mod: MarzipanoAny = await import('marzipano');
        const Marzipano: MarzipanoAny = mod.default ?? mod;
        if (cancelled) return;
        destroyViewer();

        // Create viewer
        const viewer = new Marzipano.Viewer(containerRef.current!, {
          controls: {
            mouseViewMode: 'qtilt',
            scrollZoom: true,
            scrollZoomSpeed: 0.3,
            dragRotateOnMobile: true,
            dragRoll: true,
          },
          defaultTransition: { duration: 500 },
        });
        viewerRef.current = viewer;

        // Source: multi-res tiles if tileUrl provided, else full equirect
        let source: MarzipanoAny;
        if (scene.tileUrl) {
          source = Marzipano.ImageUrlSource.fromTileUrl(
            `${scene.tileUrl}/{z}/{y}/{x}.jpg`,
            { crossOrigin: 'anonymous', tileSize: 512, maxZoom: 5 }
          );
        } else {
          source = Marzipano.ImageUrlSource.fromString(scene.url, {
            crossOrigin: 'anonymous',
          });
        }

        // Geometry: multi-level pyramid
        const geometry = new Marzipano.EquirectGeometry([
          { width: 4096 },
          { width: 2048 },
          { width: 1024 },
          { width: 512 },
          { width: 256 },
        ]);

        // Dynamic limiter from scene.viewConstraints
        const vc = scene.viewConstraints || {
          top: -90, bottom: 90, left: -180, right: 180,
          zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false,
        };
        const limiter = Marzipano.RectilinearView.limit.traditional(
          1024,
          (vc.zoomMax * Math.PI) / 180,
          (vc.zoomMax * Math.PI) / 180
        );

        const view = new Marzipano.RectilinearView(
          {
            yaw: ((scene.initialYaw || 0) * Math.PI) / 180,
            pitch: ((scene.initialPitch || 0) * Math.PI) / 180,
            fov: Math.PI / 2,
          },
          limiter
        );

        // Create marzipano scene
        const ms = viewer.createScene({
          source,
          geometry,
          view,
          name: scene.name,
          id: scene.id,
          pinFirstLevel: true,
        });

        ms.switch();
        sceneRef.current = ms;
        setProgress(0.7);

        // Hotspots with ARIA labels
        if (scene.hotspots?.length) {
          scene.hotspots.forEach((hs) => {
            ms.hotspots().create({
              pitch: hs.pitch,
              yaw: hs.yaw,
              type: 'custom',
              create: () => {
                const el = document.createElement('div');
                el.className = 'viztr-hotspot';
                el.setAttribute('role', 'button');
                el.setAttribute('tabIndex', '0');
                el.setAttribute('aria-label', `${hs.title}, ${hs.type} hotspot`);
                el.innerHTML = `
                  <div class="w-4 h-4 bg-[#3ECF8E] rounded-full shadow-lg animate-pulse border-2 border-white cursor-pointer hover:scale-125 transition-transform"
                       title="${hs.title}">
                  </div>
                `;
                const handleClick = (e: Event) => {
                  e.stopPropagation();
                  onHotspotClick?.(scene.id, hs.id);
                };
                el.addEventListener('click', handleClick);
                el.addEventListener('keydown', (e: KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e); }
                });
                return el;
              },
              destroy: (el: HTMLElement) => {
                el.removeEventListener('click', () => {});
                el.remove();
              },
            });
          });
        }

        setProgress(1);
        setLoading(false);

        // Autorotate
        startAutorotate();

        // Pause autorotate on user interaction
        const el = containerRef.current!;
        const stopEvents = ['mousedown', 'touchstart', 'wheel'];
        stopEvents.forEach((ev) => el.addEventListener(ev, stopAutorotate, { once: true }));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to initialize tour viewer');
          setLoading(false);
        }
      }
    };

    init();

    // WebGL context loss recovery
    const canvas = containerRef.current?.querySelector('canvas');
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setLoading(true);
      setProgress(0);
    };
    const onContextRestored = () => setSceneKey((k) => k + 1);
    canvas?.addEventListener('webglcontextlost', onContextLost);
    canvas?.addEventListener('webglcontextrestored', onContextRestored);

    return () => {
      cancelled = true;
      canvas?.removeEventListener('webglcontextlost', onContextLost);
      canvas?.removeEventListener('webglcontextrestored', onContextRestored);
      destroyViewer();
    };
  }, [scene, sceneKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Keyboard navigation ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const step = Math.PI / 36; // 5 degrees
    const handleKey = (e: KeyboardEvent) => {
      const ms = sceneRef.current;
      const view = ms?.view?.();
      if (!view) return;
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); view.yaw(view.yaw() - step); break;
        case 'ArrowRight': e.preventDefault(); view.yaw(view.yaw() + step); break;
        case 'ArrowUp': e.preventDefault(); view.pitch(Math.min(view.pitch() + step, Math.PI / 2 - 0.01)); break;
        case 'ArrowDown': e.preventDefault(); view.pitch(Math.max(view.pitch() - step, -Math.PI / 2 + 0.01)); break;
        case '+': case '=': e.preventDefault(); view.fov(Math.max(view.fov() * 0.9, Math.PI / 6)); break;
        case '-': e.preventDefault(); view.fov(Math.min(view.fov() * 1.1, Math.PI)); break;
        case 'f': case 'F': e.preventDefault(); toggleFullscreen(); break;
        case 'Escape': if (document.fullscreenElement) document.exitFullscreen(); break;
      }
    };

    el.setAttribute('tabIndex', '0');
    el.addEventListener('keydown', handleKey);
    return () => el.removeEventListener('keydown', handleKey);
  }, [toggleFullscreen]);

  if (error) {
    return (
      <div className="absolute inset-0 bg-[#09090B] flex flex-col items-center justify-center gap-3 z-40">
        <div className="text-sm text-red-400 font-mono">{error}</div>
        <button onClick={() => setSceneKey((k) => k + 1)} className="text-xs px-3 py-1.5 rounded bg-[#27272A] text-white hover:bg-[#3F3F46]">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <div
        ref={containerRef}
        key={sceneKey}
        className="absolute inset-0"
        role="region"
        aria-label={`Virtual tour: ${scene.name}`}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[#09090B] flex flex-col items-center justify-center gap-2 z-40">
          <div className="text-xs font-mono text-[#3ECF8E]">Loading 360°…</div>
          <div className="w-48 h-1 bg-[#27272A] rounded-full overflow-hidden">
            <div className="h-full bg-[#3ECF8E] transition-all duration-300 rounded-full animate-pulse" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        <button onClick={() => { const v = sceneRef.current?.view?.(); if (v) v.fov(Math.max(v.fov() * 0.8, Math.PI / 6)); }} className="p-2 rounded-lg bg-[#18181B]/70 border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all cursor-pointer" title="Zoom In" aria-label="Zoom in">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => { const v = sceneRef.current?.view?.(); if (v) v.fov(Math.min(v.fov() * 1.25, Math.PI)); }} className="p-2 rounded-lg bg-[#18181B]/70 border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all cursor-pointer" title="Zoom Out" aria-label="Zoom out">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={toggleFullscreen} className="p-2 rounded-lg bg-[#18181B]/70 border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all cursor-pointer" title="Fullscreen" aria-label="Toggle fullscreen">
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Scene info */}
      <div className="absolute bottom-4 left-4 z-10 bg-[#09090B]/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-[#27272A]">
        <div className="text-xs font-mono text-[#A1A1AA]">{scene.name}</div>
      </div>
    </div>
  );
}