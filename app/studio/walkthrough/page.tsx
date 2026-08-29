'use client';

import React from 'react';
import Link from 'next/link';
import { servicePagesData } from '@/data/pages';
import ContactForm from '@/components/forms/ContactForm';
import { ArrowRight, CheckCircle2, Play, Film, Sliders, Music, Zap } from 'lucide-react';

export default function WalkthroughStudioPage() {
  const data = servicePagesData['walkthrough'];

  return (
    <main className="flex-1 w-full pb-20">
      {/* HERO */}
      <section className="relative py-28 px-6 bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-35 bg-cover bg-center" style={{ backgroundImage: `url(${data.heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <Link href="/studio" className="text-xs text-rose-400 hover:underline">
              Studio
            </Link>
            <span className="text-xs text-zinc-500">/</span>
            <span className="text-xs text-zinc-300">Walkthrough Animation</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-display">
            {data.title}
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>
          <div className="pt-2">
            <a
              href="#walkthrough-brief"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-xl shadow-rose-900/40 transition-all hover:scale-105"
            >
              <span>Commission 4K Architectural Film</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* OVERVIEW & CAPABILITIES */}
      <section className="py-20 px-6 max-w-[1280px] mx-auto space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Cinematic Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white font-display">
              Unrivaled Motion Direction & Emotion-Driven Storytelling
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {data.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {data.capabilities?.map((cap, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-900 text-white border border-zinc-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-lg font-bold font-display">Cinematography Standards</h3>
              <span className="text-xs text-rose-400 font-mono">DCI 4K 60fps</span>
            </div>
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-2"><Film className="w-4 h-4 text-rose-400" /> Camera Motion Rig</span>
                <span className="text-zinc-400">Steadicam, drone swoops, macro dollys</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-2"><Music className="w-4 h-4 text-rose-400" /> Audio & Soundscapes</span>
                <span className="text-zinc-400">Custom orchestral scoring & spatial foley</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-2"><Zap className="w-4 h-4 text-rose-400" /> Render Farm Cluster</span>
                <span className="text-zinc-400">Distributed GPU cloud rendering</span>
              </div>
            </div>
          </div>
        </div>

        {/* PROCESS */}
        <div className="p-8 sm:p-10 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Animation Methodology
            </span>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-display mt-1">
              Production Workflow & Storyboard Approval
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.process?.map((p, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                  0{idx + 1}
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white font-display">
                  {p.step}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
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
              Animation Pricing Structure
            </h4>
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">30-Second Teaser (4K 60fps):</span>
                <span className="font-mono font-bold text-white">$4,500 – $7,000</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">60-Second Full Walkthrough Film:</span>
                <span className="font-mono font-bold text-white">$8,500 – $14,000</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">2-3 Minute Master Cinematic Film:</span>
                <span className="font-mono font-bold text-white">$16,000 – $28,000</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-400">Standard Production Schedule:</span>
                <span className="font-mono font-bold text-rose-400">2 – 3 Weeks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRIEF INQUIRY FORM */}
      <section id="walkthrough-brief" className="py-16 px-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-display">
            Request an Architectural Animation Quote
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Specify desired length, target presentation date, and audio requirements.
          </p>
        </div>
        <ContactForm initialService="Walkthrough Animation" />
      </section>
    </main>
  );
}
