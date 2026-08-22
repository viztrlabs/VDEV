'use client';

import React from 'react';
import { XRScene } from './xr.types';
import SceneLayer from './SceneLayer';
import HotspotLayer from './HotspotLayer';
import AnnotationLayer from './AnnotationLayer';
import TeleportLayer from './TeleportLayer';
import { useXRStore } from './xr.store';

interface SceneManagerProps {
  currentScene: XRScene;
}

export default function SceneManager({ currentScene }: SceneManagerProps) {
  const { isTransitioning } = useXRStore();

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* 300ms Fade-to-black transition shield */}
      <div
        className={`absolute inset-0 z-40 bg-black pointer-events-none transition-opacity duration-300 ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Layer 1: Galaxy Scene Layer (360 HDR / Model) */}
      <SceneLayer scene={currentScene} />

      {/* Layer 2: Interactive Hotspots */}
      <HotspotLayer
        hotspots={currentScene.hotspots}
        annotations={currentScene.annotations}
      />

      {/* Layer 3: Room-to-Room Teleport Layer */}
      <TeleportLayer teleportPoints={currentScene.teleportPoints} />

      {/* Layer 4: Info Annotations Modal */}
      <AnnotationLayer />
    </div>
  );
}
