'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import {
  X,
  Rotate3d,
  Sun,
  Layers,
  Eye,
  Maximize2,
  Minimize2,
  Box,
  Compass,
  Grid,
  Sparkles,
  Smartphone,
  Headset,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export default function ModelViewer() {
  const {
    modelViewerOpen,
    activeModelUrl,
    activeModelTitle,
    closeModelViewer,
    showToast
  } = useAppStore();

  const [rotX, setRotX] = useState(25);
  const [rotY, setRotY] = useState(45);
  const [zoom, setZoom] = useState(1);
  const [renderMode, setRenderMode] = useState<'pbr' | 'clay' | 'wireframe'>('pbr');
  const [lighting, setLighting] = useState<'noon' | 'sunset' | 'night'>('sunset');
  const [showGrid, setShowGrid] = useState(true);
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [arSupported, setArSupported] = useState(false);
  const [vrSupported, setVrSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'xr' in navigator) {
      (navigator as any).xr?.isSessionSupported?.('immersive-ar').then((res: boolean) => setArSupported(res));
      (navigator as any).xr?.isSessionSupported?.('immersive-vr').then((res: boolean) => setVrSupported(res));
    }
  }, []);

  if (!modelViewerOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotY((prev) => prev + dx * 0.4);
    setRotX((prev) => Math.max(-60, Math.min(60, prev - dy * 0.4)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleLaunchAR = () => {
    showToast('Initializing WebAR session... Point camera at a flat surface.', 'success');
  };

  const handleLaunchVR = () => {
    showToast('Initializing WebXR VR headset projection...', 'success');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      id="3d-webxr-model-viewer"
      className="fixed inset-0 z-[999] bg-[#09090b] text-white flex flex-col justify-between select-none animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
    >
      {/* TOP BAR */}
      <div className="px-4 py-3 bg-[#09090B] border-b border-[#27272A] flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#18181B] border border-[#27272A] text-[#3ECF8E] text-[10px] font-mono font-bold uppercase tracking-wider">
            <Box className="w-3.5 h-3.5" />
            <span>WEBXR 3D ORBIT ENGINE</span>
          </div>
          <h2 className="text-xs font-mono font-semibold text-[#FAFAFA] hidden sm:inline">
            {activeModelTitle || 'The Apex Tower - Interactive WebXR Master Model'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLaunchAR}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] font-mono text-[#FAFAFA] transition-colors border border-[#27272A] cursor-pointer"
            title="Launch WebAR mode"
          >
            <Smartphone className="w-3 h-3 text-[#3ECF8E]" />
            <span>{arSupported ? 'WebAR Active' : 'Simulate AR'}</span>
          </button>

          <button
            onClick={handleLaunchVR}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] font-mono text-[#FAFAFA] transition-colors border border-[#27272A] cursor-pointer"
            title="Launch VR mode"
          >
            <Headset className="w-3 h-3 text-[#3ECF8E]" />
            <span>{vrSupported ? 'VR Ready' : 'Simulate VR'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={closeModelViewer}
            className="p-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors ml-1 cursor-pointer"
            title="Close Model Viewer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D INTERACTIVE VIEWPORT */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing bg-[#09090B]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onWheel={(e) => {
          setZoom((prev) => Math.max(0.6, Math.min(2.5, prev - e.deltaY * 0.001)));
        }}
      >
        {/* Floating Controls HUD Sidebar */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 p-3 rounded-xl bg-[#09090B]/90 border border-[#27272A] backdrop-blur-md max-w-[210px]">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3ECF8E] mb-1 flex items-center gap-1.5">
            <Sliders className="w-3 h-3 text-[#3ECF8E]" />
            <span>Shader Render Mode</span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#18181B] border border-[#27272A] rounded">
            <button
              onClick={() => setRenderMode('pbr')}
              className={`py-1 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer ${
                renderMode === 'pbr' ? 'bg-[#3ECF8E] text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              PBR
            </button>
            <button
              onClick={() => setRenderMode('clay')}
              className={`py-1 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer ${
                renderMode === 'clay' ? 'bg-[#3ECF8E] text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Clay
            </button>
            <button
              onClick={() => setRenderMode('wireframe')}
              className={`py-1 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer ${
                renderMode === 'wireframe' ? 'bg-[#3ECF8E] text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Wire
            </button>
          </div>

          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3ECF8E] mt-2 mb-1 flex items-center gap-1.5">
            <Sun className="w-3 h-3 text-amber-400" />
            <span>Daylight Simulation</span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#18181B] border border-[#27272A] rounded">
            <button
              onClick={() => setLighting('noon')}
              className={`py-1 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer ${
                lighting === 'noon' ? 'bg-amber-500 text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Noon
            </button>
            <button
              onClick={() => setLighting('sunset')}
              className={`py-1 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer ${
                lighting === 'sunset' ? 'bg-[#3ECF8E] text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Sunset
            </button>
            <button
              onClick={() => setLighting('night')}
              className={`py-1 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer ${
                lighting === 'night' ? 'bg-indigo-600 text-white font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Night
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#27272A] mt-1 text-xs">
            <span className="text-[10px] font-mono text-[#A1A1AA]">Ground Grid</span>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                showGrid ? 'bg-[#3ECF8E] text-black' : 'bg-[#18181B] text-[#71717A] border border-[#27272A]'
              }`}
            >
              {showGrid ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* 3D Model Spatial Simulation Stage */}
        <div
          className="relative transition-transform duration-100 ease-out"
          style={{
            transform: `scale(${zoom}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transformStyle: 'preserve-3d',
            perspective: '1000px',
          }}
        >
          {/* Ground Grid Plate */}
          {showGrid && (
            <div
              className="absolute -bottom-32 -left-48 w-96 h-96 border border-[#27272A] rounded-xl pointer-events-none opacity-40"
              style={{
                transform: 'rotateX(90deg) translateZ(-80px)',
                backgroundImage: 'radial-gradient(circle, #3ECF8E 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
          )}

          {/* Rendered Architectural Geometric Volumes */}
          <div
            className={`w-56 h-80 relative rounded-xl transition-all duration-300 shadow-2xl flex flex-col items-center justify-between p-6 ${
              renderMode === 'pbr'
                ? lighting === 'sunset'
                  ? 'bg-gradient-to-br from-[#18181B] via-[#09090B] to-[#18181B] border border-[#3ECF8E]/40'
                  : lighting === 'noon'
                  ? 'bg-gradient-to-br from-zinc-200 via-zinc-400 to-zinc-600 text-zinc-900 border-2 border-white/60'
                  : 'bg-gradient-to-br from-indigo-950 via-zinc-900 to-black border border-indigo-500/40'
                : renderMode === 'clay'
                ? 'bg-zinc-300 text-zinc-800 border-2 border-zinc-400 shadow-inner'
                : 'bg-transparent border-2 border-dashed border-[#3ECF8E] text-[#3ECF8E]'
            }`}
            style={{
              transform: `translateZ(${explodeFactor * 20}px)`,
            }}
          >
            {/* Top Penthouse Volume */}
            <div className="w-full h-16 rounded border border-[#27272A] bg-[#18181B]/80 flex items-center justify-center text-[11px] font-bold font-mono text-[#FAFAFA]">
              LEVEL 42 — SKY PENTHOUSE
            </div>

            {/* Middle Structural Floors with Cantilever */}
            <div className="w-full flex-1 my-3 rounded border border-[#27272A] bg-[#18181B]/40 flex flex-col justify-around p-3">
              <div className="h-1.5 w-3/4 rounded bg-[#3ECF8E]/80" />
              <div className="h-1.5 w-full rounded bg-[#3ECF8E]/40" />
              <div className="h-1.5 w-5/6 rounded bg-[#3ECF8E]/60" />
              <div className="text-[9px] text-center text-[#A1A1AA] font-mono">
                PBR Curtain Glass Facade (Babylon.js 8)
              </div>
            </div>

            {/* Podium Base */}
            <div className="w-full h-12 rounded border border-[#27272A] bg-[#18181B] flex items-center justify-center text-[10px] font-mono font-bold text-[#FAFAFA]">
              GROUND LOBBY PODIUM
            </div>
          </div>
        </div>

        {/* Telemetry Indicator */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3 p-2.5 rounded-lg bg-[#09090B]/90 border border-[#27272A] backdrop-blur-md text-[10px] font-mono text-[#A1A1AA]">
          <div className="flex items-center gap-1.5 text-[#3ECF8E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-pulse" />
            <span>60 FPS</span>
          </div>
          <div>Poly: 142k</div>
          <div>Rot: {Math.round(rotY)}°</div>
          <div>Zoom: {zoom.toFixed(1)}x</div>
        </div>
      </div>
    </div>
  );
}
