'use client';

import React from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { ArrowRight, CheckCircle2, Sparkles, Box } from 'lucide-react';

export default function ServiceCategories() {
  const { serviceCategories } = homepageData;

  return (
    <section id="service-categories-section" className="py-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#3ECF8E]">
              CORE DISCIPLINES
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAFAFA]">
            {serviceCategories.title}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md">
          {serviceCategories.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1 — STUDIO */}
        <div
          id="service-card-studio"
          className="rounded-xl overflow-hidden bg-[#18181B] border border-[#27272A] hover:border-[#3f3f46] transition-all flex flex-col justify-between"
        >
          <div>
            {/* Image Header */}
            <div className="relative h-56 sm:h-64 w-full overflow-hidden border-b border-[#27272A]">
              <img
                src={serviceCategories.studio.image}
                alt="Studio Architectural Visualization"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-black/40" />
              <div className="absolute top-4 left-4">
                <span className="px-2 py-0.5 rounded bg-[#09090B]/90 text-[#3ECF8E] border border-[#27272A] text-[10px] font-mono font-bold uppercase tracking-wider">
                  {serviceCategories.studio.subtitle}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-2xl font-bold text-white">
                  {serviceCategories.studio.title}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                {serviceCategories.studio.description}
              </p>

              <div className="pt-3 border-t border-[#27272A] space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#71717A]">
                  Included Pipelines
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {serviceCategories.studio.services.map((svc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-[#FAFAFA] bg-[#09090B] p-2 rounded border border-[#27272A]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3ECF8E] shrink-0" />
                      <span className="truncate">{svc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="p-5 pt-0">
            <Link
              href={serviceCategories.studio.href}
              className="w-full py-2.5 rounded bg-[#27272A] hover:bg-[#3ECF8E] text-[#FAFAFA] hover:text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <span>{serviceCategories.studio.cta}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* CARD 2 — XR WORLD */}
        <div
          id="service-card-xr"
          className="rounded-xl overflow-hidden bg-[#18181B] border border-[#3ECF8E]/30 hover:border-[#3ECF8E] transition-all flex flex-col justify-between"
        >
          <div>
            {/* Image Header */}
            <div className="relative h-56 sm:h-64 w-full overflow-hidden border-b border-[#27272A]">
              <img
                src={serviceCategories.xrWorld.image}
                alt="XR World Spatial Technology"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-black/40" />
              <div className="absolute top-4 right-4">
                <span className="px-2 py-0.5 rounded bg-[#3ECF8E] text-black text-[10px] font-mono font-extrabold uppercase tracking-wider">
                  SPATIAL ENGINE
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="px-2 py-0.5 rounded bg-[#09090B]/90 text-[#3ECF8E] border border-[#27272A] text-[10px] font-mono font-bold uppercase tracking-wider">
                  {serviceCategories.xrWorld.subtitle}
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {serviceCategories.xrWorld.title}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                {serviceCategories.xrWorld.description}
              </p>

              <div className="pt-3 border-t border-[#27272A] space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#3ECF8E]">
                  Spatial Capabilities
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {serviceCategories.xrWorld.services.map((svc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-[#FAFAFA] bg-[#09090B] p-2 rounded border border-[#27272A]">
                      <Sparkles className="w-3.5 h-3.5 text-[#3ECF8E] shrink-0" />
                      <span className="truncate">{svc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="p-5 pt-0">
            <Link
              href={serviceCategories.xrWorld.href}
              className="w-full py-2.5 rounded bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-[#3ECF8E]/20"
            >
              <span>{serviceCategories.xrWorld.cta}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
