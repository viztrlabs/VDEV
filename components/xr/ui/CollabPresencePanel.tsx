'use client';

import React from 'react';
import { useCollab } from '../collab/CollabProvider';
import { Wifi, WifiOff, MousePointer2 } from 'lucide-react';

/** Live presence roster + connection status for the collaboration system. */
export default function CollabPresencePanel({ className = '' }: { className?: string }) {
  const { collaborators, self, connected } = useCollab();

  return (
    <div className={`absolute top-4 right-4 z-40 w-56 rounded-xl bg-[#18181B]/85 backdrop-blur-sm border border-[#27272A] p-3 space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">Collaboration</span>
        <span className={`inline-flex items-center gap-1 text-[10px] ${connected ? 'text-[#3ECF8E]' : 'text-[#71717A]'}`}>
          {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {connected ? 'live' : 'local'}
        </span>
      </div>

      <div className="space-y-1.5 max-h-40 overflow-auto">
        {collaborators.map((c) => (
          <div key={c.id} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: c.color }}
              aria-hidden
            />
            <span className="text-xs text-white truncate flex-1">
              {c.name}
              {c.id === self.id ? <span className="text-[#71717A]"> (you)</span> : null}
            </span>
            {c.cursor ? (
              <MousePointer2 className="w-3 h-3 text-[#71717A]" />
            ) : null}
            <span className="text-[9px] font-mono uppercase text-[#71717A]">{c.status}</span>
          </div>
        ))}
        {collaborators.length === 0 ? (
          <div className="text-[10px] text-[#71717A]">No collaborators yet</div>
        ) : null}
      </div>
    </div>
  );
}
