'use client';

import React from 'react';
import { homepageData } from '@/data/homepage';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HowItWorksSection() {
  const { howItWorks } = homepageData;

  return (
    <section id="how-it-works-section" className="py-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#3ECF8E]">
              PIPELINE WORKFLOW
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAFAFA]">
            How It Works
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md">
          From raw CAD geometry to high-impact marketing imagery and interactive spatial links.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {howItWorks.map((step) => (
          <div
            key={step.step}
            className="relative p-5 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3f3f46] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black font-mono text-[#3ECF8E]">
                  0{step.step}
                </span>
                <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#09090B] text-[#71717A] border border-[#27272A]">
                  PHASE 0{step.step}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#FAFAFA] mb-1.5">
                {step.title}
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {step.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#27272A] flex items-center gap-1.5 text-[10px] font-mono text-[#3ECF8E] font-medium">
              <CheckCircle2 className="w-3 h-3 text-[#3ECF8E]" />
              <span>Full Portal Sync</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
