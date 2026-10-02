'use client';

/**
 * TourViewer — tour viewer built on the shared useTourEngine.
 * Props stay compatible with existing callers: `scene` is required; the new
 * optional props (scenes, activeSceneId, controls, onSelectScene) enable
 * scene menus and control toggles on the public page.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { TourScene } from '@/lib/tourClientStore';
import { useSharedExperience } from './SharedExperienceContext';
import { useTourEngine } from '@/components/tour-viewer/useTourEngine';
import { TourControls } from '@/components/tour-viewer/TourControls';
import { ShareControl } from '@/components/tour-viewer/ShareControl';
import { GyroscopeControl } from '@/components/tour-viewer/GyroscopeControl';

interface TourViewerProps {
  scene: TourScene;
  onHotspotClick?: (sceneId: string, hotspotId: string) => void;
  onSceneChange?: (sceneId: string) => void;
  scenes?: TourScene[];
  activeSceneId?: string;
  controls?: boolean;
  onSelectScene?: (sceneId: string) => void;
}

export default function TourViewer({
  scene, onHotspotClick, onSceneChange,
  scenes, activeSceneId, controls = true, onSelectScene,
}: TourViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const localUpdateRef = useRef(false);

  const { yaw: sharedYaw, pitch: sharedPitch, setOrientation } = useSharedExperience();

  const engine = useTourEngine(containerRef, {
    scenes: scenes ?? [scene],
    activeSceneId: activeSceneId ?? scene.id,
    transitionDuration: 500,
    onHotspotClick,
    onSceneChange,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autorotateOn, setAutorotateOn] = useState(false);

  // Track per-scene autorotate default (scene change may re-enable it).
  useEffect(() => {
    setAutorotateOn(!!scene.autorotateEnabled);
  }, [scene]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  const toggleAutorotate = useCallback(() => {
    setAutorotateOn((on) => {
      engine.setAutorotate(!on, scene.autorotateSpeed || 1);
      return !on;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, scene.autorotateSpeed]);

  // --- Keyboard navigation ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const step = Math.PI / 36; // 5 degrees
    const handleKey = (e: KeyboardEvent) => {
      const v = engine.getCurrentScene()?.view?.();
      if (!v) return;
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); v.yaw(v.yaw() - step); break;
        case 'ArrowRight': e.preventDefault(); v.yaw(v.yaw() + step); break;
        case 'ArrowUp': e.preventDefault(); v.pitch(Math.min(v.pitch() + step, Math.PI / 2 - 0.01)); break;
        case 'ArrowDown': e.preventDefault(); v.pitch(Math.max(v.pitch() - step, -Math.PI / 2 + 0.01)); break;
        case '+': case '=': e.preventDefault(); engine.zoomBy(0.9); break;
        case '-': e.preventDefault(); engine.zoomBy(1.1); break;
        case 'f': case 'F': e.preventDefault(); toggleFullscreen(); break;
        case 'Escape': if (document.fullscreenElement) document.exitFullscreen(); break;
      }
    };

    el.setAttribute('tabIndex', '0');
    el.addEventListener('keydown', handleKey);
    return () => el.removeEventListener('keydown', handleKey);
  }, [engine, toggleFullscreen]);

  // --- Camera sync: Marzipano → shared context, and back ---
  useEffect(() => {
    localUpdateRef.current = true;
    setOrientation(engine.view.yaw, engine.view.pitch);
    const t = setTimeout(() => { localUpdateRef.current = false; }, 0);
    return () => clearTimeout(t);
  }, [engine.view, setOrientation]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (localUpdateRef.current) return;
    const v = engine.getCurrentScene()?.view?.();
    if (!v) return;
    v.yaw(sharedYaw);
    v.pitch(sharedPitch);
  }, [sharedYaw, sharedPitch]); // eslint-disable-line react-hooks/exhaustive-deps

  if (engine.error) {
    return (
      <div className="absolute inset-0 bg-[#09090B] flex flex-col items-center justify-center gap-3 z-40">
        <div className="text-sm text-red-400 font-mono">{engine.error}</div>
        <button onClick={engine.reload} className="text-xs px-3 py-1.5 rounded bg-[#27272A] text-white hover:bg-[#3F3F46] cursor-pointer">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <div
        ref={containerRef}
        className="absolute inset-0"
        role="region"
        aria-label={`Virtual tour: ${scene.name}`}
      />

      {engine.loading && (
        <div className="absolute inset-0 bg-[#09090B] flex flex-col items-center justify-center gap-2 z-40">
          <div className="text-xs font-mono text-[#3ECF8E]">Loading 360°…</div>
          <div className="w-48 h-1 bg-[#27272A] rounded-full overflow-hidden">
            <div className="h-full bg-[#3ECF8E] transition-all duration-300 rounded-full animate-pulse" style={{ width: `${engine.progress * 100}%` }} />
          </div>
        </div>
      )}

      {controls && (
        <>
          <TourControls
            onZoomIn={() => engine.zoomBy(0.8)}
            onZoomOut={() => engine.zoomBy(1.25)}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
            autorotateEnabled={autorotateOn}
            onToggleAutorotate={toggleAutorotate}
            scenes={scenes}
            activeSceneId={activeSceneId ?? scene.id}
            onSelectScene={onSelectScene}
          />
          <div className="absolute bottom-4 right-16 z-10">
            <GyroscopeControl
              getMarzipano={engine.getMarzipano}
              getViewer={engine.getViewer}
            />
          </div>
          <div className="absolute bottom-4 right-28 z-10">
            <ShareControl tourId={scene.id} tourName={scene.name} />
          </div>
        </>
      )}

      <div className="absolute bottom-4 left-4 z-10 bg-[#09090B]/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-[#27272A]">
        <div className="text-xs font-mono text-[#A1A1AA]">{scene.name}</div>
      </div>
    </div>
  );
}
