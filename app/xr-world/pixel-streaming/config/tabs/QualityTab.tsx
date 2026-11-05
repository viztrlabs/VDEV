'use client';

import React from 'react';

interface TabProps {
  config: any;
  onChange: (path: string, value: any) => void;
}

export function QualityTab({ config, onChange }: TabProps) {
  const quality = config?.quality || {};
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#27272A] bg-[#0F0F11] p-6">
        <h3 className="text-sm font-mono font-bold text-white mb-4">Quality Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Resolution" value={quality.resolution || '4k'} onChange={(v) => onChange('quality.resolution', v)} select={['720p', '1080p', '2k', '4k']} />
          <Field label="FPS" value={String(quality.fps || 60)} onChange={(v) => onChange('quality.fps', Number(v))} select={['30', '60', '120']} />
          <Field label="Bitrate (kbps)" value={String(quality.bitrate || 50000)} onChange={(v) => onChange('quality.bitrate', Number(v))} />
          <Field label="Codec" value={quality.codec || 'h265'} onChange={(v) => onChange('quality.codec', v)} select={['h264', 'h265', 'vp9']} />
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
