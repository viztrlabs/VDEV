'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface MenuItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
  children?: MenuItem[];
}

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  items: MenuItem[];
  title?: string;
}

interface ContextMenuContextType {
  showContextMenu: (x: number, y: number, items: MenuItem[], title?: string) => void;
  hideContextMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextType>({
  showContextMenu: () => {},
  hideContextMenu: () => {},
});

export function useContextMenu() {
  return useContext(ContextMenuContext);
}

export function ContextMenuProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    items: [],
  });
  const menuRef = useRef<HTMLDivElement>(null);

  const showContextMenu = useCallback((x: number, y: number, items: MenuItem[], title?: string) => {
    setState({ isOpen: true, x, y, items, title });
  }, []);

  const hideContextMenu = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  useEffect(() => {
    if (!state.isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        hideContextMenu();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideContextMenu();
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [state.isOpen, hideContextMenu]);

  useEffect(() => {
    if (state.isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;

      let x = state.x;
      let y = state.y;

      if (x + rect.width > viewW) x = viewW - rect.width - 8;
      if (y + rect.height > viewH) y = viewH - rect.height - 8;
      if (x < 0) x = 8;
      if (y < 0) y = 8;

      menuRef.current.style.left = `${x}px`;
      menuRef.current.style.top = `${y}px`;
    }
  }, [state.isOpen, state.x, state.y]);

  return (
    <ContextMenuContext.Provider value={{ showContextMenu, hideContextMenu }}>
      {children}
      {state.isOpen && (
        <>
          <div className="fixed inset-0 z-[99]" />
          <div
            ref={menuRef}
            className="fixed z-[100] bg-[#18181B] border border-[#27272A] rounded-lg shadow-2xl py-1 min-w-[200px] backdrop-blur-sm"
            style={{ left: state.x, top: state.y }}
          >
            {state.title && (
              <div className="px-3 py-1.5 text-[10px] font-mono text-[#71717A] border-b border-[#27272A]">
                {state.title}
              </div>
            )}
            {state.items.map((item, i) => {
              if (item.divider) {
                return <div key={i} className="border-t border-[#27272A] my-1" />;
              }
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick?.();
                      hideContextMenu();
                    }
                  }}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-mono transition-colors ${
                    item.danger
                      ? 'text-red-500 hover:bg-red-500/10'
                      : item.disabled
                      ? 'text-[#71717A]/50 cursor-not-allowed'
                      : 'text-[#A1A1AA] hover:bg-white/5'
                  }`}
                >
                  {item.icon && <item.icon className="w-3.5 h-3.5 flex-shrink-0" />}
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-[10px] text-[#71717A] ml-4">{item.shortcut}</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </ContextMenuContext.Provider>
  );
}
