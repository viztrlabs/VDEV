'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface LetterItem {
  char: string;
  word: string;
  accent: string;
}

const LETTERS: LetterItem[] = [
  { char: 'V', word: 'VISUALIZE', accent: '#00F0FF' },
  { char: 'I', word: 'IMMERSE', accent: '#33F3FF' },
  { char: 'Z', word: 'ZERO-LATENCY', accent: '#42CF8B' },
  { char: 'T', word: 'TRANSFORM', accent: '#00F0FF' },
  { char: 'R', word: 'REAL-TIME', accent: '#42CF8B' },
];

export interface ViztrIntroOverlayProps {
  /**
   * 'intro': 5-second landing page arrival animation with countdown
   * 'loading': continuous page loader WITHOUT time limitation until page is loaded
   */
  mode?: 'intro' | 'loading';
  isLoading?: boolean;
  onFinish?: () => void;
}

export default function ViztrIntroOverlay({
  mode = 'intro',
  isLoading = true,
  onFinish,
}: ViztrIntroOverlayProps) {
  const isIntroMode = mode === 'intro';
  const [internalVisible, setInternalVisible] = useState(true);
  const [complete, setComplete] = useState(false);
  const [activeCharIndex, setActiveCharIndex] = useState(-1);
  const [shimmerCycle, setShimmerCycle] = useState(0);

  const shouldShow = isIntroMode ? internalVisible : isLoading;

  // Sequential letter entry
  useEffect(() => {
    setActiveCharIndex(-1);
    setComplete(false);

    const letterTimers = LETTERS.map((_, idx) =>
      setTimeout(() => {
        setActiveCharIndex(idx);
      }, 250 + idx * 220)
    );

    const completeTimer = setTimeout(() => {
      setComplete(true);
    }, 250 + LETTERS.length * 220 + 100);

    return () => {
      letterTimers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, []);

  // For loading mode: periodic shimmer wave (continuous without time limitation)
  useEffect(() => {
    if (isIntroMode) return;
    const interval = setInterval(() => {
      setShimmerCycle((prev) => prev + 1);
    }, 2800);
    return () => clearInterval(interval);
  }, [isIntroMode]);

  // For intro mode: exact 5-second auto-hide lifecycle
  useEffect(() => {
    if (!isIntroMode) return;

    const hideTimer = setTimeout(() => {
      setInternalVisible(false);
      onFinish?.();
    }, 5000);

    return () => clearTimeout(hideTimer);
  }, [isIntroMode, onFinish]);

  const handleSkip = () => {
    setInternalVisible(false);
    onFinish?.();
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          key="viztr-intro-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.06,
            filter: 'blur(16px)',
            transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0B] text-white select-none pointer-events-auto"
          role="dialog"
          aria-label={isIntroMode ? 'VizTR Welcome Animation' : 'VizTR Page Loading'}
        >
          {/* Ambient Lighting & Architectural Spatial Grid */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Radial glow spots */}
            <motion.div
              animate={
                !isIntroMode
                  ? {
                      scale: [1, 1.15, 1],
                      opacity: [0.15, 0.25, 0.15],
                      transition: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' }
                    }
                  : {}
              }
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-radial from-[#00F0FF]/15 via-[#42CF8B]/5 to-transparent blur-3xl"
            />
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00F0FF]/10 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#42CF8B]/10 blur-3xl" />

            {/* Subtle architectural perspective grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)
                `,
                backgroundSize: '48px 48px',
                maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
              }}
            />
          </div>

          {/* Top Status & Controls */}
          <div className="absolute top-6 left-0 right-0 px-6 sm:px-10 flex items-center justify-between z-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[11px] font-mono tracking-widest text-[#00F0FF]">
              {!isIntroMode ? (
                <Loader2 className="w-3 h-3 text-[#00F0FF] animate-spin" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-ping" />
              )}
              <span>
                {isIntroMode
                  ? 'SPATIAL REALITY INITIALIZING'
                  : 'LOADING EXPERIENCE • PLEASE WAIT'}
              </span>
            </div>

            {isIntroMode && (
              <button
                onClick={handleSkip}
                className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#00F0FF]/40 backdrop-blur-md text-xs font-mono uppercase tracking-widest text-[#B9CACB] hover:text-white transition-all cursor-pointer"
              >
                <span>Skip</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>

          {/* CENTER: Main Typography Assembling Complete VIZTR */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-5xl mx-auto">
            {/* Sequential Letters forming VIZTR */}
            <motion.div
              animate={
                !isIntroMode && complete
                  ? {
                      y: [0, -5, 0],
                      transition: { repeat: Infinity, duration: 3.2, ease: 'easeInOut' }
                    }
                  : {}
              }
              className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6"
            >
              {LETTERS.map((item, idx) => {
                const isShown = activeCharIndex >= idx;

                return (
                  <motion.div
                    key={item.char}
                    initial={{
                      opacity: 0,
                      y: 35,
                      scale: 0.65,
                      filter: 'blur(12px)'
                    }}
                    animate={
                      isShown
                        ? {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            filter: 'blur(0px)',
                            transition: {
                              type: 'spring',
                              damping: 14,
                              stiffness: 130,
                              mass: 0.8
                            }
                          }
                        : { opacity: 0, y: 35, scale: 0.65, filter: 'blur(12px)' }
                    }
                    className="relative flex flex-col items-center"
                  >
                    {/* Big Letter Glyph */}
                    <span
                      className={`text-6xl sm:text-8xl md:text-9xl lg:text-[10.5rem] font-black font-sans tracking-tight leading-none drop-shadow-[0_0_35px_rgba(0,240,255,0.35)] transition-all duration-300 ${
                        complete
                          ? 'text-transparent bg-clip-text bg-gradient-to-br from-white via-[#E5E2E3] to-[#00F0FF]'
                          : 'text-white'
                      }`}
                    >
                      {item.char}
                    </span>

                    {/* Sequential Sub-word Pill (Word by word reveal) */}
                    <motion.span
                      initial={{ opacity: 0, y: 8 }}
                      animate={
                        isShown
                          ? {
                              opacity: complete ? 0.8 : 1,
                              y: 0,
                              transition: { delay: 0.12, duration: 0.25 }
                            }
                          : { opacity: 0, y: 8 }
                      }
                      className="mt-2 sm:mt-3 text-[9px] sm:text-[11px] md:text-xs font-mono font-bold tracking-[0.25em] text-[#00F0FF] uppercase select-none"
                    >
                      {item.word}
                    </motion.span>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Complete VIZTR Shimmer & Tagline Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={
                complete
                  ? {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: 'easeOut' }
                    }
                  : { opacity: 0, y: 18 }
              }
              className="mt-6 sm:mt-8 flex flex-col items-center text-center"
            >
              {/* Electric Shimmer Line */}
              <div className="relative w-48 sm:w-72 h-[2px] overflow-hidden rounded-full bg-white/15 mb-4">
                <motion.div
                  key={shimmerCycle}
                  initial={{ x: '-100%' }}
                  animate={complete ? { x: '100%' } : { x: '-100%' }}
                  transition={{
                    repeat: isIntroMode ? Infinity : Infinity,
                    duration: 1.8,
                    ease: 'easeInOut'
                  }}
                  className="w-full h-full bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent shadow-[0_0_12px_#00F0FF]"
                />
              </div>

              {/* Master Tagline */}
              <p className="text-sm sm:text-base md:text-lg font-medium tracking-[0.3em] uppercase text-[#E5E2E3]">
                Visualize <span className="text-[#00F0FF]">✦</span> Experience{' '}
                <span className="text-[#42CF8B]">✦</span> Transform
              </p>

              {/* Architecture Studio Subtext */}
              <div className="mt-2 inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#B9CACB]/80">
                <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>
                  {isIntroMode
                    ? 'ARCHITECTURAL VISUALIZATION & REAL-TIME WEBXR'
                    : 'LOADING SPATIAL ARCHITECTURE & ASSETS'}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
            {isIntroMode ? (
              /* 5-second fixed progress bar for intro */
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5.0, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-[#00F0FF] via-[#42CF8B] to-[#00F0FF] shadow-[0_0_12px_#00F0FF]"
              />
            ) : (
              /* Infinite continuous scanning beam for loading mode (NO time limitation) */
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '350%' }}
                transition={{
                  repeat: Infinity,
                  duration: 1.6,
                  ease: 'easeInOut'
                }}
                className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent shadow-[0_0_14px_#00F0FF]"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
