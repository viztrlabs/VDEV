'use client';

import React, { useState } from 'react';
import { homepageData } from '@/data/homepage';
import { Building2, Compass, Home, Megaphone, Globe, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UseCasesSection() {
  const { useCases } = homepageData;
  const [activeTab, setActiveTab] = useState(0);

  const icons = [Building2, Compass, Home, Megaphone, Globe];

  const current = useCases[activeTab] || useCases[0];
  const IconComponent = icons[activeTab] || Building2;

  return (
    <section id="use-cases-section" className="py-16 px-4 sm:px-6 bg-[#0A0A0B] border-y border-[#1E293B]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#1E293B]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#42CF8B]">
                VERTICAL SPECIALIZATION
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#FAFAFA]">
              Built For Your Industry
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#B9CACB] max-w-md">
            Solving key commercialization and presentation hurdles across the built environment spectrum.
          </p>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {useCases.map((uc, idx) => {
            const TabIcon = icons[idx];
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
                  activeTab === idx
                    ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_16px_rgba(0,240,255,0.35)]'
                    : 'bg-[#131314] text-[#B9CACB] border-[#1E293B] hover:text-[#FAFAFA] hover:border-[#00F0FF]/40'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{uc.audience}</span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE USE CASE BREAKDOWN CARD */}
        <div className="p-6 sm:p-8 rounded-[2rem] bg-[#131314] border border-[#1E293B] space-y-6 animate-in fade-in duration-300 shadow-xl">
          <div className="flex items-center gap-3 pb-5 border-b border-[#1E293B]">
            <div className="w-12 h-12 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-[#00F0FF] flex items-center justify-center shadow-inner">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-[#00F0FF] tracking-wider">
                INDUSTRY SPECIFICATION
              </span>
              <h3 className="text-lg sm:text-xl font-display font-bold text-[#FAFAFA]">
                {current.audience}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0A0A0B] border border-rose-500/30 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>The Challenge</span>
              </div>
              <p className="text-xs text-[#B9CACB] leading-relaxed">
                {current.problem}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0A0A0B] border border-[#1E293B] space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#FAFAFA] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>VizTR Solution</span>
              </div>
              <p className="text-xs text-[#B9CACB] leading-relaxed">
                {current.solution}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0A0A0B] border border-[#42CF8B]/40 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#42CF8B] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Commercial Impact</span>
              </div>
              <p className="text-xs text-[#B9CACB] leading-relaxed">
                {current.benefit}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
