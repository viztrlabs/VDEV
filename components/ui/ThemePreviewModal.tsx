'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme, ThemeId, ThemeConfig } from '@/lib/theme-provider';
import {
  Palette,
  Check,
  Eye,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Layers,
  ShieldCheck,
  X,
  ArrowRight,
  Sliders,
  Smartphone,
  Cpu
} from 'lucide-react';

export default function ThemePreviewModal() {
  const {
    theme,
    previewThemeId,
    setTheme,
    previewTheme,
    availableThemes,
    themeModalOpen,
    setThemeModalOpen,
  } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hoveredThemeId, setHoveredThemeId] = useState<ThemeId | null>(null);

  const categories = ['All', 'Dark Mode', 'Light Mode', 'Specialty', 'Adaptive'];

  const filteredThemes =
    selectedCategory === 'All'
      ? availableThemes
      : availableThemes.filter((t) => t.category === selectedCategory);

  const activeEffectiveTheme = hoveredThemeId || previewThemeId || theme;
  const currentPreviewConfig =
    availableThemes.find((t) => t.id === activeEffectiveTheme) || availableThemes[0];

  const handleApplyTheme = (id: ThemeId) => {
    setTheme(id);
    setHoveredThemeId(null);
    previewTheme(null);
  };

  const handleCardMouseEnter = (id: ThemeId) => {
    setHoveredThemeId(id);
    previewTheme(id);
  };

  const handleCardMouseLeave = () => {
    setHoveredThemeId(null);
    previewTheme(null);
  };

  if (!themeModalOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="theme-preview-modal-backdrop"
        className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={() => {
          previewTheme(null);
          setThemeModalOpen(false);
        }}
      >
        <motion.div
          id="theme-preview-modal-content"
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl rounded-2xl bg-[#0D0F14] border border-[#27272A] text-[#FAFAFA] shadow-2xl shadow-black/90 overflow-hidden flex flex-col my-auto max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* MODAL HEADER */}
          <div className="p-5 sm:p-6 border-b border-[#27272A] bg-[#14171F] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#09090B] border border-[#3ECF8E]/40 flex items-center justify-center text-[#3ECF8E] shadow-sm">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-display font-bold tracking-tight text-white">
                    Studio Theme Studio & Live Previews
                  </h2>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/30">
                    {availableThemes.length} Color Engines
                  </span>
                </div>
                <p className="text-xs text-[#A1A1AA] font-mono mt-0.5">
                  Hover any theme card to preview live across the entire interface. Click to apply permanently.
                </p>
              </div>
            </div>

            <button
              id="btn-close-theme-modal"
              type="button"
              onClick={() => {
                previewTheme(null);
                setThemeModalOpen(false);
              }}
              className="w-8 h-8 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close theme studio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* LIVE PREVIEW BANNER (WHEN HOVERING/TESTING) */}
          {hoveredThemeId && hoveredThemeId !== theme && (
            <div className="px-6 py-2 bg-[#3ECF8E]/10 border-b border-[#3ECF8E]/30 flex items-center justify-between text-xs font-mono text-[#3ECF8E] animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 animate-pulse" />
                <span>
                  <strong>Live Preview Active:</strong> {currentPreviewConfig.name} ({currentPreviewConfig.subtitle})
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleApplyTheme(hoveredThemeId)}
                className="px-2.5 py-1 rounded bg-[#3ECF8E] text-black font-bold hover:bg-[#34b27b] transition-colors cursor-pointer"
              >
                Apply This Theme
              </button>
            </div>
          )}

          {/* MAIN MODAL BODY */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#09090B]/60">
            {/* CATEGORY FILTER TABS & CURRENT THEME STATUS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#27272A]/70">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#18181B] text-[#3ECF8E] border border-[#3ECF8E]/50 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181B]/50 border border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500">Active Theme:</span>
                <span className="px-2 py-0.5 rounded bg-[#18181B] text-[#3ECF8E] border border-[#27272A] font-bold">
                  {availableThemes.find((t) => t.id === theme)?.name || theme}
                </span>
              </div>
            </div>

            {/* THEMES GRID WITH MINI INTERACTIVE PREVIEWS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredThemes.map((t) => {
                const isActive = theme === t.id;
                const isHovered = hoveredThemeId === t.id;

                return (
                  <div
                    key={t.id}
                    id={`theme-card-${t.id}`}
                    onMouseEnter={() => handleCardMouseEnter(t.id)}
                    onMouseLeave={handleCardMouseLeave}
                    onClick={() => handleApplyTheme(t.id)}
                    className={`relative rounded-xl border p-4.5 flex flex-col justify-between space-y-4 transition-all duration-200 cursor-pointer group ${
                      isActive
                        ? 'bg-[#14171F] border-[#3ECF8E] shadow-lg shadow-[#3ECF8E]/10 ring-1 ring-[#3ECF8E]/40'
                        : isHovered
                        ? 'bg-[#18181B] border-zinc-500 scale-[1.01] shadow-xl'
                        : 'bg-[#121215] border-[#27272A] hover:border-zinc-600 hover:bg-[#18181B]'
                    }`}
                  >
                    {/* TOP INFO & ACTIVE INDICATOR */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-white group-hover:text-[#3ECF8E] transition-colors">
                              {t.name}
                            </h3>
                            {t.id === 'dark' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-800 text-zinc-300">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{t.subtitle}</p>
                        </div>

                        {isActive ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#3ECF8E] text-black">
                            <Check className="w-3 h-3" />
                            <span>ACTIVE</span>
                          </span>
                        ) : isHovered ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/40">
                            <Eye className="w-3 h-3" />
                            <span>PREVIEWING</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-500 bg-[#09090B] border border-[#27272A]">
                            {t.category}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mt-2">
                        {t.description}
                      </p>
                    </div>

                    {/* MINI UI COMPONENT PREVIEW MOCKUP */}
                    <div
                      className="rounded-lg p-2.5 border transition-all space-y-2 shadow-inner"
                      style={{
                        backgroundColor: t.colors.bg,
                        borderColor: t.colors.border,
                        color: t.colors.text,
                      }}
                    >
                      {/* Mini Header Bar */}
                      <div
                        className="flex items-center justify-between px-2 py-1 rounded border text-[10px] font-mono"
                        style={{
                          backgroundColor: t.colors.card,
                          borderColor: t.colors.border,
                          color: t.colors.text,
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: t.colors.primary }}
                          />
                          <span className="font-bold">VizTR UI</span>
                        </div>
                        <div
                          className="px-1 py-0.5 rounded text-[9px] font-bold"
                          style={{
                            backgroundColor: t.colors.badgeBg,
                            color: t.colors.badgeText,
                          }}
                        >
                          LUMEN
                        </div>
                      </div>

                      {/* Mini Metric Card */}
                      <div
                        className="p-2 rounded border flex items-center justify-between"
                        style={{
                          backgroundColor: t.colors.card,
                          borderColor: t.colors.border,
                        }}
                      >
                        <div>
                          <div className="text-[9px] opacity-70 font-mono">Render Latency</div>
                          <div className="text-xs font-bold font-mono">12.4ms 4K</div>
                        </div>
                        <div
                          className="px-2 py-1 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: t.colors.primary,
                            color: t.resolvedMode === 'light' ? '#ffffff' : '#000000',
                          }}
                        >
                          60 FPS
                        </div>
                      </div>
                    </div>

                    {/* PALETTE COLOR SWATCHES & CONTRAST STATS */}
                    <div className="pt-2 border-t border-[#27272A]/70 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-500 uppercase">Palette:</span>
                        <div className="flex items-center -space-x-1">
                          <div
                            className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: t.colors.bg }}
                            title={`Background: ${t.colors.bg}`}
                          />
                          <div
                            className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: t.colors.card }}
                            title={`Card Surface: ${t.colors.card}`}
                          />
                          <div
                            className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: t.colors.primary }}
                            title={`Primary Accent: ${t.colors.primary}`}
                          />
                          <div
                            className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: t.colors.text }}
                            title={`Text: ${t.colors.text}`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                        <ShieldCheck className="w-3 h-3 text-[#3ECF8E]" />
                        <span>{t.contrastRatio}</span>
                      </div>
                    </div>

                    {/* ACTION BUTTON */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyTheme(t.id);
                      }}
                      className={`w-full py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#18181B] text-zinc-400 border border-[#27272A] cursor-default'
                          : 'bg-[#18181B] hover:bg-[#3ECF8E] text-zinc-300 hover:text-black border border-[#27272A] hover:border-[#3ECF8E]'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#3ECF8E]" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <span>Apply {t.name}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* LIVE THEME COMPONENT SANDBOX PREVIEW */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-[#14171F] border border-[#27272A] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#3ECF8E]" />
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Interactive Element Sandbox Preview
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  Target: <strong className="text-[#3ECF8E]">{currentPreviewConfig.name}</strong>
                </span>
              </div>

              <div
                className="p-4 rounded-xl border transition-all grid grid-cols-1 sm:grid-cols-3 gap-3"
                style={{
                  backgroundColor: currentPreviewConfig.colors.bg,
                  borderColor: currentPreviewConfig.colors.border,
                }}
              >
                {/* Sandbox Card 1 */}
                <div
                  className="p-3 rounded-lg border space-y-2"
                  style={{
                    backgroundColor: currentPreviewConfig.colors.card,
                    borderColor: currentPreviewConfig.colors.border,
                    color: currentPreviewConfig.colors.text,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono opacity-70">TELEMETRY</span>
                    <span
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: currentPreviewConfig.colors.badgeBg,
                        color: currentPreviewConfig.colors.badgeText,
                      }}
                    >
                      ONLINE
                    </span>
                  </div>
                  <div className="text-sm font-bold">Unreal Engine 5.4</div>
                  <div className="text-[11px] opacity-80">8K Photorealistic Frame Stream</div>
                </div>

                {/* Sandbox Card 2 */}
                <div
                  className="p-3 rounded-lg border space-y-2 flex flex-col justify-between"
                  style={{
                    backgroundColor: currentPreviewConfig.colors.card,
                    borderColor: currentPreviewConfig.colors.border,
                    color: currentPreviewConfig.colors.text,
                  }}
                >
                  <div className="text-[10px] font-mono opacity-70">CALL TO ACTION</div>
                  <button
                    type="button"
                    className="w-full py-1.5 rounded text-xs font-bold font-mono transition-opacity cursor-pointer"
                    style={{
                      backgroundColor: currentPreviewConfig.colors.primary,
                      color: currentPreviewConfig.resolvedMode === 'light' ? '#ffffff' : '#000000',
                    }}
                  >
                    Launch Interactive XR
                  </button>
                </div>

                {/* Sandbox Card 3 */}
                <div
                  className="p-3 rounded-lg border space-y-2"
                  style={{
                    backgroundColor: currentPreviewConfig.colors.card,
                    borderColor: currentPreviewConfig.colors.border,
                    color: currentPreviewConfig.colors.text,
                  }}
                >
                  <div className="text-[10px] font-mono opacity-70">DESIGN TOKENS</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border flex items-center justify-center font-mono text-[10px] font-bold"
                      style={{
                        backgroundColor: currentPreviewConfig.colors.primary,
                        color: currentPreviewConfig.resolvedMode === 'light' ? '#ffffff' : '#000000',
                      }}
                    >
                      Aa
                    </div>
                    <div className="text-xs font-mono">
                      <div className="font-bold">Inter / Display</div>
                      <div className="text-[10px] opacity-60">WCAG {currentPreviewConfig.contrastRatio}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MODAL FOOTER */}
          <div className="p-4 border-t border-[#27272A] bg-[#14171F] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-400">
              <Sparkles className="w-4 h-4 text-[#3ECF8E]" />
              <span>Themes persist across your browser session via localStorage (`viztr-theme`).</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  previewTheme(null);
                  setThemeModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
