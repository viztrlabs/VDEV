'use client';

import React, { useState } from 'react';
import { HelpCircle, Send, CheckCircle2, Phone, Mail } from 'lucide-react';

export default function SupportSystem() {
  const [ticketSent, setTicketSent] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setTicketSent(true);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#3ECF8E]" />
            <span>Dedicated Architectural Studio Support</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            24/7 direct escalation line to VizTR executive producers and technical directors
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-5 rounded-xl bg-[#18181B] border border-[#27272A] space-y-4">
          <h3 className="text-sm font-bold text-white">Create Urgent Priority Ticket</h3>
          
          {ticketSent ? (
            <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Priority ticket dispatched. Assigned Director has been alerted via SMS/Email.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#A1A1AA] mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Urgent camera angle update for investor presentation"
                  className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#A1A1AA] mb-1">Details</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your technical or architectural request..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Priority Request</span>
              </button>
            </form>
          )}
        </div>

        <div className="p-5 rounded-xl bg-[#18181B] border border-[#27272A] space-y-4">
          <h3 className="text-sm font-bold text-white">Direct Contacts</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
              <div className="font-bold text-white">Alexander Cross</div>
              <div className="text-[10px] font-mono text-[#3ECF8E]">Managing Technical Director</div>
              <div className="text-[#A1A1AA] text-[11px] mt-1 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-[#71717A]" />
                <span>alexander@viztr.com</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
              <div className="font-bold text-white">Production Hotline</div>
              <div className="text-[10px] font-mono text-[#3ECF8E]">London & Zurich Studio Hub</div>
              <div className="text-[#A1A1AA] text-[11px] mt-1 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-[#71717A]" />
                <span>+44 20 7946 0912</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
