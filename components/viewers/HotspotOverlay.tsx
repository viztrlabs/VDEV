'use client';

import React from 'react';
import { DoorOpen } from 'lucide-react';
import type { Hotspot, HotspotColor, HotspotType } from '@/components/viewers/PanoramaViewer';
import { getColorClasses, getHotspotIcon } from './hotspot-utils';

export type HotspotColorType = HotspotColor;

export interface HotspotOverlayProps {
  hotspots: Hotspot[];
  yaw: number;
  pitch: number;
  fov: number;
  showHotspots: boolean;
  isAddMode: boolean;
  activeHotspot: Hotspot | null;
  onHotspotClick: (hotspot: Hotspot) => void;
}

export default function HotspotOverlay({
  hotspots,
  yaw,
  pitch,
  fov,
  showHotspots,
  isAddMode,
  activeHotspot,
  onHotspotClick,
}: HotspotOverlayProps) {
  if (!showHotspots) return null;

  return (
    <>
      {hotspots.map((hp) => {
        let diff = (hp.xPercent - (yaw / 360) * 100) % 100;
        if (diff < -50) diff += 100;
        if (diff > 50) diff -= 100;

        const relativeX = 50 + diff * (fov / 360);
        const relativeY = Math.max(12, Math.min(88, hp.yPercent + pitch * 0.65));

        const isVisible = relativeX >= 5 && relativeX <= 95;
        if (!isVisible) return null;

        const colorStyle = getColorClasses(hp.color);
        const isPortal = hp.type === 'room_link';

        return (
          <div
            key={hp.id}
            style={{
              position: 'absolute',
              left: `${relativeX}%`,
              top: `${relativeY}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="z-20 group pointer-events-auto"
          >
            <div className="relative flex items-center justify-center">
              <span className={`absolute -inset-2 rounded-full opacity-75 animate-ping ${colorStyle.bg}`} />
              <span className={`absolute -inset-4 rounded-full opacity-30 ${colorStyle.bg}`} />

              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAddMode) return;
                  onHotspotClick(hp);
                }}
                className={`relative flex items-center justify-center p-3 rounded-full text-white transition-all transform hover:scale-125 shadow-2xl cursor-pointer ${
                  colorStyle.bg
                } ${colorStyle.glow} ${
                  activeHotspot?.id === hp.id ? 'ring-4 ring-white scale-125' : ''
                }`}
                aria-label={`Hotspot: ${hp.title}`}
              >
                {getHotspotIcon(hp.icon, hp.type)}
              </button>

              <div className="absolute -bottom-8 whitespace-nowrap px-2.5 py-1 rounded-xl bg-black/90 backdrop-blur-md text-[11px] font-mono font-bold text-white border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl flex items-center gap-1.5">
                {isPortal && <DoorOpen className="w-3 h-3 text-[#3ECF8E]" />}
                <span>{hp.title}</span>
                {isPortal && <span className="text-[9px] text-[#3ECF8E]">» Jump</span>}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
