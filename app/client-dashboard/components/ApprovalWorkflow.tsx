'use client';

import React, { useState } from 'react';
import { CheckCircle2, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ApprovalWorkflow() {
  const [stages, setStages] = useState([
    {
      id: 'stg-1',
      title: 'Stage 01: Schematic CAD & Volume Study',
      status: 'approved',
      signedBy: 'Alexander Wright (Client Lead)',
      date: 'Feb 04, 2026',
      notes: 'Massing signoff completed with zero geometry revisions required.'
    },
    {
      id: 'stg-2',
      title: 'Stage 02: Clay Renderings & View Angles',
      status: 'approved',
      signedBy: 'Elena Rostova',
      date: 'Feb 15, 2026',
      notes: 'All 8 primary exterior cameras locked and approved.'
    },
    {
      id: 'stg-3',
      title: 'Stage 03: Photometric Lighting & PBR Materials',
      status: 'pending_signature',
      signedBy: null,
      date: 'Awaiting Client Review',
      notes: 'Final 4K draft renders ready for formal client review and signoff.'
    },
    {
      id: 'stg-4',
      title: 'Stage 04: Master 4K Animation & Spatial WebXR',
      status: 'queued',
      signedBy: null,
      date: 'Target: Sep 12, 2026',
      notes: 'Final multi-angle production & cloud pixel streaming deployment.'
    }
  ]);

  const handleApprove = (id: string) => {
    setStages(
      stages.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'approved',
              signedBy: 'You (Authorized Client Signatory)',
              date: 'Just now'
            }
          : s
      )
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#3ECF8E]" />
            <span>Formal Milestone Sign-Off & Approval Workflow</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Audit-grade architectural milestone signoffs and contract stage approvals
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stg) => (
          <div key={stg.id} className="p-4 sm:p-5 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {stg.status === 'approved' ? (
                  <CheckCircle2 className="w-5 h-5 text-[#3ECF8E] shrink-0" />
                ) : stg.status === 'pending_signature' ? (
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-zinc-500 shrink-0" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-white">{stg.title}</h3>
                  <p className="text-[11px] text-[#A1A1AA]">{stg.notes}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border ${
                    stg.status === 'approved'
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                      : stg.status === 'pending_signature'
                      ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {stg.status.replace('_', ' ')}
                </span>
                {stg.status === 'pending_signature' && (
                  <button
                    onClick={() => handleApprove(stg.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Authorize Sign-Off
                  </button>
                )}
              </div>
            </div>

            {stg.signedBy && (
              <div className="pt-2 border-t border-[#27272A] flex items-center justify-between text-[11px] font-mono text-[#71717A]">
                <span>Digitally Signed by: {stg.signedBy}</span>
                <span>Timestamp: {stg.date}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
