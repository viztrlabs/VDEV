'use client';

import React from 'react';
import ProjectTracker from '@/components/tracking/ProjectTracker';

export default function TrackProjectSection() {
  return (
    <section id="track-project-section" className="py-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#42CF8B]">
              TELEMETRY & LOGS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#FAFAFA]">
            Track Active Pipeline Milestone
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#B9CACB] max-w-md">
          Monitor your 7-stage production pipeline, review draft proofs, and access master files in real time.
        </p>
      </div>

      <ProjectTracker />
    </section>
  );
}
