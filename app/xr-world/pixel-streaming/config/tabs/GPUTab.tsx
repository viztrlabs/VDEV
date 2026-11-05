'use client';

import React from 'react';

interface TabProps {
  config: any;
  onChange: (path: string, value: any) => void;
}

export function GPUTab({ config, onChange }: TabProps) {
  const gpu = config?.gpu || {};
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#27272A] bg-[#0F0F11] p-6">
        <h3 className="text-sm font-mono font-bold text-white mb-4">GPU Configuration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="GPU Model" value={gpu.model || 'NVIDIA RTX 4090'} onChange={(v) => onChange('gpu.model', v)} />
          <Field label="VRAM" value={gpu.vram || '24GB'} onChange={(v) => onChange('gpu.vram', v)} />
          <Field label="Region" value={gpu.region || 'eu-central-1'} onChange={(v) => onChange('gpu.region', v)} />
          <Field label="Instance Type" value={gpu.instanceType || 'g5.24xlarge'} onChange={(v) => onChange('gpu.instanceType', v)} />
          <Field label="Max Concurrent Sessions" value={String(gpu.maxConcurrentSessions || 1)} onChange={(v) => onChange('gpu.maxConcurrentSessions', Number(v))} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, select }: { label: string; value: string; onChange: (v: string) => void; select?: string[] }) {
  return (
    <div>
      <label className="block text-[10px] font-mono text-[#71717A] mb-1">{label}</label>
      {select ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#121216] text-white text-xs font-mono focus:border-[#3ECF8E] focus:outline-none">
          {select.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#27272A] bg-[#121216] text-white text-xs font-mono focus:border-[#3ECF8E] focus:outline-none" />
      )}
    </div>
  );
}
