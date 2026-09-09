'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { homepageData } from '@/data/homepage';
import { ArrowRight, Eye } from 'lucide-react';

export default function StudioPreview() {
  const { studioPreview } = homepageData;

  return (
    <section id="studio-preview-section" className="py-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#1E293B] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#42CF8B]">
              CGI PIPELINES
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#FAFAFA]">
            {studioPreview.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#B9CACB] mt-1 max-w-xl">
            {studioPreview.subtitle}
          </p>
        </div>
        <Link
          href="/studio"
          className="text-xs font-bold text-[#00F0FF] hover:underline inline-flex items-center gap-1.5 shrink-0"
        >
          <span>ALL STUDIO PIPELINES →</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {studioPreview.services.map((svc) => (
          <div
            key={svc.id}
            className="rounded-[2rem] overflow-hidden bg-[#131314] border border-[#1E293B] hover:border-[#00F0FF]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
          >
            <div>
              <div className="relative h-52 w-full overflow-hidden border-b border-[#1E293B]">
                <Image
                  src={svc.image}
                  alt={svc.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  quality={85}
                  className="object-cover render-lighting-enhanced group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-[1]" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0A0A0B]/90 text-[#00F0FF] border border-[#1E293B] text-[10px] font-bold z-10 shadow-md">
                  {svc.tag}
                </span>
              </div>

              <div className="p-6 space-y-2">
                <h3 className="text-base font-display font-bold text-[#FAFAFA]">
                  {svc.title}
                </h3>
                <p className="text-xs text-[#B9CACB] leading-relaxed">
                  {svc.description}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Link
                href={svc.href}
                className="w-full py-2.5 rounded-full bg-[#0A0A0B] hover:bg-[#00F0FF] text-[#FAFAFA] hover:text-black text-xs font-bold uppercase tracking-wider border border-[#1E293B] hover:border-[#00F0FF] transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Pipeline Specs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
