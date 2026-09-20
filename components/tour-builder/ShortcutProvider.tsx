'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { Keyboard } from 'lucide-react';

interface Shortcut {
  key: string;
  modifiers?: string[];
  label: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  { key: 'v', label: 'Select Mode', category: 'Tools' },
  { key: 'm', label: 'Move Mode', category: 'Tools' },
  { key: 'h', label: 'Add Hotspot', category: 'Tools' },
  { key: 'n', label: 'Add Navigation Hotspot', category: 'Tools' },
  { key: 'c', label: 'Connect Rooms', category: 'Tools' },
  { key: 'f', label: 'Info Hotspot', category: 'Tools' },
  { key: 'g', label: 'Gallery Hotspot', category: 'Tools' },
  { key: 'l', label: 'Link Hotspot', category: 'Tools' },
  { key: 'i', label: 'Icon Hotspot', category: 'Tools' },
  { key: 'r', label: 'Rotate View', category: 'Tools' },
  { key: 's', label: 'Set Start View', category: 'Tools' },
  { key: 'a', label: 'Alignment Mode', category: 'Tools' },
  { key: 'p', label: 'Preview', category: 'Tools' },
  { key: '3', label: '3D Model Hotspot', category: 'Tools' },
  { key: 'Delete', label: 'Delete Selected', category: 'Edit' },
  { key: 'Backspace', label: 'Delete Selected', category: 'Edit' },
  { key: 'Escape', label: 'Deselect / Cancel', category: 'Edit' },
  { key: 'z', modifiers: ['Ctrl'], label: 'Undo', category: 'Edit' },
  { key: 'z', modifiers: ['Ctrl', 'Shift'], label: 'Redo', category: 'Edit' },
  { key: 'y', modifiers: ['Ctrl'], label: 'Redo', category: 'Edit' },
  { key: 's', modifiers: ['Ctrl'], label: 'Save', category: 'File' },
  { key: 'S', modifiers: ['Ctrl', 'Shift'], label: 'Save As', category: 'File' },
  { key: 'o', modifiers: ['Ctrl'], label: 'Open Tour', category: 'File' },
  { key: 'n', modifiers: ['Ctrl'], label: 'New Tour', category: 'File' },
  { key: 'F5', label: 'Preview Tour', category: 'View' },
  { key: 'F11', label: 'Fullscreen Preview', category: 'View' },
  { key: '1', modifiers: ['Alt'], label: 'Focus Rooms Panel', category: 'Navigation' },
  { key: '2', modifiers: ['Alt'], label: 'Focus Viewport', category: 'Navigation' },
  { key: '3', modifiers: ['Alt'], label: 'Focus Inspector', category: 'Navigation' },
  { key: '?', label: 'Show Shortcuts', category: 'Help' },
];

interface ShortcutProviderProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onSave?: () => void;
  onSaveAs?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onPreview?: () => void;
  onDelete?: () => void;
  onSelectRoom?: (id: string) => void;
  onSelectViewport?: () => void;
  onSelectInspector?: () => void;
  children: React.ReactNode;
}

export function ShortcutProvider({
  activeTool,
  onToolChange,
  onSave,
  onSaveAs,
  onUndo,
  onRedo,
  onDelete,
  onSelectRoom,
  onSelectViewport,
  onSelectInspector,
  children,
}: ShortcutProviderProps) {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      const mod = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Shortcuts help toggle
      if (e.key === '?' && !inEditable && !mod) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      // Close help on Escape
      if (e.key === 'Escape' && showHelp) {
        setShowHelp(false);
        return;
      }

      if (inEditable) return;

      // Ctrl/Cmd shortcuts
      if (mod) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            if (shift) onSaveAs?.();
            else onSave?.();
            return;
          case 'z':
            e.preventDefault();
            if (shift) onRedo?.();
            else onUndo?.();
            return;
          case 'y':
            e.preventDefault();
            onRedo?.();
            return;
          case 'o':
            e.preventDefault();
            // TODO: Open tour
            return;
          case 'n':
            e.preventDefault();
            // TODO: New tour
            return;
        }
      }

      // Alt shortcuts
      if (alt && !mod) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            onSelectRoom?.('');
            return;
          case '2':
            e.preventDefault();
            onSelectViewport?.();
            return;
          case '3':
            e.preventDefault();
            onSelectInspector?.();
            return;
        }
      }

      // F-key shortcuts
      if (!mod && !alt && !shift) {
        switch (e.key) {
          case 'F5':
            e.preventDefault();
            onPreview?.();
            return;
          case 'F11':
            e.preventDefault();
            // TODO: Fullscreen
            return;
        }
      }

      // Single-key shortcuts (no modifiers)
      if (!mod && !alt && !shift) {
        const toolShortcuts: Record<string, string> = {
          v: 'select',
          m: 'move',
          h: 'hotspot',
          n: 'hotspot-navigation',
          c: 'connect',
          f: 'info',
          g: 'gallery',
          l: 'link',
          i: 'icon',
          r: 'rotate',
          s: 'startview',
          a: 'alignment',
          p: 'preview',
          '3': 'model3d',
        };
        const tool = toolShortcuts[e.key.toLowerCase()];
        if (tool) {
          e.preventDefault();
          onToolChange(tool);
          return;
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          onDelete?.();
          return;
        }
        if (e.key === 'Escape') {
          onToolChange('select');
          return;
        }
      }
    },
    [onToolChange, onSave, onSaveAs, onUndo, onRedo, onDelete, onSelectRoom, onSelectViewport, onSelectInspector, showHelp, onPreview]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const categories = SHORTCUTS.reduce<Record<string, Shortcut[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <>
      {children}

      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 right-4 z-40 p-2 rounded-full bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] transition-colors"
        title="Keyboard Shortcuts (?)"
      >
        <Keyboard className="w-4 h-4 text-[#71717A]" />
      </button>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#09090B] border border-[#27272A] rounded-lg w-[500px] max-h-[70vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272A]">
              <h2 className="text-sm font-mono font-bold text-white">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-[#71717A] hover:text-white text-xs"
              >
                ESC
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4">
              {Object.entries(categories).map(([cat, shortcuts]) => (
                <div key={cat}>
                  <h3 className="text-[10px] font-mono text-[#71717A] uppercase mb-2">{cat}</h3>
                  <div className="space-y-1">
                    {shortcuts.map((s) => (
                      <div key={s.key + (s.modifiers?.join('') || '')} className="flex items-center justify-between">
                        <span className="text-xs font-mono text-[#A1A1AA]">{s.label}</span>
                        <div className="flex gap-1">
                          {s.modifiers?.map((m) => (
                            <kbd key={m} className="px-1.5 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[10px] font-mono text-[#71717A]">
                              {m}
                            </kbd>
                          ))}
                          <kbd className="px-1.5 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[10px] font-mono text-white">
                            {s.key}
                          </kbd>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
