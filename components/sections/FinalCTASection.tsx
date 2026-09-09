'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { ArrowRight, Calendar, Sparkles } from 'lucide-react';

export default function FinalCTASection() {
  const { openPixelStream } = useAppStore();

  return (
    <section
      id="final-cta-section"
      className="relative py-24 px-4 sm:px-6 bg-[#0A0A0B] border-t border-[#1E293B] text-white overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#131314] border border-[#1E293B] text-xs text-[#00F0FF] font-bold uppercase tracking-widest shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse" />
          <span>INITIALIZE ARCHITECTURAL PIPELINE</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-[#FAFAFA]">
          Ready to Transform Your Vision into Reality?
        </h2>

        <p className="text-xs sm:text-sm text-[#B9CACB] max-w-xl mx-auto leading-relaxed">
          From unbuilt CAD masterplans to photorealistic 8K imagery, cinematic films, and cloud Pixel Streaming experiences.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/contact"
            id="final-cta-start-btn"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-display font-extrabold text-xs uppercase tracking-wider shadow-[0_0_28px_rgba(0,240,255,0.45)] hover:shadow-[0_0_36px_rgba(0,240,255,0.6)] transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Start Your Project</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </Link>

          <Link
            href="/book-consultation"
            id="final-cta-consult-btn"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#131314] hover:bg-[#1E293B] text-[#FAFAFA] font-bold text-xs uppercase tracking-wider border border-[#1E293B] hover:border-[#00F0FF]/50 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm active:scale-95"
          >
            <Calendar className="w-4 h-4 text-[#00F0FF]" />
            <span>Book Consultation</span>
          </Link>

          <button
            onClick={openPixelStream}
            id="final-cta-demo-btn"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#131314] hover:bg-[#1E293B] text-[#FAFAFA] font-bold text-xs uppercase tracking-wider border border-[#42CF8B]/40 hover:border-[#42CF8B] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#42CF8B]" />
            <span>Request Demo</span>
          </button>
        </div>
      </div>
    </section>
  );
}
