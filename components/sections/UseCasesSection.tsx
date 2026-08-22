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
    <section id="use-cases-section" className="py-16 px-4 sm:px-6 bg-[#09090B] border-y border-[#27272A]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#27272A]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#3ECF8E]">
                VERTICAL SPECIALIZATION
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAFAFA]">
              Built For Your Industry
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md">
            Solving key commercialization and presentation hurdles across the built environment spectrum.
          </p>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex flex-wrap items-center gap-1.5 mb-6">
          {useCases.map((uc, idx) => {
            const TabIcon = icons[idx];
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer border ${
                  activeTab === idx
                    ? 'bg-[#3ECF8E] text-black border-[#3ECF8E]'
                    : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:text-white hover:border-[#3f3f46]'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{uc.audience}</span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE USE CASE BREAKDOWN CARD */}
        <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 pb-4 border-b border-[#27272A]">
            <div className="p-2.5 rounded bg-[#09090B] border border-[#27272A] text-[#3ECF8E]">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-[#3ECF8E]">
                INDUSTRY SPECIFICATION
              </span>
              <h3 className="text-base font-bold text-[#FAFAFA]">
                {current.audience}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[#09090B] border border-rose-500/20 space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" />
                <span>The Challenge</span>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {current.problem}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FAFAFA] flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-[#3ECF8E]" />
                <span>VizTR Solution</span>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {current.solution}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#09090B] border border-[#3ECF8E]/30 space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3ECF8E] flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Commercial Impact</span>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {current.benefit}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
