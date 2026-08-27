'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { homepageData } from '@/data/homepage';
import { ArrowRight, Eye } from 'lucide-react';

export default function StudioPreview() {
  const { studioPreview } = homepageData;

  return (
    <section id="studio-preview-section" className="py-14 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#27272A] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#3ECF8E]">
              CGI PIPELINES
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAFAFA]">
            {studioPreview.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1 max-w-xl">
            {studioPreview.subtitle}
          </p>
        </div>
        <Link
          href="/studio"
          className="text-xs font-mono font-semibold text-[#3ECF8E] hover:underline inline-flex items-center gap-1.5 shrink-0"
        >
          <span>ALL STUDIO PIPELINES →</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {studioPreview.services.map((svc) => (
          <div
            key={svc.id}
            className="rounded-xl overflow-hidden bg-[#18181B] border border-[#27272A] hover:border-[#3f3f46] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 w-full overflow-hidden border-b border-[#27272A]">
                <Image
                  src={svc.image}
                  alt={svc.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#09090B]/90 text-[#3ECF8E] border border-[#27272A] text-[10px] font-mono font-bold z-10">
                  {svc.tag}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-base font-bold text-[#FAFAFA]">
                  {svc.title}
                </h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  {svc.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0">
              <Link
                href={svc.href}
                className="w-full py-2 rounded bg-[#27272A] hover:bg-[#3ECF8E] text-[#FAFAFA] hover:text-black text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
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
