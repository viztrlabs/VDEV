'use client';

import React, { useState } from 'react';
import { VtedPolygonStyle } from '@/lib/vted-types';

interface PolygonStylePanelProps {
  style: VtedPolygonStyle;
  onChangeStyle: (next: VtedPolygonStyle) => void;
}

export default function PolygonStylePanel({ style, onChangeStyle }: PolygonStylePanelProps) {
  const set = (patch: Partial<VtedPolygonStyle>) => {
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
          Border color
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={style.borderColor || '#27272A'}
            onChange={(e) => set({ borderColor: e.target.value })}
            className="w-10 h-8 bg-transparent border border-[#27272A] rounded"
          />
          <input
            value={style.borderColor || ''}
            onChange={(e) => set({ borderColor: e.target.value })}
            placeholder="#27272A"
            className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          />
        </div>
        <p className="text-[9px] text-[#71717A] mt-0.5">Supports hex + alpha</p>
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Border width (px)
        </label>
        <div className="flex items-center gap-1.5">
          <select
            value={style.borderWidth ?? 1}
            onChange={(e) => set({ borderWidth: Number(e.target.value) })}
            className="w-24 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          >
            <option value={0}>0 (no border)</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Hover background color
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={style.backgroundHoverColor || '#18181B'}
            onChange={(e) => set({ backgroundHoverColor: e.target.value })}
            className="w-10 h-8 bg-transparent border border-[#27272A] rounded"
          />
          <input
            value={style.backgroundHoverColor || ''}
            onChange={(e) => set({ backgroundHoverColor: e.target.value })}
            placeholder="#18181B"
            className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Hover border color
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={style.borderHoverColor || '#27272A'}
            onChange={(e) => set({ borderHoverColor: e.target.value })}
            className="w-10 h-8 bg-transparent border border-[#27272A] rounded"
          />
          <input
            value={style.borderHoverColor || ''}
            onChange={(e) => set({ borderHoverColor: e.target.value })}
            placeholder="#27272A"
            className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          />
        </div>
      </div>
    </div>
  );
}