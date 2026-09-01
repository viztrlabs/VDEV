'use client';

import React from 'react';
import { Calendar, Clock, Flag } from 'lucide-react';

export default function DeadlineTracker() {
  const milestones = [
    {
      title: 'Lighting & PBR Material Sign-Off',
      dueDate: 'Sep 04, 2026',
      daysRemaining: '3 Days',
      status: 'upcoming',
      critical: true
    },
    {
      title: 'Unreal Engine 5.4 Lumen Animation Render Delivery',
      dueDate: 'Sep 12, 2026',
      daysRemaining: '11 Days',
      status: 'in-schedule',
      critical: false
    },
    {
      title: 'WebXR Spatial Package & Investor Deck Deployment',
      dueDate: 'Sep 20, 2026',
      daysRemaining: '19 Days',
      status: 'in-schedule',
      critical: false
    }
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#3ECF8E]" />
            <span>Milestone Schedule & Critical Path Deadlines</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Realtime delivery schedule with automated SLA and milestone alarms
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {milestones.map((m, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-[#3ECF8E] shrink-0">
                <Flag className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>{m.title}</span>
                  {m.critical && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-950/40 text-amber-400 border border-amber-800/40 text-[9px] font-mono font-bold uppercase">
                      Action Required
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-[#71717A] mt-0.5 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>Target Date: {m.dueDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-right">
                <div className="text-sm font-mono font-bold text-white">{m.daysRemaining}</div>
                <div className="text-[10px] font-mono text-[#3ECF8E]">Remaining</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
