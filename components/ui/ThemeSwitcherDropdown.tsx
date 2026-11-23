'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeId } from '@/lib/theme-provider';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

export default function ThemeSwitcherDropdown() {
  const {
    theme,
    previewThemeId,
    setTheme,
    previewTheme,
    resolvedTheme,
  } = useTheme();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeThemeId = previewThemeId || theme;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        previewTheme(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [previewTheme]);

  const handleSelectTheme = (id: ThemeId) => {
    setTheme(id);
    setDropdownOpen(false);
    previewTheme(null);
  };

  // Only 3 primary modes for public pages: Light, Dark, System
  const PUBLIC_THEME_OPTIONS: Array<{
    id: ThemeId;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'light',
      label: 'Light',
      description: 'Daylight Clean Mode',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'dark',
      label: 'Dark',
      description: 'Cyan Spark Dark',
      icon: <Moon className="w-4 h-4 text-[var(--primary)]" />,
    },
    {
      id: 'system',
      label: 'System',
      description: 'Automatic OS Sync',
      icon: <Monitor className="w-4 h-4 text-sky-400" />,
    },
  ];

  const getActiveSign = () => {
    if (activeThemeId === 'light') {
      return <Sun className="w-4 h-4 text-amber-500" />;
    }
    if (activeThemeId === 'system') {
      return <Monitor className="w-4 h-4 text-sky-400" />;
    }
    // Dark or any dark preset
    return <Moon className="w-4 h-4 text-[var(--primary)]" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* TRIGGER BUTTON - DISPLAYS ONLY THE ACTIVE SIGN (SUN / MOON / SYSTEM) */}
      <button
        id="theme-switcher-btn"
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        suppressHydrationWarning
        className="p-2 rounded-md bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--primary)]/40 transition-all cursor-pointer flex items-center justify-center text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        title={`Theme: ${activeThemeId.toUpperCase()} (Click to switch Light / Dark / System)`}
        aria-label={`Current theme is ${activeThemeId}. Click to switch theme.`}
      >
        {getActiveSign()}
      </button>

      {/* DROPDOWN MENU */}
      {dropdownOpen && (
        <div
          id="theme-switcher-dropdown"
          className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] shadow-2xl shadow-black/80 p-1.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-150 text-[var(--text-primary)]"
        >
          <div className="px-2.5 py-1.5 border-b border-[var(--border)] mb-1 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Appearance
            </span>
            <span className="text-[9px] font-mono text-[var(--text-muted)] capitalize">
              {resolvedTheme} Mode
            </span>
          </div>

          <div className="space-y-1">
            {PUBLIC_THEME_OPTIONS.map((opt) => {
              const isSelected = activeThemeId === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  id={`theme-option-${opt.id}`}
                  onClick={() => handleSelectTheme(opt.id)}
                  onMouseEnter={() => previewTheme(opt.id)}
                  onMouseLeave={() => previewTheme(null)}
                  className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--primary)]/40 font-bold'
                      : 'hover:bg-[var(--bg-secondary)]/70 text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded-md bg-[var(--bg-primary)] border border-[var(--border)] shrink-0">
                      {opt.icon}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[var(--text-primary)]">{opt.label}</div>
                      <div className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                        {opt.description}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-[var(--primary)]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
