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
    <section id="benefits-section" className="py-16 px-4 sm:px-6 bg-[#0A0A0B] border-y border-[#1E293B]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#1E293B]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#42CF8B]">
                COMPETITIVE ADVANTAGE
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#FAFAFA]">
              Why Visionaries Choose VizTR
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#B9CACB] max-w-md">
            Engineered to elevate architectural presentation, accelerate pre-sales, and eliminate client review friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {benefits.map((b, idx) => {
            const IconComponent = icons[idx % icons.length];
            return (
              <div
                key={idx}
                className="p-6 rounded-[2rem] bg-[#131314] border border-[#1E293B] hover:border-[#00F0FF]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-[#00F0FF] flex items-center justify-center mb-4 group-hover:border-[#00F0FF]/50 transition-colors shadow-inner">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-display font-bold text-[#FAFAFA] mb-2">
                    {b.title}
                  </h3>
                  <p className="text-xs text-[#B9CACB] leading-relaxed">
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
