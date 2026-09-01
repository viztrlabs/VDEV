'use client';

import React from 'react';
import { FileText, Download, CreditCard } from 'lucide-react';

export default function FinancialsPanel() {
  const invoices = [
    {
      id: 'INV-2026-882-01',
      description: 'Initial Retainer & CAD Schematic Ingestion Deposit',
      amount: '$14,500.00',
      status: 'Paid',
      date: 'Jan 28, 2026'
    },
    {
      id: 'INV-2026-882-02',
      description: 'Stage 02 Milestone: 3D Modelling & Master Cameras Lock',
      amount: '$18,200.00',
      status: 'Paid',
      date: 'Feb 16, 2026'
    },
    {
      id: 'INV-2026-882-03',
      description: 'Stage 03 Milestone: 4K Lighting Calibration & Realtime XR Build',
      amount: '$16,000.00',
      status: 'Pending',
      date: 'Due Sep 15, 2026'
    }
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#3ECF8E]" />
            <span>Commission Financials & Invoices</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Retainer ledger, milestone payments, and tax invoices
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
          <div className="text-[10px] font-mono uppercase text-[#A1A1AA]">Total Commission Value</div>
          <div className="text-2xl font-bold text-white mt-1">$48,700.00</div>
          <div className="text-[11px] font-mono text-[#3ECF8E] mt-1">Full Scope Production</div>
        </div>
        <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
          <div className="text-[10px] font-mono uppercase text-[#A1A1AA]">Paid to Date</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">$32,700.00</div>
          <div className="text-[11px] font-mono text-[#A1A1AA] mt-1">67.1% Cleared</div>
        </div>
        <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
          <div className="text-[10px] font-mono uppercase text-[#A1A1AA]">Current Balance Due</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">$16,000.00</div>
          <div className="text-[11px] font-mono text-[#A1A1AA] mt-1">Milestone 03 in review</div>
        </div>
      </div>

      <div className="space-y-3">
        {invoices.map((inv) => (
          <div key={inv.id} className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#3ECF8E] shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{inv.id}</span>
                  <span className="text-[10px] font-mono text-[#A1A1AA]">• {inv.date}</span>
                </div>
                <div className="text-[11px] text-[#A1A1AA] mt-0.5">{inv.description}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-auto">
              <span className="text-sm font-mono font-bold text-white">{inv.amount}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                  inv.status === 'Paid'
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                    : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                }`}
              >
                {inv.status}
              </span>
              <button
                type="button"
                className="p-1.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                title="Download PDF Invoice"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
