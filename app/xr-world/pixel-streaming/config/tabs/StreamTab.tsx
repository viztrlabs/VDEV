'use client';

import React from 'react';

interface TabProps {
  config: any;
  onChange: (path: string, value: any) => void;
}

export function StreamTab({ config, onChange }: TabProps) {
  const stream = config?.stream || {};
  return (
    <div className="space-y-6">
      <Section title="Stream Settings">
        <Field label="Stream ID" value={stream.streamId || ''} onChange={(v) => onChange('stream.streamId', v)} />
        <Field label="Protocol" value={stream.protocol || 'webrtc'} onChange={(v) => onChange('stream.protocol', v)} select={['webrtc', 'rtc']} />
        <Field label="Protocol Version" value={stream.protocolVersion || '2'} onChange={(v) => onChange('stream.protocolVersion', v)} select={['1', '2']} />
        <Field label="Resolution" value={stream.resolution || '3840x2160'} onChange={(v) => onChange('stream.resolution', v)} />
        <Field label="FPS" value={String(stream.fps || 60)} onChange={(v) => onChange('stream.fps', Number(v))} select={['30', '60', '120']} />
        <Field label="Bitrate (kbps)" value={String(stream.bitrate || 50000)} onChange={(v) => onChange('stream.bitrate', Number(v))} />
        <Field label="Codec" value={stream.codec || 'h265'} onChange={(v) => onChange('stream.codec', v)} select={['h264', 'h265', 'vp9']} />
        <Field label="Low Latency" value={String(stream.lowLatency ?? true)} onChange={(v) => onChange('stream.lowLatency', v === 'true')} select={['true', 'false']} />
      </Section>
      <Section title="Signaling">
        <Field label="Signaling URL" value={stream.signalingUrl || ''} onChange={(v) => onChange('stream.signalingUrl', v)} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#27272A] bg-[#0F0F11] p-6">
      <h3 className="text-sm font-mono font-bold text-white mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
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
