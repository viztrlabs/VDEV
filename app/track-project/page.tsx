'use client';

import React from 'react';
import ProjectTracker from '@/components/tracking/ProjectTracker';
import { ShieldCheck, Info, Sparkles, RefreshCw } from 'lucide-react';
import { ViztrLogoMark } from '@/components/ui/Logo';

export default function TrackProjectPage() {
  return (
    <main className="flex-1 w-full pb-24">
      {/* HERO */}
      <section className="relative py-24 px-6 bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-2xl bg-[#18181B] border border-[#27272A] shadow-xl">
              <ViztrLogoMark className="w-12 h-12" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Live Milestone Synchronization</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-display">
            Client Production Portal
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
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
