'use client';

import React, { useEffect, useRef } from 'react';

export interface ContextMenuItem {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface EditorContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function EditorContextMenu({ x, y, items, onClose }: EditorContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (rect.right > vw) el.style.left = `${Math.max(0, vw - rect.width - 8)}px`;
    if (rect.bottom > vh) el.style.top = `${Math.max(0, vh - rect.height - 8)}px`;
  }, [x, y]);

  return (
    <div
      ref={ref}
      className="fixed z-[9999] min-w-[180px] rounded-lg border border-[#27272A] bg-[#09090B] shadow-2xl py-1"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) => {
        if (item.label === '---') {
          return <div key={i} className="my-1 border-t border-[#27272A]" />;
        }
        return (
          <button
            key={i}
            type="button"
            disabled={item.disabled}
            onClick={() => {
              item.action();
              onClose();
            }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono text-left transition-colors ${
              item.destructive
                ? 'text-rose-400 hover:bg-rose-500/10'
                : item.disabled
                  ? 'text-[#52525B] cursor-not-allowed'
                  : 'text-[#A1A1AA] hover:bg-[#18181B] hover:text-white'
            }`}
          >
            <span className="shrink-0 w-4 h-4 flex items-center justify-center">{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
