'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  Maximize,
  AlertTriangle,
} from 'lucide-react';
import { useTourStore } from '@/lib/tourClientStore';
import type { TourHotspot } from '@/lib/tourClientStore';
import { useContextMenu } from './ContextMenu';

interface PanoramaViewportProps {
  roomId: string;
  activeTool: string;
  selectedHotspotId: string;
  onSelectHotspot: (id: string) => void;
}

const HOTSPOT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  link: Navigation,
  info: Info,
  image: Image,
  video: Video,
  audio: Music,
  product: Package,
};

export function PanoramaViewport({
  roomId,
  activeTool,
  selectedHotspotId,
  onSelectHotspot,
}: PanoramaViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const scenes = useTourStore((s) => s.scenes);
  const updateScene = useTourStore((s) => s.updateScene);
  const room = scenes.find((r) => r.id === roomId);
  const [currentYaw, setCurrentYaw] = useState(0);
  const [currentPitch, setCurrentPitch] = useState(0);
  const [currentFov, setCurrentFov] = useState(75);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const { showContextMenu } = useContextMenu();

  useEffect(() => {
    if (!containerRef.current || !room?.url) {
      setError(room?.url ? '' : 'No panorama image URL set');
      return;
    }

    let cancelled = false;

    const init = async () => {
      try {
        setError('');
        const Marzipano = (await import('marzipano')).default;
        if (cancelled || !containerRef.current) return;

        viewerRef.current?.destroy?.();

        const viewer = new Marzipano.Viewer(containerRef.current, {
          controls: {
            mouseViewMode: 'drag',
            scrollZoom: true,
          },
        });
        viewerRef.current = viewer;

        const source = Marzipano.ImageUrlSource.fromString(room.url);
        const geometry = new Marzipano.EquirectGeometry([{ width: 4096 }]);
        const limiter = Marzipano.RectilinearView.limit.traditional(4096, Math.PI / 2);
        const view = new Marzipano.RectilinearView(
          {
            yaw: ((room.initialYaw || 0) * Math.PI) / 180,
            pitch: ((room.initialPitch || 0) * Math.PI) / 180,
            fov: ((room.initialFov || 75) * Math.PI) / 180,
          },
          limiter
        );

        const ms = viewer.createScene({ source, geometry, view });
        ms.switch();
        sceneRef.current = ms;

        const sceneView = ms.view();
        if (sceneView) {
          sceneView.addEventListener('change', () => {
            setCurrentYaw(sceneView.yaw());
            setCurrentPitch(sceneView.pitch());
            setCurrentFov(sceneView.fov());
          });
        }
      } catch (err) {
        console.error('Failed to init Marzipano:', err);
        setError('Failed to load panorama');
      }
    };

    init();

    return () => {
      cancelled = true;
      viewerRef.current?.destroy?.();
      viewerRef.current = null;
    };
  }, [room?.url, room?.initialYaw, room?.initialPitch, room?.initialFov]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const items = [
        {
          label: 'Add Navigation Hotspot',
          icon: Navigation,
          shortcut: 'N',
          onClick: () => {
            if (!room) return;
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const yaw = ((e.clientX - rect.left) / rect.width - 0.5) * 2 * Math.PI;
            const pitch = ((e.clientY - rect.top) / rect.height - 0.5) * Math.PI;
            const newHotspot: TourHotspot = {
              id: `hs-${Date.now()}`,
              yaw,
              pitch,
              type: 'link',
              title: 'Navigate',
              description: '',
            };
            updateScene(room.id, {
              hotspots: [...(room.hotspots || []), newHotspot],
            });
            onSelectHotspot(newHotspot.id);
          },
        },
        {
          label: 'Add Info Hotspot',
          icon: Info,
          shortcut: 'F',
          onClick: () => {
            if (!room) return;
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const yaw = ((e.clientX - rect.left) / rect.width - 0.5) * 2 * Math.PI;
            const pitch = ((e.clientY - rect.top) / rect.height - 0.5) * Math.PI;
            const newHotspot: TourHotspot = {
              id: `hs-${Date.now()}`,
              yaw,
              pitch,
              type: 'info',
              title: 'Info',
              description: '',
            };
            updateScene(room.id, {
              hotspots: [...(room.hotspots || []), newHotspot],
            });
            onSelectHotspot(newHotspot.id);
          },
        },
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
            if (!sceneRef.current) return;
            const view = sceneRef.current.view();
            view.setYaw(((room?.initialYaw || 0) * Math.PI) / 180);
            view.setPitch(((room?.initialPitch || 0) * Math.PI) / 180);
            view.setFov(((room?.initialFov || 75) * Math.PI) / 180);
          },
        },
      ];
      showContextMenu(e.clientX, e.clientY, items, 'Viewport');
    },
    [room, currentYaw, currentPitch, currentFov, updateScene, onSelectHotspot, showContextMenu]
  );

  const handleClick = (e: React.MouseEvent) => {
    if (activeTool === 'select' || activeTool === 'move') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const yaw = (x - 0.5) * 2 * Math.PI;
    const pitch = (y - 0.5) * Math.PI;

    if (room && activeTool.startsWith('hotspot')) {
      const type = activeTool === 'hotspot-navigation' ? 'link' : 'info';
      const newHotspot: TourHotspot = {
        id: `hs-${Date.now()}`,
        yaw,
        pitch,
        type: type as any,
        title: type === 'link' ? 'Navigate' : 'Info',
        description: '',
      };
      updateScene(room.id, {
        hotspots: [...(room.hotspots || []), newHotspot],
      });
      onSelectHotspot(newHotspot.id);
    }
  };

  const handleZoomIn = () => {
    if (!sceneRef.current) return;
    const view = sceneRef.current.view();
    view.setFov(Math.max((room?.viewConstraints?.zoomMin || 30) * (Math.PI / 180), view.fov() - 0.1));
  };

  const handleZoomOut = () => {
    if (!sceneRef.current) return;
    const view = sceneRef.current.view();
    view.setFov(Math.min((room?.viewConstraints?.zoomMax || 120) * (Math.PI / 180), view.fov() + 0.1));
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
    if (!sceneRef.current || !room) return;
    const view = sceneRef.current.view();
    view.setYaw(((room.initialYaw || 0) * Math.PI) / 180);
    view.setPitch(((room.initialPitch || 0) * Math.PI) / 180);
    view.setFov(((room.initialFov || 75) * Math.PI) / 180);
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#09090B]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="text-sm font-mono text-[#71717A]">{error}</p>
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

      {room?.hotspots?.map((hs) => {
        const Icon = HOTSPOT_ICONS[hs.type] || MapPin;
        const isSelected = selectedHotspotId === hs.id;

        return (
          <div
            key={hs.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
              isSelected ? 'scale-125 z-10' : 'hover:scale-110'
            }`}
            style={{
              left: `${50 + ((hs.yaw || 0) / Math.PI) * 50}%`,
              top: `${50 + ((hs.pitch || 0) / Math.PI) * 50}%`,
            }}
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
                  : hs.type === 'link'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/90 text-[#09090B]'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
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
          className="w-8 h-8 rounded bg-[#09090B]/80 backdrop-blur-sm flex items-center justify-center hover:bg-[#27272A] transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 rounded bg-[#09090B]/80 backdrop-blur-sm flex items-center justify-center hover:bg-[#27272A] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={handleSetStartView}
          className="w-8 h-8 rounded bg-[#09090B]/80 backdrop-blur-sm flex items-center justify-center hover:bg-[#27272A] transition-colors"
          title="Set Start View (S)"
        >
          <Eye className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={handleResetView}
          className="w-8 h-8 rounded bg-[#09090B]/80 backdrop-blur-sm flex items-center justify-center hover:bg-[#27272A] transition-colors"
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

      {activeTool.startsWith('hotspot') && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-[#3ECF8E]/20 backdrop-blur-sm rounded px-3 py-1.5 text-xs font-mono text-[#3ECF8E]">
          Click to place {activeTool === 'hotspot-navigation' ? 'navigation' : 'info'} hotspot
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
