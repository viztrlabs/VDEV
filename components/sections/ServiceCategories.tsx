'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { homepageData } from '@/data/homepage';
import { ArrowRight, CheckCircle2, Sparkles, Box } from 'lucide-react';

export default function ServiceCategories() {
  const { serviceCategories } = homepageData;

  return (
    <section id="service-categories-section" className="py-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#42CF8B]">
              CORE DISCIPLINES
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#FAFAFA]">
            {serviceCategories.title}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#B9CACB] max-w-md">
          {serviceCategories.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1 — STUDIO */}
        <div
          id="service-card-studio"
          className="rounded-[2rem] overflow-hidden bg-[#131314] border border-[#1E293B] hover:border-[#00F0FF]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
        >
          <div>
            {/* Image Header */}
            <div className="relative h-60 sm:h-72 w-full overflow-hidden border-b border-[#1E293B]">
              <Image
                src={serviceCategories.studio.image}
                alt="Studio Architectural Visualization"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={85}
                className="object-cover render-lighting-enhanced group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-[#131314]/30 to-black/40" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-[#0A0A0B]/90 text-[#00F0FF] border border-[#1E293B] text-[10px] font-bold uppercase tracking-wider shadow-md">
                  {serviceCategories.studio.subtitle}
                </span>
              </div>
              <div className="absolute bottom-4 left-6 right-6">
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                  {serviceCategories.studio.title}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 space-y-5">
              <p className="text-xs sm:text-sm text-[#B9CACB] leading-relaxed">
                {serviceCategories.studio.description}
              </p>

              <div className="pt-4 border-t border-[#1E293B] space-y-3">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#71717A]">
                  Included Pipelines
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {serviceCategories.studio.services.map((svc, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-[#FAFAFA] bg-[#0A0A0B] px-3.5 py-2 rounded-full border border-[#1E293B]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                      <span className="truncate font-medium">{svc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="p-6 sm:p-8 pt-0">
            <Link
              href={serviceCategories.studio.href}
              className="w-full py-3 rounded-full bg-[#0A0A0B] hover:bg-[#00F0FF] text-[#FAFAFA] hover:text-black font-extrabold text-xs uppercase tracking-wider border border-[#1E293B] hover:border-[#00F0FF] transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{serviceCategories.studio.cta}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* CARD 2 — XR WORLD */}
        <div
          id="service-card-xr"
          className="rounded-[2rem] overflow-hidden bg-[#131314] border border-[#42CF8B]/40 hover:border-[#42CF8B] transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
        >
          <div>
            {/* Image Header */}
            <div className="relative h-60 sm:h-72 w-full overflow-hidden border-b border-[#1E293B]">
              <Image
                src={serviceCategories.xrWorld.image}
                alt="XR World Spatial Technology"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={85}
                className="object-cover render-lighting-enhanced group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-[#131314]/30 to-black/40" />
              <div className="absolute top-4 right-4">
                <span className="px-3.5 py-1 rounded-full bg-[#42CF8B] text-black text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                  SPATIAL ENGINE
                </span>
              </div>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-3 py-1 rounded-full bg-[#0A0A0B]/90 text-[#42CF8B] border border-[#1E293B] text-[10px] font-bold uppercase tracking-wider inline-block mb-1.5 shadow-md">
                  {serviceCategories.xrWorld.subtitle}
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                  {serviceCategories.xrWorld.title}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 space-y-5">
              <p className="text-xs sm:text-sm text-[#B9CACB] leading-relaxed">
                {serviceCategories.xrWorld.description}
              </p>

              <div className="pt-4 border-t border-[#1E293B] space-y-3">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#42CF8B]">
                  Spatial Capabilities
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {serviceCategories.xrWorld.services.map((svc, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-[#FAFAFA] bg-[#0A0A0B] px-3.5 py-2 rounded-full border border-[#1E293B]">
                      <Sparkles className="w-3.5 h-3.5 text-[#42CF8B] shrink-0" />
                      <span className="truncate font-medium">{svc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="p-6 sm:p-8 pt-0">
            <Link
              href={serviceCategories.xrWorld.href}
              className="w-full py-3 rounded-full bg-[#42CF8B] hover:bg-[#34b27b] text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-[#42CF8B]/25 active:scale-95"
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
