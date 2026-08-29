'use client';

import React, { useState, useRef, useEffect } from 'react';
import { XRScene } from './xr.types';
import { useXRStore } from './xr.store';
import MarzipanoViewer from './MarzipanoViewer';
import PlayCameraSceneRenderer from './PlayCameraSceneRenderer';
import Image from 'next/image';

interface SceneLayerProps {
  scene: XRScene;
}

export default function SceneLayer({ scene }: SceneLayerProps) {
  const { currentMode } = useXRStore();
  const [isPlayCameraSupported, setIsPlayCameraSupported] = useState(true);

  // Check WebGL support for fallback logic
  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        setIsPlayCameraSupported(!!gl);
      } catch {
        setIsPlayCameraSupported(false);
      }
    };
    checkWebGL();
  }, []);

  // Use Marzipano for tour mode with 360 scenes (primary 360 pano engine)
  const useMarzipanoRenderer = currentMode === 'tour' && scene.type === '360' && isPlayCameraSupported;

  // Use PlayCanvas (primary WebXR engine) for 3D models, VR and AR modes
  const usePlayCameraRenderer =
    (scene.type === '3d' || currentMode === 'vr' || currentMode === 'ar') && isPlayCameraSupported;

  // 360 scenes shown in VR/AR use Marzipano as a fallback when no 3D model is present
  const useMarzipanoForXR = (currentMode === 'vr' || currentMode === 'ar') && scene.type === '360' && isPlayCameraSupported;

  if (usePlayCameraRenderer) {
    return (
      <div className="absolute inset-0">
        <PlayCameraSceneRenderer scene={scene} mode={currentMode} />
      </div>
    );
  }

  if (useMarzipanoRenderer || useMarzipanoForXR) {
    return (
      <div className="absolute inset-0">
        <MarzipanoViewer scene={scene} />
      </div>
    );
  }

  // CSS fallback for all other cases
  return <CSSFallbackScene scene={scene} />;
}

// CSS Fallback for when engines are not available
function CSSFallbackScene({ scene }: { scene: XRScene }) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    setPan({
      x: dragStart.current.panX + deltaX * 0.1,
      y: Math.max(-20, Math.min(20, dragStart.current.panY + deltaY * 0.1)),
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      className="absolute inset-0 select-none overflow-hidden cursor-grab active:cursor-grabbing bg-black"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="w-full h-full relative transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
        }}
      >
        <Image
          src={scene.url}
          alt={scene.name}
          fill
          priority
          className="object-cover pointer-events-none"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-30" />
      </div>
    </div>
  );
}
