'use client';

import React, { useState } from 'react';
import {
  Save,
  Eye,
  PanelLeftOpen,
  PanelRightOpen,
  Undo2,
  Redo2,
  Map,
  CheckCircle,
  Upload,
} from 'lucide-react';

interface TourToolbarProps {
  projectId: string;
  experienceId?: string;
  leftOpen: boolean;
  rightOpen: boolean;
  validationOpen: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onToggleValidation: () => void;
}

export function TourToolbar({
  projectId,
  experienceId,
  leftOpen,
  rightOpen,
  validationOpen,
  onToggleLeft,
  onToggleRight,
  onToggleValidation,
}: TourToolbarProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-12 border-b border-[#27272A] flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <button onClick={onToggleLeft} className="p-1.5 rounded hover:bg-white/5">
          <PanelLeftOpen className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-[#27272A]" />
        <button onClick={() => {}} className="p-1.5 rounded hover:bg-white/5" title="Undo (Ctrl+Z)">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={() => {}} className="p-1.5 rounded hover:bg-white/5" title="Redo (Ctrl+Shift+Z)">
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-[#71717A]">Tour Builder</span>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => {}} className="p-1.5 rounded hover:bg-white/5" title="Tour Map">
          <Map className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleValidation}
          className={`p-1.5 rounded hover:bg-white/5 ${validationOpen ? 'text-[#3ECF8E]' : ''}`}
          title="Validate"
        >
          <CheckCircle className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-[#27272A]" />
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#27272A] hover:bg-[#3F3F46] text-xs font-mono"
        >
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#27272A] hover:bg-[#3F3F46] text-xs font-mono">
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#34BF7D] text-black text-xs font-mono font-bold">
          Publish
        </button>
        <button onClick={onToggleRight} className="p-1.5 rounded hover:bg-white/5">
          <PanelRightOpen className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
