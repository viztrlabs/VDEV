'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, BarChart2, Home, Target, Users, DollarSign, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';

const solutions = [
  { name: 'Architects', href: '/solutions/architects', icon: Home, desc: 'Design development & client presentation' },
  { name: 'Real Estate', href: '/solutions/real-estate', icon: Home, desc: 'Marketing visuals & virtual staging' },
  { name: 'Developers', href: '/solutions/developers', icon: BarChart2, desc: 'XR integration & API access' },
  { name: 'Interior Designers', href: '/solutions/interior-designers', icon: Target, desc: 'Luxury staging & material visualization' },
  { name: 'Agencies', href: '/solutions/agencies', icon: Users, desc: 'White-label creative production' },
];

export default function SolutionsHub() {
  return (
    <main className="flex-1 w-full pb-20 bg-zinc-950 text-white">
      {/* 1. HERO PRESENTATION AREA (Full Landing Page Presentation Aspect Ratio) */}
      <section
        id="hero-section"
        className="relative w-full h-screen min-h-[680px] flex flex-col justify-between items-center overflow-hidden text-white select-none transition-colors duration-300"
      >
        {/* MEDIA LAYER: Full Bleed High-Res Architectural Render */}
        <div className="hero-media-layer absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=85"
              alt="Industry Solutions"
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
            <span className="font-bold text-[#42CF8B] tracking-wider uppercase shrink-0">INDUSTRY ARCHITECTURE</span>
            <span className="opacity-40 shrink-0">|</span>
            <span className="opacity-80 shrink-0">Sector-Specific Solutions</span>
          </div>
        </div>

        {/* BOTTOM HERO CONTENT: Fluid typography, original content & pill CTAs */}
        <div className="relative z-20 w-full container-ultrawide text-center flex flex-col items-center justify-end mt-auto px-4 sm:px-6 pb-6 sm:pb-8">
          <h1 className="hero-headline text-fluid-hero font-extrabold tracking-tight mb-2 sm:mb-3 font-sans">
            Solutions
          </h1>

          <p className="hero-subheadline text-fluid-sub font-medium tracking-wide mb-3 max-w-3xl">
            Tailored visualization solutions for every industry.
          </p>

          <p className="hero-desc text-fluid-desc max-w-2xl 2xl:max-w-3xl text-center prose-readable font-normal leading-relaxed mb-6 text-[#E5E2E3]">
            From conceptual design development for architects to high-converting marketing visuals and WebXR for global developers and luxury agencies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-6">
            <a
              href="#solutions-list"
              id="hero-primary-cta"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Explore Industry Sectors</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>

            <Link
              href="/book-consultation"
              id="hero-secondary-cta"
              className="hero-secondary-btn w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#131314] hover:bg-[#1E293B] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-[#1E293B]"
            >
              <Sparkles className="w-4 h-4 text-[#42CF8B]" />
              <span>Request Custom Solution</span>
            </Link>
          </div>

          {/* Bottom Bar: Scroll Indicator */}
          <div className="relative w-full flex items-center justify-center pt-2">
            <div className="sm:block">
              <a
                href="#solutions-list"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById('solutions-list');
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                  }
                }}
                className="hero-scroll-btn group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0A0B] text-[#FAFAFA] text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:bg-[#131314] border border-[#1E293B]"
                aria-label="Scroll down to explore solutions"
              >
                <span>Scroll to explore</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#00F0FF] animate-bounce" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTIONS LIST */}
      <section id="solutions-list" className="py-20 px-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          {solutions.map((sol) => {
            const Icon = sol.icon;
            return (
              <Link
                key={sol.name}
                href={sol.href}
                className="group flex items-center gap-4 p-6 bg-[#131314] border border-[#1E293B] rounded-2xl hover:border-[#00F0FF]/40 transition-all duration-300 shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
              >
                <div className="p-3 w-12 h-12 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-[#00F0FF] flex items-center justify-center group-hover:border-[#00F0FF]/50 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1 text-[#FAFAFA] group-hover:text-[#00F0FF]">{sol.name}</h3>
                  <p className="text-sm text-[#B9CACB]">{sol.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#B9CACB] group-hover:text-[#00F0FF] transition-colors" />
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
