'use client';

import React from 'react';
import { useXRStore } from './xr.store';
import { Headset, X, Disc, Navigation, Sparkles, Volume2 } from 'lucide-react';

export default function VRControls() {
  const { currentMode, setMode, currentSceneId, scenes, setScene } = useXRStore();

  if (currentMode !== 'vr') return null;

  return (
    <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col justify-between p-6 pointer-events-none">
      {/* VR HUD Top Bar */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-[#3ECF8E]/60 text-xs font-mono text-[#3ECF8E] shadow-2xl">
          <Headset className="w-4 h-4 animate-pulse" />
          <span>WebXR Immersive Session Active • 90 FPS Stereo</span>
        </div>

        <button
          onClick={() => setMode('tour')}
          className="p-2 rounded-xl bg-black/80 hover:bg-white/10 border border-white/20 text-white transition-colors cursor-pointer"
          title="Exit VR"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* VR Center Reticle Aim Indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
        <div className="w-4 h-4 rounded-full border-2 border-[#3ECF8E] bg-[#3ECF8E]/20 animate-ping" />
        <div className="w-1.5 h-1.5 rounded-full bg-white absolute" />
      </div>

      {/* Floating VR Scene Switcher Menu */}
      <div className="self-center p-3 rounded-2xl bg-black/90 border border-white/20 pointer-events-auto flex items-center gap-2 shadow-2xl">
        <span className="text-[10px] font-mono uppercase text-[#71717A] px-2">Rooms:</span>
        {scenes.map((s) => (
          <button
            key={s.id}
            onClick={() => setScene(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              currentSceneId === s.id
                ? 'bg-[#3ECF8E] text-black font-bold'
                : 'text-[#A1A1AA] hover:text-white hover:bg-white/10'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
