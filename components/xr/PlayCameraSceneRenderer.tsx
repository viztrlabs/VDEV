'use client';

import React, { useRef, useEffect, useState } from 'react';
import { usePlayCameraEngine } from './hooks/usePlayCameraEngine';
import { XRScene } from './xr.types';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface PlayCameraSceneRendererProps {
  scene: XRScene;
  mode: 'tour' | 'vr' | 'ar';
  onError?: (error: string) => void;
}

const PlayCameraSceneRenderer: React.FC<PlayCameraSceneRendererProps> = ({
  scene,
  mode,
  onError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const {
    app,
    scene: pcScene,
    camera,
    isInitialized,
    isXRAvailable,
    xrMode,
    error,
    actions,
  } = usePlayCameraEngine(canvasRef as React.RefObject<HTMLCanvasElement>);

  // Load scene when engine is initialized
  useEffect(() => {
    if (!isInitialized || !pcScene || !scene) return;

    const loadScene = async () => {
      try {
        setIsLoading(true);
        setLoadProgress(0);

        // Load background/panorama based on scene type
        if (scene.type === '360' && scene.url) {
          setLoadProgress(0.5);
          await actions.loadPanorama(scene.url);
        } else if (scene.type === '3d' && scene.url) {
          setLoadProgress(0.3);
          await actions.loadModel(scene.url);
        }

        // Load hotspots
        if (scene.hotspots && scene.hotspots.length > 0) {
          setLoadProgress(0.7);
          // Hotspots are handled by HotspotLayer component
        }

        setLoadProgress(1);
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load scene';
        onError?.(errorMessage);
        setIsLoading(false);
      }
    };

    loadScene();
  }, [isInitialized, pcScene, scene, actions, onError]);

  // Handle XR mode changes
  useEffect(() => {
    if (!isInitialized) return;

    const handleXRModeChange = async () => {
      if (mode === 'vr' && xrMode !== 'vr') {
        await actions.startVR();
      } else if (mode === 'ar' && xrMode !== 'ar') {
        await actions.startAR();
      } else if (mode === 'tour' && xrMode !== 'none') {
        await actions.endXR();
      }
    };

    handleXRModeChange();
  }, [mode, isXRAvailable, xrMode, isInitialized, actions]);

  // Animation loop
  useEffect(() => {
    if (isInitialized) {
      actions.startAnimationLoop();
    }
    return () => {
      // Cleanup handled by engine hook
    };
  }, [isInitialized, actions]);

  // Render
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#18181B] border border-rose-800/50 rounded-xl">
        <div className="text-center p-4">
          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto mb-2" />
          <p className="text-xs text-rose-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-[#09090B] flex flex-col items-center justify-center gap-3">
          <div className="text-xs font-mono text-[#3ECF8E]">Loading Scene...
          </div>
          <div className="w-48 h-1 bg-[#27272A] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3ECF8E] transition-all duration-300 rounded-full"
              style={{ width: `${loadProgress * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-[#71717A]">{Math.round(loadProgress * 100)}%</div>
        </div>
      )}

      {/* PlayCamera Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: isLoading ? 'none' : 'block' }}
      />

      {/* Scene info overlay */}
      {isInitialized && !isLoading && (
        <div className="absolute bottom-2 left-2 z-10 bg-[#09090B]/80 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-[#27272A]">
          <div className="flex items-center gap-2">
            {xrMode === 'vr' ? (
              <Wifi className="w-3 h-3 text-[#3ECF8E]" />
            ) : (
              <WifiOff className="w-3 h-3 text-[#71717A]" />
            )}
            <span className="text-xs font-mono text-[#A1A1AA]">
              {scene.name} • {scene.type === '360' ? 'Panorama' : '3D Model'} • {mode.toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayCameraSceneRenderer;
