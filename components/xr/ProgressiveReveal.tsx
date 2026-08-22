'use client';

import React from 'react';
import { useXRStore } from './xr.store';
import { Headset, Sparkles } from 'lucide-react';

export default function ProgressiveReveal() {
  const { viewedScenes, currentMode, setMode } = useXRStore();

  // Show after exploring 2+ scenes
  const isUnlocked = viewedScenes.length >= 2;

  if (!isUnlocked || currentMode === 'vr') return null;

  return (
    <div className="absolute bottom-6 right-6 z-30 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <button
        onClick={() => setMode('vr')}
        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#3ECF8E] to-emerald-400 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl shadow-[#3ECF8E]/30 hover:scale-105 transition-all cursor-pointer"
      >
        <Headset className="w-4 h-4" />
        <span>Enter Full WebXR VR Mode</span>
        <Sparkles className="w-3.5 h-3.5 fill-black" />
      </button>
    </div>
  );
}
