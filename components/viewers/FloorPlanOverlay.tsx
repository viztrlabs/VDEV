'use client';

import React from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';
import type { TourRoom } from '@/components/viewers/PanoramaViewer';
import type { TourPreferences } from '@/hooks/use-tour-preferences';

export interface FloorPlanOverlayProps {
  yaw: number;
  pitch: number;
  preferences: TourPreferences;
  updatePreferences: (updates: Partial<TourPreferences>) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function FloorPlanOverlay({
  yaw,
  pitch,
  preferences,
  updatePreferences,
  showToast,
}: FloorPlanOverlayProps) {
  return (
    <>
      {/* TOP-BAR FLOOR PLAN NAVIGATOR WITH LIVE LOCATION DOT */}
      {preferences.showFloorPlan && preferences.floorPlanImageUrl && (
        <div className="flex items-center gap-2.5">
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 border-[#3ECF8E] bg-[#09090B]">
            <img
              src={preferences.floorPlanImageUrl}
              alt="Floor Plan"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute rounded-full bg-[#3ECF8E] shadow-[0_0_8px_rgba(62,207,142,0.8)] animate-pulse"
              style={{
                width: '10px',
                height: '10px',
                left: `${(yaw / 360) * 80 + 10}%`,
                top: `${((pitch + 45) / 90) * 80 + 10}%`,
              }}
            />
          </div>
          <label className="cursor-pointer p-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  updatePreferences({ floorPlanImageUrl: url });
                  showToast('Floor plan uploaded.', 'success');
                }
              }}
            />
            <ImageIcon className="w-3.5 h-3.5" />
          </label>
        </div>
      )}
    </>
  );
}
