'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  MousePointer2,
  Move,
  MapPin,
  Link,
  Link2,
  Info,
  Images,
  Box,
  RotateCcw,
  RotateCw,
  Sparkles,
  Crosshair,
  MoreHorizontal,
} from 'lucide-react';

interface ToolbarProps {
  activeTool: string;
  onSelectTool: (tool: string) => void;
}

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'move', icon: Move, label: 'Move', shortcut: 'M' },
  { id: 'hotspot', icon: MapPin, label: 'Add Hotspot', shortcut: 'H' },
  { id: 'connect', icon: Link, label: 'Connect Rooms', shortcut: 'C' },
  { id: 'info', icon: Info, label: 'Info Hotspot', shortcut: 'F' },
  { id: 'link', icon: Link2, label: 'Link Hotspot', shortcut: 'L' },
  { id: 'gallery', icon: Images, label: 'Gallery', shortcut: 'G' },
  { id: 'icon', icon: Sparkles, label: 'Icon Hotspot', shortcut: 'I' },
  { id: 'model3d', icon: Box, label: '3D Model', shortcut: '3' },
  { id: 'rotate', icon: RotateCw, label: 'Rotate View', shortcut: 'R' },
  { id: 'alignment', icon: Crosshair, label: 'Alignment', shortcut: 'A' },
  { id: 'startview', icon: RotateCcw, label: 'Set Start View', shortcut: 'S' },
];

const PRIMARY_COUNT = 6;

export function Toolbar({ activeTool, onSelectTool }: ToolbarProps) {
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!flyoutOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) setFlyoutOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFlyoutOpen(false); };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [flyoutOpen]);

  const primary = tools.slice(0, PRIMARY_COUNT);
  const extra = tools.slice(PRIMARY_COUNT);

  const btnClass = (id: string) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors ${
      activeTool === id
        ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/50'
        : 'bg-[#18181B] text-[#71717A] hover:text-white hover:bg-[#27272A] border border-transparent'
    }`;

  return (
    <div className="h-10 border-t border-[#27272A] flex items-center justify-center gap-1 px-4">
      {primary.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onSelectTool(tool.id)}
          className={btnClass(tool.id)}
          title={`${tool.label} (${tool.shortcut})`}
        >
          <tool.icon className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{tool.label}</span>
          <span className="text-[10px] opacity-50 ml-1">{tool.shortcut}</span>
        </button>
      ))}
      <div className="relative" ref={flyoutRef}>
        <button
          onClick={() => setFlyoutOpen((o) => !o)}
          className={flyoutOpen ? btnClass('flyout-open') : 'flex items-center px-3 py-1.5 rounded text-xs font-mono bg-[#18181B] text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors'}
          title="More tools"
          aria-label="More tools"
          aria-expanded={flyoutOpen}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
        {flyoutOpen && (
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 min-w-[190px] rounded-lg bg-[#09090B] border border-[#27272A] py-1 z-20"
            role="menu"
          >
            {extra.map((tool) => (
              <button
                key={tool.id}
                role="menuitem"
                onClick={() => {
                  setFlyoutOpen(false);
                  onSelectTool(tool.id);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer ${
                  activeTool === tool.id
                    ? 'text-[#3ECF8E] bg-[#3ECF8E]/10'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
                }`}
                title={`${tool.label} (${tool.shortcut})`}
              >
                <span className="inline-flex items-center gap-2">
                  <tool.icon className="w-3.5 h-3.5" />
                  {tool.label}
                  <span className="ml-auto text-[10px] opacity-50">{tool.shortcut}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
