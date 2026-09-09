'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { homepageData } from '@/data/homepage';
import {
  ArrowRight,
  Compass,
  FileCode,
  Box,
  Image as ImageIcon,
  Play,
  ScanLine,
  Headset,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function HeroSection() {
  const { hero, pipelineStages } = homepageData;
  const [currentPipelineIndex, setCurrentPipelineIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-advance sliding hero images every 4 seconds (4000ms duration)
  useEffect(() => {
    if (!hero.images || hero.images.length === 0) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % hero.images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [hero.images]);

  // Rotate pipeline stages smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPipelineIndex((prev) => (prev + 1) % pipelineStages.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [pipelineStages.length]);

  const getStageIcon = (name: string) => {
    const icons: Record<string, React.ReactNode> = {
      FileCode: <FileCode className="w-3.5 h-3.5" />,
      Box: <Box className="w-3.5 h-3.5" />,
      Image: <ImageIcon className="w-3.5 h-3.5" />,
      Play: <Play className="w-3.5 h-3.5" />,
      ScanLine: <ScanLine className="w-3.5 h-3.5" />,
      Headset: <Headset className="w-3.5 h-3.5" />,
      Sparkles: <Sparkles className="w-3.5 h-3.5" />,
    };
    return icons[name] || <Box className="w-3.5 h-3.5" />;
  };

  return (
    <section
      id="hero-section"
      className="relative w-full h-screen min-h-[680px] flex flex-col justify-between items-center overflow-hidden text-white select-none transition-colors duration-300"
    >
      {/* 1. MEDIA LAYER: High-Resolution Architectural Renders sliding every 4 seconds */}
      <div className="hero-media-layer absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {hero.images.map((img, idx) => {
          const isActive = currentImageIndex === idx;
          return (
            <div
              key={img}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                isActive
                  ? 'opacity-100 scale-100 z-10'
                  : 'opacity-0 scale-105 z-0'
              }`}
            >
              <Image
                src={img}
                alt={`VizTR Architectural Render ${idx + 1}`}
                fill
                priority={idx === 0}
                quality={90}
                sizes="100vw"
                className="hero-bg-image object-cover object-center render-lighting-enhanced"
              />
            </div>
          );
        })}

        {/* Ambient atmospheric dark gradient overlays for cinematic depth and high text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-[#0A0A0B]/65 pointer-events-none z-20" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#0A0A0B]/25 to-[#0A0A0B]/80 pointer-events-none z-20" />
      </div>

      {/* 3. TOP SPACER: Clears floating header */}
      <div className="w-full pt-16 sm:pt-20 shrink-0" />

      {/* 4. CENTER HERO CONTENT: Fluid typography, readable constraints, and pill CTAs */}
      <div className="relative z-20 w-full container-ultrawide text-center flex flex-col items-center justify-center my-auto px-4 sm:px-6">
        {/* Eyebrow Badge Pill */}
        <div className="hero-eyebrow inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full backdrop-blur-xl shadow-2xl mb-6 transition-colors border border-[#1E293B]">
          <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse shadow-[0_0_8px_#42CF8B]" />
          <span className="font-bold text-[#42CF8B] tracking-wider uppercase">NEXT-GEN SPATIAL ARCHITECTURE</span>
          <span className="opacity-40">|</span>
          <span className="opacity-80 hidden sm:inline">CGI Studio & Real-time WebXR</span>
        </div>

        {/* Master Fluid Headline - Restored to exact original font-sans font for VIZTR only */}
        <h1 className="hero-headline text-fluid-hero font-extrabold tracking-tight mb-3 font-sans">
          {hero.headline}
        </h1>

        {/* Sub-headline / Tagline */}
        <p className="hero-subheadline text-fluid-sub font-medium tracking-wide mb-4 max-w-3xl">
          {hero.subheadline}
        </p>

        {/* Description - Constrained for ultra-wide reading comfort */}
        <p className="hero-desc text-fluid-desc max-w-2xl 2xl:max-w-3xl prose-readable font-normal leading-relaxed mb-8 sm:mb-10 text-[#E5E2E3]">
          {hero.description}
        </p>

        {/* Pill-shaped Call-To-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-6">
          {/* Primary CTA: High-impact electric cyan pill */}
          <Link
            href={hero.primaryCTA.href}
            id="hero-primary-cta"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_24px_rgba(0,240,255,0.4)] hover:shadow-[0_0_36px_rgba(0,240,255,0.65)] hover:scale-105 active:scale-95"
          >
            <span>{hero.primaryCTA.label}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Secondary CTA: Frosted glass pill */}
          <Link
            href={hero.secondaryCTA.href}
            id="hero-secondary-cta"
            className="hero-secondary-btn w-full sm:w-auto px-8 py-4 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider backdrop-blur-xl transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-[#1E293B]"
          >
            <Compass className="w-4 h-4 text-[#42CF8B]" />
            <span>{hero.secondaryCTA.label}</span>
          </Link>
        </div>

        {/* Slideshow Progress Dots (Auto-advances every 4 seconds) */}
        <div className="flex items-center gap-2 mt-2 pointer-events-auto" aria-label="Hero slide indicators">
          {hero.images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentImageIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                currentImageIndex === idx
                  ? 'w-7 bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]'
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              title={`Jump to render ${idx + 1}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 5. BOTTOM SECTION: Scroll to Explore indicator & Left/Right Nav */}
      <div className="absolute bottom-6 left-0 right-0 z-20 w-full container-ultrawide px-4 pointer-events-none flex items-end justify-between">
        {/* Navigation Arrows (Bottom-Left) */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            type="button"
            onClick={() => setCurrentImageIndex((prev) => (prev - 1 + hero.images.length) % hero.images.length)}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-[#00F0FF]/20 border border-white/10 hover:border-[#00F0FF]/50 text-white flex items-center justify-center backdrop-blur-md transition-all group"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentImageIndex((prev) => (prev + 1) % hero.images.length)}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-[#00F0FF]/20 border border-white/10 hover:border-[#00F0FF]/50 text-white flex items-center justify-center backdrop-blur-md transition-all group"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Animated Scroll Indicator Pill (Center-ish / Right) */}
        <div className="pointer-events-auto">
        <a
          href="#viztr-homepage"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
          }}
          className="hero-scroll-btn group inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer shadow-lg border border-[#1E293B]"
          aria-label="Scroll down to explore page content"
        >
          <span>Scroll to explore</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#00F0FF] animate-bounce" />
        </a>
        </div>
      </div>
    </section>
  );
}