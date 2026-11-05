'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { servicePagesData } from '@/data/pages';
import ContactForm from '@/components/forms/ContactForm';
import { useAppStore } from '@/lib/store';
import { ScanLine, QrCode, Smartphone, CheckCircle2, ArrowRight, ChevronDown, Sparkles } from 'lucide-react';

export default function WebARServicePage() {
  const data = servicePagesData.webar;
  const { openModelViewer } = useAppStore();

  return (
    <main className="flex-1 w-full pb-20">
      {/* 1. HERO PRESENTATION AREA (Full Landing Page Presentation Aspect Ratio) */}
      <section
        id="hero-section"
        className="relative w-full h-screen min-h-[680px] flex flex-col justify-between items-center overflow-hidden text-white select-none transition-colors duration-300"
      >
        {/* MEDIA LAYER: Full Bleed High-Res Render */}
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-[#0A0A0B]/65 pointer-events-none z-20" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#0A0A0B]/25 to-[#0A0A0B]/80 pointer-events-none z-20" />
        </div>

        {/* TOP AREA: Clears floating header & hosts Eyebrow Badge (No directory breadcrumbs) */}
        <div className="relative z-20 w-full pt-16 sm:pt-20 shrink-0 flex justify-center px-2 sm:px-4">
          <div className="hero-eyebrow inline-flex items-center gap-1.5 sm:gap-2.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full backdrop-blur-xl shadow-2xl transition-all border border-[#1E293B] text-[10px] sm:text-xs max-w-[95vw] sm:max-w-none">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#42CF8B] animate-pulse shadow-[0_0_8px_#42CF8B] shrink-0" />
            <span className="font-bold text-[#42CF8B] tracking-wider uppercase shrink-0">AUGMENTED REALITY</span>
            <span className="opacity-40 shrink-0">|</span>
            <span className="opacity-80 shrink-0">Browser-Native WebAR Instant Projection</span>
          </div>
        </div>

        {/* BOTTOM HERO CONTENT: Fluid typography, original content & pill CTAs */}
        <div className="relative z-20 w-full container-ultrawide text-center flex flex-col items-center justify-end mt-auto px-4 sm:px-6 pb-6 sm:pb-8">
          <h1 className="hero-headline text-fluid-hero font-extrabold tracking-tight mb-2 sm:mb-3 font-sans">
            {data.title}
          </h1>

          <p className="hero-subheadline text-fluid-sub font-medium tracking-wide mb-3 max-w-3xl">
            {data.subtitle}
          </p>

          <p className="hero-desc text-fluid-desc max-w-2xl 2xl:max-w-3xl text-center prose-readable font-normal leading-relaxed mb-6 text-[#E5E2E3]">
            {data.description || 'Project true-scale architectural models onto conference tables or on-site land directly from mobile iOS Safari and Android Chrome.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-6">
            <button
              onClick={() => openModelViewer('/assets/bmw-i8.glb', 'BMW i8 — WebAR Tabletop')}
              id="hero-primary-cta"
              type="button"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_24px_rgba(0,240,255,0.4)] hover:shadow-[0_0_36px_rgba(0,240,255,0.65)] hover:scale-105 active:scale-95"
            >
              <ScanLine className="w-4 h-4" />
              <span>Simulate WebAR Placement</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <a
              href="#webar-capabilities"
              id="hero-secondary-cta"
              className="hero-secondary-btn w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider backdrop-blur-xl transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-[#1E293B]"
            >
              <Sparkles className="w-4 h-4 text-[#42CF8B]" />
              <span>Explore AR Features</span>
            </a>
          </div>

          {/* Bottom Bar: Scroll Indicator */}
          <div className="relative w-full flex items-center justify-center pt-2">
            <div className="sm:block">
              <a
                href="#webar-capabilities"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById('webar-capabilities');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                  else window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                }}
                className="hero-scroll-btn group inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer shadow-lg border border-[#1E293B]"
                aria-label="Scroll down to explore"
              >
                <span>Scroll to explore</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#00F0FF] animate-bounce" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW & CAPABILITIES */}
      <section id="webar-capabilities" className="py-20 px-6 max-w-[1280px] mx-auto space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Augmented Reality
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white font-display">
              Project True Scale Models Onto Conference Tables or On-Site Land
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {data.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {data.capabilities.map((cap, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AR QR Launcher Card */}
          <div className="p-8 rounded-3xl bg-zinc-900 text-white border border-zinc-800 space-y-6 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center mx-auto">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display">Instant Mobile QR Trigger</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Scan with any iPhone or Android camera to anchor the 3D building onto your desk in under 2 seconds.
              </p>
            </div>
            <button
              onClick={() => openModelViewer('/assets/bmw-i8.glb', 'BMW i8 — WebAR Tabletop')}
              className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-rose-600 text-white text-xs font-semibold transition-colors inline-flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Launch AR Simulator Mode</span>
            </button>
          </div>
        </div>

        {/* DELIVERABLES & PRICING */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white font-display">
              WebAR Deliverables
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
              WebAR Investment Packages
            </h4>
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Single Scale Model WebAR:</span>
                <span className="font-mono font-bold text-white">$2,200 – $3,800</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Multi-Model Brochure QR Campaign:</span>
                <span className="font-mono font-bold text-white">$4,500 – $8,000</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-400">Includes QR Asset Generator:</span>
                <span className="font-mono font-bold text-emerald-400">Included</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRIEF INQUIRY FORM */}
      <section className="py-16 px-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-display">
            Deploy WebAR For Your Project
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Send us your 3D CAD assets for AR optimization and QR code branding.
          </p>
        </div>
        <ContactForm initialService="WebAR Augmented Reality" />
      </section>
    </main>
  );
}