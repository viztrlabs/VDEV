'use client';

import React from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { ArrowRight, ImageIcon, Play, ArrowRight as ArrowRightIcon } from 'lucide-react';

export default function StudioSection() {
  const { studio } = homepageData;

  return (
    <section id="studio-section" className="py-28 px-6 bg-transparent text-white relative">
      <div className="container-ultrawide">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 text-xs font-mono font-bold uppercase tracking-widest mb-4 shadow-sm">
            <span>{studio.badge}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white mb-4">
            {studio.title}
          </h2>
          <p className="text-lg text-[#E5E2E3]">{studio.subtitle}</p>
        </div>

        {/* Studio Cards */}
        <div className="grid md:grid-cols-2 gap-8 w-full">
          {studio.cards.map((card) => (
            <Link
              key={card.id}
              href={card.cta.href}
              className="group glass-card rounded-[2rem] p-8 hover:border-[#00F0FF]/60 transition-all space-y-6 border border-[#1E293B]"
            >
              <div className="p-3.5 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 w-fit backdrop-blur-md shadow-inner">
                {card.icon === 'Image' && <ImageIcon className="w-6 h-6 text-[#00F0FF]" />}
                {card.icon === 'Play' && <Play className="w-6 h-6 text-[#00F0FF]" />}
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold font-display text-white">{card.title}</h3>
                <p className="text-base text-[#E5E2E3]">{card.description}</p>
                <ul className="space-y-2 pt-2 border-t border-[#1E293B]">
                  {card.services.map((s) => (
                    <li key={s.label} className="flex items-center gap-2 text-sm text-[#B9CACB]">
                      <ArrowRightIcon className="w-3 h-3 text-[#00F0FF]/60 group-hover:text-[#00F0FF] transition-colors" />
                      <span className="group-hover:text-white transition-colors">{s.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 text-[#00F0FF] text-sm font-semibold border-t border-[#1E293B] pt-4">
                <span>{card.cta.label}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}