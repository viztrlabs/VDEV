'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BookingForm from '@/components/forms/BookingForm';
import { Calendar, Clock, Video, ShieldCheck, Sparkles, ArrowRight, ChevronDown, Mail } from 'lucide-react';

export default function BookConsultationPage() {
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
              src="/assets/hero/hero-01.jpg"
              alt="Book an Architectural Consultation"
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
            <span className="font-bold text-[#42CF8B] tracking-wider uppercase shrink-0">DIRECTOR STRATEGY</span>
            <span className="opacity-40 shrink-0">|</span>
            <span className="opacity-80 shrink-0">Dedicated 30-Min Architectural Video Session</span>
          </div>
        </div>

        {/* BOTTOM HERO CONTENT: Fluid typography, original content & pill CTAs */}
        <div className="relative z-20 w-full container-ultrawide text-center flex flex-col items-center justify-end mt-auto px-4 sm:px-6 pb-6 sm:pb-8">
          <h1 className="hero-headline text-fluid-hero font-extrabold tracking-tight mb-2 sm:mb-3 font-sans">
            Book an Architectural Consultation
          </h1>

          <p className="hero-subheadline text-fluid-sub font-medium tracking-wide mb-3 max-w-3xl">
            Senior Architectural & Spatial Director Video Consultation
          </p>

          <p className="hero-desc text-fluid-desc max-w-2xl 2xl:max-w-3xl text-center prose-readable font-normal leading-relaxed mb-6 text-[#E5E2E3]">
            Schedule a dedicated 30-minute video session with our Senior Architectural & Spatial Directors to map out rendering scopes, WebXR links, or marketing milestones.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-6">
            <a
              href="#booking-form"
              id="hero-primary-cta"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Select Consultation Time</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>

            <Link
              href="/contact"
              id="hero-secondary-cta"
              className="hero-secondary-btn w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#131314] hover:bg-[#1E293B] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-[#1E293B]"
            >
              <Mail className="w-4 h-4 text-[#42CF8B]" />
              <span>Direct Brief Submission</span>
            </Link>
          </div>

          {/* Bottom Bar: Scroll Indicator */}
          <div className="relative w-full flex items-center justify-center pt-2">
            <div className="sm:block">
              <a
                href="#booking-form"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById('booking-form');
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

      {/* FORM & VALUE PROPOSITION SPLIT */}
      <section id="booking-form" className="py-20 px-6 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* BOOKING FORM (7 COLS) */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-[2rem] bg-[#131314] border border-[#1E293B] shadow-sm space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                Live Video Consultation
              </span>
              <h2 className="text-2xl font-bold text-[#FAFAFA] font-display">
                Select Your Consultation Details
              </h2>
              <p className="text-xs text-[#B9CACB]">
                You will receive a Google Meet calendar invitation with architectural director assignment.
              </p>
            </div>

            <BookingForm />
          </div>

          {/* WHAT TO EXPECT (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-[2rem] bg-[#131314] text-[#FAFAFA] border border-[#1E293B] space-y-6 shadow-sm">
              <h3 className="text-lg font-bold font-display">What We Cover During the Call</h3>
              
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#0A0A0B] border border-[#1E293B] text-rose-500 flex items-center justify-center shrink-0 font-bold">1</div>
                  <div>
                    <div className="font-bold text-[#FAFAFA]">CAD / BIM Asset Assessment</div>
                    <p className="text-[#B9CACB] mt-0.5">We review your Rhino, Revit, SketchUp, or 3ds Max files to estimate model cleanup time.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#0A0A0B] border border-[#1E293B] text-rose-500 flex items-center justify-center shrink-0 font-bold">2</div>
                  <div>
                    <div className="font-bold text-[#FAFAFA]">Camera Angles & Lighting Scenarios</div>
                    <p className="text-[#B9CACB] mt-0.5">Determine key Hero views, dramatic dusk atmosphere, and interior styling moodboards.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#0A0A0B] border border-[#1E293B] text-rose-500 flex items-center justify-center shrink-0 font-bold">3</div>
                  <div>
                    <div className="font-bold text-[#FAFAFA]">XR & Interactive Deployment Strategy</div>
                    <p className="text-[#B9CACB] mt-0.5">Determine if your sales team will benefit from WebXR browser links, WebAR QR codes, or Pixel Streaming.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#0A0A0B] border border-[#1E293B] text-rose-500 flex items-center justify-center shrink-0 font-bold">4</div>
                  <div>
                    <div className="font-bold text-[#FAFAFA]">Guaranteed Delivery Schedule</div>
                    <p className="text-[#B9CACB] mt-0.5">Lock in your 7-stage production schedule with access key for portal tracking.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-[#131314] border border-[#1E293B] text-xs text-[#B9CACB] space-y-2">
              <div className="font-bold text-[#FAFAFA] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>NDA Protected Strategy</span>
              </div>
              <p>
                All unreleased architectural schemes, zoning drawings, and commercial terms discussed remain under strict confidentiality.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
