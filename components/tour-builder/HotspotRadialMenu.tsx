'use client';

import React, { useEffect } from 'react';
import { DoorOpen, RotateCw, Trash2, Pencil } from 'lucide-react';
import type { TourHotspot } from '@/lib/tourClientStore';

const BTN =
  'absolute w-7 h-7 rounded-full bg-[#18181B]/95 border border-[#27272A] text-white flex items-center justify-center shadow-lg hover:bg-[#27272A] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

interface HotspotRadialMenuProps {
  x: number;
  y: number;
  hotspot: TourHotspot;
  onEnter: () => void;
  onRotate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onClose: () => void;
}

export function HotspotRadialMenu({ x, y, hotspot, onEnter, onRotate, onDelete, onEdit, onClose }: HotspotRadialMenuProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div
        data-testid="hotspot-radial-backdrop"
        className="absolute inset-0 z-20"
        onClick={onClose}
      />
      <div className="absolute z-30" style={{ left: x, top: y }}>
        <button
          aria-label="Enter target room"
          disabled={!hotspot.targetSceneId}
          onClick={onEnter}
          className={BTN}
          style={{ left: 0, top: -44, transform: 'translate(-50%, -50%)' }}
        >
          <DoorOpen className="w-3.5 h-3.5" />
        </button>
        <button
          aria-label="Rotate hotspot"
          onClick={onRotate}
          className={BTN}
          style={{ left: -31, top: -31, transform: 'translate(-50%, -50%)' }}
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
        <button
          aria-label="Delete hotspot"
          onClick={onDelete}
          className={`${BTN} hover:text-red-500`}
          style={{ left: -31, top: 31, transform: 'translate(-50%, -50%)' }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button
          aria-label="Edit hotspot"
          onClick={onEdit}
          className={BTN}
          style={{ left: 0, top: 44, transform: 'translate(-50%, -50%)' }}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
}
