'use client';

import React from 'react';
import { AlertTriangle, Clock, ArrowRight, CheckCircle2, FileSignature, MessageSquare } from 'lucide-react';

export default function ActionRequiredPanel() {
  const actions = [
    {
      id: 'act-1',
      title: 'Milestone 03: Twilight Lighting Calibration Sign-Off',
      description: 'The architectural lighting study and PBR material reflectance values are awaiting your formal approval before final 8K rendering.',
      deadline: 'Tomorrow, 17:00 GMT',
      urgent: true,
      type: 'approval',
      actionText: 'Review & Sign Off'
    },
    {
      id: 'act-2',
      title: 'Review North Elevation Facade Revision Markups',
      description: 'VizTR CGI directors added 3 alternative glazing reflections in the interactive visual markup viewer.',
      deadline: 'Friday, Sep 04, 2026',
      urgent: false,
      type: 'feedback',
      actionText: 'Open Visual Markup'
    }
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
            <span>Action Required by Client ({actions.length})</span>
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#A1A1AA]">SLA Priority Channel</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((act) => (
          <div
            key={act.id}
            className="p-5 rounded-xl bg-[#18181B] border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-4 shadow-lg shadow-amber-950/10"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span>Due: {act.deadline}</span>
                </span>
                {act.urgent && (
                  <span className="px-2 py-0.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold uppercase">
                    High Priority
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-white">{act.title}</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">{act.description}</p>
            </div>

            <div className="pt-3 border-t border-[#27272A] flex items-center justify-end">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>{act.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
