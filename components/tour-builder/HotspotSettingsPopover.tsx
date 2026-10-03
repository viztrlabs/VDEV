'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { TourHotspot } from '@/lib/tourClientStore';
import { HotspotSettingsForm } from './HotspotSettingsForm';

const CARD_WIDTH = 320;

interface HotspotSettingsPopoverProps {
  x: number;
  y: number;
  badge: string;
  roomId: string;
  hotspot: TourHotspot;
  viewport: { width: number; height: number };
  onUpdate: (patch: Partial<TourHotspot>) => void;
  onClose: () => void;
}

export function HotspotSettingsPopover({ x, y, badge, roomId, hotspot, viewport, onUpdate, onClose }: HotspotSettingsPopoverProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  let left = x + 16;
  if (left + CARD_WIDTH > viewport.width - 8) left = x - 16 - CARD_WIDTH;
  if (left < 8) left = 8;
  const top = Math.min(Math.max(8, y - 40), Math.max(8, viewport.height - 200));

  return (
    <>
      <div
        data-testid="hotspot-popover-backdrop"
        className="absolute inset-0 z-30"
        onClick={onClose}
      />
      <div
        className="absolute z-40 w-80 max-h-[70vh] overflow-y-auto bg-[#18181B] border border-[#27272A] rounded-lg shadow-2xl"
        style={{ left, top, width: CARD_WIDTH }}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#27272A] sticky top-0 bg-[#18181B]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-1.5 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[9px] font-mono text-white">
              {badge}
            </span>
            <span className="text-xs font-mono font-bold text-white truncate">
              {hotspot.title || hotspot.type}
            </span>
          </div>
          <button
            aria-label="Close hotspot settings"
            onClick={onClose}
            className="p-1 rounded hover:bg-white/5 shrink-0"
          >
            <X className="w-3.5 h-3.5 text-[#71717A]" />
          </button>
        </div>
        <HotspotSettingsForm roomId={roomId} hotspot={hotspot} onUpdate={onUpdate} />
      </div>
    </>
  );
}
