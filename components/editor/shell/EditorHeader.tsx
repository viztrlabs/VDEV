'use client';

import React, { memo } from 'react';
import { Save, Loader2, CheckCircle2, Undo2, Redo2, FolderUp, FolderDown, FilePlus, User } from 'lucide-react';
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
  onImportTour?: () => void;
  onExportTour?: () => void;
  onNewTour?: () => void;
  busy?: boolean;
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
  onImportTour,
  onExportTour,
  onNewTour,
  busy,
}: EditorHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#27272A] bg-[#0c0c0f]">
      {/* Far left — Viztr logo */}
      <Link
        href="/xr-world/virtual-tour"
        className="flex items-center gap-1.5 text-sm font-bold font-mono text-[#3ECF8E] hover:opacity-90 shrink-0"
        aria-label="VizTR home"
      >
        <span
          className="inline-flex w-6 h-6 rounded-md bg-gradient-to-br from-[#3ECF8E] to-cyan-500 items-center justify-center text-[10px] font-extrabold text-black"
          aria-hidden="true"
        >
          V
        </span>
        VizTR
      </Link>

      {/* Middle — title + counters + actions */}
      <div className="flex-1 min-w-0 flex items-center gap-3 justify-center">
        <span className="text-sm font-bold font-mono text-[#3ECF8E]">360° TOUR EDITOR</span>
        <span className="text-[10px] font-mono text-[#71717A] hidden sm:inline">
          {roomsCount} nodes · {hotspotsCount} hotspots
        </span>
        <div className="flex items-center gap-1.5 ml-2">
          {saved && (
            <span className="hidden md:flex items-center gap-1 text-[10px] font-mono text-[#3ECF8E]">
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
          {onNewTour && (
            <button
              type="button"
              onClick={onNewTour}
              disabled={busy || saving}
              className="p-1.5 rounded text-[#A1A1AA] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Start a new tour"
              aria-label="New tour"
            >
              <FilePlus className="w-3.5 h-3.5" />
            </button>
          )}
          {onImportTour && (
            <button
              type="button"
              onClick={onImportTour}
              disabled={busy || saving}
              className="p-1.5 rounded text-[#A1A1AA] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Import Marzipano tour ZIP"
              aria-label="Import tour"
            >
              <FolderUp className="w-3.5 h-3.5" />
            </button>
          )}
          {onExportTour && (
            <button
              type="button"
              onClick={onExportTour}
              disabled={busy || saving}
              className="p-1.5 rounded text-[#A1A1AA] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Export Marzipano tour ZIP"
              aria-label="Export tour"
            >
              <FolderDown className="w-3.5 h-3.5" />
            </button>
          )}
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
      </div>

      {/* Far right — account profile */}
      <button
        type="button"
        aria-label="Account"
        title="Account"
        className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#3ECF8E] to-cyan-500 flex items-center justify-center text-[10px] font-bold text-black hover:opacity-90"
      >
        <User className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </header>
  );
}

export const EditorHeader = memo(EditorHeaderBase);
