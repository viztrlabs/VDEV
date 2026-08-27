'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeId, ThemeConfig } from '@/lib/theme-provider';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Check,
  Eye,
  Sliders,
  ChevronRight
} from 'lucide-react';

export default function ThemeSwitcherDropdown() {
  const {
    theme,
    previewThemeId,
    setTheme,
    previewTheme,
    availableThemes,
    setThemeModalOpen,
  } = useTheme();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeConfig =
    availableThemes.find((t) => t.id === (previewThemeId || theme)) || availableThemes[0];

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

  const getThemeIcon = (id: ThemeId) => {
    switch (id) {
      case 'light':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'glass':
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'system':
        return <Monitor className="w-4 h-4 text-sky-400" />;
      case 'dark':
      case 'obsidian':
      case 'bronze':
      case 'blueprint':
      default:
        return <Moon className="w-4 h-4 text-[#3ECF8E]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* TRIGGER BUTTON - DISPLAYS ONLY THE SELECTED THEME ICON */}
      <button
        id="theme-switcher-btn"
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        suppressHydrationWarning
        className="p-2 rounded-md bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/40 transition-all cursor-pointer flex items-center justify-center text-white focus:outline-none focus:ring-1 focus:ring-[#3ECF8E]"
        title={`Theme: ${activeConfig.name} (Click to switch Light / Dark / System / Glassmorphism)`}
        aria-label={`Current theme is ${activeConfig.name}. Click to change theme.`}
      >
        {getThemeIcon(activeConfig.id)}
      </button>

      {/* DROPDOWN MENU */}
      {dropdownOpen && (
        <div
          id="theme-switcher-dropdown"
          className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-[#14171F] border border-[#27272A] shadow-2xl shadow-black/80 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150 text-[#FAFAFA]"
        >
          {/* HEADER */}
          <div className="px-3.5 py-2 border-b border-[#27272A] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              <Palette className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span>Switch Studio Theme</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">{availableThemes.length} Themes</span>
          </div>

          {/* THEME ITEMS LIST */}
          <div className="p-1.5 space-y-1 max-h-72 overflow-y-auto">
            {availableThemes.map((t) => {
              const isSelected = theme === t.id;
              const isPreviewing = previewThemeId === t.id;

              return (
                <button
                  key={t.id}
                  type="button"
                  id={`theme-option-${t.id}`}
                  onClick={() => handleSelectTheme(t.id)}
                  onMouseEnter={() => previewTheme(t.id)}
                  onMouseLeave={() => previewTheme(null)}
                  className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#18181B] text-white border border-[#3ECF8E]/40 font-bold'
                      : isPreviewing
                      ? 'bg-[#18181B]/80 text-white border border-zinc-500'
                      : 'hover:bg-[#18181B] text-zinc-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Color Swatch Dot */}
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-black/50 shadow-sm shrink-0"
                      style={{ backgroundColor: t.colors.primary }}
                    />

                    <div>
                      <div className="text-xs flex items-center gap-1.5">
                        <span>{t.name}</span>
                        {t.id === 'dark' && (
                          <span className="text-[9px] font-mono text-zinc-500">Default</span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 line-clamp-1">
                        {t.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-[#3ECF8E]" />
                    ) : isPreviewing ? (
                      <Eye className="w-3 h-3 text-zinc-400" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          {/* FOOTER ACTION: OPEN FULL THEME STUDIO PREVIEW GALLERY */}
          <div className="p-2 border-t border-[#27272A] bg-[#0D0F14]">
            <button
              type="button"
              id="btn-open-theme-studio-modal"
              onClick={() => {
                setDropdownOpen(false);
                setThemeModalOpen(true);
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/40 text-[#3ECF8E] text-xs font-mono font-bold flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Open Theme Studio & Previews</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
