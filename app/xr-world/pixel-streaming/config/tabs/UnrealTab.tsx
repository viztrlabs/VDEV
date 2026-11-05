'use client';

import React from 'react';

interface TabProps {
  config: any;
  onChange: (path: string, value: any) => void;
}

export function UnrealTab({ config, onChange }: TabProps) {
  const unreal = config?.unreal || {};
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#27272A] bg-[#0F0F11] p-6">
        <h3 className="text-sm font-mono font-bold text-white mb-4">Unreal Engine</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Version" value={unreal.version || 'UE5.4'} onChange={(v) => onChange('unreal.version', v)} />
          <Field label="Project Path" value={unreal.projectPath || ''} onChange={(v) => onChange('unreal.projectPath', v)} />
          <Field label="Project Version" value={unreal.projectVersion || '1.0.0'} onChange={(v) => onChange('unreal.projectVersion', v)} />
          <Field label="Map" value={unreal.map || ''} onChange={(v) => onChange('unreal.map', v)} />
          <Field label="Command Line Args" value={unreal.commandLineArgs || ''} onChange={(v) => onChange('unreal.commandLineArgs', v)} />
          <Field label="Build ID" value={unreal.buildId || ''} onChange={(v) => onChange('unreal.buildId', v)} />
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
