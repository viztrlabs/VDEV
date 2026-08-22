'use client';

import React from 'react';
import { HotspotItem } from './xr.types';
import { Sparkles, Info, ArrowRight, Play, ExternalLink } from 'lucide-react';

interface HotspotProps {
  hotspot: HotspotItem;
  onClick: (hotspot: HotspotItem) => void;
  is3D?: boolean;
}

export default function Hotspot({ hotspot, onClick }: HotspotProps) {
  // Positional coordinates calculation for 2D equirectangular projection overlay
  const pos = Array.isArray(hotspot.position)
    ? { left: `${50 + hotspot.position[0] * 30}%`, top: `${50 - hotspot.position[1] * 30}%` }
    : {
        left: `${((hotspot.position.yaw + 180) / 360) * 100}%`,
        top: `${((90 - hotspot.position.pitch) / 180) * 100}%`
      };

  return (
    <div
      style={{ left: pos.left, top: pos.top }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
      onClick={() => onClick(hotspot)}
    >
      {/* Outer Pulsing Aura */}
      <div className="w-8 h-8 rounded-full bg-[#3ECF8E]/20 animate-ping absolute inset-0 -m-1 pointer-events-none" />

      {/* Core Button Ring */}
      <div className="w-6 h-6 rounded-full bg-black/80 border-2 border-[#3ECF8E] text-[#3ECF8E] flex items-center justify-center shadow-lg group-hover:scale-125 group-hover:bg-[#3ECF8E] group-hover:text-black transition-all duration-200">
        {hotspot.action === 'teleport' && <ArrowRight className="w-3.5 h-3.5" />}
        {hotspot.action === 'open_info' && <Info className="w-3.5 h-3.5" />}
        {hotspot.action === 'play_media' && <Play className="w-3.5 h-3.5 fill-current" />}
        {hotspot.action === 'external' && <ExternalLink className="w-3.5 h-3.5" />}
      </div>

      {/* Tooltip Label */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block whitespace-nowrap px-2.5 py-1 rounded-md bg-black/90 backdrop-blur-md border border-white/20 text-[11px] font-mono text-white pointer-events-none shadow-2xl">
        {hotspot.title}
      </div>
    </div>
  );
}
