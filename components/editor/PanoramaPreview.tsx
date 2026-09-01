'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, DoorOpen, Loader2, AlertTriangle, Move3D, ZoomIn, ZoomOut } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const viewRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Hotspot drag state
  const draggingRef = useRef<{ id: string; pointerId: number } | null>(null);

  // -------------------------------------------------------------------------
  // Initialize Marzipano
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const init = async () => {
      try {
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

        // Track view changes for orientation bar
        const handleViewChange = () => {
          if (!viewRef.current || !onViewChange) return;
          const yaw = (viewRef.current.yaw() * 180) / Math.PI;
          const pitch = (viewRef.current.pitch() * 180) / Math.PI;
          onViewChange(yaw, pitch);
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
      const xPct = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
      );
      const yPct = Math.max(
        0,
        Math.min(100, ((e.clientY - rect.top) / rect.height) * 100),
      );
      onHotspotPositionChange?.(
        drag.id,
        Math.round(xPct * 10) / 10,
        Math.round(yPct * 10) / 10,
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
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      onRequestAddHotspot(
        Math.round(xPct * 10) / 10,
        Math.round(yPct * 10) / 10,
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

      {/* Hotspot markers (2D overlay) */}
      {ready &&
        hotspots.map((hotspot) => (
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
              left: `${hotspot.xPercent}%`,
              top: `${hotspot.yPercent}%`,
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
        ))}

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
