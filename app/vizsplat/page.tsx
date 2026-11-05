'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Camera, Edit3, Download, BarChart2, ExternalLink, Box, ArrowRight, ChevronDown, Compass } from 'lucide-react';

const features = [
  {
    title: '3D Capture',
    description: 'Gaussian splatting capture from photos with sub-millimeter precision',
    icon: Camera,
    color: 'rose',
  },
  {
    title: 'Scene Editing',
    description: 'Real-time editing with density manipulation, color correction, and cleaning tools',
    icon: Edit3,
    color: 'cyan',
  },
  {
    title: 'Digital Twins',
    description: 'Create photogrammetry-free digital twins for architecture and real estate',
    icon: Sparkles,
    color: 'amber',
  },
  {
    title: 'Web Export',
    description: 'Export to WebXR, WebAR, and 3D viewers with zero-install playback',
    icon: Download,
    color: 'emerald',
  },
  {
    title: 'Performance',
    description: 'Real-time rendering with progressive loading and LOD support',
    icon: BarChart2,
    color: 'blue',
  },
  {
    title: 'SuperSplat Editor',
    description: 'Open-source editor by Reality Labs with full VizTR integration',
    icon: Box,
    color: 'purple',
  },
];

export default function VizSplatPage() {
  return (
    <main className="flex-1 w-full pb-24 bg-zinc-950 text-white">
      {/* 1. HERO PRESENTATION AREA (Full Landing Page Presentation Aspect Ratio) */}
      <section
        id="hero-section"
        className="relative w-full h-screen min-h-[680px] flex flex-col justify-between items-center overflow-hidden text-white select-none transition-colors duration-300"
      >
        {/* MEDIA LAYER: Full Bleed High-Res Render */}
        <div className="hero-media-layer absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/assets/hero/hero-01.jpg"
              alt="VizSplat 3D Gaussian Splatting"
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
          <div className="hero-eyebrow inline-flex items-center gap-1.5 sm:gap-2.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#0A0A0B] shadow-2xl transition-all border border-[#1E293B] text-[10px] sm:text-xs max-w-[95vw] sm:max-w-none">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#42CF8B] animate-pulse shrink-0" />
            <span className="font-bold text-[#42CF8B] tracking-wider uppercase shrink-0">GAUSSIAN SPLATTING</span>
            <span className="opacity-40 shrink-0">|</span>
            <span className="opacity-80 shrink-0">Neural Radiance Capture Platform</span>
          </div>
        </div>

        {/* BOTTOM HERO CONTENT: Fluid typography, original content & pill CTAs */}
        <div className="relative z-20 w-full container-ultrawide text-center flex flex-col items-center justify-end mt-auto px-4 sm:px-6 pb-6 sm:pb-8">
          <h1 className="hero-headline text-fluid-hero font-extrabold tracking-tight mb-2 sm:mb-3 font-sans">
            VizSplat
          </h1>

          <p className="hero-subheadline text-fluid-sub font-medium tracking-wide mb-3 max-w-3xl">
            Gaussian Splatting 3D Capture & Real-Time Editing Platform
          </p>

          <p className="hero-desc text-fluid-desc max-w-2xl 2xl:max-w-3xl text-center prose-readable font-normal leading-relaxed mb-6 text-[#E5E2E3]">
            Gaussian splatting 3D capture and editing platform for photorealistic architectural digital twins with sub-millimeter precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-6">
            <a
              href="/supersplat/index.html"
              target="_blank"
              rel="noopener noreferrer"
              id="hero-primary-cta"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Open SuperSplat Editor</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>

            <Link
              href="/pricing"
              id="hero-secondary-cta"
              className="hero-secondary-btn w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#131314] hover:bg-[#1E293B] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-[#1E293B]"
            >
              <Compass className="w-4 h-4 text-[#42CF8B]" />
              <span>View Pricing Plans</span>
            </Link>
          </div>

          {/* Bottom Bar: Scroll Indicator */}
          <div className="relative w-full flex items-center justify-center pt-2">
            <div className="sm:block">
              <a
                href="#vizsplat-features"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById('vizsplat-features');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                  else window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                }}
                className="hero-scroll-btn group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0A0B] text-[#FAFAFA] text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:bg-[#131314] border border-[#1E293B]"
                aria-label="Scroll down to explore"
              >
                <span>Scroll to explore</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#00F0FF] animate-bounce" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="vizsplat-features" className="container mx-auto py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="px-3.5 py-1 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-rose-400 text-xs font-bold uppercase tracking-widest inline-block mb-4">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
              Splat Capture & Real-Time Processing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 bg-[#131314] border border-[#1E293B] rounded-2xl hover:border-rose-500/40 transition-all duration-300 shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                >
                  <div className="mb-4 w-10 h-10 rounded-full bg-[#0A0A0B] border border-[#1E293B] flex items-center justify-center text-rose-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#B9CACB]">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

export { features };
