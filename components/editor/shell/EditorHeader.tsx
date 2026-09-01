'use client';

import React, { memo } from 'react';
import { ArrowLeft, Save, Loader2, CheckCircle2, Undo2, Redo2 } from 'lucide-react';
import Link from 'next/link';
import type { SectionTab } from '@/lib/editorStore';

interface EditorHeaderProps {
  roomsCount: number;
  hotspotsCount: number;
  saved: boolean;
  saving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

function EditorHeaderBase({
  roomsCount,
  hotspotsCount,
  saved,
  saving,
  canUndo,
  canRedo,
  onSave,
  onUndo,
  onRedo,
}: EditorHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-[#27272A] bg-[#0c0c0f]">
      <div className="flex items-center gap-3">
        <Link
          href="/xr-world/virtual-tour"
          className="flex items-center gap-1.5 text-xs font-mono text-[#A1A1AA] hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Virtual Tour
        </Link>
        <span className="text-sm font-bold font-mono text-[#3ECF8E]">360° TOUR EDITOR</span>
        <span className="text-[10px] font-mono text-[#71717A]">
          {roomsCount} nodes · {hotspotsCount} hotspots
        </span>
      </div>
      <div className="flex items-center gap-2">
        {saved && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#3ECF8E]">
            <CheckCircle2 className="w-3.5 h-3.5" /> Saved
          </span>
        )}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded text-[#A1A1AA] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded text-[#A1A1AA] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Save Tour
        </button>
      </div>
    </header>
  );
}

export const EditorHeader = memo(EditorHeaderBase);
