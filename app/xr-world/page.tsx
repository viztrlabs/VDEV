'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { servicePagesData } from '@/data/pages';
import { useAppStore } from '@/lib/store';
import {
  ArrowRight,
  Sparkles,
  Box,
  ScanLine,
  Headset,
  Compass,
  Cpu,
  CheckCircle2,
  Play,
  Brain,
  Terminal,
  ChevronDown
} from 'lucide-react';

export default function XRWorldHubPage() {
  const data = servicePagesData.xrHub;
  const { openPixelStream, openModelViewer, openPanorama } = useAppStore();

  const getIcon = (id: string) => {
    switch (id) {
      case 'webxr':
        return Box;
      case 'webar':
        return ScanLine;
      case 'vr':
        return Headset;
      case 'virtual-tour':
        return Compass;
      case 'pixel-streaming':
        return Cpu;
      case 'gaussian-splat':
        return Brain;
      case 'xr-editor':
        return Terminal;
      default:
        return Box;
    }
  };

  return (
    <main className="flex-1 w-full pb-20">
      {/* 1. HERO PRESENTATION AREA (Full Landing Page Presentation Aspect Ratio) */}
      <section
        id="hero-section"
        className="relative w-full h-screen min-h-[680px] flex flex-col justify-between items-center overflow-hidden text-white select-none transition-colors duration-300"
      >
        {/* MEDIA LAYER: Full Bleed Spatial Architecture Render */}
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

        {/* TOP AREA: Clears floating header & hosts Eyebrow Badge */}
        <div className="relative z-20 w-full pt-16 sm:pt-20 shrink-0 flex justify-center px-2 sm:px-4">
          <div className="hero-eyebrow inline-flex items-center gap-1.5 sm:gap-2.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#0A0A0B] shadow-2xl transition-all border border-[#1E293B] text-[10px] sm:text-xs max-w-[95vw] sm:max-w-none">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#42CF8B] animate-pulse shrink-0" />
            <span className="font-bold text-[#42CF8B] tracking-wider uppercase shrink-0">SPATIAL COMPUTING</span>
            <span className="opacity-40 shrink-0">|</span>
            <span className="opacity-80 shrink-0">{data.heroBadge || 'XR World Platform'}</span>
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
            {data.description || 'Enterprise-grade WebXR, real-time Unreal Engine 5 pixel streaming, and 3D Gaussian Splatting for architecture.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl sm:max-w-none mb-6">
            <button
              type="button"
              onClick={openPixelStream}
              id="hero-primary-cta"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Live Cloud GPU Demo</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <Link
              href="/xr-world/link-generator"
              id="hero-secondary-cta"
              className="hero-secondary-btn w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#131314] hover:bg-[#1E293B] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-[#1E293B]"
            >
              <Sparkles className="w-4 h-4 text-[#42CF8B]" />
              <span>Spatial Link &amp; WebAR Portal</span>
            </Link>

            <button
              type="button"
              onClick={() => openModelViewer('', 'WebXR Architecture Viewer')}
              className="hero-secondary-btn w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#131314] hover:bg-[#1E293B] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-[#1E293B]"
            >
              <Box className="w-4 h-4 text-[#00F0FF]" />
              <span>Test 3D Orbit</span>
            </button>
          </div>

          {/* Bottom Bar: Scroll Indicator */}
          <div className="relative w-full flex items-center justify-center pt-2">
            <div className="sm:block">
              <a
                href="#xr-services"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById('xr-services');
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                  }
                }}
                className="hero-scroll-btn group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0A0B] text-[#FAFAFA] text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:bg-[#131314] border border-[#1E293B]"
                aria-label="Scroll down to explore XR modules"
              >
                <span>Scroll to explore</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#00F0FF] animate-bounce" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5 SUB-SERVICES DETAILED GRID */}
      <section id="xr-services" className="py-20 px-6 max-w-[1280px] mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="px-3.5 py-1 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-rose-400 text-xs font-bold uppercase tracking-widest inline-block mb-4">
            Spatial Computation Formats
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display mt-1">
            Five Scalable Interactive Formats
          </h2>
          <p className="text-sm text-[#B9CACB] mt-2">
            Engineered for instant zero-install web access to ultra-high-end GPU cloud streaming.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.services?.map((svc) => {
            const Icon = getIcon(svc.id);
            const isFlagship = svc.id === 'pixel-streaming';

            return (
              <div
                key={svc.id}
                className={`rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-300 bg-[#131314] border border-[#1E293B] shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] ${
                  isFlagship ? 'lg:col-span-2' : ''
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 w-12 h-12 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-rose-500 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    {isFlagship && (
                      <span className="px-3 py-1 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-rose-500 text-xs font-bold uppercase tracking-wider animate-pulse">
                        Flagship Architecture
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold font-display text-[#FAFAFA]">
                    {svc.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#B9CACB]">
                    {svc.desc}
                  </p>

                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-rose-500">
                      Capabilities:
                    </div>
                    <ul className="space-y-1.5">
                      {svc.features.map((f, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-xs text-[#B9CACB]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#1E293B] flex items-center justify-between gap-2">
                  <Link
                    href={svc.href}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Read Architecture Spec</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {isFlagship ? (
                    <button
                      onClick={openPixelStream}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Launch Cloud Session</span>
                    </button>
                  ) : svc.id === 'virtual-tour' ? (
                    <button
                      onClick={() => openPanorama('', 'Sample 360 Tour')}
                      className="px-4 py-2 rounded-xl bg-[#0A0A0B] border border-[#1E293B] hover:bg-rose-600 hover:border-rose-600 hover:text-white text-xs font-semibold transition-colors"
                    >
                      Launch 360
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* WEBXR VS APP STORE TABLE */}
      <section className="py-16 px-6 bg-[#0A0A0B] border-y border-[#1E293B]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
              Frictionless Adoption
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
              Zero-Install WebXR vs Traditional Native Apps
            </h3>
          </div>

          <div className="rounded-[2rem] overflow-hidden bg-[#131314] border border-[#1E293B] shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all">
            <div className="grid grid-cols-3 p-4 bg-[#0A0A0B] text-xs font-bold uppercase tracking-wider text-[#B9CACB]">
              <div>Metric / Capability</div>
              <div className="text-rose-500">VizTR WebXR Platform</div>
              <div className="text-zinc-600">Legacy Native App</div>
            </div>
            <div className="divide-y divide-[#1E293B] text-xs sm:text-sm">
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-semibold text-[#FAFAFA]">Install Friction</div>
                <div className="text-emerald-500 font-bold">0 Seconds (1 Click URL / QR)</div>
                <div className="text-zinc-500">5-10 min App Store download</div>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-semibold text-[#FAFAFA]">Device Compatibility</div>
                <div className="text-emerald-500 font-bold">All Browsers (iOS/Android/Mac/PC)</div>
                <div className="text-zinc-500">Restricted OS & Hardware</div>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-semibold text-[#FAFAFA]">Real-Time CMS Updates</div>
                <div className="text-emerald-500 font-bold">Instant live cloud sync</div>
                <div className="text-zinc-500">Requires App Store re-submission</div>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-semibold text-[#FAFAFA]">Sales Conversion Drop-Off</div>
                <div className="text-emerald-500 font-bold">&lt; 4% drop-off</div>
                <div className="text-zinc-500">&gt; 65% drop-off at download gate</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
