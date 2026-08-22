'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
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
          Legal & Data Privacy
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">
          Privacy Policy
        </h1>
        <p className="text-xs text-zinc-400 font-mono">Effective Date: January 1, 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white font-display">1. Overview</h2>
        <p>
          VizTR Studio (&ldquo;VizTR&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) respects the privacy and confidentiality of our clients, architects, and web visitors. This Privacy Policy details how we handle project data, CAD drawings, personal contact information, and real-time WebXR/Pixel Streaming session telemetry.
        </p>

        <h2 className="text-base font-bold text-zinc-900 dark:text-white font-display">2. Architectural Confidentiality & Non-Disclosure (NDA)</h2>
        <p>
          We treat all unbuilt architectural designs, 3D BIM models, masterplans, and pre-sales marketing renders submitted to VizTR as strictly confidential proprietary intellectual property. We do not distribute, sell, or publicly showcase any commissioned visual assets without express written consent from the client.
        </p>

        <h2 className="text-base font-bold text-zinc-900 dark:text-white font-display">3. Information We Collect</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Contact Data:</strong> Name, work email, phone number, and company name provided via project inquiries or consultation bookings.</li>
          <li><strong>Project Specifications:</strong> CAD/BIM model geometries, floor plans, material schedules, and timeline parameters.</li>
          <li><strong>Spatial Stream Telemetry:</strong> Anonymized GPU session metrics (latency, viewport resolution, frame rates) used to optimize WebRTC and Pixel Streaming cloud performance.</li>
        </ul>

        <h2 className="text-base font-bold text-zinc-900 dark:text-white font-display">4. Data Security & Storage</h2>
        <p>
          All uploaded assets and project portal milestones are stored in encrypted cloud environments with restricted director-level access controls.
        </p>

        <h2 className="text-base font-bold text-zinc-900 dark:text-white font-display">5. Contact Information</h2>
        <p>
          For privacy inquiries or data removal requests, please contact our data compliance officer at <strong>privacy@viztr.studio</strong>.
        </p>
      </div>
    </main>
  );
}
