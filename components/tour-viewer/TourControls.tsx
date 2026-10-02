'use client';

/**
 * TourControls — control cluster for the tour viewer.
 * Zoom in/out, fullscreen, scene menu, autorotate toggle.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, Minimize, RotateCw, Pause, ChevronUp } from 'lucide-react';
import type { TourScene } from '@/lib/tourClientStore';

const BTN_CLASS =
  'p-2 rounded-lg bg-[#18181B]/70 border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all cursor-pointer';
const BTN_ACTIVE_CLASS =
  'p-2 rounded-lg bg-[#3ECF8E]/20 border border-[#3ECF8E] text-[#3ECF8E] hover:bg-[#3ECF8E]/30 transition-all cursor-pointer';

interface TourControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  autorotateEnabled: boolean;
  onToggleAutorotate?: () => void;
  scenes?: TourScene[];
  activeSceneId?: string;
  onSelectScene?: (id: string) => void;
}

export function TourControls({
  onZoomIn, onZoomOut, onToggleFullscreen, isFullscreen,
  autorotateEnabled, onToggleAutorotate, scenes, activeSceneId, onSelectScene,
}: TourControlsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleSelectScene = useCallback((id: string) => {
    setMenuOpen(false);
    onSelectScene?.(id);
  }, [onSelectScene]);

  return (
    <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 z-10">
      {scenes && scenes.length > 1 && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className={BTN_CLASS}
            title="Scenes"
            aria-label="Scene menu"
            aria-expanded={menuOpen}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div
              className="absolute bottom-full right-0 mb-2 min-w-[160px] max-h-64 overflow-y-auto rounded-lg bg-[#09090B] border border-[#27272A] py-1"
              role="menu"
            >
              {scenes.map((s) => (
                <button
                  key={s.id}
                  role="menuitem"
                  onClick={() => handleSelectScene(s.id)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer ${
                    s.id === activeSceneId ? 'text-[#3ECF8E]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {s.name || s.id}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {onToggleAutorotate && (
        <button
          onClick={onToggleAutorotate}
          className={autorotateEnabled ? BTN_ACTIVE_CLASS : BTN_CLASS}
          title={autorotateEnabled ? 'Pause autorotate' : 'Start autorotate'}
          aria-label={autorotateEnabled ? 'Pause autorotate' : 'Start autorotate'}
          aria-pressed={autorotateEnabled}
        >
          {autorotateEnabled ? <Pause className="w-4 h-4" /> : <RotateCw className="w-4 h-4" />}
        </button>
      )}
      <button onClick={onZoomIn} className={BTN_CLASS} title="Zoom In" aria-label="Zoom in">
        <ZoomIn className="w-4 h-4" />
      </button>
      <button onClick={onZoomOut} className={BTN_CLASS} title="Zoom Out" aria-label="Zoom out">
        <ZoomOut className="w-4 h-4" />
      </button>
      <button onClick={onToggleFullscreen} className={BTN_CLASS} title="Fullscreen" aria-label="Toggle fullscreen">
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </button>
    </div>
  );
}
