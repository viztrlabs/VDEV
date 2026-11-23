'use client';

import React, { useState } from 'react';
import { ArrowLeft, Download, ExternalLink, RotateCcw, Save } from 'lucide-react';
import {
  publishSiteContent,
  resetSiteContentDraft,
  useIsDraftDirty,
  useSiteContentDraftStore,
} from '@/lib/site-content-store';
import { useEditMode } from './EditModeContext';

function exportStamp(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const buttonClass =
  'flex items-center gap-1.5 rounded-lg border border-[#353436] bg-[#201f20] px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-widest text-[#A1A1AA] transition-colors hover:border-[#dbfcff] hover:text-white';

export default function EditorToolbar({ onExit }: { onExit: () => void }) {
  const { editMode, setEditMode } = useEditMode();
  const dirty = useIsDraftDirty();
  const [confirmReset, setConfirmReset] = useState(false);

  const publish = () => {
    publishSiteContent();
    setConfirmReset(false);
  };

  const reset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetSiteContentDraft();
    setConfirmReset(false);
  };

  const exportJson = () => {
    if (typeof URL.createObjectURL !== 'function') return;
    const content = useSiteContentDraftStore.getState().content;
    const payload = { schemaVersion: content.version, content };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = `viztr-site-content-${exportStamp()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div
      data-testid="editor-toolbar"
      className="flex flex-wrap items-center gap-2 border-b border-[#353436] bg-[#131314] px-3 py-2 text-white"
    >
      <button type="button" onClick={onExit} className={buttonClass}>
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <label
        htmlFor="editor-edit-mode"
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#353436] bg-[#201f20] px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-widest text-[#A1A1AA]"
      >
        <input
          id="editor-edit-mode"
          type="checkbox"
          aria-label="Edit mode"
          checked={editMode}
          onChange={(event) => setEditMode(event.target.checked)}
          className="h-3.5 w-3.5 accent-[#dbfcff]"
        />
        {editMode ? 'Edit' : 'Preview'}
      </label>

      {dirty ? (
        <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-amber-300">
          Unsaved changes
        </span>
      ) : null}

      <button type="button" onClick={publish} className={buttonClass}>
        <Save className="h-3.5 w-3.5" />
        Publish
      </button>

      <button type="button" onClick={reset} className={buttonClass}>
        <RotateCcw className="h-3.5 w-3.5" />
        {confirmReset ? 'Confirm reset' : 'Reset'}
      </button>

      <button type="button" onClick={exportJson} className={buttonClass}>
        <Download className="h-3.5 w-3.5" />
        Export JSON
      </button>

      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className={`${buttonClass} ml-auto`}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Open live site
      </a>
    </div>
  );
}
