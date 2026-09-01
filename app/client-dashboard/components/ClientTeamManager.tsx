'use client';

import React from 'react';
import { Users } from 'lucide-react';

export default function ClientTeamManager() {
  const teamMembers = [
    {
      name: 'Alexander Wright',
      email: 'a.wright@fosterpartners.com',
      role: 'Principal Reviewer (Full Sign-off)',
      status: 'Active'
    },
    {
      name: 'Elena Rostova',
      email: 'e.rostova@fosterpartners.com',
      role: 'Lead BIM Architect (Comment & Download)',
      status: 'Active'
    },
    {
      name: 'Marcus Chen',
      email: 'm.chen@fosterpartners.com',
      role: 'Development Partner (View Only)',
      status: 'Invited'
    }
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3ECF8E]" />
            <span>Authorized Team & Stakeholder Access</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Manage who at your architecture firm can review, comment, and approve deliverables
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {teamMembers.map((m, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#3ECF8E]/20 text-[#3ECF8E] font-bold text-xs flex items-center justify-center shrink-0">
                {m.name.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{m.name}</span>
                  <span className="text-[10px] font-mono text-[#71717A]">({m.email})</span>
                </div>
                <div className="text-[11px] text-[#A1A1AA] mt-0.5">{m.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                  m.status === 'Active'
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {m.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
