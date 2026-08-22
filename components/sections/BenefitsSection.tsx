'use client';

import React from 'react';
import { homepageData } from '@/data/homepage';
import {
  Sparkles,
  Zap,
  Smartphone,
  Eye,
  TrendingUp,
  HeartHandshake,
  CloudCheck
} from 'lucide-react';

export default function BenefitsSection() {
  const { benefits } = homepageData;

  const icons = [
    Sparkles,
    Zap,
    Smartphone,
    Eye,
    TrendingUp,
    HeartHandshake,
    CloudCheck
  ];

  return (
    <section id="benefits-section" className="py-16 px-4 sm:px-6 bg-[#09090B] border-y border-[#27272A]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#27272A]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#3ECF8E]">
                COMPETITIVE ADVANTAGE
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAFAFA]">
              Why Visionaries Choose VizTR
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md">
            Engineered to elevate architectural presentation, accelerate pre-sales, and eliminate client review friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {benefits.map((b, idx) => {
            const IconComponent = icons[idx % icons.length];
            return (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3f3f46] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded bg-[#09090B] border border-[#27272A] text-[#3ECF8E] flex items-center justify-center mb-3">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#FAFAFA] mb-1.5">
                    {b.title}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
