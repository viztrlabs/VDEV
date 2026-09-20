'use client';

import React from 'react';
import {
  MousePointer2,
  MapPin,
  Link,
  Info,
  Image,
  Compass,
  Eye,
  Settings,
  Undo2,
  Redo2,
} from 'lucide-react';

interface EditorBottomBarProps {
  activeTool: string;
  onSelectTool: (tool: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSetStartView?: () => void;
}

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'metadata', icon: MapPin, label: 'Metadata', shortcut: 'M' },
  { id: 'info', icon: Info, label: 'Info', shortcut: 'I' },
  { id: 'portal', icon: Link, label: 'Portal', shortcut: 'P' },
  { id: 'gallery', icon: Image, label: 'Gallery', shortcut: 'G' },
  { id: 'startview', icon: Compass, label: 'Start View', shortcut: 'S' },
  { id: 'preview', icon: Eye, label: 'Preview', shortcut: 'R' },
  { id: 'settings', icon: Settings, label: 'Settings', shortcut: 'T' },
];

export function EditorBottomBar({
  activeTool,
  onSelectTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSetStartView,
}: EditorBottomBarProps) {
  return (
    <div className="h-10 border-t border-[#27272A] flex items-center justify-between px-4 bg-[#09090B]">
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded text-[#71717A] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded text-[#71717A] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
        <div className="h-4 w-px bg-[#27272A] mx-1" />
      </div>

      <div className="flex items-center gap-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => {
              if (tool.id === 'startview' && onSetStartView) {
                onSetStartView();
              } else {
                onSelectTool(tool.id);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              activeTool === tool.id
                ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/50'
                : 'bg-[#18181B] text-[#71717A] hover:text-white hover:bg-[#27272A] border border-transparent'
            }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <tool.icon className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{tool.label}</span>
            <span className="text-[10px] opacity-50 ml-1">{tool.shortcut}</span>
          </button>
        ))}
      </div>

      <div className="w-20" />
    </div>
  );
}
