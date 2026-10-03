'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Info,
  Image,
  Video,
  Music,
  Package,
  Eye,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
} from 'lucide-react';
import { useTourStore } from '@/lib/tourClientStore';
import type { TourHotspot, HotspotType } from '@/lib/tourClientStore';
import { useContextMenu } from './ContextMenu';
import { useTourEngine } from '@/components/tour-viewer/useTourEngine';
import { setViewportView } from '@/lib/tour-builder/viewportView';

interface PanoramaViewportProps {
  roomId: string;
  activeTool: string;
  selectedHotspotId: string;
  onSelectHotspot: (id: string) => void;
  onViewportClick?: (yaw: number, pitch: number) => void;
}

const HOTSPOT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  link: Navigation,
  info: Info,
  image: Image,
  video: Video,
  audio: Music,
  product: Package,
};

const TOOL_TYPES: Record<string, HotspotType> = {
  'hotspot-navigation': 'navigation',
  'hotspot-info': 'info',
  'hotspot-link': 'link',
  'hotspot-gallery': 'gallery',
  'hotspot-model3d': 'model3d',
};

export function PanoramaViewport({
  roomId,
  activeTool,
  selectedHotspotId,
  onSelectHotspot,
  onViewportClick,
}: PanoramaViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scenes = useTourStore((s) => s.scenes);
  const updateScene = useTourStore((s) => s.updateScene);
  const room = scenes.find((r) => r.id === roomId);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [projected, setProjected] = useState<Record<string, { x: number; y: number } | null>>({});
  const { showContextMenu } = useContextMenu();

  const engine = useTourEngine(containerRef, {
    scenes,
    activeSceneId: roomId,
    transitionDuration: 300,
  });

  // Current view readout (rad) derives from the engine's published view.
  const currentYaw = engine.view.yaw;
  const currentPitch = engine.view.pitch;
  const currentFov = engine.view.fov;

  // Publish the viewport view (deg) for the Inspector.
  useEffect(() => {
    setViewportView({
      yaw: (engine.view.yaw * 180) / Math.PI,
      pitch: (engine.view.pitch * 180) / Math.PI,
      fov: (engine.view.fov * 180) / Math.PI,
    });
  }, [engine.view]);

  // Project hotspots from sphere coords to screen pixels on every view change
  // (PanoramaPreview pattern) so they stay glued to the scene.
  useEffect(() => {
    if (!room) { setProjected({}); return; }
    const v = engine.getCurrentScene()?.view?.();
    if (!v?.coordinatesToScreen) { setProjected({}); return; }
    const next: Record<string, { x: number; y: number } | null> = {};
    for (const hs of room.hotspots || []) {
      const p = v.coordinatesToScreen({ yaw: hs.yaw, pitch: hs.pitch });
      next[hs.id] = p ? { x: p.x, y: p.y } : null;
    }
    setProjected(next);
  }, [engine.view, room]); // eslint-disable-line react-hooks/exhaustive-deps

  const containerRect = () => containerRef.current?.getBoundingClientRect();

  const placeHotspot = useCallback(
    (clientX: number, clientY: number) => {
      if (!room) return;
      const rect = containerRect();
      if (!rect) return;
      const coords = engine.screenToCoordinates(clientX - rect.left, clientY - rect.top);
      if (!coords) return;
      const type = TOOL_TYPES[activeTool] || 'info';
      const newHotspot: TourHotspot = {
        id: `hs-${Date.now()}`,
        yaw: coords.yaw,
        pitch: coords.pitch,
        type,
        title: type === 'navigation' ? 'Navigate' : type === 'link' ? 'Link' : type === 'gallery' ? 'Gallery' : type === 'model3d' ? '3D Model' : 'Info',
        description: '',
      };
      updateScene(room.id, {
        hotspots: [...(room.hotspots || []), newHotspot],
      });
      onSelectHotspot(newHotspot.id);
    },
    [room, activeTool, engine, updateScene, onSelectHotspot],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const addItems = [
        {
          label: 'Add Navigation Hotspot',
          icon: Navigation,
          shortcut: 'N',
          onClick: () => placeHotspot(e.clientX, e.clientY),
        },
        {
          label: 'Add Info Hotspot',
          icon: Info,
          shortcut: 'F',
          onClick: () => placeHotspot(e.clientX, e.clientY),
        },
      ];
      const items = [
        ...addItems,
        { label: 'divider', divider: true },
        {
          label: 'Set as Start View',
          icon: Eye,
          onClick: () => {
            if (!room) return;
            updateScene(room.id, {
              initialYaw: (currentYaw * 180) / Math.PI,
              initialPitch: (currentPitch * 180) / Math.PI,
              initialFov: (currentFov * 180) / Math.PI,
            });
          },
        },
        {
          label: 'Reset View',
          icon: RotateCcw,
          onClick: () => {
            const v = engine.getCurrentScene()?.view?.();
            if (!v) return;
            v.setYaw(((room?.initialYaw || 0) * Math.PI) / 180);
            v.setPitch(((room?.initialPitch || 0) * Math.PI) / 180);
            v.setFov(((room?.initialFov || 75) * Math.PI) / 180);
          },
        },
      ];
      showContextMenu(e.clientX, e.clientY, items, 'Viewport');
    },
    [room, currentYaw, currentPitch, currentFov, engine, updateScene, placeHotspot, showContextMenu],
  );

  const handleClick = (e: React.MouseEvent) => {
    if (activeTool !== 'connect' && !TOOL_TYPES[activeTool]) return;
    if (activeTool === 'connect') {
      const rect = containerRect();
      if (!rect) return;
      const coords = engine.screenToCoordinates(e.clientX - rect.left, e.clientY - rect.top);
      if (!coords) return;
      onViewportClick?.(coords.yaw, coords.pitch);
      return;
    }
    placeHotspot(e.clientX, e.clientY);
  };

  const handleZoomIn = () => {
    const v = engine.getCurrentScene()?.view?.();
    if (!v) return;
    v.setFov(Math.max((room?.viewConstraints?.zoomMin || 30) * (Math.PI / 180), v.fov() - 0.1));
  };

  const handleZoomOut = () => {
    const v = engine.getCurrentScene()?.view?.();
    if (!v) return;
    v.setFov(Math.min((room?.viewConstraints?.zoomMax || 120) * (Math.PI / 180), v.fov() + 0.1));
  };

  const handleSetStartView = () => {
    if (!room) return;
    updateScene(room.id, {
      initialYaw: (currentYaw * 180) / Math.PI,
      initialPitch: (currentPitch * 180) / Math.PI,
      initialFov: (currentFov * 180) / Math.PI,
    });
  };

  const handleResetView = () => {
    const v = engine.getCurrentScene()?.view?.();
    if (!v || !room) return;
    v.setYaw(((room.initialYaw || 0) * Math.PI) / 180);
    v.setPitch(((room.initialPitch || 0) * Math.PI) / 180);
    v.setFov(((room.initialFov || 75) * Math.PI) / 180);
  };

  if (engine.error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#09090B]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="text-sm font-mono text-[#71717A]">{engine.error}</p>
        </div>
      </div>
    );
  }

  if (!room?.url) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#09090B]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="text-sm font-mono text-[#71717A]">No panorama image URL set</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <div
        ref={containerRef}
        className="absolute inset-0"
        onContextMenu={handleContextMenu}
        onClick={handleClick}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      />

      {engine.loading && (
        <div className="absolute inset-0 bg-[#09090B] flex items-center justify-center">
          <div className="text-xs font-mono text-[#3ECF8E] animate-pulse">Loading panorama…</div>
        </div>
      )}

      {(room?.hotspots || []).map((hs, idx) => {
        const p = projected[hs.id];
        if (!p) return null;
        const Icon = HOTSPOT_ICONS[hs.type] || MapPin;
        const isSelected = selectedHotspotId === hs.id;

        return (
          <div
            key={hs.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
              isSelected ? 'scale-125 z-10' : 'hover:scale-110'
            }`}
            style={{ left: p.x, top: p.y }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectHotspot(hs.id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              showContextMenu(e.clientX, e.clientY, [
                { label: 'Edit', icon: Eye, onClick: () => onSelectHotspot(hs.id) },
                { label: 'divider', divider: true },
                {
                  label: 'Delete',
                  icon: () => null,
                  danger: true,
                  onClick: () => {
                    if (!room) return;
                    updateScene(room.id, {
                      hotspots: room.hotspots.filter((h) => h.id !== hs.id),
                    });
                    onSelectHotspot('');
                  },
                },
              ]);
            }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                isSelected
                  ? 'bg-[#3ECF8E] text-black'
                  : hs.type === 'link' || hs.type === 'navigation'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/90 text-[#09090B]'
              }`}
              style={{ transform: `rotate(${hs.rotation ?? 0}deg)` }}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-1 px-1.5 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[9px] font-mono text-white whitespace-nowrap">
              {String(idx + 1).padStart(2, '0')}
            </span>
            {isSelected && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-0.5 rounded bg-[#09090B] text-[9px] font-mono text-white whitespace-nowrap">
                {hs.title || hs.type}
              </div>
            )}
          </div>
        );
      })}

      <div className="absolute top-3 left-3 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 rounded bg-[#09090B]/80 backdrop-blur-sm flex items-center justify-center hover:bg-[#27272A] transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 rounded bg-[#09090B]/80 backdrop-blur-sm flex items-center justify-center hover:bg-[#27272A] transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={handleSetStartView}
          className="w-8 h-8 rounded bg-[#09090B]/80 backdrop-blur-sm flex items-center justify-center hover:bg-[#27272A] transition-colors cursor-pointer"
          title="Set Start View (S)"
        >
          <Eye className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={handleResetView}
          className="w-8 h-8 rounded bg-[#09090B]/80 backdrop-blur-sm flex items-center justify-center hover:bg-[#27272A] transition-colors cursor-pointer"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 bg-[#09090B]/80 backdrop-blur-sm rounded px-2 py-1 text-[10px] font-mono text-[#71717A]">
        Yaw: {((currentYaw * 180) / Math.PI).toFixed(1)}° | Pitch:{' '}
        {((currentPitch * 180) / Math.PI).toFixed(1)}° | FOV:{' '}
        {((currentFov * 180) / Math.PI).toFixed(1)}°
      </div>

      {TOOL_TYPES[activeTool] && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-[#3ECF8E]/20 backdrop-blur-sm rounded px-3 py-1.5 text-xs font-mono text-[#3ECF8E]">
          Click to place {TOOL_TYPES[activeTool]} hotspot
        </div>
      )}

      {activeTool === 'connect' && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-[#3B82F6]/20 backdrop-blur-sm rounded px-3 py-1.5 text-xs font-mono text-[#3B82F6]">
          Click to set connection origin, then choose target room
        </div>
      )}

      {room && (
        <div className="absolute top-3 right-3 bg-[#09090B]/80 backdrop-blur-sm rounded px-2 py-1 text-[10px] font-mono text-[#71717A]">
          {room.name || 'Untitled Room'}
        </div>
      )}
    </div>
  );
}
