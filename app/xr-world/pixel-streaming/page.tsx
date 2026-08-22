'use client';

import React from 'react';
import Link from 'next/link';
import { servicePagesData } from '@/data/pages';
import DemoRequestForm from '@/components/forms/DemoRequestForm';
import { useAppStore } from '@/lib/store';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Sparkles,
  Play,
  Zap,
  Activity,
  Layers,
  ShieldAlert,
  Server
} from 'lucide-react';

export default function PixelStreamingServicePage() {
  const data = servicePagesData.pixelStreaming;
  const { openPixelStream } = useAppStore();

  return (
    <main className="flex-1 w-full pb-20">
      {/* HERO */}
      <section className="relative py-32 px-6 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url(${data.heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-600/30 border border-rose-500/40 text-rose-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{data.heroBadge}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight font-display">
            {data.title}
          </h1>

          <p className="text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={openPixelStream}
              id="pixel-stream-launch-hero"
              className="px-8 py-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-2xl shadow-rose-900/60 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Live Cloud GPU Session</span>
            </button>

            <a
              href="#stream-specs"
              className="px-6 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm border border-zinc-700 transition-all flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-rose-400" />
              <span>Technical Specs</span>
            </a>
          </div>
        </div>
      </section>

      {/* OVERVIEW & UNREAL 5.4 ARCHITECTURE */}
      <section className="py-20 px-6 max-w-[1280px] mx-auto space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Zero Compromise Real-Time
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white font-display">
              Unreal Engine 5.4 Rendered on Cloud GPUs, Streamed to Any Web Browser
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

          {/* TELEMETRY HUD CARD */}
          <div id="stream-specs" className="p-8 rounded-3xl bg-zinc-950 text-white border border-rose-500/40 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-lg font-bold font-display">Cloud Node Telemetry</h3>
              </div>
              <span className="text-xs text-rose-400 font-mono">RTX 4090 Cloud Pod</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="text-zinc-500">ENGINE</div>
                <div className="text-sm font-bold text-white">Unreal Engine 5.4.3</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="text-zinc-500">LIGHTING & GEOM</div>
                <div className="text-sm font-bold text-rose-400">Lumen + Nanite</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="text-zinc-500">STREAM PROTOCOL</div>
                <div className="text-sm font-bold text-white">WebRTC Peer-to-Peer</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="text-zinc-500">AVERAGE LATENCY</div>
                <div className="text-sm font-bold text-emerald-400">&lt; 28ms (US/EU/Asia)</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={openPixelStream}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Open Unreal 5 Viewport</span>
              </button>
            </div>
          </div>
        </div>

        {/* DELIVERABLES & PRICING */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white font-display">
              Pixel Streaming Deliverables
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
              Enterprise Streaming Pricing
            </h4>
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">UE5 Environment Build & Optimization:</span>
                <span className="font-mono font-bold text-white">$12,000 – $24,000</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Cloud GPU Streaming Node (Hourly / Concurrency):</span>
                <span className="font-mono font-bold text-white">$1.20 – $1.80 / hr per stream</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-400">Global Auto-Scaling & Load Balancing:</span>
                <span className="font-mono font-bold text-rose-400">Fully Managed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIP DEMO REQUEST FORM */}
      <section className="py-16 px-6 max-w-xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Immediate Access
          </span>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-display mt-1">
            Request Pixel Streaming Access
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Provide your credentials below to immediately allocate a test GPU instance.
          </p>
        </div>
        <DemoRequestForm />
      </section>
    </main>
  );
}
