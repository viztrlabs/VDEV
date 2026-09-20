'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTourStore } from '@/lib/tourClientStore';

interface PanoramaViewportProps {
  roomId: string;
  activeTool: string;
  selectedHotspotId: string;
  onSelectHotspot: (id: string) => void;
}

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
  const room = scenes.find((r) => r.id === roomId);
  const [currentYaw, setCurrentYaw] = useState(0);
  const [currentPitch, setCurrentPitch] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !room?.url) return;

    let cancelled = false;

    const init = async () => {
      try {
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
            fov: Math.PI / 2,
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
          });
        }
      } catch (err) {
        console.error('Failed to init Marzipano:', err);
      }
    };

    init();

    return () => {
      cancelled = true;
      viewerRef.current?.destroy?.();
      viewerRef.current = null;
    };
  }, [room?.url, room?.initialYaw, room?.initialPitch]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (activeTool === 'select' || activeTool === 'move') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const yaw = (x - 0.5) * 2 * Math.PI;
    const pitch = (y - 0.5) * Math.PI;

    if (room && activeTool.startsWith('hotspot')) {
      const newHotspot = {
        id: `hs-${Date.now()}`,
        yaw,
        pitch,
        type: activeTool === 'hotspot-navigation' ? 'link' : 'info',
        title: 'New Hotspot',
        description: '',
      };
      const hotspots = [...(room.hotspots || []), newHotspot];
      useTourStore.getState().updateScene(roomId, { hotspots });
      onSelectHotspot(newHotspot.id);
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-crosshair"
        onContextMenu={handleContextMenu}
        onClick={handleClick}
      />

      {room?.hotspots?.map((hs) => (
        <div
          key={hs.id}
          className={`absolute w-4 h-4 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
            selectedHotspotId === hs.id
              ? 'bg-[#3ECF8E] ring-2 ring-white'
              : 'bg-amber-500 hover:bg-amber-400'
          }`}
          style={{
            left: `${50 + ((hs.yaw || 0) / Math.PI) * 50}%`,
            top: `${50 + ((hs.pitch || 0) / Math.PI) * 50}%`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectHotspot(hs.id);
          }}
        />
      ))}

      <div className="absolute bottom-3 left-3 bg-[#09090B]/80 backdrop-blur-sm rounded px-2 py-1 text-[10px] font-mono text-[#71717A]">
        Yaw: {((currentYaw * 180) / Math.PI).toFixed(1)} | Pitch:{' '}
        {((currentPitch * 180) / Math.PI).toFixed(1)}
      </div>
    </div>
  );
}
