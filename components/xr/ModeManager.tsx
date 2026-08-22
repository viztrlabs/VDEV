'use client';

import React from 'react';
import { useXRStore } from './xr.store';
import { Eye, Headset, Smartphone, Sparkles } from 'lucide-react';
import { XRMode } from './xr.types';

export default function ModeManager() {
  const { currentMode, setMode, deviceCapabilities } = useXRStore();

  const modes: { id: XRMode; label: string; icon: any; supported: boolean }[] = [
    { id: 'tour', label: '360° Interactive Tour', icon: Eye, supported: true },
    { id: 'vr', label: 'Immersive VR Headset', icon: Headset, supported: deviceCapabilities.hasVR },
    { id: 'ar', label: 'Spatial WebAR Surface', icon: Smartphone, supported: deviceCapabilities.hasAR },
  ];

  return (
    <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 p-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = currentMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              isActive
                ? 'bg-[#3ECF8E] text-black font-bold shadow-md shadow-[#3ECF8E]/20'
                : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
