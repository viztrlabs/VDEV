// components/admin/DocStudioCRM.tsx
'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import DocStudioTabs from './DocStudioTabs';
import DocStudioProfile from './DocStudioProfile';
import DocStudioForm from './DocStudioForm';
import DocStudioPreview from './DocStudioPreview';
import CRMKanbanBoard from './CRMKanbanBoard';
import { useDocStudioStore } from './DocStudioStore';

export default function DocStudioCRM() {
  const { documents, setActiveDocument, activeDocument, createDocument, activeTab } = useDocStudioStore();
  const [view, setView] = React.useState<'studio' | 'crm'>('studio');
  
  const filteredDocs = documents.filter(d => d.type === activeTab);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/30 flex items-center justify-center">
            <FileText className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-[var(--text-primary)]">
              Doc Studio & CRM
            </h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              Fill once, generate every client-facing document. Track leads from first contact to closed deal.
            </p>
          </div>
        </div>
        
        <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
          <button
            onClick={() => setView('studio')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              view === 'studio'
                ? 'bg-[var(--primary)] text-black font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Doc Studio
          </button>
          <button
            onClick={() => setView('crm')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              view === 'crm'
                ? 'bg-[var(--primary)] text-black font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            CRM
          </button>
        </div>
      </div>
      
      {view === 'studio' ? (
        <>
          <DocStudioTabs />
          
          <DocStudioProfile />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[11px] font-mono font-bold uppercase text-[var(--text-muted)]">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}s
                  </h3>
                  <button
                    onClick={() => createDocument(activeTab)}
                    className="text-[10px] font-mono text-[var(--primary)] hover:underline"
                  >
                    + New
                  </button>
                </div>
                {filteredDocs.length === 0 ? (
                  <p className="text-[11px] text-[var(--text-muted)] text-center py-3">
                    No documents yet. Create one to get started.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {filteredDocs.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setActiveDocument(doc)}
                        className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-mono transition-colors ${
                          activeDocument?.id === doc.id
                            ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        <span className="truncate block">{doc.title || doc.client_name || doc.type}</span>
                        <span className="text-[10px] opacity-60">
                          {new Date(doc.updated_at).toLocaleDateString()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
                <DocStudioForm />
              </div>
            </div>
            
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
              <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] mb-2">
                Live Preview
              </div>
              <DocStudioPreview />
            </div>
          </div>
        </>
      ) : (
        <CRMKanbanBoard />
      )}
    </div>
  );
}
