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
      className="relative py-20 px-4 sm:px-6 bg-[#09090B] border-t border-[#27272A] text-white overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#3ECF8E]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#3ECF8E] font-bold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]" />
          <span>INITIALIZE ARCHITECTURAL PIPELINE</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#FAFAFA]">
          Ready to Transform Your Vision into Reality?
        </h2>

        <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl mx-auto leading-relaxed">
          From unbuilt CAD masterplans to photorealistic 8K imagery, cinematic films, and cloud Pixel Streaming experiences.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/contact"
            id="final-cta-start-btn"
            className="w-full sm:w-auto px-6 py-3 rounded bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#3ECF8E]/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Start Your Project</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </Link>

          <Link
            href="/book-consultation"
            id="final-cta-consult-btn"
            className="w-full sm:w-auto px-6 py-3 rounded bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] font-bold text-xs uppercase tracking-wider border border-[#27272A] transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4 text-[#3ECF8E]" />
            <span>Book Consultation</span>
          </Link>

          <button
            onClick={openPixelStream}
            id="final-cta-demo-btn"
            className="w-full sm:w-auto px-6 py-3 rounded bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] font-bold text-xs uppercase tracking-wider border border-[#3ECF8E]/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#3ECF8E]" />
            <span>Request Demo</span>
          </button>
        </div>
      </div>
    </section>
  );
}
