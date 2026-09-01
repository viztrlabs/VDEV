// components/admin/DocStudioForm.tsx
'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useDocStudioStore } from './DocStudioStore';
import type {
  DocumentType, Document, RateCardContent, ProposalContent,
  AgreementContent, NDAContent, InvoiceContent, OnboardingContent,
  ReleaseContent, CaseStudyContent
} from './types/doc-studio';

interface LineItemProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function TextInput({ label, value, onChange, placeholder }: LineItemProps) {
  return (
    <div>
      <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: LineItemProps) {
  return (
    <div>
      <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] resize-none"
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-mono font-bold text-[var(--primary)] mt-4 mb-2">
      {children}
    </div>
  );
}

interface LineItemsProps {
  items: Array<{ name: string; price: string }>;
  onChange: (items: Array<{ name: string; price: string }>) => void;
}

function LineItemsEditor({ items, onChange }: LineItemsProps) {
  const update = (idx: number, field: 'name' | 'price', val: string) => {
    const updated = items.map((item, i) => 
      i === idx ? { ...item, [field]: val } : item
    );
    onChange(updated);
  };
  
  const add = () => onChange([...items, { name: 'New service', price: '₹' }]);
  
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            type="text"
            value={item.name}
            onChange={(e) => update(idx, 'name', e.target.value)}
            placeholder="Service name"
            className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
          />
          <input
            type="text"
            value={item.price}
            onChange={(e) => update(idx, 'price', e.target.value)}
            placeholder="Price"
            className="w-32 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
          />
          <button
            onClick={() => remove(idx)}
            className="p-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-muted)] hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[var(--primary)] text-[var(--primary)] text-xs hover:bg-[var(--primary)]/10 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add service
      </button>
    </div>
  );
}

interface InvestmentItemsProps {
  items: Array<{ item: string; cost: string }>;
  onChange: (items: Array<{ item: string; cost: string }>) => void;
}

function InvestmentItemsEditor({ items, onChange }: InvestmentItemsProps) {
  const update = (idx: number, field: 'item' | 'cost', val: string) => {
    const updated = items.map((it, i) => 
      i === idx ? { ...it, [field]: val } : it
    );
    onChange(updated);
  };
  
  const add = () => onChange([...items, { item: 'New service', cost: '₹' }]);
  
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  
  return (
    <div className="space-y-2">
      {items.map((it, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            type="text"
            value={it.item}
            onChange={(e) => update(idx, 'item', e.target.value)}
            placeholder="Service name"
            className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
          />
          <input
            type="text"
            value={it.cost}
            onChange={(e) => update(idx, 'cost', e.target.value)}
            placeholder="Price"
            className="w-32 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
          />
          <button
            onClick={() => remove(idx)}
            className="p-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-muted)] hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[var(--primary)] text-[var(--primary)] text-xs hover:bg-[var(--primary)]/10 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add service
      </button>
    </div>
  );
}

interface DocStudioFormProps {
  readOnly?: boolean;
}

export default function DocStudioForm({ readOnly = false }: DocStudioFormProps) {
  const { activeTab, activeDocument, createDocument, updateDocument, deleteDocument } = useDocStudioStore();
  
  if (!activeDocument) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-[var(--text-muted)] text-xs mb-4">
          No document selected. Create one to get started.
        </p>
        <button
          onClick={() => createDocument(activeTab)}
          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-black text-xs font-mono font-bold hover:bg-[var(--primary-hover)] transition-colors"
        >
          + Create {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </button>
      </div>
    );
  }
  
  const update = (updates: Partial<Document>) => updateDocument(activeDocument.id, updates);
  const updateContent = (contentUpdates: Partial<Document['content']>) => {
    update({ content: { ...activeDocument.content, ...contentUpdates } as DocumentContent });
  };
  
  const docType = activeDocument.type;
  const content = activeDocument.content;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[10px] font-mono text-[var(--text-muted)]">
            {docType.toUpperCase()}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            Last updated: {new Date(activeDocument.updated_at).toLocaleDateString()}
          </span>
        </div>
        {!readOnly && (
          <button
            onClick={() => {
              if (confirm('Delete this document?')) deleteDocument(activeDocument.id);
            }}
            className="p-1.5 rounded-lg bg-red-950/30 border border-red-800/50 text-red-400 hover:bg-red-950/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      
      {/* Common fields */}
      <div className="grid grid-cols-2 gap-3">
        <TextInput
          label="Client Name"
          value={(content as any).client || (content as any).client_name || ''}
          onChange={(v) => updateContent({ client: v, client_name: v } as any)}
          placeholder="Client name"
        />
        <TextInput
          label="Project Name"
          value={(content as any).project || (content as any).project_name || ''}
          onChange={(v) => updateContent({ project: v, project_name: v } as any)}
          placeholder="Project name"
        />
      </div>
      
      {/* Type-specific fields */}
      {docType === 'ratecard' && (
        <LineItemsEditor
          items={(content as RateCardContent).items}
          onChange={(items) => updateContent({ items })}
        />
      )}
      
      {docType === 'proposal' && (
        <>
          <SectionLabel>1 · Understanding Their Challenge</SectionLabel>
          <TextArea
            label="Restate the pain point"
            value={(content as ProposalContent).challengeQuote}
            onChange={(v) => updateContent({ challengeQuote: v })}
          />
          <SectionLabel>2 · Proposed Solution</SectionLabel>
          <TextArea
            label="What we're building"
            value={(content as ProposalContent).solutionWhat}
            onChange={(v) => updateContent({ solutionWhat: v })}
          />
          <TextArea
            label="Why this solves it"
            value={(content as ProposalContent).solutionWhy}
            onChange={(v) => updateContent({ solutionWhy: v })}
          />
          <SectionLabel>3 · What&apos;s Included (Phase 1)</SectionLabel>
          <TextArea
            label="One feature per line"
            value={(content as ProposalContent).phase1}
            onChange={(v) => updateContent({ phase1: v })}
          />
          <TextArea
            label="Phase 2 (optional)"
            value={(content as ProposalContent).phase2}
            onChange={(v) => updateContent({ phase2: v })}
          />
          <SectionLabel>5 · Investment</SectionLabel>
          <InvestmentItemsEditor
            items={(content as ProposalContent).investmentItems}
            onChange={(items) => updateContent({ investmentItems: items })}
          />
          <TextInput
            label="Payment Terms"
            value={(content as ProposalContent).payment}
            onChange={(v) => updateContent({ payment: v })}
          />
          <SectionLabel>6 · Why VizTR</SectionLabel>
          <TextArea
            label="Relevant experience"
            value={(content as ProposalContent).whyViztr}
            onChange={(v) => updateContent({ whyViztr: v })}
          />
          <SectionLabel>7 · Next Steps</SectionLabel>
          <TextArea
            label="One step per line"
            value={(content as ProposalContent).nextSteps}
            onChange={(v) => updateContent({ nextSteps: v })}
          />
        </>
      )}
      
      {docType === 'agreement' && (
        <>
          <TextArea label="Scope" value={(content as AgreementContent).scope} onChange={(v) => updateContent({ scope: v })} />
          <TextArea label="Revisions Clause" value={(content as AgreementContent).revisions} onChange={(v) => updateContent({ revisions: v })} />
          <TextArea label="Timeline" value={(content as AgreementContent).timeline} onChange={(v) => updateContent({ timeline: v })} />
          <TextArea label="Payment Terms" value={(content as AgreementContent).payment} onChange={(v) => updateContent({ payment: v })} />
          <TextArea label="IP & Usage Rights" value={(content as AgreementContent).ip} onChange={(v) => updateContent({ ip: v })} />
          <TextArea label="Cancellation Policy" value={(content as AgreementContent).cancel} onChange={(v) => updateContent({ cancel: v })} />
          <TextArea label="Governing Law" value={(content as AgreementContent).law} onChange={(v) => updateContent({ law: v })} />
        </>
      )}
      
      {docType === 'nda' && (
        <>
          <TextInput label="Party A (you)" value={(content as NDAContent).partyA} onChange={(v) => updateContent({ partyA: v })} />
          <TextInput label="Party B (client)" value={(content as NDAContent).partyB} onChange={(v) => updateContent({ partyB: v })} />
          <TextInput label="Purpose" value={(content as NDAContent).purpose} onChange={(v) => updateContent({ purpose: v })} />
          <TextInput label="Term" value={(content as NDAContent).term} onChange={(v) => updateContent({ term: v })} />
        </>
      )}
      
      {docType === 'invoice' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <TextInput label="Invoice #" value={(content as InvoiceContent).number} onChange={(v) => updateContent({ number: v })} />
            <TextInput label="Date" value={(content as InvoiceContent).date} onChange={(v) => updateContent({ date: v })} />
            <TextInput label="Due Date" value={(content as InvoiceContent).due} onChange={(v) => updateContent({ due: v })} />
            <TextInput label="Client Address" value={(content as InvoiceContent).clientAddr} onChange={(v) => updateContent({ clientAddr: v })} />
          </div>
          <SectionLabel>Line Items</SectionLabel>
          <LineItemsEditor
            items={(content as InvoiceContent).items}
            onChange={(items) => updateContent({ items })}
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(content as InvoiceContent).gst}
                onChange={(e) => updateContent({ gst: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-xs text-[var(--text-primary)]">Add GST</span>
            </label>
            {(content as InvoiceContent).gst && (
              <TextInput
                label="GST %"
                value={(content as InvoiceContent).gstPercent}
                onChange={(v) => updateContent({ gstPercent: v })}
              />
            )}
          </div>
          <TextArea
            label="Notes"
            value={(content as InvoiceContent).notes}
            onChange={(v) => updateContent({ notes: v })}
          />
        </>
      )}
      
      {docType === 'onboarding' && (
        <TextInput
          label="Project Name"
          value={(content as OnboardingContent).project}
          onChange={(v) => updateContent({ project: v })}
        />
      )}
      
      {docType === 'release' && (
        <>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(content as ReleaseContent).showName}
                onChange={(e) => updateContent({ showName: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-xs text-[var(--text-primary)]">Client name may be shown publicly</span>
            </label>
          </div>
        </>
      )}
      
      {docType === 'casestudy' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <TextInput label="Location" value={(content as CaseStudyContent).location} onChange={(v) => updateContent({ location: v })} />
            <TextInput label="Services Used" value={(content as CaseStudyContent).services} onChange={(v) => updateContent({ services: v })} />
          </div>
          <TextArea label="Challenge" value={(content as CaseStudyContent).challenge} onChange={(v) => updateContent({ challenge: v })} />
          <TextArea label="Approach / Solution" value={(content as CaseStudyContent).approach} onChange={(v) => updateContent({ approach: v })} />
          <TextArea label="Result" value={(content as CaseStudyContent).result} onChange={(v) => updateContent({ result: v })} />
          <TextArea label="Testimonial Quote" value={(content as CaseStudyContent).testimonial} onChange={(v) => updateContent({ testimonial: v })} />
          <TextInput label="Testimonial Author" value={(content as CaseStudyContent).author} onChange={(v) => updateContent({ author: v })} />
        </>
      )}
    </div>
  );
}
