'use client';

import React from 'react';

interface TabProps {
  config: any;
  onChange: (path: string, value: any) => void;
}

export function OverviewTab({ config, onChange }: TabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Stream ID"
          value={config?.stream?.streamId || 'apex-tower-ue5'}
          color="#3ECF8E"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          label="GPU"
          value={config?.gpu?.model || 'RTX 4090'}
          color="#8B5CF6"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>}
          sub={config?.gpu?.vram || '24GB VRAM'}
        />
        <StatCard
          label="Quality"
          value={config?.quality?.resolution?.toUpperCase() || '4K'}
          color="#F59E0B"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
          sub={`${config?.stream?.fps || 60} FPS`}
        />
        <StatCard
          label="Unreal"
          value={config?.unreal?.version || 'UE 5.4'}
          color="#534AB7"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
          sub={config?.stream?.protocol?.toUpperCase() || 'WebRTC'}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon, sub }: { label: string; value: string; color: string; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl border border-[#27272A] bg-[#0F0F11] p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <span style={{ color }}>{icon}</span>
        </span>
        <span className="text-[10px] font-mono text-[#71717A]">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <p className="text-[10px] text-[#71717A]">{sub}</p>}
    </div>
  );
}
