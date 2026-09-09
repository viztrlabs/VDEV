'use client';

import React from 'react';
import { homepageData } from '@/data/homepage';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HowItWorksSection() {
  const { howItWorks } = homepageData;

  return (
    <section id="how-it-works-section" className="py-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#42CF8B]">
              PIPELINE WORKFLOW
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#FAFAFA]">
            How It Works
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#B9CACB] max-w-md">
          From raw CAD geometry to high-impact marketing imagery and interactive spatial links.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {howItWorks.map((step) => (
          <div
            key={step.step}
            className="relative p-6 rounded-[2rem] bg-[#131314] border border-[#1E293B] hover:border-[#00F0FF]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black font-display text-[#00F0FF]">
                  0{step.step}
                </span>
                <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-[#0A0A0B] text-[#B9CACB] border border-[#1E293B]">
                  PHASE 0{step.step}
                </span>
              </div>
              <h3 className="text-base font-display font-bold text-[#FAFAFA] mb-2">
                {step.title}
              </h3>
              <p className="text-xs text-[#B9CACB] leading-relaxed">
                {step.desc}
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#1E293B] flex items-center gap-2 text-[11px] text-[#42CF8B] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#42CF8B]" />
              <span>Full Portal Sync</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
