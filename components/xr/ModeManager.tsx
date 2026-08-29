'use client';

import React, { useState, useEffect } from 'react';
import { useXRStore } from './xr.store';
import { Eye, Headset, Smartphone, Sparkles, AlertCircle } from 'lucide-react';

export default function ModeManager() {
  const { currentMode, setMode } = useXRStore();
  const [xrAvailable, setXrAvailable] = useState(false);

  useEffect(() => {
    const checkXRAvailability = async () => {
      if (typeof navigator !== 'undefined' && 'xr' in navigator) {
        try {
          const vrSupported = await navigator.xr!.isSessionSupported('immersive-vr');
          const arSupported = await navigator.xr!.isSessionSupported('immersive-ar');
          setXrAvailable(vrSupported || arSupported);
        } catch {
          setXrAvailable(false);
        }
      }
    };

    checkXRAvailability();
  }, []);

  const modes = [
    {
      id: 'tour' as const,
      label: '360° Tour',
      icon: Eye,
      supported: true,
      description: 'Panoramic virtual tour with hotspots',
      engine: 'Marzipano / PlayCamera',
    },
    {
      id: 'vr' as const,
      label: 'VR Headset',
      icon: Headset,
      supported: xrAvailable || true, // Allow testing even if XR not available
      description: 'Immersive VR headset experience',
      engine: 'PlayCamera WebXR',
    },
    {
      id: 'ar' as const,
      label: 'WebAR',
      icon: Smartphone,
      supported: xrAvailable || true, // Allow testing even if XR not available
      description: 'Augmented reality on mobile',
      engine: 'PlayCamera WebXR',
    },
  ];

  return (
    <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 p-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = currentMode === m.id;
        const isDisabled = !m.supported;

        return (
          <div key={m.id} className="relative group">
            <button
              onClick={() => !isDisabled && setMode(m.id)}
              disabled={isDisabled}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5
                transition-all cursor-pointer relative
                ${isActive
                  ? 'bg-[#3ECF8E] text-black font-bold shadow-md shadow-[#3ECF8E]/20'
                  : isDisabled
                  ? 'text-[#71717A] cursor-not-allowed opacity-50'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'}
              `}
              title={
                m.supported
                  ? `${m.label} - ${m.engine}`
                  : `${m.label} (Not Supported)`
              }
            >
              <Icon className={`w-3.5 h-3.5 ${isActive && m.id === 'vr' ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{m.label}</span>

              {!m.supported && (
                <AlertCircle className="w-3 h-3 text-rose-400" />
              )}
            </button>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#18181B] border border-[#27272A] rounded text-[9px] font-mono text-[#A1A1AA] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap min-w-[120px]">
              {m.engine}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#18181B]"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
