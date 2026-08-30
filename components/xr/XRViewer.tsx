'use client';

import React, { useEffect, useState } from 'react';
import { XRScene, XRMode } from './xr.types';
import { useXRStore } from './xr.store';
import SceneManager from './SceneManager';
import ModeManager from './ModeManager';
import ProgressiveReveal from './ProgressiveReveal';
import CinematicEntry from './CinematicEntry';
import VRControls from './VRControls';
import { Maximize, Minimize, RotateCcw, Sparkles, Users } from 'lucide-react';
import { useAdvancedRendering, DEFAULT_LIGHTS } from './rendering/useAdvancedRendering';
import { CollabProvider } from './collab/CollabProvider';
import CollabPresencePanel from './ui/CollabPresencePanel';
import AnalyticsPanel from './ui/AnalyticsPanel';

const DEFAULT_SCENES: XRScene[] = [
  {
    id: 'scene-01',
    name: 'Main Living Gallery',
    type: '360',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=90',
    hotspots: [
      {
        id: 'hs-1',
        position: { yaw: 20, pitch: 0 },
        action: 'open_info',
        target: 'ann-1',
        title: 'Calacatta Marble Island & Custom Millwork'
      },
      {
        id: 'hs-2',
        position: { yaw: -60, pitch: 10 },
        action: 'open_info',
        target: 'ann-2',
        title: 'Floor-to-Ceiling Curtain Wall Glazing'
      }
    ],
    annotations: [
      {
        id: 'ann-1',
        hotspotId: 'hs-1',
        title: 'Bookmatched Calacatta Marble',
        text: 'Honed Italian marble island with integrated concealed induction elements and brushed brass reveal trim.',
        style: 'glass'
      },
      {
        id: 'ann-2',
        hotspotId: 'hs-2',
        title: 'Double-Glazed Low-E Acoustic Glass',
        text: 'Engineered structural facade delivering optimal thermal insulation and acoustic dampening for urban penthouses.',
        style: 'glass'
      }
    ],
    teleportPoints: [
      {
        id: 'tp-1',
        position: { yaw: 110, pitch: -10 },
        targetSceneId: 'scene-02',
        label: 'Master Bedroom Suite'
      }
    ]
  },
  {
    id: 'scene-02',
    name: 'Master Bedroom Suite',
    type: '360',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=90',
    hotspots: [
      {
        id: 'hs-3',
        position: { yaw: -30, pitch: -5 },
        action: 'open_info',
        target: 'ann-3',
        title: 'Bespoke American Walnut Wall Panels'
      }
    ],
    annotations: [
      {
        id: 'ann-3',
        hotspotId: 'hs-3',
        title: 'Architectural Woodcraft',
        text: 'FSC-certified American Walnut with integrated indirect warm 2700K perimeter LED lighting cove.',
        style: 'glass'
      }
    ],
    teleportPoints: [
      {
        id: 'tp-2',
        position: { yaw: -120, pitch: -10 },
        targetSceneId: 'scene-01',
        label: 'Main Living Gallery'
      }
    ]
  }
];

interface XRViewerProps {
  projectId?: string;
  scenes?: XRScene[];
  initialSceneId?: string;
  mode?: XRMode;
  className?: string;
}

export default function XRViewer({
  projectId = 'apex-tower',
  scenes = DEFAULT_SCENES,
  initialSceneId = 'scene-01',
  mode = 'tour',
  className = ''
}: XRViewerProps) {
  const {
    currentSceneId,
    setScene,
    setMode,
    setScenes,
    currentMode
  } = useXRStore();

  const { rebuildLighting, setPostProcessing } = useAdvancedRendering();
  const [advancedLighting, setAdvancedLighting] = useState(true);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const toggleAdvancedLighting = () => {
    const next = !advancedLighting;
    setAdvancedLighting(next);
    // toggle the advanced rendering rig on the engine instance
    try {
      if (next) rebuildLighting(DEFAULT_LIGHTS);
      setPostProcessing({ bloom: next, bloomIntensity: 0.85, vignette: next, vignetteOffset: 1.0, vignetteDarkness: 1.1, ssao: next, fxaa: true, toneMapping: 'aces', exposure: 1.0 });
    } catch {
      /* engine not booted — no-op */
    }
  };

  useEffect(() => {
    setScenes(scenes);
    setScene(initialSceneId);
    setMode(mode);
  }, [scenes, initialSceneId, mode, setScenes, setScene, setMode]);

  const activeScene = scenes.find((s) => s.id === currentSceneId) || scenes[0];

  const toggleFullscreen = () => {
    if (!containerRef) return;
    if (!document.fullscreenElement) {
      containerRef.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <CollabProvider
      userId={`user-${projectId}-${Math.random().toString(36).slice(2, 7)}`}
      userName="You"
    >
      <div
        ref={setContainerRef}
        className={`relative w-full h-[600px] rounded-2xl overflow-hidden bg-black border border-[#27272A] shadow-2xl ${className}`}
      >
        {/* Cinematic Entry sequence */}
        <CinematicEntry
          title="The Apex Tower Spatial Showcase"
          subtitle="Drag to look around • Click hotspots for details • Click rings to teleport"
          onComplete={() => {}}
        />

        {/* Mode Manager (Tour / VR / AR) */}
        <ModeManager />

        {/* Main Multi-Layer Scene Engine */}
        <SceneManager currentScene={activeScene} />

        {/* VR Overlay Controls */}
        <VRControls />

        {/* Progressive Reveal for VR trigger */}
        <ProgressiveReveal />

        {/* Advanced rendering toggle */}
        <button
          onClick={toggleAdvancedLighting}
          className="absolute top-4 left-4 z-30 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/80 hover:bg-white/10 border border-white/10 text-[#FAFAFA] text-xs transition-colors cursor-pointer"
          title="Toggle advanced lighting & post-processing"
        >
          <Sparkles className={`w-3.5 h-3.5 ${advancedLighting ? 'text-[#3ECF8E]' : 'text-[#71717A]'}`} />
          <span>Advanced Render: {advancedLighting ? 'ON' : 'OFF'}</span>
        </button>

        {/* Collaboration presence + analytics overlays */}
        <CollabPresencePanel />
        <AnalyticsPanel />

        {/* Top Right Utility Bar */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button
          onClick={() => setScene(scenes[0].id)}
          className="p-2 rounded-xl bg-black/80 hover:bg-white/10 border border-white/10 text-white transition-colors cursor-pointer"
          title="Reset Camera / Return to Entrance"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-black/80 hover:bg-white/10 border border-white/10 text-white transition-colors cursor-pointer"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom Scene Name Pill */}
      <div className="absolute bottom-4 left-4 z-30 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono text-[#FAFAFA] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#3ECF8E] animate-pulse" />
        <span>Scene: {activeScene.name}</span>
      </div>
    </div>
    </CollabProvider>
  );
}
