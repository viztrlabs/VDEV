'use client';

import React from 'react';
import { TeleportPointItem } from './xr.types';
import { Compass, Move } from 'lucide-react';

interface TeleportPointProps {
  teleport: TeleportPointItem;
  onTeleport: (targetSceneId: string) => void;
}

export default function TeleportPoint({ teleport, onTeleport }: TeleportPointProps) {
  const pos = Array.isArray(teleport.position)
    ? { left: `${50 + teleport.position[0] * 35}%`, top: `${50 - teleport.position[1] * 35}%` }
    : {
        left: `${((teleport.position.yaw + 180) / 360) * 100}%`,
        top: `${((90 - teleport.position.pitch) / 180) * 100}%`
      };

  return (
    <div
      style={{ left: pos.left, top: pos.top }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
      onClick={() => onTeleport(teleport.targetSceneId)}
    >
      {/* Ground Nav Ring */}
      <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#3ECF8E]/80 animate-spin-slow flex items-center justify-center bg-black/60 shadow-xl group-hover:scale-125 group-hover:border-[#3ECF8E] transition-all">
        <Compass className="w-5 h-5 text-[#3ECF8E]" />
      </div>

      {/* Label Badge */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block whitespace-nowrap px-3 py-1 rounded-md bg-black/90 backdrop-blur-md border border-[#3ECF8E]/40 text-[10px] font-mono font-bold text-[#3ECF8E] shadow-2xl">
        Teleport to {teleport.label} →
      </div>
    </div>
  );
}
