'use client';

import React, { useState } from 'react';
import { MonitorPlay, FolderCog, Maximize2 } from 'lucide-react';
import LiveSiteEditor from '@/components/admin/live-editor/LiveSiteEditor';
import SuperAdminCMSManager from '@/components/admin/SuperAdminCMSManager';

type EngineMode = 'live-editor' | 'content-manager';

export default function MasterCMSEngine({ onOpenLiveEditor }: { onOpenLiveEditor?: () => void }) {
  const [mode, setMode] = useState<EngineMode>('live-editor');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ['live-editor', 'Structured', MonitorPlay],
            ['content-manager', 'Content Manager', FolderCog],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 cursor-pointer ${
              mode === id
                ? 'bg-[#dbfcff] text-black shadow-lg shadow-[#dbfcff]/20'
                : 'bg-[#201f20] text-[#A1A1AA] hover:text-white border border-[#353436]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => onOpenLiveEditor?.()}
          className="ml-auto flex items-center gap-2 rounded-xl border border-[#dbfcff]/60 bg-[#dbfcff]/10 px-3.5 py-2 text-xs font-mono font-semibold text-[#dbfcff] transition-colors hover:bg-[#dbfcff] hover:text-black"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          Open Live Editor
        </button>
      </div>
      {mode === 'live-editor' ? <LiveSiteEditor /> : <SuperAdminCMSManager />}
    </div>
  );
}
