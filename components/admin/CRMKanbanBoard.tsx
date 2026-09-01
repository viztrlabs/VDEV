// components/admin/CRMKanbanBoard.tsx
'use client';

import React, { useState } from 'react';
import { Plus, Download, AlertCircle } from 'lucide-react';
import { useDocStudioStore } from './DocStudioStore';
import { LEAD_STAGES } from './types/doc-studio';

function daysSince(iso: string): number {
  if (!iso) return 999;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

function csvEscape(v: string): string {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export default function CRMKanbanBoard() {
  const { leads, createLead, staleDays, setStaleDays } = useDocStudioStore();
  const [showStaleConfig, setShowStaleConfig] = useState(false);
  
  const handleExportCSV = () => {
    const headers = ['Name', 'Contact', 'Source', 'Service', 'Stage', 'Quoted Price', 'Advance Status', 'Next Follow-up', 'Created'];
    const rows = leads.map(l => [
      csvEscape(l.name),
      csvEscape(l.contact),
      csvEscape(l.source),
      csvEscape(l.service),
      csvEscape(l.stage),
      csvEscape(l.quoted_price),
      csvEscape(l.advance_status),
      csvEscape(l.next_followup || ''),
      csvEscape(l.created_at),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viztr-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => createLead()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-black text-xs font-mono font-bold hover:bg-[var(--primary-hover)] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Lead
        </button>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] hover:border-[var(--primary)] transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setShowStaleConfig(!showStaleConfig)}
            className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Flag stale after
          </button>
          {showStaleConfig && (
            <input
              type="number"
              value={staleDays}
              onChange={(e) => setStaleDays(parseInt(e.target.value) || 7)}
              className="w-14 px-2 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] text-center"
              min={1}
            />
          )}
          <span className="text-[11px] font-mono text-[var(--text-muted)]">days</span>
        </div>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1">
        {LEAD_STAGES.map((stage) => {
          const stageLeads = leads.filter(l => l.stage === stage.id);
          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-[240px] bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--primary)]">
                  {stage.label}
                </h3>
                <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">
                  {stageLeads.length}
                </span>
              </div>
              
              <div className="space-y-2">
                {stageLeads.length === 0 ? (
                  <div className="text-center py-4 text-[11px] text-[var(--text-muted)] opacity-60">
                    No leads
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const stale = daysSince(lead.updated_at) > staleDays;
                    return (
                      <div
                        key={lead.id}
                        className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors cursor-pointer"
                      >
                        <div className="text-[13px] font-bold text-[var(--text-primary)] mb-0.5 truncate">
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] mb-2">
                          {lead.service}
                          {lead.next_followup && ` · Follow-up: ${lead.next_followup}`}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {lead.quoted_price && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-[var(--primary)] text-[var(--primary)]">
                              {lead.quoted_price}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-[var(--border)] text-[var(--text-muted)]">
                            {lead.advance_status}
                          </span>
                          {stale && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-red-500 text-red-400">
                              Stale {daysSince(lead.updated_at)}d
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
