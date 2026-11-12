'use client';

import React from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { ArrowRight, ImageIcon, Play, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { useSiteSection } from '@/lib/use-site-section';
import { getTextField } from '@/lib/site-content';

export default function StudioSection() {
  const { studio: fallback } = homepageData;
  const section = useSiteSection('home', 'studio');
  const studio = section
    ? { ...fallback, title: getTextField(section, 'title', fallback.title), tagline: getTextField(section, 'tagline', fallback.tagline) }
    : fallback;

 return (
 <section id="studio-section"className="py-28 px-6 bg-transparent text-white relative">
 <div className="container-ultrawide">
 {/* Section Header */}
 <div className="text-center max-w-2xl mx-auto mb-16">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 text-xs font-mono font-bold uppercase tracking-widest mb-4 shadow-sm">
 <span>{studio.badge}</span>
 </div>
 <h2 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white mb-4">
 {studio.title}
 </h2>
 <p className="text-lg text-[#E5E2E3]">{studio.tagline}</p>
 </div>

 {/* Studio Cards */}
 <div className="grid md:grid-cols-2 gap-8 w-full">
 {studio.cards.map((card) => (
 <Link
 key={card.id}
 href={card.cta.href}
 className="group p-8 rounded-[2rem] bg-[#131314] border border-[#1E293B] hover:border-[#00F0FF]/40 transition-all duration-300 flex flex-col justify-between shadow-sm"
 >
 <div>
 <div className="w-10 h-10 rounded-full bg-[#0A0A0B] border border-[#1E293B] flex items-center justify-center mb-4 text-[#00F0FF] group-hover:border-[#00F0FF]/50 transition-colors">
 {card.icon === 'Image' && <ImageIcon className="w-4 h-4 text-[#00F0FF]"/>}
 {card.icon === 'Play' && <Play className="w-4 h-4 text-[#00F0FF]"/>}
 </div>
 <div className="space-y-3">
 <h3 className="text-2xl font-bold font-display text-[#FAFAFA]">{card.title}</h3>
 <p className="text-sm text-[#B9CACB] leading-relaxed">{card.description}</p>
 <ul className="space-y-2 pt-3 border-t border-[#1E293B]">
 {card.services.map((s) => (
 <li key={s.label} className="flex items-center gap-2 text-xs text-[#B9CACB]">
 <ArrowRightIcon className="w-3 h-3 text-[#00F0FF]/60 group-hover:text-[#00F0FF] transition-colors"/>
 <span className="group-hover:text-white transition-colors">{s.label}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>

 <div className="pt-5 mt-6 border-t border-[#1E293B]">
 <div className="w-full py-2.5 rounded-full bg-[#0A0A0B] group-hover:bg-[#00F0FF] group-hover:text-black text-[#FAFAFA] border border-[#1E293B] group-hover:border-[#00F0FF] text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm">
 <span>{card.cta.label}</span>
 <ArrowRight className="w-3.5 h-3.5"/>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </section>
 );
}