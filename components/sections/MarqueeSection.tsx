'use client';

import React from 'react';
import { homepageData } from '@/data/homepage';

export default function MarqueeSection() {
  const { marquee } = homepageData;

  return (
    <section
      id="marquee-section"
      className="w-full overflow-hidden bg-[#09090B] border-y border-[#27272A] py-2.5 select-none"
    >
      <div className="flex w-max animate-marquee space-x-6">
        {/* Render items multiple times for smooth infinite scroll */}
        {[...marquee.items, ...marquee.items, ...marquee.items].map((item, idx) => (
          <div key={idx} className="flex items-center space-x-6 shrink-0">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#A1A1AA]">
              {item}
            </span>
            <span className="text-[#3ECF8E] text-[10px]">✦</span>
          </div>
        ))}
      </div>
    </section>
  );
}
