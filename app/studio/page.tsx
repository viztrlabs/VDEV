'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { servicePagesData } from '@/data/pages';
import ContactForm from '@/components/forms/ContactForm';
import { ArrowRight, CheckCircle2, Eye, Sparkles, ChevronDown } from 'lucide-react';

export default function StudioHubPage() {
  const data = servicePagesData.studioHub;

  return (
    <main className="flex-1 w-full pb-20">
      {/* 1. HERO PRESENTATION AREA (Full Landing Page Presentation Aspect Ratio) */}
      <section
        id="hero-section"
        className="relative w-full h-screen min-h-[680px] flex flex-col justify-between items-center overflow-hidden text-white select-none transition-colors duration-300"
      >
        {/* MEDIA LAYER: Full Bleed High-Res Architectural Render */}
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
          <div className="hero-eyebrow inline-flex items-center gap-1.5 sm:gap-2.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full backdrop-blur-xl shadow-2xl transition-all border border-[#1E293B] text-[10px] sm:text-xs max-w-[95vw] sm:max-w-none">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#42CF8B] animate-pulse shadow-[0_0_8px_#42CF8B] shrink-0" />
            <span className="font-bold text-[#42CF8B] tracking-wider uppercase shrink-0">STUDIO PIPELINES</span>
            <span className="opacity-40 shrink-0">|</span>
            <span className="opacity-80 shrink-0">{data.badge || 'Architectural CGI'}</span>
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
            {data.description || 'Translating CAD blueprints and BIM models into emotionally evocative, photorealistic exterior, interior, and walkthrough imagery.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-6">
            <Link
              href="/book-consultation"
              id="hero-primary-cta"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_24px_rgba(0,240,255,0.4)] hover:shadow-[0_0_36px_rgba(0,240,255,0.65)] hover:scale-105 active:scale-95"
            >
              <span>Book Studio Project</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/portfolio"
              id="hero-secondary-cta"
              className="hero-secondary-btn w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider backdrop-blur-xl transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-[#1E293B]"
            >
              <Eye className="w-4 h-4 text-[#42CF8B]" />
              <span>Explore Studio Portfolio</span>
            </Link>
          </div>

          {/* Bottom Bar: Scroll Indicator */}
          <div className="relative w-full flex items-center justify-center pt-2">
            <div className="sm:block">
              <a
                href="#studio-services"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById('studio-services');
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                  }
                }}
                className="hero-scroll-btn group inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer shadow-lg border border-[#1E293B]"
                aria-label="Scroll down to explore services"
              >
                <span>Scroll to explore</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#00F0FF] animate-bounce" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3 SUB-SERVICES BREAKDOWN */}
      <section id="studio-services" className="py-20 px-6 max-w-[1280px] mx-auto space-y-20">
        {data.services?.map((svc, idx) => (
          <div
            key={svc.id}
            className={`flex flex-col ${
              idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
            } items-center gap-10 lg:gap-14`}
          >
            {/* Image */}
            <div className="w-full lg:w-1/2 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 relative group aspect-[16/10] bg-zinc-900">
              <Image
                src={svc.image}
                alt={svc.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                referrerPolicy="no-referrer"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="w-full lg:w-1/2 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Studio Specialization 0{idx + 1}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white font-display">
                {svc.title}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {svc.desc}
              </p>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Included Capabilities:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {svc.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href={svc.href}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-rose-600 dark:hover:bg-rose-600 dark:hover:text-white font-semibold text-xs transition-colors shadow-md"
                >
                  <span>Explore {svc.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* STUDIO PIPELINE COMPARISON & PRICING MATRIX */}
      <section className="py-16 px-6 bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Transparent Tiering
          </span>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white font-display">
            Studio Production Packages
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Scalable architectural rendering packages engineered for boutique architects to master developers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
          <div className="p-7 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-md space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Essentials Render</h3>
            <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-white">$3,500 <span className="text-xs font-normal text-zinc-400">/ project</span></div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Up to 3 high-resolution 8K stills with 2 rounds of creative revisions.</p>
            <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-500" /> 8K Ultra HD Stills</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-500" /> Day & Dusk Lighting</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-500" /> 7-Stage Portal Tracking</li>
            </ul>
          </div>

          <div className="p-7 rounded-3xl bg-zinc-950 text-white border-2 border-rose-500 shadow-xl space-y-4 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider">
              Most Popular
            </span>
            <h3 className="text-lg font-bold">Marketing Master Suite</h3>
            <div className="text-3xl font-bold font-mono text-rose-400">$9,500 <span className="text-xs font-normal text-zinc-400">/ project</span></div>
            <p className="text-xs text-zinc-300">8 High-res stills + 45s 4K cinematic film + complete material board.</p>
            <ul className="space-y-2 text-xs text-zinc-300 pt-3 border-t border-zinc-800">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> 8x 8K Stills (Ext & Int)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> 4K Cinematic Walkthrough</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> 360° Web Viewer Node</li>
            </ul>
          </div>

          <div className="p-7 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-md space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Masterplan Enterprise</h3>
            <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-white">Custom <span className="text-xs font-normal text-zinc-400">/ proposal</span></div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Multi-building districts, aerial drone integration, and complete media suites.</p>
            <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-500" /> Unlimited Visual Assets</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-500" /> Drone Geo-Matching</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-500" /> Dedicated Art Director</li>
            </ul>
          </div>
        </div>
      </section>

      {/* BRIEF INQUIRY */}
      <section className="py-20 px-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-display">
            Commission a Studio Project
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Submit your CAD/BIM drawings or brief for an itemized estimate within 24 hours.
          </p>
        </div>
        <ContactForm initialService="Exterior Visualization" />
      </section>
    </main>
  );
}
