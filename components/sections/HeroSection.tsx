'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { useAppStore } from '@/lib/store';
import {
  ArrowRight,
  Compass,
  Sparkles,
  Layers,
  ChevronRight,
  Calendar,
  Box,
  Play
} from 'lucide-react';

export default function HeroSection() {
  const { hero } = homepageData;
  const { openPixelStream, openPanorama, openLightbox } = useAppStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % hero.images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [hero.images.length]);

  return (
    <section
      id="hero-section"
      className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-[#09090B] text-[#FAFAFA]"
    >
      {/* BACKGROUND IMAGE SLIDESHOW WITH DARK OVERLAY */}
      {hero.images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            currentImageIndex === idx ? 'opacity-30 scale-105' : 'opacity-0 scale-100'
          }`}
          style={{
            backgroundImage: `url(${img})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            transitionProperty: 'opacity, transform',
            transitionDuration: '1.8s',
          }}
        />
      ))}

      {/* Atmospheric Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-[#09090B]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-[#3ECF8E]/10 via-transparent to-transparent pointer-events-none" />

      {/* HERO CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center flex flex-col items-center">
        
        {/* Subtle Eyebrow / Live Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#FAFAFA] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#3ECF8E] animate-pulse" />
          <span className="text-[#3ECF8E] font-bold">NEXT-GEN ENGINE</span>
          <span className="text-[#71717A]">|</span>
          <span className="text-[#A1A1AA]">CGI Studio & Real-time WebXR</span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#FAFAFA] leading-[1.08] mb-6 font-sans"
        >
          {hero.headline}
        </h1>

        {/* Sub-headline */}
        <p className="text-sm sm:text-lg text-[#A1A1AA] font-normal leading-relaxed max-w-2xl mb-8">
          {hero.subheadline}
        </p>

        {/* 3 Call-To-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          {/* Primary CTA */}
          <Link
            href={hero.primaryCTA.href}
            id="hero-primary-cta"
            className="w-full sm:w-auto px-6 py-3 rounded bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#3ECF8E]/20"
          >
            <span>{hero.primaryCTA.label}</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </Link>

          {/* Secondary CTA */}
          <Link
            href={hero.secondaryCTA.href}
            id="hero-secondary-cta"
            className="w-full sm:w-auto px-6 py-3 rounded bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] font-bold text-xs uppercase tracking-wider border border-[#27272A] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#3ECF8E]" />
            <span>{hero.secondaryCTA.label}</span>
          </Link>
        </div>

        {/* Tertiary Text Link */}
        <div className="mt-5">
          <Link
            href={hero.tertiaryCTA.href}
            id="hero-tertiary-cta"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#3ECF8E] hover:text-emerald-300 transition-colors uppercase tracking-wider"
          >
            <span>{hero.tertiaryCTA.label}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* High Density Interactive Showcase Pills */}
        <div className="mt-12 pt-6 border-t border-[#27272A] grid grid-cols-3 gap-2.5 w-full max-w-xl">
          <button
            onClick={() => openPanorama('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2400&q=85', 'Solarium Penthouse 360')}
            className="p-2.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#3ECF8E]">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>360° Tour</span>
              </div>
              <span className="text-[9px] text-[#71717A]">16K</span>
            </div>
            <div className="text-[11px] text-[#A1A1AA] mt-1 group-hover:text-white truncate">
              Launch Sample
            </div>
          </button>

          <button
            onClick={openPixelStream}
            className="p-2.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#3ECF8E]/40 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#3ECF8E]">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pixel Stream</span>
              </div>
              <span className="text-[9px] bg-[#3ECF8E] text-black px-1 rounded font-extrabold">LIVE</span>
            </div>
            <div className="text-[11px] text-[#A1A1AA] mt-1 group-hover:text-white truncate">
              Cloud GPU Stream
            </div>
          </button>

          <button
            onClick={() =>
              openLightbox([
                {
                  url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
                  title: 'Nordic Monolith 8K Still',
                  type: 'image'
                }
              ])
            }
            className="p-2.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#3ECF8E]">
              <div className="flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5" />
                <span>8K Stills</span>
              </div>
              <span className="text-[9px] text-[#71717A]">RAW</span>
            </div>
            <div className="text-[11px] text-[#A1A1AA] mt-1 group-hover:text-white truncate">
              Ultra Zoom Gallery
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
