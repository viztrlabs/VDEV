'use client';

import React from 'react';
import ProjectTracker from '@/components/tracking/ProjectTracker';

export default function TrackProjectSection() {
  return (
    <section id="track-project-section" className="py-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#3ECF8E]">
              TELEMETRY & LOGS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAFAFA]">
            Track Active Pipeline Milestone
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md">
          Monitor your 7-stage production pipeline, review draft proofs, and access master files in real time.
        </p>
      </div>

      <ProjectTracker />
    </section>
  );
}
