'use client';

import React from 'react';
import { Compass, Save, RotateCcw, MapPin, Crosshair, Info } from 'lucide-react';

interface OrientationBarProps {
  yaw: number;
  pitch: number;
  roll: number;
  initialYaw: number;
  initialPitch: number;
  hotspotCount: number;
  onSaveDefault: () => void;
  onSetNorth: () => void;
  panoramaUrl?: string;
  hotspots?: Array<{ id: string; xPercent: number; yPercent: number; color?: string }>;
}

export default function OrientationBar({
  yaw,
  pitch,
  roll,
  initialYaw,
  initialPitch,
  hotspotCount,
  onSaveDefault,
  onSetNorth,
  panoramaUrl,
  hotspots = [],
}: OrientationBarProps) {
  return (
    <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-3 pointer-events-none">
      {/* Left: Orientation controls */}
      <div className="pointer-events-auto flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-xl">
        <Compass className="w-3.5 h-3.5 text-[#3ECF8E]" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-white/80">
          Orientation
        </span>
        <span className="text-[10px] font-mono text-[#A1A1AA] hidden sm:inline">
          P:{Math.round(pitch)}° Y:{Math.round(yaw)}° R:{Math.round(roll)}°
        </span>
        <div className="h-3 w-px bg-white/15 mx-1" />
        <button
          type="button"
          onClick={onSaveDefault}
          className="px-2 py-1 rounded bg-white/10 hover:bg-[#3ECF8E] hover:text-black text-[10px] font-mono text-white flex items-center gap-1"
        >
          <Save className="w-3 h-3" />
          Save default view
        </button>
        <button
          type="button"
          onClick={onSetNorth}
          className="px-2 py-1 rounded bg-white/10 hover:bg-[#3ECF8E] hover:text-black text-[10px] font-mono text-white flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Set North (0°)
        </button>
        <div className="h-3 w-px bg-white/15 mx-1" />
        <span className="text-[10px] font-mono text-[#71717A] hidden md:inline">
          default {Math.round(initialYaw)}° / {Math.round(initialPitch)}°
        </span>
      </div>

      {/* Right: Mini-map */}
      {panoramaUrl && (
        <div className="pointer-events-auto relative w-32 h-20 sm:w-40 sm:h-24 rounded-lg overflow-hidden border border-white/15 shadow-xl bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={panoramaUrl} alt="Mini-map" className="w-full h-full object-cover opacity-50" />
          {/* Hotspot dots */}
          {hotspots.map((h) => (
            <span
              key={h.id}
              className="absolute w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.8)]"
              style={{ left: `${h.xPercent}%`, top: `${h.yPercent}%`, transform: 'translate(-50%, -50%)' }}
              title="Hotspot"
            />
          ))}
          {/* Current view indicator */}
          <span
            className="absolute w-1 h-1 rounded-full bg-[#3ECF8E] shadow-[0_0_4px_rgba(62,207,142,0.8)]"
            style={{
              left: `${((yaw + 180) / 360) * 100}%`,
              top: `${((pitch + 90) / 180) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between text-[9px] font-mono text-white/80">
            <span className="flex items-center gap-1">
              <Crosshair className="w-2.5 h-2.5" />
              {hotspotCount} hotspots
            </span>
            <span>Y {Math.round(yaw)}°</span>
          </div>
        </div>
      )}
    </div>
  );
}
