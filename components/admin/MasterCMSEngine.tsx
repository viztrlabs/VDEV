'use client';

import React, { useState } from 'react';
import { MonitorPlay, FolderCog } from 'lucide-react';
import LiveSiteEditor from '@/components/admin/live-editor/LiveSiteEditor';
import SuperAdminCMSManager from '@/components/admin/SuperAdminCMSManager';

type EngineMode = 'live-editor' | 'content-manager';

export default function MasterCMSEngine() {
  const [mode, setMode] = useState<EngineMode>('live-editor');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(
          [
            ['live-editor', 'Live Site Editor', MonitorPlay],
            ['content-manager', 'Content Manager', FolderCog],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 cursor-pointer ${
              mode === id
                ? 'bg-[#3ECF8E] text-black shadow-lg shadow-[#3ECF8E]/20'
                : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#27272A]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
      {mode === 'live-editor' ? <LiveSiteEditor /> : <SuperAdminCMSManager />}
    </div>
  );
}
