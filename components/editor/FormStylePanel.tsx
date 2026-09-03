'use client';

import React from 'react';
import type { VtedFormStyle } from '@/lib/vted-types';

interface FormStylePanelProps {
  style: VtedFormStyle;
  onChangeStyle: (next: VtedFormStyle) => void;
}

export default function FormStylePanel({ style, onChangeStyle }: FormStylePanelProps) {
  const set = (patch: Partial<VtedFormStyle>) => {
    const next = { ...style, ...patch };
    onChangeStyle(next);
  };

  const LAYOUT_OPTIONS = ['dialog', 'panel'] as const;
  const POSITION_OPTIONS = ['left', 'right'] as const;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Layout
        </label>
        <select
          value={style.layout || 'dialog'}
          onChange={(e) => set({ layout: e.target.value as 'dialog' | 'panel' })}
          className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
        >
          <option value="dialog">Dialog (modal centered)</option>
          <option value="panel">Panel (side sheet)</option>
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Position
        </label>
        <select
          value={style.position || 'right'}
          onChange={(e) => set({ position: e.target.value as 'left' | 'right' })}
          className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Background color
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={style.backgroundColor || '#09090B'}
            onChange={(e) => set({ backgroundColor: e.target.value })}
            className="w-10 h-8 bg-transparent border border-[#27272A] rounded"
          />
          <input
            value={style.backgroundColor || ''}
            onChange={(e) => set({ backgroundColor: e.target.value })}
            placeholder="#09090B"
            className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          />
        </div>
        <p className="text-[9px] text-[#71717A] mt-0.5">Supports hex + alpha (e.g. #09090B50)</p>
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
          Overlay color
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={style.overlayColor || '#000000'}
            onChange={(e) => set({ overlayColor: e.target.value })}
            className="w-10 h-8 bg-transparent border border-[#27272A] rounded"
          />
          <input
            value={style.overlayColor || ''}
            onChange={(e) => set({ overlayColor: e.target.value })}
            placeholder="#000000"
            className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          />
        </div>
        <p className="text-[9px] text-[#71717A] mt-0.5">Supports hex + alpha (e.g. #00000080)</p>
      </div>

      {/* Live preview */}
      <div className="mt-4 rounded-lg border border-[#27272A] bg-[#0c0c0f] p-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-2">
          Form Preview (dialog)
        </div>
        <div
          className="rounded-md p-4 max-w-xs"
          style={{
            backgroundColor: style.backgroundColor || '#09090B',
            border: `1px solid ${style.backgroundColor || '#27272A'}`,
            color: '#FAFAFA',
          }}
        >
          <div className="text-[11px] font-bold mb-2">Contact Us</div>
          <input
            type="text"
            placeholder="Your name"
            className="w-full mb-2 px-2 py-1 rounded bg-[#18181B] border border-[#27272A] text-white text-xs"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-2 px-2 py-1 rounded bg-[#18181B] border border-[#27272A] text-white text-xs"
          />
          <textarea
            placeholder="Message"
            rows={3}
            className="w-full mb-2 px-2 py-1 rounded bg-[#18181B] border border-[#27272A] text-white text-xs"
          />
          <button
            type="button"
            className="w-full px-3 py-1.5 rounded bg-[#3ECF8E] text-black text-xs font-bold font-mono"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}