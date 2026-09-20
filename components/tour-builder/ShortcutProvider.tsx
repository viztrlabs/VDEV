'use client';

import React from 'react';

interface ShortcutProviderProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onPreview?: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
}

export function ShortcutProvider({
  activeTool,
  onToolChange,
  onSave,
  onUndo,
  onRedo,
  onDelete,
  children,
}: ShortcutProviderProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (inEditable) return;

      const mod = e.ctrlKey || e.metaKey;

      if (mod) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            onSave?.();
            return;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) onRedo?.();
            else onUndo?.();
            return;
        }
      }

      if (!mod && !e.altKey) {
        const shortcuts: Record<string, string> = {
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
        const tool = shortcuts[e.key.toLowerCase()];
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToolChange, onSave, onUndo, onRedo, onDelete]);

  return <>{children}</>;
}
