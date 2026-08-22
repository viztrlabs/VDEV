'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="flex-1 w-full py-24 px-6 max-w-4xl mx-auto space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
          Client Agreement & Licensing
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">
          Terms of Service
        </h1>
        <p className="text-xs text-zinc-400 font-mono">Effective Date: January 1, 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white font-display">1. Commission Agreement & Production Milestones</h2>
        <p>
          All visualization commissions, 3D modeling, animations, and WebXR applications produced by VizTR are governed by project-specific Statements of Work (SOW) and tracked through the 7-stage production milestone portal.
        </p>

        <h2 className="text-base font-bold text-zinc-900 dark:text-white font-display">2. Intellectual Property & Commercial Usage License</h2>
        <p>
          Upon final milestone payment and delivery of master files, clients receive full, irrevocable, worldwide commercial usage rights for marketing, advertising, investor presentations, and architectural sales materials for the specified project. VizTR retains the right to display approved images in non-confidential studio portfolio showcases unless exclusive embargo terms are executed.
        </p>

        <h2 className="text-base font-bold text-zinc-900 dark:text-white font-display">3. Revisions & Scope Amendments</h2>
        <p>
          Each package tier includes defined revision cycles at Stage 3 (Whitecard geometry & camera lock) and Stage 5 (Lighting, materials & draft review). Structural architectural design changes requested after camera approval may incur additional modeling fees.
        </p>

        <h2 className="text-base font-bold text-zinc-900 dark:text-white font-display">4. Cloud Pixel Streaming Availability</h2>
        <p>
          Unreal Engine 5.4 Pixel Streaming instances are provisioned on dedicated GPU cloud clusters with 99.9% target uptime. Concurrency limits and bandwidth allocations scale according to the active enterprise subscription tier.
        </p>
      </div>
    </main>
  );
}
