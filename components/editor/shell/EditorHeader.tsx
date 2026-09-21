'use client';

import React, { memo } from 'react';
import { Save, Loader2, CheckCircle2, Undo2, Redo2, FolderUp, FolderDown, FilePlus, User, PanelLeftOpen, PanelRightOpen, Globe, ShieldCheck } from 'lucide-react';
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
  onPublish?: () => void;
  publishing?: boolean;
  busy?: boolean;
  leftOpen?: boolean;
  rightOpen?: boolean;
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
  onValidate?: () => void;
  validationIssueCount?: number;
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
  onPublish,
  publishing,
  busy,
  leftOpen = true,
  rightOpen = true,
  onToggleLeft,
  onToggleRight,
  onValidate,
  validationIssueCount = 0,
}: EditorHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 px-4 py-2 border-b border-[#27272A] bg-[#09090B]">
      <div className="flex items-center gap-2">
        {onToggleLeft && (
          <button
            onClick={onToggleLeft}
            className="p-1.5 rounded hover:bg-white/5"
            title={leftOpen ? 'Hide Left Panel' : 'Show Left Panel'}
          >
            <PanelLeftOpen className={`w-4 h-4 ${leftOpen ? 'text-[#3ECF8E]' : 'text-[#71717A]'}`} />
          </button>
        )}
        <div className="h-4 w-px bg-[#27272A]" />
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
        <div className="h-4 w-px bg-[#27272A]" />
        <span className="text-xs font-mono font-bold text-[#3ECF8E]">360° TOUR EDITOR</span>
        <span className="text-[10px] font-mono text-[#52525B]">&bull;</span>
        <span className="text-[10px] font-mono text-[#52525B]">{roomsCount} rooms</span>
        <span className="text-[10px] font-mono text-[#52525B]">&bull;</span>
        <span className="text-[10px] font-mono text-[#52525B]">{hotspotsCount} hotspots</span>
      </div>

      <div className="flex items-center gap-1.5">
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
        <div className="h-4 w-px bg-[#27272A]" />
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
        <div className="h-4 w-px bg-[#27272A]" />
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#27272A] hover:bg-[#3F3F46] text-xs font-mono disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Save
        </button>
        {onValidate && (
          <button
            type="button"
            onClick={onValidate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#27272A] hover:bg-[#3F3F46] text-xs font-mono relative"
            title="Validate tour"
            aria-label="Validate tour"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Validate
            {validationIssueCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-amber-500 text-black text-[9px] font-mono font-bold px-1">
                {validationIssueCount}
              </span>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={onPublish}
          disabled={publishing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#34BF7D] text-black text-xs font-mono font-bold disabled:opacity-50"
        >
          {publishing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Globe className="w-3.5 h-3.5" />
          )}
          Publish
        </button>
        {onToggleRight && (
          <button
            onClick={onToggleRight}
            className="p-1.5 rounded hover:bg-white/5"
            title={rightOpen ? 'Hide Right Panel' : 'Show Right Panel'}
          >
            <PanelRightOpen className={`w-4 h-4 ${rightOpen ? 'text-[#3ECF8E]' : 'text-[#71717A]'}`} />
          </button>
        )}
      </div>
    </header>
  );
}

export const EditorHeader = memo(EditorHeaderBase);
