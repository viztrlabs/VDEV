'use client';

import React from 'react';
import Link from 'next/link';
import { servicePagesData } from '@/data/pages';
import { useAppStore } from '@/lib/store';
import {
  ArrowRight,
  Sparkles,
  Box,
  ScanLine,
  Headset,
  Compass,
  Cpu,
  CheckCircle2,
  Play
} from 'lucide-react';

export default function XRWorldHubPage() {
  const data = servicePagesData.xrHub;
  const { openPixelStream, openModelViewer, openPanorama } = useAppStore();

  const getIcon = (id: string) => {
    switch (id) {
      case 'webxr':
        return Box;
      case 'webar':
        return ScanLine;
      case 'vr':
        return Headset;
      case 'virtual-tour':
        return Compass;
      case 'pixel-streaming':
        return Cpu;
      default:
        return Box;
    }
  };

  return (
    <main className="flex-1 w-full pb-20">
      {/* HERO SECTION */}
      <section className="relative py-28 px-6 bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-cover bg-center" style={{ backgroundImage: `url(${data.heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <span className="px-3.5 py-1 rounded-full bg-rose-600/30 border border-rose-500/40 text-rose-400 text-xs font-bold uppercase tracking-widest inline-block">
            {data.heroBadge}
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-display">
            {data.title}
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={openPixelStream}
              className="px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xl shadow-rose-900/40 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Live Cloud GPU Demo</span>
            </button>

            <button
              onClick={() => openModelViewer('', 'WebXR Architecture Viewer')}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Box className="w-4 h-4 text-rose-400" />
              <span>Test 3D Orbit</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5 SUB-SERVICES DETAILED GRID */}
      <section className="py-20 px-6 max-w-[1280px] mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Spatial Computation Formats
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white font-display mt-1">
            Five Scalable Interactive Formats
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Engineered for instant zero-install web access to ultra-high-end GPU cloud streaming.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.services.map((svc) => {
            const Icon = getIcon(svc.id);
            const isFlagship = svc.id === 'pixel-streaming';

            return (
              <div
                key={svc.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  isFlagship
                    ? 'lg:col-span-2 bg-gradient-to-br from-rose-950/60 via-zinc-900 to-black text-white border-2 border-rose-500 shadow-2xl'
                    : 'bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-md hover:shadow-xl'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                      <Icon className="w-6 h-6 text-rose-500" />
                    </div>
                    {isFlagship && (
                      <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-wider animate-pulse">
                        Flagship Architecture
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold font-display">
                    {svc.title}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      isFlagship ? 'text-zinc-300' : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {svc.desc}
                  </p>

                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-rose-500">
                      Capabilities:
                    </div>
                    <ul className="space-y-1.5">
                      {svc.features.map((f, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <Link
                    href={svc.href}
                    className="text-xs font-semibold text-rose-500 hover:underline inline-flex items-center gap-1.5"
                  >
                    <span>Read Architecture Spec</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {isFlagship ? (
                    <button
                      onClick={openPixelStream}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Launch Cloud Session</span>
                    </button>
                  ) : svc.id === 'virtual-tour' ? (
                    <button
                      onClick={() => openPanorama('', 'Sample 360 Tour')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-600 hover:text-white text-xs font-semibold transition-colors"
                    >
                      Launch 360
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* WEBXR VS APP STORE TABLE */}
      <section className="py-16 px-6 bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Frictionless Adoption
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white font-display mt-1">
              Zero-Install WebXR vs Traditional Native Apps
            </h3>
          </div>

          <div className="rounded-3xl overflow-hidden bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-lg">
            <div className="grid grid-cols-3 p-4 bg-zinc-100 dark:bg-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              <div>Metric / Capability</div>
              <div className="text-rose-600 dark:text-rose-400">VizTR WebXR Platform</div>
              <div className="text-zinc-500">Legacy Native App</div>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs sm:text-sm">
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-semibold text-zinc-900 dark:text-white">Install Friction</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold">0 Seconds (1 Click URL / QR)</div>
                <div className="text-zinc-500">5-10 min App Store download</div>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-semibold text-zinc-900 dark:text-white">Device Compatibility</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold">All Browsers (iOS/Android/Mac/PC)</div>
                <div className="text-zinc-500">Restricted OS & Hardware</div>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-semibold text-zinc-900 dark:text-white">Real-Time CMS Updates</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold">Instant live cloud sync</div>
                <div className="text-zinc-500">Requires App Store re-submission</div>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-semibold text-zinc-900 dark:text-white">Sales Conversion Drop-Off</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold">&lt; 4% drop-off</div>
                <div className="text-zinc-500">&gt; 65% drop-off at download gate</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
