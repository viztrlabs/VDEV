'use client';

import React from 'react';

interface TabProps {
  config: any;
  onChange: (path: string, value: any) => void;
}

export function SignalingTab({ config, onChange }: TabProps) {
  const signaling = config?.signaling || {};
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#27272A] bg-[#0F0F11] p-6">
        <h3 className="text-sm font-mono font-bold text-white mb-4">Signaling Server</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="URL" value={signaling.url || ''} onChange={(v) => onChange('signaling.url', v)} />
          <Field label="Protocol" value={signaling.protocol || 'wss'} onChange={(v) => onChange('signaling.protocol', v)} select={['ws', 'wss']} />
          <Field label="Reconnect Attempts" value={String(signaling.reconnectAttempts || 5)} onChange={(v) => onChange('signaling.reconnectAttempts', Number(v))} />
          <Field label="Reconnect Interval (ms)" value={String(signaling.reconnectInterval || 5000)} onChange={(v) => onChange('signaling.reconnectInterval', Number(v))} />
        </div>
      </div>
      <div className="rounded-xl border border-[#27272A] bg-[#0F0F11] p-6">
        <h3 className="text-sm font-mono font-bold text-white mb-4">ICE Servers</h3>
        {(signaling.iceServers || []).map((server: any, i: number) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Field label="URLs" value={server.urls || ''} onChange={(v) => {
              const servers = [...(signaling.iceServers || [])];
              servers[i] = { ...servers[i], urls: v };
              onChange('signaling.iceServers', servers);
            }} />
            <Field label="Username" value={server.username || ''} onChange={(v) => {
              const servers = [...(signaling.iceServers || [])];
              servers[i] = { ...servers[i], username: v };
              onChange('signaling.iceServers', servers);
            }} />
            <Field label="Credential" value={server.credential || ''} onChange={(v) => {
              const servers = [...(signaling.iceServers || [])];
              servers[i] = { ...servers[i], credential: v };
              onChange('signaling.iceServers', servers);
            }} />
          </div>
        ))}
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
