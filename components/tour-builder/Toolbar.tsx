'use client';

import React from 'react';
import {
  MousePointer2,
  Move,
  MapPin,
  Link,
  Info,
  Images,
  Box,
  RotateCcw,
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
  { id: 'gallery', icon: Images, label: 'Gallery', shortcut: 'G' },
  { id: 'model3d', icon: Box, label: '3D Model', shortcut: '3' },
  { id: 'startview', icon: RotateCcw, label: 'Set Start View', shortcut: 'S' },
];

export function Toolbar({ activeTool, onSelectTool }: ToolbarProps) {
  return (
    <div className="h-10 border-t border-[#27272A] flex items-center justify-center gap-1 px-4">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onSelectTool(tool.id)}
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
  );
}
