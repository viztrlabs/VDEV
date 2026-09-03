'use client';

import React from 'react';
import type { VtedPopupStyle } from '@/lib/vted-types';

interface PopupStylePanelProps {
  style: VtedPopupStyle;
  onChangeStyle: (next: VtedPopupStyle) => void;
}

export default function PopupStylePanel({ style, onChangeStyle }: PopupStylePanelProps) {
  const set = (patch: Partial<VtedPopupStyle>) => {
    const next = { ...style, ...patch };
    onChangeStyle(next);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Background color
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={style.backgroundColor || '#18181B'}
            onChange={(e) => set({ backgroundColor: e.target.value })}
            className="w-10 h-8 bg-transparent border border-[#27272A] rounded"
          />
          <input
            value={style.backgroundColor || ''}
            onChange={(e) => set({ backgroundColor: e.target.value })}
            placeholder="#18181B"
            className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          />
        </div>
        <p className="text-[9px] text-[#71717A] mt-0.5">Supports hex + alpha (e.g. #18181B50)</p>
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Text color
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={style.textColor || '#FAFAFA'}
            onChange={(e) => set({ textColor: e.target.value })}
            className="w-10 h-8 bg-transparent border border-[#27272A] rounded"
          />
          <input
            value={style.textColor || ''}
            onChange={(e) => set({ textColor: e.target.value })}
            placeholder="#FAFAFA"
            className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          />
        </div>
      </div>

      {/* Live preview */}
      <div className="mt-4 rounded-lg border border-[#27272A] bg-[#0c0c0f] p-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-2">
          Popup Preview
        </div>
        <div
          className="rounded-md p-3 text-[11px]"
          style={{
            backgroundColor: style.backgroundColor || '#18181B',
            color: style.textColor || '#FAFAFA',
            border: `1px solid ${style.backgroundColor || '#27272A'}`,
          }}
        >
          <div className="font-bold">Hotel Viewpoint — Room 204</div>
          <div className="opacity-80 mt-1 text-[9px]">
            This popup shows text content inside the 360° tour. Adjust colors above.
          </div>
        </div>
      </div>
    </div>
  );
}
