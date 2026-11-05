'use client';

import React from 'react';
import ProjectTracker from '@/components/tracking/ProjectTracker';
import { ShieldCheck, Info, Sparkles, RefreshCw } from 'lucide-react';
import { ViztrLogoMark } from '@/components/ui/Logo';

export default function TrackProjectPage() {
  return (
    <main className="flex-1 w-full pb-24">
      {/* 1. HERO PRESENTATION AREA (Full Landing Page Presentation Aspect Ratio) */}
      <section
        id="hero-section"
        className="relative w-full h-screen min-h-[680px] flex flex-col justify-between items-center overflow-hidden text-white select-none transition-colors duration-300 bg-[#09090B]"
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0" />

        {/* TOP AREA: Clears floating header & hosts Eyebrow Badge */}
        <div className="relative z-20 w-full pt-16 sm:pt-20 shrink-0 flex justify-center px-2 sm:px-4">
          <div className="hero-eyebrow inline-flex items-center gap-1.5 sm:gap-2.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#0A0A0B] shadow-2xl transition-all border border-[#1E293B] text-[10px] sm:text-xs max-w-[95vw] sm:max-w-none">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="font-bold text-emerald-400 tracking-wider uppercase shrink-0">Live Milestone Synchronization</span>
          </div>
        </div>

        {/* BOTTOM HERO CONTENT */}
        <div className="relative z-20 w-full container-ultrawide text-center flex flex-col items-center justify-end mt-auto px-4 sm:px-6 pb-6 sm:pb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-[#0A0A0B] border border-[#1E293B] shadow-xl">
              <ViztrLogoMark className="w-12 h-12" />
            </div>
          </div>
          
          <h1 className="hero-headline text-fluid-hero font-extrabold tracking-tight mb-2 sm:mb-3 font-sans">
            Client Production Portal
          </h1>

          <p className="hero-desc text-fluid-desc max-w-2xl 2xl:max-w-3xl text-center prose-readable font-normal leading-relaxed mb-6 text-[#E5E2E3]">
            Track your 7-stage architectural visualization pipeline in real time. Review whitecard clay previews, provide feedback, and download signed master deliverables.
          </p>
        </div>
      </section>

      {/* TRACKER COMPONENT CONTAINER */}
      <section className="py-12 px-6 max-w-[1280px] mx-auto">
        <ProjectTracker />

        {/* SECURITY & HELP CALLOUT */}
        <div className="mt-16 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Encrypted Access</span>
            </div>
            <p>
              Your architectural CAD and confidential pre-launch imagery are protected by AES-256 asset encryption and access keys.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-rose-500" />
              <span>Real-Time Updates</span>
            </div>
            <p>
              Status milestones update dynamically as our CGI directors and render cluster complete review phases.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-400" />
              <span>Need Direct Support?</span>
            </div>
            <p>
              Lost your access key? Contact your dedicated VizTR project director at <strong className="text-zinc-900 dark:text-white">portal@viztr.studio</strong>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
