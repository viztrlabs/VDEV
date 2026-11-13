'use client';

import React from 'react';
import { homepageData } from '@/data/homepage';
import { useSiteSection } from '@/lib/use-site-section';
import { getListItems, getDefaultSection } from '@/lib/site-content';

export default function MarqueeSection() {
 const { marquee: fallback } = homepageData;
 const section = useSiteSection('marquee') ?? getDefaultSection('marquee');
 const stored = getListItems(section, 'marqueeItems').map((item) => item.values.value ?? '');
 const items = (stored.length > 0 ? stored : fallback.items).filter((item) => item.trim() !== '');

 return (
 <section
 id="marquee-section"
 className="relative w-full overflow-hidden bg-[#0A0A0B] border-y border-[#1E293B] py-5 sm:py-6 select-none shadow-inner"
 style={{
 maskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
 WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)'
 }}
 aria-label="VizTR Services and Technology Marquee"
 >
 <div className="flex w-max animate-marquee">
 {/* Set 1: Primary items */}
 <div className="flex shrink-0 items-center space-x-8 sm:space-x-12 pr-8 sm:pr-12">
 {items.map((item, idx) => (
 <div key={`set1-${idx}`} className="flex items-center space-x-8 sm:space-x-12 shrink-0">
 <span className="text-base sm:text-lg md:text-[22px] font-mono font-extrabold uppercase tracking-[0.2em] text-[#E5E2E3] hover:text-[#00F0FF] transition-colors duration-300">
 {item}
 </span>
 <span className="text-[#00F0FF] text-base sm:text-xl drop- select-none">
 ✦
 </span>
 </div>
 ))}
 </div>

 {/* Set 2: Exact duplicate clone for seamless infinite loop */}
 <div className="flex shrink-0 items-center space-x-8 sm:space-x-12 pr-8 sm:pr-12"aria-hidden="true">
 {items.map((item, idx) => (
 <div key={`set2-${idx}`} className="flex items-center space-x-8 sm:space-x-12 shrink-0">
 <span className="text-base sm:text-lg md:text-[22px] font-mono font-extrabold uppercase tracking-[0.2em] text-[#E5E2E3] hover:text-[#00F0FF] transition-colors duration-300">
 {item}
 </span>
 <span className="text-[#00F0FF] text-base sm:text-xl drop- select-none">
 ✦
 </span>
 </div>
 ))}
 </div>
 </div>
 </section>
 );
}
