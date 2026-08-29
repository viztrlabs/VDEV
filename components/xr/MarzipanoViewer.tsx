'use client';

import React, { useEffect, useState, useRef } from 'react';
import { XRScene, HotspotItem } from './xr.types';
import { ZoomIn, ZoomOut, Move3D } from 'lucide-react';

interface MarzipanoViewerProps {
  scene: XRScene;
  onHotspotClick?: (hotspot: HotspotItem) => void;
}

const MarzipanoViewer: React.FC<MarzipanoViewerProps> = ({ scene, onHotspotClick }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const marzipanoViewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!viewerRef.current) return;

    const initMarzipano = async () => {
      try {
        const Marzipano: any = (await import('marzipano')).default || (await import('marzipano'));

        setLoadProgress(0.2);

        // Initialize Marzipano viewer
        const viewer: any = new Marzipano.Viewer(viewerRef.current!, {
          controls: {
            mouseViewMode: 'qtilt',
            scrollZoom: true,
            scrollZoomSpeed: 0.3,
            dragRotateOnMobile: true,
            dragRoll: true,
          },
          autoplay: false,
          defaultTransition: {
            duration: 500,
          },
        });

        marzipanoViewerRef.current = viewer;

        setLoadProgress(0.5);

        // Create scene with proper equirectangular source
        let source: any;
        if (scene.type === '360') {
          source = Marzipano.ImageUrlSource.fromString(
            scene.url,
            { crossOrigin: 'anonymous' }
          );
        } else {
          source = Marzipano.ImageUrlSource.fromString(
            scene.url,
            { crossOrigin: 'anonymous' }
          );
        }

        const geometry = new Marzipano.EquirectGeometry([
          { width: 4096 },
          { width: 2048 },
          { width: 1024 },
          { width: 512 },
        ]);

        const limiter = Marzipano.RectilinearView.limit.traditional(
          1024,
          120 * Math.PI / 180,
          120 * Math.PI / 180
        );

        const view = new Marzipano.RectilinearView({
          yaw: 0,
          pitch: 0,
          fov: Math.PI / 2,
        }, limiter);

        const marzipanoScene = viewer.createScene({
          source: source,
          geometry: geometry,
          view: view,
          name: scene.name,
          id: scene.id,
          pinFirstLevel: true,
        });

        // Switch to scene
        marzipanoScene.switch();

        setLoadProgress(0.7);

        // Add hotspots
        if (scene.hotspots && scene.hotspots.length > 0) {
          scene.hotspots.forEach((hotspot: HotspotItem) => {
            if ('yaw' in hotspot.position && 'pitch' in hotspot.position) {
              marzipanoScene.hotspots().create({
                pitch: hotspot.position.pitch || 0,
                yaw: hotspot.position.yaw || 0,
                type: 'custom',
                create: () => {
                  const el = document.createElement('div');
                  el.className = 'marzipano-hotspot';
                  el.innerHTML = `
                    <div class="w-3 h-3 bg-[#3ECF8E] rounded-full shadow-lg animate-pulse border-2 border-white cursor-pointer"
                         title="${hotspot.title || ''}">
                    </div>
                  `;
                  el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    onHotspotClick?.(hotspot);
                  });
                  return el;
                },
                destroy: (el: HTMLElement) => {
                  el.remove();
                },
              });
            }
          });
        }

        setLoadProgress(1);
        setIsLoading(false);
      } catch (err) {
        console.error('Marzipano initialization error:', err);
        setIsLoading(false);
      }
    };

    initMarzipano();

    // Cleanup
    return () => {
      if (marzipanoViewerRef.current) {
        marzipanoViewerRef.current.destroy();
      }
    };
  }, [scene, onHotspotClick]);

  // Handle zoom
  const handleZoom = (direction: 'in' | 'out') => {
    if (!marzipanoViewerRef.current) return;
    const viewer = marzipanoViewerRef.current;
    const scene = viewer.scene();
    if (!scene) return;

    const view = scene.view();
    if (!view) return;

    const newZoom = direction === 'in'
      ? Math.min(zoomLevel + 0.2, 3)
      : Math.max(zoomLevel - 0.2, 0.5);
    setZoomLevel(newZoom);

    if (view.fov) {
      const currentFov = view.fov();
      const newFov = direction === 'in'
        ? Math.max(currentFov * 0.8, Math.PI / 6)
        : Math.min(currentFov * 1.25, Math.PI);
      view.fov(newFov);
    }
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    if (viewerRef.current) {
      const element = viewerRef.current;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        (element as any).mozRequestFullScreen();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-[#09090B] flex flex-col items-center justify-center gap-2 z-40">
        <div className="text-xs font-mono text-[#3ECF8E]">Loading 360° Tour...</div>
        <div className="w-48 h-1 bg-[#27272A] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#3ECF8E] transition-all duration-300 rounded-full animate-pulse"
            style={{ width: `${loadProgress * 100}%` }}
          />
        </div>
        <div className="text-[10px] text-[#71717A]">{Math.round(loadProgress * 100)}%</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Marzipano container */}
      <div ref={viewerRef} className="absolute inset-0" />

      {/* Controls overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        <button
          onClick={() => handleZoom('in')}
          className="p-2 rounded-lg bg-[#18181B]/70 border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="p-2 rounded-lg bg-[#18181B]/70 border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFullscreen}
          className="p-2 rounded-lg bg-[#18181B]/70 border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          title="Fullscreen"
        >
          <Move3D className="w-4 h-4" />
        </button>
      </div>

      {/* Scene info */}
      <div className="absolute bottom-4 left-4 z-10 bg-[#09090B]/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-[#27272A]">
        <div className="text-xs font-mono text-[#A1A1AA]">
          {scene.name} • Marzipano Tour • Zoom: {Math.round(zoomLevel * 100)}%
        </div>
      </div>
    </div>
  );
};

export default MarzipanoViewer;
