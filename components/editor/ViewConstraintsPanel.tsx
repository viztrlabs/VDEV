'use client';

import React, { useState } from 'react';
import { Eye, X, Save, Smartphone, Maximize2 } from 'lucide-react';
import type { VtedViewConstraints } from '@/lib/vted-types';

interface ViewConstraintsPanelProps {
  value: VtedViewConstraints;
  onChange: (next: VtedViewConstraints) => void;
}

function ConstraintRow({
  label,
  value,
  onChange,
  min,
  max,
  defaultValue,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  defaultValue: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-12 text-[10px] font-mono text-[#A1A1AA]">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
      />
      <button
        type="button"
        onClick={() => onChange(defaultValue)}
        className="p-1 rounded text-[#71717A] hover:text-white hover:bg-white/10"
        title={`Reset to ${defaultValue}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ViewConstraintsPanel({ value, onChange }: ViewConstraintsPanelProps) {
  const [local, setLocal] = useState<VtedViewConstraints>(value);

  React.useEffect(() => {
    setLocal(value);
  }, [value]);

  const set = (patch: Partial<VtedViewConstraints>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange(next);
  };

  return (
    <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3 space-y-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-[#3ECF8E] flex items-center gap-1.5">
        <Eye className="w-3 h-3" />
        View Constraints
      </div>

      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
          Limit View
        </div>
        <ConstraintRow
          label="Top"
          value={local.top}
          onChange={(v) => set({ top: v })}
          min={-90}
          max={90}
          defaultValue={-90}
        />
        <ConstraintRow
          label="Bottom"
          value={local.bottom}
          onChange={(v) => set({ bottom: v })}
          min={-90}
          max={90}
          defaultValue={90}
        />
        <ConstraintRow
          label="Left"
          value={local.left}
          onChange={(v) => set({ left: v })}
          min={-180}
          max={180}
          defaultValue={-180}
        />
        <ConstraintRow
          label="Right"
          value={local.right}
          onChange={(v) => set({ right: v })}
          min={-180}
          max={180}
          defaultValue={180}
        />
      </div>

      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
          Zoom Limit
        </div>
        <div className="flex items-center gap-2">
          <label className="w-12 text-[10px] font-mono text-[#A1A1AA]">Min</label>
          <input
            type="number"
            value={local.zoomMin}
            onChange={(e) => set({ zoomMin: Number(e.target.value) })}
            className="flex-1 bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          />
          <span className="text-[#71717A] text-[10px]">–</span>
          <label className="w-12 text-[10px] font-mono text-[#A1A1AA] text-right">Max</label>
          <input
            type="number"
            value={local.zoomMax}
            onChange={(e) => set({ zoomMax: Number(e.target.value) })}
            className="flex-1 bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Maximize2 className="w-3 h-3 text-[#71717A]" />
          <input
            type="range"
            min={20}
            max={180}
            value={local.zoomMax}
            onChange={(e) => set({ zoomMin: Math.min(local.zoomMin, Number(e.target.value)), zoomMax: Number(e.target.value) })}
            className="flex-1 accent-[#3ECF8E]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-2 rounded bg-[#09090B] border border-[#27272A]">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#FAFAFA]">
          <Smartphone className="w-3 h-3 text-[#71717A]" />
          Mobile zoom limit
        </div>
        <button
          type="button"
          onClick={() => set({ mobileZoomEnabled: !local.mobileZoomEnabled })}
          className={`w-9 h-5 rounded-full relative transition-colors ${
            local.mobileZoomEnabled ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
              local.mobileZoomEnabled ? 'left-4' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onChange(local)}
        className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#34b876] text-black text-[10px] font-mono font-bold"
      >
        <Save className="w-3.5 h-3.5" />
        Save All
      </button>
    </div>
  );
}
