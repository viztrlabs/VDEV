'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building,
  ShieldCheck,
  Download,
  Box,
  Eye,
  Clock,
  ExternalLink,
  Lock,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import ProjectTracker from '@/components/tracking/ProjectTracker';
import ProjectStatsWidget, { ProjectStatsData } from '@/components/tracking/ProjectStatsWidget';

const DEFAULT_PROJECT_STATS: Record<string, ProjectStatsData> = {
  'VIZTR-882': {
    hoursSpent: 142.5,
    totalEstimatedHours: 180.0,
    assetsApproved: 12,
    totalAssets: 15,
    pendingRevisions: 2,
    revisionsSummary: '2 active tickets (podium glass tint & lighting)',
    nextMilestone: 'Stage 6: 8K Production Rendering',
    milestoneEta: 'ETA: 24h',
    currentStageNumber: 6,
    totalStages: 7,
  },
  'VIZTR-904': {
    hoursSpent: 86.0,
    totalEstimatedHours: 160.0,
    assetsApproved: 4,
    totalAssets: 8,
    pendingRevisions: 3,
    revisionsSummary: '3 active tickets (walnut millwork texturing)',
    nextMilestone: 'Stage 4: Lighting & Material Staging',
    milestoneEta: 'ETA: Friday',
    currentStageNumber: 4,
    totalStages: 7,
  },
  'VIZTR-771': {
    hoursSpent: 210.0,
    totalEstimatedHours: 210.0,
    assetsApproved: 22,
    totalAssets: 22,
    pendingRevisions: 0,
    revisionsSummary: 'Zero blockers — all milestone batches signed off',
    nextMilestone: 'Archival Master Package Dispatched',
    milestoneEta: 'Completed',
    currentStageNumber: 7,
    totalStages: 7,
  },
};

export default function SharedClientViewPage({ params }: { params: Promise<{ accessCode: string }> }) {
  const resolvedParams = use(params);
  const { showToast, openModelViewer, openPanorama } = useAppStore();

  const accessCode = resolvedParams.accessCode || 'VIZTR-882';
  const cleanCode = accessCode.toUpperCase();

  const [validationState, setValidationState] = useState<'pending' | 'valid' | 'invalid'>('pending');
  const [clientName, setClientName] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    async function validate() {
      // Skip validation for known demo access codes (back-compat for the public read-only demo)
      if (cleanCode.startsWith('VIZTR-')) {
        setValidationState('valid');
        return;
      }
      try {
        const res = await fetch(`/api/clients?accessCode=${encodeURIComponent(cleanCode)}`, {
          cache: 'no-store',
        });
        if (cancelled) return;
        if (!res.ok) {
          setValidationState('invalid');
          return;
        }
        const data = await res.json();
        if (Array.isArray(data.clients) && data.clients.length > 0) {
          setClientName(data.clients[0].name || '');
          setValidationState('valid');
        } else {
          setValidationState('invalid');
        }
      } catch {
        if (!cancelled) setValidationState('invalid');
      }
    }
    validate();
    return () => {
      cancelled = true;
    };
  }, [cleanCode]);

  if (validationState === 'pending') {
    return (
      <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-[#3ECF8E] animate-spin" />
          <p className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">Validating access token…</p>
        </div>
      </main>
    );
  }

  if (validationState === 'invalid') {
    return (
      <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4 p-8 rounded-2xl bg-[#18181B] border border-[#27272A]">
          <Lock className="w-8 h-8 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold font-display text-white">Invalid Access Token</h2>
          <p className="text-xs text-[#A1A1AA]">
            The access code <span className="font-mono text-white">{accessCode}</span> was not recognized. Please verify the link or contact your VizTR project lead for a valid token.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Link
              href="/client-access"
              className="px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider"
            >
              Client Portal Login
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-white font-mono text-xs"
            >
              Contact Studio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const matchedStats: ProjectStatsData = DEFAULT_PROJECT_STATS[cleanCode] || DEFAULT_PROJECT_STATS['VIZTR-882'];

  return (
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* TOP NOTICE */}
        <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Secure Public Read-Only Milestone & Stats View • Token: {accessCode}</span>
          </div>

          <Link
            href="/client-access"
            className="text-xs font-mono text-[#FAFAFA] hover:text-[#3ECF8E] inline-flex items-center gap-1 transition-colors"
          >
            <span>Full Client Workspace Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* HERO CARD */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#27272A] pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#3ECF8E] uppercase tracking-wider font-bold">
                Commercial High-Rise & WebXR Commission
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
                The Apex Tower — Stakeholder Review
              </h1>
              <p className="text-xs text-[#A1A1AA]">
                Client: {clientName || 'Foster & Partners'} • Authorization Key: <span className="text-white font-mono">{accessCode}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openModelViewer('models/apex-tower-v3-draco.glb', 'The Apex Tower')}
                className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#3ECF8E]/40 text-xs font-mono text-[#3ECF8E] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Box className="w-4 h-4" />
                <span>3D WebXR Model</span>
              </button>

              <button
                onClick={() => openPanorama('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=90', 'The Apex Tower')}
                className="px-3 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>360° Node</span>
              </button>
            </div>
          </div>

          {/* PROJECT STATISTICS TELEMETRY WIDGET */}
          <div className="space-y-2">
            <ProjectStatsWidget
              stats={matchedStats}
              projectName="The Apex Tower"
              projectId={cleanCode}
              readOnly={true}
            />
          </div>

          {/* PROJECT TIMELINE */}
          <div className="space-y-4 pt-4 border-t border-[#27272A]">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3ECF8E]" />
              <span>Production Pipeline Status (7 Stages)</span>
            </h2>
            <ProjectTracker initialProjectId={accessCode} />
          </div>

          {/* DELIVERABLE ASSETS PREVIEW */}
          <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-[#3ECF8E]" />
              <span>Available Milestone Previews</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">Stage 4 Approval Proofs (Watermarked)</div>
                  <div className="text-[10px] text-[#71717A]">4 Stills · 3840x2160 JPEG</div>
                </div>
                <button
                  onClick={() => showToast('Opening proof bundle...', 'info')}
                  className="px-2 py-1 rounded bg-[#27272A] text-[#3ECF8E] hover:bg-[#3F3F46]"
                >
                  View
                </button>
              </div>

              <div className="p-3 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">WebXR Geometry Preview Model</div>
                  <div className="text-[10px] text-[#71717A]">GLB Binary · 8.4 MB</div>
                </div>
                <button
                  onClick={() => openModelViewer('models/apex-tower-v3-draco.glb', 'The Apex Tower')}
                  className="px-2 py-1 rounded bg-[#27272A] text-[#3ECF8E] hover:bg-[#3F3F46]"
                >
                  Launch
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
