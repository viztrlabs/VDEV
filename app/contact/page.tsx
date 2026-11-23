'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ContactForm from '@/components/forms/ContactForm';
import { Mail, Phone, MapPin, Clock, ShieldCheck, Sparkles, ArrowRight, ChevronDown, Compass } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="flex-1 w-full pb-24">
      {/* 1. HERO PRESENTATION AREA (Full Landing Page Presentation Aspect Ratio) */}
      <section
        id="hero-section"
        className="relative w-full h-screen min-h-[680px] flex flex-col justify-between items-center overflow-hidden text-white select-none transition-colors duration-300"
      >
        {/* MEDIA LAYER: Full Bleed High-Res Architectural Render */}
        <div className="hero-media-layer absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/assets/hero/hero-03.jpg"
              alt="Start Your Architectural Project"
              fill
              priority
              quality={90}
              sizes="100vw"
              className="hero-bg-image object-cover object-center render-lighting-enhanced"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-[#131314]/40 to-[#131314]/65 pointer-events-none z-20" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#131314]/25 to-[#131314]/80 pointer-events-none z-20" />
        </div>

        {/* TOP AREA: Clears floating header & hosts Eyebrow Badge (No directory breadcrumbs) */}
        <div className="relative z-20 w-full pt-16 sm:pt-20 shrink-0 flex justify-center px-2 sm:px-4">
          <div className="hero-eyebrow inline-flex items-center gap-1.5 sm:gap-2.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#131314] shadow-2xl transition-all border border-[#3b494b] text-[10px] sm:text-xs max-w-[95vw] sm:max-w-none">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#54de99] animate-pulse shrink-0" />
            <span className="font-bold text-[#54de99] tracking-wider uppercase shrink-0">INQUIRIES & COMMISSIONS</span>
            <span className="opacity-40 shrink-0">|</span>
            <span className="opacity-80 shrink-0">24-Hour Itemized Scope Proposal</span>
          </div>
        </div>

        {/* BOTTOM HERO CONTENT: Fluid typography, original content & pill CTAs */}
        <div className="relative z-20 w-full container-ultrawide text-center flex flex-col items-center justify-end mt-auto px-4 sm:px-6 pb-6 sm:pb-8">
          <h1 className="hero-headline text-fluid-hero font-extrabold tracking-tight mb-2 sm:mb-3 font-sans">
            Start Your Architectural Project
          </h1>

          <p className="hero-subheadline text-fluid-sub font-medium tracking-wide mb-3 max-w-3xl">
            Direct Visual Director Access & Itemized Scope Proposals
          </p>

          <p className="hero-desc text-fluid-desc max-w-2xl 2xl:max-w-3xl text-center prose-readable font-normal leading-relaxed mb-6 text-[#e5e2e3]">
            Directly connect with our visual directors and spatial engineers to receive an itemized proposal, timeline, and milestone schedule within 24 hours.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-6">
            <a
              href="#contact-brief"
              id="hero-primary-cta"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Submit Project Brief</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>

            <Link
              href="/book-consultation"
              id="hero-secondary-cta"
              className="hero-secondary-btn w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#131314] hover:bg-[#3b494b] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-[#3b494b]"
            >
              <Compass className="w-4 h-4 text-[#54de99]" />
              <span>Book Strategy Session</span>
            </Link>
          </div>

          {/* Bottom Bar: Scroll Indicator */}
          <div className="relative w-full flex items-center justify-center pt-2">
            <div className="sm:block">
              <a
                href="#contact-brief"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById('contact-brief');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                  else window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                }}
                className="hero-scroll-btn group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#131314] text-[#e5e2e3] text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:bg-[#131314] border border-[#3b494b]"
                aria-label="Scroll down to explore"
              >
                <span>Scroll to explore</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#00F0FF] animate-bounce" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FORM & LOCATIONS SPLIT */}
      <section id="contact-brief" className="py-20 px-6 max-w-[1280px] mx-auto bg-[#131314]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* CONTACT FORM CONTAINER (7 Cols) */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-[2rem] bg-[#131314] border border-[#3b494b] shadow-sm space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                Architectural Brief Submission
              </span>
              <h2 className="text-2xl font-bold text-[#e5e2e3] font-display">
                Tell Us About Your Development
              </h2>
              <p className="text-xs text-[#B9CACB]">
                All uploaded files and preliminary project data are strictly protected under mutual NDA.
              </p>
            </div>

            <ContactForm initialService="Exterior Visualization" />
          </div>

          {/* STUDIO CONTACT DETAILS & GLOBAL HUBS (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-[2rem] bg-[#131314] text-white border border-[#3b494b] space-y-6 shadow-sm">
              <h3 className="text-lg font-bold font-display text-[#e5e2e3]">Direct Communications</h3>
              
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3.5">
                  <Mail className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[#B9CACB] font-bold uppercase text-[10px]">Client Inquiries</div>
                    <a href="mailto:hello@viztr.studio" className="text-white hover:text-rose-400 transition-colors font-medium">
                      hello@viztr.studio
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Phone className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[#B9CACB] font-bold uppercase text-[10px]">Direct Studio Line</div>
                    <span className="text-white font-medium">+1 (212) 555-0198 / +44 20 7946 0912</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Clock className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[#B9CACB] font-bold uppercase text-[10px]">Production Hours</div>
                    <span className="text-white font-medium">24/5 Worldwide Cloud Production Pipeline</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GLOBAL OFFICES CARD */}
            <div className="p-8 rounded-[2rem] bg-[#131314] border border-[#3b494b] space-y-5 shadow-sm">
              <h3 className="text-base font-bold text-[#e5e2e3] font-display">
                Studio Office Locations
              </h3>

              <div className="space-y-4 text-xs divide-y divide-[#3b494b]">
                <div className="pt-2 first:pt-0">
                  <div className="font-bold text-[#e5e2e3]">New York (Americas)</div>
                  <p className="text-[#B9CACB]">450 Lexington Ave, 32nd Floor, New York, NY 10017</p>
                </div>

                <div className="pt-3">
                  <div className="font-bold text-[#e5e2e3]">London (Europe HQ)</div>
                  <p className="text-[#B9CACB]">22 Bishopsgate, Level 18, London EC2N 4BQ</p>
                </div>

                <div className="pt-3">
                  <div className="font-bold text-[#e5e2e3]">Dubai (Middle East)</div>
                  <p className="text-[#B9CACB]">DIFC Gate Precinct Building 4, Dubai, UAE</p>
                </div>

                <div className="pt-3">
                  <div className="font-bold text-[#e5e2e3]">Tokyo (XR Lab)</div>
                  <p className="text-[#B9CACB]">Roppongi Hills Mori Tower 24F, Minato-ku, Tokyo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
