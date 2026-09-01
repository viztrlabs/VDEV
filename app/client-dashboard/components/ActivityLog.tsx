'use client';

import React from 'react';
import { Activity, Download, Eye, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ActivityLog() {
  const logs = [
    { action: '8K Render Set Downloaded', user: 'Alexander Wright', time: '1 hour ago', type: 'download' },
    { action: 'Feedback Comment Added to Cam 04', user: 'Alexander Wright', time: '2 hours ago', type: 'feedback' },
    { action: 'CAD Facade Rev 4 Uploaded', user: 'VizTR BIM Team', time: '5 hours ago', type: 'upload' },
    { action: 'Stage 02 Milestone Formally Approved', user: 'Elena Rostova', time: 'Yesterday', type: 'approval' },
    { action: 'WebXR Spatial Inspection Launched', user: 'Marcus Chen', time: '2 days ago', type: 'view' }
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#3ECF8E]" />
            <span>Audit Trail & Project Activity History</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Immutable log of all reviews, downloads, approvals, and model uploads
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {logs.map((log, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#3ECF8E] shrink-0">
                {log.type === 'download' ? (
                  <Download className="w-3.5 h-3.5" />
                ) : log.type === 'approval' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : log.type === 'feedback' ? (
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{log.action}</div>
                <div className="text-[10px] font-mono text-[#71717A]">Performed by {log.user}</div>
              </div>
            </div>

            <span className="text-[10px] font-mono text-[#71717A]">{log.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
