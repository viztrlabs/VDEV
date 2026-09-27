'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, DoorOpen, Loader2, AlertTriangle, Move3D, ZoomIn, ZoomOut } from 'lucide-react';
import { xyPercentsToYawPitch, yawPitchToXYPercents } from '@/lib/marzipano/coords';

// ============================================================================
// Types
// ============================================================================

export type HotspotType =
  | 'metadata'
  | 'room_link'
  | 'image'
  | 'video'
  | 'info'
  | 'audio'
  | 'link';

export interface PreviewHotspot {
  id: string;
  xPercent: number;
  yPercent: number;
  title: string;
  type: HotspotType;
}

export interface PanoramaPreviewProps {
  panoramaUrl: string;
  hotspots: PreviewHotspot[];
  initialYaw?: number;
  initialPitch?: number;
  addMode?: boolean;
  onHotspotClick?: (hotspotId: string) => void;
  onHotspotPositionChange?: (hotspotId: string, xPercent: number, yPercent: number) => void;
  onViewChange?: (yawDeg: number, pitchDeg: number) => void;
  onRequestAddHotspot?: (xPercent: number, yPercent: number) => void;
  className?: string;
}

// ============================================================================
// Marzipano dynamic import (client-only, code-split)
// ============================================================================

let cachedMarzipano: any = null;
async function loadMarzipano() {
  if (cachedMarzipano) return cachedMarzipano;
  const mod: any = await import('marzipano');
  cachedMarzipano = mod.default || mod;
  return cachedMarzipano;
}

// ============================================================================
// Component
// ============================================================================

export default function PanoramaPreview({
  panoramaUrl,
  hotspots,
  initialYaw = 0,
  initialPitch = 0,
  addMode = false,
  onHotspotClick,
  onHotspotPositionChange,
  onViewChange,
  onRequestAddHotspot,
  className = '',
}: PanoramaPreviewProps) {
  const hasPanorama = Boolean(panoramaUrl && panoramaUrl.trim());
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const viewRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Sphere-anchored hotspot positions: id → screen pixels (null when the
  // hotspot is behind the camera). Recomputed on every view change so
  // markers stay glued to the scene while the artist looks around.
  const [projected, setProjected] = useState<Record<string, { x: number; y: number } | null>>({});
  // Local drag override (id → screen pixels) for instant visual feedback.
  const [dragPos, setDragPos] = useState<{ id: string; x: number; y: number } | null>(null);

  // Keep hotspots fresh for the view-change listener registered once at init.
  const hotspotsRef = useRef<PreviewHotspot[]>(hotspots);
  hotspotsRef.current = hotspots;

  // Hotspot drag state
  const draggingRef = useRef<{ id: string; pointerId: number } | null>(null);

  // -------------------------------------------------------------------------
  // Projection: equirect image percents ⇄ screen pixels
  // -------------------------------------------------------------------------
  // Hotspots are stored in equirect IMAGE coordinates (xPercent/yPercent of
  // the flat 360 image — the same convention the public viewer uses via
  // lib/marzipano/coords). Display positions come from Marzipano's
  // coordinatesToScreen on every view change, so markers move with the
  // image exactly like they do on the published tour.
  const reproject = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    const next: Record<string, { x: number; y: number } | null> = {};
    for (const h of hotspotsRef.current) {
      const { yaw, pitch } = xyPercentsToYawPitch(h.xPercent, h.yPercent);
      let screen: any = null;
      try {
        screen = view.coordinatesToScreen([yaw, pitch]);
      } catch {
        screen = null;
      }
      next[h.id] = screen ? { x: screen[0], y: screen[1] } : null;
    }
    setProjected(next);
  }, []);

  // -------------------------------------------------------------------------
  // Initialize Marzipano
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const init = async () => {
      try {
        if (!hasPanorama) {
          setLoading(false);
          setReady(false);
          setError(null);
          return;
        }
        setLoading(true);
        setError(null);
        const Marzipano = await loadMarzipano();
        if (cancelled || !containerRef.current) return;

        const viewer = new Marzipano.Viewer(containerRef.current, {
          controls: {
            mouseViewMode: 'drag',
            scrollZoom: true,
            touchViewMode: 'drag',
            dragRotate: true,
          },
        });
        viewerRef.current = viewer;

        const source = Marzipano.ImageUrlSource.fromString(panoramaUrl, {
          crossOrigin: 'anonymous',
        });

        const geometry = new Marzipano.EquirectGeometry([
          { width: 4096 },
          { width: 2048 },
          { width: 1024 },
          { width: 512 },
        ]);

        const limiter = Marzipano.RectilinearView.limit.traditional(
          1024,
          (120 * Math.PI) / 180,
          (120 * Math.PI) / 180,
        );

        const view = new Marzipano.RectilinearView(
          {
            yaw: (initialYaw * Math.PI) / 180,
            pitch: (initialPitch * Math.PI) / 180,
            fov: Math.PI / 2,
          },
          limiter,
        );
        viewRef.current = view;

        const scene = viewer.createScene({
          source,
          geometry,
          view,
          pinFirstLevel: true,
        });
        sceneRef.current = scene;
        scene.switchTo();

        // Track view changes for orientation bar + hotspot re-anchoring
        const handleViewChange = () => {
          if (!viewRef.current) return;
          const yaw = (viewRef.current.yaw() * 180) / Math.PI;
          const pitch = (viewRef.current.pitch() * 180) / Math.PI;
          onViewChange?.(yaw, pitch);
          reproject();
        };
        view.addEventListener('change', handleViewChange);

        setReady(true);
        setLoading(false);
      } catch (e: any) {
        console.error('Marzipano init error:', e);
        setError(e?.message || 'Failed to initialize 360° viewer');
        setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch {
          // ignore destroy errors during unmount
        }
        viewerRef.current = null;
        sceneRef.current = null;
        viewRef.current = null;
      }
    };
  }, [panoramaUrl]);

  // -------------------------------------------------------------------------
  // Update view when initialYaw/Pitch props change externally
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.yaw((initialYaw * Math.PI) / 180);
    viewRef.current.pitch((initialPitch * Math.PI) / 180);
  }, [initialYaw, initialPitch]);

  // -------------------------------------------------------------------------
  // Re-anchor markers whenever hotspots change or the viewer becomes ready
  // -------------------------------------------------------------------------
  useEffect(() => {
    reproject();
  }, [hotspots, ready, reproject]);

  // -------------------------------------------------------------------------
  // Hotspot drag handlers (overlay 2D)
  // -------------------------------------------------------------------------
  const onHotspotPointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      e.stopPropagation();
      e.preventDefault();
      draggingRef.current = { id, pointerId: e.pointerId };
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = draggingRef.current;
      if (!drag || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      // Instant visual feedback while dragging.
      setDragPos({ id: drag.id, x: px, y: py });
      // Persist in equirect image coords by unprojecting the pointer.
      const view = viewRef.current;
      if (!view || typeof view.screenToCoordinates !== 'function' || !onHotspotPositionChange) return;
      let yaw = 0;
      let pitch = 0;
      try {
        const coords = view.screenToCoordinates([px, py]);
        yaw = coords[0];
        pitch = coords[1];
      } catch {
        return;
      }
      const p = yawPitchToXYPercents(yaw, pitch);
      onHotspotPositionChange(
        drag.id,
        Math.round(p.x * 10) / 10,
        Math.round(p.y * 10) / 10,
      );
    },
    [onHotspotPositionChange],
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const drag = draggingRef.current;
    if (drag) {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(drag.pointerId);
      draggingRef.current = null;
    }
    setDragPos(null);
  }, []);

  // -------------------------------------------------------------------------
  // Click on background to add hotspot (when addMode)
  // -------------------------------------------------------------------------
  const onContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (!addMode || !containerRef.current || !onRequestAddHotspot) return;
      // Ignore clicks that originated on hotspot markers
      if ((e.target as HTMLElement).closest('[data-hotspot-marker]')) return;
      const rect = containerRef.current.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      // Unproject the click to the world position on the sphere, then store
      // it as equirect image percents — the same convention the public
      // viewer reads. Storing raw screen percents made hotspots drift away
      // from the clicked spot as soon as the camera moved.
      const view = viewRef.current;
      if (!view || typeof view.screenToCoordinates !== 'function') return;
      let yaw = 0;
      let pitch = 0;
      try {
        const coords = view.screenToCoordinates([px, py]);
        yaw = coords[0];
        pitch = coords[1];
      } catch {
        return;
      }
      const p = yawPitchToXYPercents(yaw, pitch);
      onRequestAddHotspot(
        Math.round(p.x * 10) / 10,
        Math.round(p.y * 10) / 10,
      );
    },
    [addMode, onRequestAddHotspot],
  );

  // -------------------------------------------------------------------------
  // Zoom controls
  // -------------------------------------------------------------------------
  const handleZoom = (direction: 'in' | 'out') => {
    if (!viewRef.current) return;
    const currentFov = viewRef.current.fov();
    const newFov =
      direction === 'in'
        ? Math.max(currentFov * 0.8, Math.PI / 6)
        : Math.min(currentFov * 1.25, Math.PI);
    viewRef.current.fov(newFov);
    setZoomLevel(direction === 'in' ? Math.min(zoomLevel + 0.2, 3) : Math.max(zoomLevel - 0.2, 0.5));
  };

  // -------------------------------------------------------------------------
  // Error / loading UI
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // Empty state (no panorama URL)
  // -------------------------------------------------------------------------
  if (!hasPanorama) {
    return (
      <div
        className={`flex items-center justify-center bg-black text-[#71717A] p-4 ${className}`}
      >
        <div className="text-xs font-mono space-y-1 text-center">
          <Move3D className="w-6 h-6 mx-auto mb-1 opacity-40" />
          <div className="text-[#A1A1AA]">No panorama image</div>
          <div>Upload a 360° image for this room to preview it here.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-black text-rose-300 p-4 ${className}`}
      >
        <div className="text-xs font-mono space-y-1 text-center">
          <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto" />
          <div className="font-bold">360° Viewer Error</div>
          <div className="text-rose-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full ${className}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={onContainerClick}
    >
      {/* Marzipano container */}
      <div
        ref={containerRef}
        className="absolute inset-0 bg-black"
        style={{ cursor: addMode ? 'crosshair' : 'grab' }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/70 text-[#3ECF8E]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <div className="text-xs font-mono">Initializing 360° viewer…</div>
        </div>
      )}

      {/* Hotspot markers (2D overlay, sphere-anchored) */}
      {ready &&
        hotspots.map((hotspot) => {
          const p = dragPos?.id === hotspot.id ? dragPos : projected[hotspot.id];
          if (!p) return null;
          return (
            <button
              key={hotspot.id}
              data-hotspot-marker
              onPointerDown={(e) => onHotspotPointerDown(e, hotspot.id)}
              onClick={(e) => {
                e.stopPropagation();
                onHotspotClick?.(hotspot.id);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-move touch-none"
              style={{
                left: `${p.x}px`,
                top: `${p.y}px`,
              }}
              title={hotspot.title}
            >
              <span
                className={`flex items-center justify-center w-5 h-5 rounded-full text-white shadow-lg ${
                  hotspot.type === 'room_link' ? 'bg-[#3ECF8E]' : 'bg-[#ec4899]'
                }`}
              >
                {hotspot.type === 'room_link' ? (
                  <DoorOpen className="w-3 h-3" />
                ) : (
                  <MapPin className="w-3 h-3" />
                )}
              </span>
            </button>
          );
        })}

      {/* Zoom controls (always visible) */}
      {ready && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-20">
          <button
            type="button"
            onClick={() => handleZoom('in')}
            className="p-1.5 rounded bg-black/60 backdrop-blur border border-white/10 text-white/80 hover:text-white hover:bg-black/80"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom('out')}
            className="p-1.5 rounded bg-black/60 backdrop-blur border border-white/10 text-white/80 hover:text-white hover:bg-black/80"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Add-mode hint */}
      {addMode && ready && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-[#3ECF8E] text-black text-[10px] font-mono font-bold animate-pulse">
          Click on the panorama to place a hotspot
        </div>
      )}
    </div>
  );
}
