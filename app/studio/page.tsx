'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { servicePagesData } from '@/data/pages';
import ContactForm from '@/components/forms/ContactForm';
import { ArrowRight, CheckCircle2, Eye, Sparkles } from 'lucide-react';

export default function StudioHubPage() {
  const data = servicePagesData.studioHub;

  return (
    <main className="flex-1 w-full pb-20">
      {/* HERO SECTION */}
      <section className="relative py-24 px-6 bg-zinc-950 text-white overflow-hidden">
        <Image
          src={data.heroImage}
          alt="Studio Visualization Hub"
          fill
          priority
          referrerPolicy="no-referrer"
          className="object-cover opacity-30 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <span className="px-3.5 py-1 rounded-full bg-rose-600/30 border border-rose-500/40 text-rose-400 text-xs font-bold uppercase tracking-widest inline-block">
            {data.badge}
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-display">
            {data.title}
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>
        </div>
      </section>

      {/* 3 SUB-SERVICES BREAKDOWN */}
      <section className="py-20 px-6 max-w-[1280px] mx-auto space-y-20">
        {data.services?.map((svc, idx) => (
          <div
            key={svc.id}
            className={`flex flex-col ${
              idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
            } items-center gap-10 lg:gap-14`}
          >
            {/* Image */}
            <div className="w-full lg:w-1/2 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 relative group aspect-[16/10] bg-zinc-900">
              <Image
                src={svc.image}
                alt={svc.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                referrerPolicy="no-referrer"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="w-full lg:w-1/2 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Studio Specialization 0{idx + 1}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white font-display">
                {svc.title}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {svc.desc}
              </p>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Included Capabilities:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {svc.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href={svc.href}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-rose-600 dark:hover:bg-rose-600 dark:hover:text-white font-semibold text-xs transition-colors shadow-md"
                >
                  <span>Explore {svc.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* STUDIO PIPELINE COMPARISON & PRICING MATRIX */}
      <section className="py-16 px-6 bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Transparent Tiering
          </span>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white font-display">
            Studio Production Packages
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Scalable architectural rendering packages engineered for boutique architects to master developers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
          <div className="p-7 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-md space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Essentials Render</h3>
            <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-white">$3,500 <span className="text-xs font-normal text-zinc-400">/ project</span></div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Up to 3 high-resolution 8K stills with 2 rounds of creative revisions.</p>
            <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-500" /> 8K Ultra HD Stills</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-500" /> Day & Dusk Lighting</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-500" /> 7-Stage Portal Tracking</li>
            </ul>
          </div>

          <div className="p-7 rounded-3xl bg-zinc-950 text-white border-2 border-rose-500 shadow-xl space-y-4 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider">
              Most Popular
            </span>
            <h3 className="text-lg font-bold">Marketing Master Suite</h3>
            <div className="text-3xl font-bold font-mono text-rose-400">$9,500 <span className="text-xs font-normal text-zinc-400">/ project</span></div>
            <p className="text-xs text-zinc-300">8 High-res stills + 45s 4K cinematic film + complete material board.</p>
            <ul className="space-y-2 text-xs text-zinc-300 pt-3 border-t border-zinc-800">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> 8x 8K Stills (Ext & Int)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> 4K Cinematic Walkthrough</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> 360° Web Viewer Node</li>
            </ul>
          </div>

          <div className="p-7 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-md space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Masterplan Enterprise</h3>
            <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-white">Custom <span className="text-xs font-normal text-zinc-400">/ proposal</span></div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Multi-building districts, aerial drone integration, and complete media suites.</p>
            <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-500" /> Unlimited Visual Assets</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-500" /> Drone Geo-Matching</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-500" /> Dedicated Art Director</li>
            </ul>
          </div>
        </div>
      </section>

      {/* BRIEF INQUIRY */}
      <section className="py-20 px-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-display">
            Commission a Studio Project
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Submit your CAD/BIM drawings or brief for an itemized estimate within 24 hours.
          </p>
        </div>
        <ContactForm initialService="Exterior Visualization" />
      </section>
    </main>
  );
}
