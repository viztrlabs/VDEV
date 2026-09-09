'use client';

import React from 'react';
import { useTheme } from '@/lib/theme-provider';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, cycleLightDarkSystem } = useTheme();

  // Determine current active mode
  const currentMode = theme === 'light' ? 'light' : theme === 'system' ? 'system' : 'dark';

  return (
    <button
      id="header-theme-toggle-btn"
      type="button"
      onClick={cycleLightDarkSystem}
      suppressHydrationWarning
      className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18181B]/80 hover:bg-[#27272A] text-zinc-300 hover:text-white border border-[#27272A] hover:border-emerald-500/40 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-sm active:scale-95 text-xs font-semibold select-none"
      title={`Current Theme: ${currentMode.toUpperCase()} (Click to cycle Light → Dark → System)`}
      aria-label={`Current theme: ${currentMode}. Click to cycle Light, Dark, and System.`}
    >
      {/* Active Icon with State-Specific Glow */}
      <span className="relative flex items-center justify-center w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-12">
        {currentMode === 'light' && (
          <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 zoom-in-75 duration-200" />
        )}
        {currentMode === 'dark' && (
          <Moon className="w-4 h-4 text-[#3ECF8E] animate-in -spin-in-90 zoom-in-75 duration-200" />
        )}
        {currentMode === 'system' && (
          <Monitor className="w-4 h-4 text-sky-400 animate-in zoom-in-75 duration-200" />
        )}
      </span>

      {/* Pill Label */}
      <span className="hidden sm:inline capitalize text-[11px] font-mono tracking-wide text-zinc-300 group-hover:text-white transition-colors">
        {currentMode}
      </span>

      {/* Subtle State Indicators (Sun, Moon, System icons preview dots) */}
      <span className="flex items-center gap-0.5 ml-0.5" aria-hidden="true">
        <span
          className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
            currentMode === 'light' ? 'bg-amber-400 scale-110 shadow-[0_0_6px_rgba(251,191,36,0.6)]' : 'bg-zinc-600/50'
          }`}
        />
        <span
          className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
            currentMode === 'dark' ? 'bg-[#3ECF8E] scale-110 shadow-[0_0_6px_rgba(62,207,142,0.6)]' : 'bg-zinc-600/50'
          }`}
        />
        <span
          className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
            currentMode === 'system' ? 'bg-sky-400 scale-110 shadow-[0_0_6px_rgba(56,189,248,0.6)]' : 'bg-zinc-600/50'
          }`}
        />
      </span>
    </button>
  );
}
