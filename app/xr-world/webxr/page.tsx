'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { servicePagesData } from '@/data/pages';
import ContactForm from '@/components/forms/ContactForm';
import { useAppStore } from '@/lib/store';
import {
  ArrowRight,
  CheckCircle2,
  Box,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function WebXRServicePage() {
  const data = servicePagesData.webar;
  const { openModelViewer } = useAppStore();

  return (
    <main className="flex-1 w-full pb-20">
      {/* 1. HERO PRESENTATION AREA (Full Landing Page Presentation Aspect Ratio) */}
      <section
        id="hero-section"
        className="relative w-full h-screen min-h-[680px] flex flex-col justify-between items-center overflow-hidden text-white select-none transition-colors duration-300"
      >
        {/* MEDIA LAYER: Full Bleed High-Res Architectural / Spatial Render */}
        <div className="hero-media-layer absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={data.heroImage}
              alt={data.title}
              fill
              priority
              quality={90}
              sizes="100vw"
              className="hero-bg-image object-cover object-center render-lighting-enhanced"
            />
          </div>
          {/* Ambient atmospheric dark gradient overlays for cinematic depth and high text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-[#0A0A0B]/65 pointer-events-none z-20" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#0A0A0B]/25 to-[#0A0A0B]/80 pointer-events-none z-20" />
        </div>

        {/* TOP AREA: Clears floating header & hosts top Eyebrow Badge (No directory breadcrumbs) */}
        <div className="relative z-20 w-full pt-16 sm:pt-20 shrink-0 flex justify-center px-2 sm:px-4">
          <div className="hero-eyebrow inline-flex items-center gap-1.5 sm:gap-2.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full backdrop-blur-xl shadow-2xl transition-all border border-[#1E293B] text-[10px] sm:text-xs max-w-[95vw] sm:max-w-none">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#42CF8B] animate-pulse shadow-[0_0_8px_#42CF8B] shrink-0" />
            <span className="font-bold text-[#42CF8B] tracking-wider uppercase shrink-0">SPATIAL COMPUTING</span>
            <span className="opacity-40 shrink-0">|</span>
            <span className="opacity-80 shrink-0">Browser-Native WebXR Engine</span>
          </div>
        </div>

        {/* BOTTOM HERO CONTENT: Fluid typography, cohesive hierarchy, pill CTAs & Scroll Explore Indicator */}
        <div className="relative z-20 w-full container-ultrawide text-center flex flex-col items-center justify-end mt-auto px-4 sm:px-6 pb-6 sm:pb-8">
          {/* Master Fluid Headline */}
          <h1 className="hero-headline text-fluid-hero font-extrabold tracking-tight mb-2 sm:mb-3 font-sans">
            {data.title}
          </h1>

          {/* Sub-headline / Tagline */}
          <p className="hero-subheadline text-fluid-sub font-medium tracking-wide mb-3 max-w-3xl">
            {data.subtitle || 'Ultra-Fast 60fps 3D Geometry in Safari, Chrome & Edge'}
          </p>

          {/* Architectural Visualization Sub Heading */}
          <p className="hero-desc text-fluid-desc max-w-2xl 2xl:max-w-3xl text-center prose-readable font-normal leading-relaxed mb-6 text-[#E5E2E3]">
            {data.description}
          </p>

          {/* Pill-shaped Call-To-Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-6">
            {/* Primary CTA: High-impact electric cyan pill */}
            <button
              type="button"
              onClick={() => openModelViewer('/assets/bmw-i8.glb', 'BMW i8 — WebXR Model')}
              id="hero-primary-cta"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_24px_rgba(0,240,255,0.4)] hover:shadow-[0_0_36px_rgba(0,240,255,0.65)] hover:scale-105 active:scale-95"
            >
              <Box className="w-4 h-4" />
              <span>Test Interactive WebXR Model</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Secondary CTA: Frosted glass pill */}
            <Link
              href="/book-consultation"
              id="hero-secondary-cta"
              className="hero-secondary-btn w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider backdrop-blur-xl transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-[#1E293B]"
            >
              <Sparkles className="w-4 h-4 text-[#42CF8B]" />
              <span>Deploy WebXR Pipeline</span>
            </Link>
          </div>

          {/* Bottom Bar: Scroll Indicator */}
          <div className="relative w-full flex items-center justify-center pt-2">
            <div className="sm:block">
              <a
                href="#webxr-overview"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById('webxr-overview');
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                  }
                }}
                className="hero-scroll-btn group inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer shadow-lg border border-[#1E293B]"
                aria-label="Scroll down to explore page content"
              >
                <span>Scroll to explore</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#00F0FF] animate-bounce" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW & CAPABILITIES */}
      <section id="webxr-overview" className="py-20 px-6 max-w-[1280px] mx-auto space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Browser-Native 3D
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white font-display">
              Ultra-Fast 60fps 3D Geometry in Safari, Chrome & Edge
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {data.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {data.capabilities.map((cap, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-900 text-white border border-zinc-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-lg font-bold font-display">WebXR Engine Specs</h3>
              <span className="text-xs text-emerald-400 font-mono">WebGPU / Three.js</span>
            </div>
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-between">
                <span className="font-semibold text-white">Load Time</span>
                <span className="text-emerald-400 font-bold">&lt; 1.8 seconds (Draco Compressed)</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-between">
                <span className="font-semibold text-white">Lighting Accuracy</span>
                <span className="text-zinc-400">PBR Environment Maps + Screen Space Reflections</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-between">
                <span className="font-semibold text-white">Device Coverage</span>
                <span className="text-zinc-400">iOS, Android, macOS, Windows (100% Web)</span>
              </div>
            </div>
          </div>
        </div>

        {/* DELIVERABLES & PRICING */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white font-display">
              Technical Deliverables
            </h4>
            <ul className="space-y-2.5">
              {data.deliverables.map((del, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{del}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 space-y-4">
            <h4 className="text-lg font-bold font-display">
              WebXR Production Investment
            </h4>
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Single Unit / Villa WebXR Model:</span>
                <span className="font-mono font-bold text-white">$2,800 – $4,500</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Full Building / Tower with Floorplan Configurator:</span>
                <span className="font-mono font-bold text-white">$6,000 – $12,000</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-400">Includes 12 Months High-Speed CDN Hosting:</span>
                <span className="font-mono font-bold text-emerald-400">Included Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRIEF INQUIRY FORM */}
      <section className="py-16 px-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-display">
            Inquire About WebXR Deployment
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Specify your CAD format and desired interactive features (custom materials, sun study, floor selector).
          </p>
        </div>
        <ContactForm initialService="WebXR (Zero-Install 3D)" />
      </section>
    </main>
  );
}
