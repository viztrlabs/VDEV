'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Globe, Sparkles, Cpu, Leaf, Award, Users, ChevronDown } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="flex-1 w-full pb-24">
      {/* 1. HERO PRESENTATION AREA (Full Landing Page Presentation Aspect Ratio) */}
      <section
        id="hero-section"
        className="relative w-full h-screen min-h-[680px] flex flex-col justify-between items-center overflow-hidden text-white select-none transition-colors duration-300"
      >
        {/* MEDIA LAYER: Full Bleed High-Res Architectural Design */}
        <div className="hero-media-layer absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
              alt="VizTR Architectural Design"
              fill
              priority
              quality={90}
              sizes="100vw"
              referrerPolicy="no-referrer"
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
            <span className="font-bold text-[#42CF8B] tracking-wider uppercase shrink-0">STUDIO PHILOSOPHY</span>
            <span className="opacity-40 shrink-0">|</span>
            <span className="opacity-80 shrink-0">Architectural Vision &amp; Spatial Engineering</span>
          </div>
        </div>

        {/* BOTTOM HERO CONTENT: Fluid typography, original content & pill CTAs */}
        <div className="relative z-20 w-full container-ultrawide text-center flex flex-col items-center justify-end mt-auto px-4 sm:px-6 pb-6 sm:pb-8">
          <h1 className="hero-headline text-fluid-hero font-extrabold tracking-tight mb-2 sm:mb-3 font-sans max-w-5xl">
            The Studio Behind the World’s Most Iconic Unbuilt Architecture
          </h1>

          <p className="hero-subheadline text-fluid-sub font-medium tracking-wide mb-3 max-w-3xl">
            Where Raw Blueprint Meets Emotional Reality
          </p>

          <p className="hero-desc text-fluid-desc max-w-2xl 2xl:max-w-3xl text-center prose-readable font-normal leading-relaxed mb-6 text-[#E5E2E3]">
            VizTR bridges the chasm between raw architectural blueprint and emotional reality through masterclass CGI rendering and real-time WebXR spatial computing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-6">
            <Link
              href="/book-consultation"
              id="hero-primary-cta"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Partner With VizTR</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/portfolio"
              id="hero-secondary-cta"
              className="hero-secondary-btn w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#131314] hover:bg-[#1E293B] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-[#1E293B]"
            >
              <Sparkles className="w-4 h-4 text-[#42CF8B]" />
              <span>Explore Selected Works</span>
            </Link>
          </div>

          {/* Bottom Bar: Scroll Indicator */}
          <div className="relative w-full flex items-center justify-center pt-2">
            <div className="sm:block">
              <a
                href="#about-pillars"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById('about-pillars');
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                  }
                }}
                className="hero-scroll-btn group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0A0B] text-[#FAFAFA] text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:bg-[#131314] border border-[#1E293B]"
                aria-label="Scroll down to explore pillars"
              >
                <span>Scroll to explore</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#00F0FF] animate-bounce" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PILLARS */}
      <section id="about-pillars" className="py-20 px-6 max-w-[1280px] mx-auto space-y-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-[2rem] bg-[#131314] border border-[#1E293B] shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-rose-500 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#FAFAFA] font-display">
              Uncompromising Artistry
            </h3>
            <p className="text-xs sm:text-sm text-[#B9CACB] leading-relaxed">
              Every texture is physically measured, every shadow is path-traced against realistic atmospheric coordinates, and every composition is framed with classical architectural lens logic.
            </p>
          </div>

          <div className="p-8 rounded-[2rem] bg-[#131314] border border-[#1E293B] shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-rose-500 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#FAFAFA] font-display">
              XR Technological Leadership
            </h3>
            <p className="text-xs sm:text-sm text-[#B9CACB] leading-relaxed">
              We pioneer browser-native 3D, zero-install WebXR, and cloud Unreal Engine 5.4 Pixel Streaming so international buyers can walk unbuilt spaces without downloading an app.
            </p>
          </div>

          <div className="p-8 rounded-[2rem] bg-[#131314] border border-[#1E293B] shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-rose-500 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#FAFAFA] font-display">
              Zero-Carbon Cloud Computing
            </h3>
            <p className="text-xs sm:text-sm text-[#B9CACB] leading-relaxed">
              100% of our distributed GPU render farm operations are powered by hydro and geothermal green data centers, matching our architectural clients&apos; ESG commitments.
            </p>
          </div>
        </div>

        {/* STUDIO DIRECTORS / LEADERSHIP */}
        <div className="space-y-10">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
              Leadership
            </span>
            <h2 className="text-3xl font-bold text-[#FAFAFA] font-display mt-1">
              Architectural & Visual Directors
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Julian Vance, AIA',
                role: 'Principal Architectural Director',
                bio: 'Former Zaha Hadid Architects senior associate with 15 years in parametric masterplanning.',
                image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
              },
              {
                name: 'Elena Rostova',
                role: 'Head of CGI & Lighting',
                bio: 'Award-winning architectural lighting director specialized in large-scale Nordic daylight studies.',
                image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
              },
              {
                name: 'Kenji Takahashi',
                role: 'Chief Spatial / XR Engineer',
                bio: 'Pioneered WebGPU rendering engines and real-time Unreal 5 cloud stream optimization.',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
              },
              {
                name: 'Clara Delacroix',
                role: 'Director of Interior FF&E',
                bio: 'Parisian interior stylist curating photorealistic tactile PBR finishes for prime residences.',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
              },
            ].map((leader, idx) => (
              <div
                key={idx}
                className="p-5 rounded-[2rem] bg-[#131314] border border-[#1E293B] shadow-sm space-y-4"
              >
                <div className="relative w-full aspect-square rounded-[1.5rem] overflow-hidden bg-black">
                  <Image
                    src={leader.image}
                    alt={leader.name}
                    width={400}
                    height={400}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-[#FAFAFA] font-display">
                    {leader.name}
                  </h4>
                  <div className="text-xs font-semibold text-rose-500">{leader.role}</div>
                  <p className="text-xs text-[#B9CACB] pt-1 leading-relaxed">
                    {leader.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GLOBAL PRESENCE */}
        <div className="p-8 sm:p-12 rounded-[2rem] bg-[#131314] text-[#FAFAFA] border border-[#1E293B] space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
              Global Operations
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-display">
              Four Hubs. 24-Hour Production Cycle.
            </h3>
            <p className="text-xs text-[#B9CACB]">
              Our synchronized studios across London, New York, Dubai, and Tokyo ensure rapid, around-the-clock turnaround.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-[#0A0A0B] border border-[#1E293B] space-y-1">
              <div className="text-rose-500 text-sm font-bold">NEW YORK</div>
              <div className="text-xs text-[#B9CACB]">Americas Commercial Hub</div>
              <div className="text-[11px] text-zinc-500 font-mono">EST / UTC-5</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0A0A0B] border border-[#1E293B] space-y-1">
              <div className="text-rose-500 text-sm font-bold">LONDON</div>
              <div className="text-xs text-[#B9CACB]">European Creative HQ</div>
              <div className="text-[11px] text-zinc-500 font-mono">GMT / UTC+0</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0A0A0B] border border-[#1E293B] space-y-1">
              <div className="text-rose-500 text-sm font-bold">DUBAI</div>
              <div className="text-xs text-[#B9CACB]">Middle East Megaprojects</div>
              <div className="text-[11px] text-zinc-500 font-mono">GST / UTC+4</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0A0A0B] border border-[#1E293B] space-y-1">
              <div className="text-rose-500 text-sm font-bold">TOKYO</div>
              <div className="text-xs text-[#B9CACB]">XR Spatial Research Lab</div>
              <div className="text-[11px] text-zinc-500 font-mono">JST / UTC+9</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
