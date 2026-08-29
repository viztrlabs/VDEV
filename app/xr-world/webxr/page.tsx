'use client';

import React from 'react';
import Link from 'next/link';
import { servicePagesData } from '@/data/pages';
import ContactForm from '@/components/forms/ContactForm';
import { useAppStore } from '@/lib/store';
import { ArrowRight, CheckCircle2, Box, Sparkles, Layers, Sliders, Smartphone } from 'lucide-react';

export default function WebXRServicePage() {
  const data = servicePagesData.webar;
  const { openModelViewer } = useAppStore();

  return (
    <main className="flex-1 w-full pb-20">
      {/* HERO */}
      <section className="relative py-28 px-6 bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-cover bg-center" style={{ backgroundImage: `url(${data.heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <Link href="/xr-world" className="text-xs text-rose-400 hover:underline">
              XR World
            </Link>
            <span className="text-xs text-zinc-500">/</span>
            <span className="text-xs text-zinc-300">WebXR</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-display">
            {data.title}
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openModelViewer('', 'WebXR Architectural Model')}
              className="px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xl shadow-rose-900/40 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <Box className="w-4 h-4" />
              <span>Test Interactive WebXR Model</span>
            </button>
          </div>
        </div>
      </section>

      {/* OVERVIEW & CAPABILITIES */}
      <section className="py-20 px-6 max-w-[1280px] mx-auto space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Browser-Native 3D
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white font-display">
              Ultra-Fast 60fps 3D Geometry in Safari, Chrome & Edge
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {data.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {data.capabilities.map((cap, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-900 text-white border border-zinc-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-lg font-bold font-display">WebXR Engine Specs</h3>
              <span className="text-xs text-emerald-400 font-mono">WebGPU / Three.js</span>
            </div>
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-between">
                <span className="font-semibold text-white">Load Time</span>
                <span className="text-emerald-400 font-bold">&lt; 1.8 seconds (Draco Compressed)</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-between">
                <span className="font-semibold text-white">Lighting Accuracy</span>
                <span className="text-zinc-400">PBR Environment Maps + Screen Space Reflections</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-between">
                <span className="font-semibold text-white">Device Coverage</span>
                <span className="text-zinc-400">iOS, Android, macOS, Windows (100% Web)</span>
              </div>
            </div>
          </div>
        </div>

        {/* DELIVERABLES & PRICING */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white font-display">
              Technical Deliverables
            </h4>
            <ul className="space-y-2.5">
              {data.deliverables.map((del, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{del}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 space-y-4">
            <h4 className="text-lg font-bold font-display">
              WebXR Production Investment
            </h4>
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Single Unit / Villa WebXR Model:</span>
                <span className="font-mono font-bold text-white">$2,800 – $4,500</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Full Building / Tower with Floorplan Configurator:</span>
                <span className="font-mono font-bold text-white">$6,000 – $12,000</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-400">Includes 12 Months High-Speed CDN Hosting:</span>
                <span className="font-mono font-bold text-emerald-400">Included Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRIEF INQUIRY FORM */}
      <section className="py-16 px-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-display">
            Inquire About WebXR Deployment
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Specify your CAD format and desired interactive features (custom materials, sun study, floor selector).
          </p>
        </div>
        <ContactForm initialService="WebXR (Zero-Install 3D)" />
      </section>
    </main>
  );
}
