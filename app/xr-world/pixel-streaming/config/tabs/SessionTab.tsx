'use client';

import React from 'react';

interface TabProps {
  config: any;
  onChange: (path: string, value: any) => void;
}

export function SessionTab({ config, onChange }: TabProps) {
  const session = config?.session || {};
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#27272A] bg-[#0F0F11] p-6">
        <h3 className="text-sm font-mono font-bold text-white mb-4">Session Management</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Max Duration (min)" value={String(session.maxDuration || 120)} onChange={(v) => onChange('session.maxDuration', Number(v))} />
          <Field label="Idle Timeout (sec)" value={String(session.idleTimeout || 300)} onChange={(v) => onChange('session.idleTimeout', Number(v))} />
          <Field label="Auto Start" value={String(session.autoStart ?? false)} onChange={(v) => onChange('session.autoStart', v === 'true')} select={['true', 'false']} />
          <Field label="Auto Restart" value={String(session.autoRestart ?? true)} onChange={(v) => onChange('session.autoRestart', v === 'true')} select={['true', 'false']} />
          <Field label="Max Concurrent Sessions" value={String(session.maxConcurrentSessions || 1)} onChange={(v) => onChange('session.maxConcurrentSessions', Number(v))} />
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
