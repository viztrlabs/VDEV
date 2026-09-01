# VizTR Doc Studio + CRM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate VizTR Doc Studio + CRM into Super Admin Dashboard with read-only client access, enabling creation of 8 document types and lead pipeline management.

**Architecture:** React/TypeScript components in Next.js 15 with Zustand state management, Supabase persistence, and localStorage caching. Two-column layout (form + preview) for document editing, Kanban board for CRM.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Zustand, Supabase, @dnd-kit/core, lucide-react

---

## Global Constraints

- Use CSS variables from `globals.css` (`--bg-primary`, `--text-primary`, `--primary`, etc.)
- Follow existing patterns: `hd-card`, `hd-badge` classes, lucide-react icons
- Use existing Supabase client setup from `@/lib/supabase/client`
- All themes (dark, light, obsidian, bronze, blueprint, glass) must work via `[data-theme="..."]` selectors
- Mobile-first responsive design with horizontal scroll for Kanban

---

## File Structure

```
components/admin/
├── DocStudioCRM.tsx           # Main container component
├── DocStudioCRMClient.tsx     # Read-only client view
├── DocStudioTabs.tsx          # 8 document type tabs
├── DocStudioProfile.tsx       # Business profile form
├── DocStudioForm.tsx          # Dynamic form based on doc type
├── DocStudioPreview.tsx       # Live preview with print/copy
├── CRMKanbanBoard.tsx        # Lead pipeline Kanban
├── CRMLeadDetail.tsx         # Lead detail modal/sheet
├── DocStudioStore.ts          # Zustand store
└── types/
    └── doc-studio.ts          # TypeScript types

lib/
└── doc-studio-supabase.ts     # Supabase client functions

supabase/migrations/
└── 20260901_doc_studio_crm.sql  # Schema + RLS

app/admin/dashboard/page.tsx    # Add sidebar + render
app/client-dashboard/page.tsx   # Add Documents tab
```

---

## Task 1: Supabase Migration

**Files:**
- Create: `supabase/migrations/20260901_doc_studio_crm.sql`
- Test: Run migration in Supabase dashboard

- [ ] **Step 1: Create migration file**

```sql
-- Studio Profile (single row)
CREATE TABLE IF NOT EXISTS studio_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT DEFAULT 'VizTR' NOT NULL,
  owner TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  upi_id TEXT,
  bank_details TEXT,
  gstin TEXT,
  paper_size TEXT DEFAULT 'A4' CHECK (paper_size IN ('A4', 'Letter')),
  show_logo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN (
    'ratecard','proposal','agreement','nda',
    'invoice','onboarding','release','casestudy'
  )),
  title TEXT,
  client_name TEXT,
  project_name TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','signed','archived')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_name);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  source TEXT,
  service TEXT DEFAULT 'Stills',
  stage TEXT DEFAULT 'lead' CHECK (stage IN (
    'lead','qualified','discovery','proposal','contract',
    'production','revisions','delivered','testimonial','upsell'
  )),
  quoted_price TEXT,
  advance_status TEXT DEFAULT 'Not requested',
  next_followup DATE,
  notes JSONB DEFAULT '[]',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);

-- Enable RLS
ALTER TABLE studio_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins full access studio_profile" ON studio_profile
  FOR ALL USING (auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'ADMIN'));

CREATE POLICY "Admins full access documents" ON documents
  FOR ALL USING (auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'ADMIN'));

CREATE POLICY "Clients read own documents" ON documents
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'CLIENT' AND
    client_name = auth.jwt() ->> 'client_firm'
  );

CREATE POLICY "Admins full access leads" ON leads
  FOR ALL USING (auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'ADMIN'));

CREATE POLICY "Clients read assigned leads" ON leads
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'CLIENT' AND
    assigned_to = auth.uid()
  );

-- Insert default studio profile
INSERT INTO studio_profile (name, owner) VALUES ('VizTR', 'Rahul')
ON CONFLICT DO NOTHING;
```

- [ ] **Step 2: Run migration in Supabase dashboard**

Apply via: Supabase Dashboard → Database → Migrations → New migration

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260901_doc_studio_crm.sql
git commit -m "feat: add doc studio CRM supabase schema"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `components/admin/types/doc-studio.ts`

- [ ] **Step 1: Create types file**

```typescript
// components/admin/types/doc-studio.ts

export type DocumentType = 
  | 'ratecard' | 'proposal' | 'agreement' | 'nda'
  | 'invoice' | 'onboarding' | 'release' | 'casestudy';

export type LeadStage = 
  | 'lead' | 'qualified' | 'discovery' | 'proposal' | 'contract'
  | 'production' | 'revisions' | 'delivered' | 'testimonial' | 'upsell';

export const SERVICE_OPTIONS = [
  'Stills', 'Animation', 'WebXR', 'WebAR', 
  'Virtual Reality', 'Virtual Tour', 'Pixel Streaming'
] as const;

export const ADVANCE_OPTIONS = [
  'Not requested', 'Requested', 'Partial', 'Paid'
] as const;

export const DOCUMENT_TABS: { id: DocumentType; label: string }[] = [
  { id: 'ratecard', label: 'Rate Card' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'agreement', label: 'Agreement / SOW' },
  { id: 'nda', label: 'NDA' },
  { id: 'invoice', label: 'Invoice' },
  { id: 'onboarding', label: 'Onboarding Brief' },
  { id: 'release', label: 'Portfolio Release' },
  { id: 'casestudy', label: 'Case Study' },
];

export const LEAD_STAGES: { id: LeadStage; label: string }[] = [
  { id: 'lead', label: 'Lead' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'discovery', label: 'Discovery Call' },
  { id: 'proposal', label: 'Proposal Sent' },
  { id: 'contract', label: 'Contract + Advance' },
  { id: 'production', label: 'Production' },
  { id: 'revisions', label: 'Revisions' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'testimonial', label: 'Testimonial / Case Study' },
  { id: 'upsell', label: 'Upsell' },
];

export interface StudioProfile {
  id?: string;
  name: string;
  owner: string;
  phone: string;
  email: string;
  address: string;
  upi_id: string;
  bank_details: string;
  gstin: string;
  paper_size: 'A4' | 'Letter';
  show_logo: boolean;
  updated_at?: string;
}

export interface Document {
  id: string;
  type: DocumentType;
  title: string;
  client_name: string;
  project_name: string;
  content: DocumentContent;
  status: 'draft' | 'sent' | 'signed' | 'archived';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  contact: string;
  source: string;
  service: string;
  stage: LeadStage;
  quoted_price: string;
  advance_status: string;
  next_followup: string | null;
  notes: LeadNote[];
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadNote {
  id: string;
  date: string;
  text: string;
}

// Document content types
export interface RateCardContent {
  items: Array<{ name: string; price: string }>;
}

export interface ProposalContent {
  client: string;
  project: string;
  date: string;
  challengeQuote: string;
  solutionWhat: string;
  solutionWhy: string;
  phase1: string;
  phase2: string;
  timelineItems: Array<{ milestone: string; date: string }>;
  investmentItems: Array<{ item: string; cost: string }>;
  payment: string;
  whyViztr: string;
  nextSteps: string;
  validity: string;
}

export interface AgreementContent {
  client: string;
  project: string;
  date: string;
  scope: string;
  revisions: string;
  timeline: string;
  payment: string;
  ip: string;
  cancel: string;
  law: string;
}

export interface NDAContent {
  partyA: string;
  partyB: string;
  date: string;
  purpose: string;
  term: string;
}

export interface InvoiceContent {
  number: string;
  date: string;
  due: string;
  client: string;
  clientAddr: string;
  items: Array<{ desc: string; qty: string; rate: string }>;
  gst: boolean;
  gstPercent: string;
  notes: string;
}

export interface OnboardingContent {
  project: string;
}

export interface ReleaseContent {
  client: string;
  project: string;
  date: string;
  showName: boolean;
}

export interface CaseStudyContent {
  project: string;
  client: string;
  location: string;
  services: string;
  challenge: string;
  approach: string;
  result: string;
  testimonial: string;
  author: string;
}

export type DocumentContent = 
  | RateCardContent
  | ProposalContent
  | AgreementContent
  | NDAContent
  | InvoiceContent
  | OnboardingContent
  | ReleaseContent
  | CaseStudyContent;
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/types/doc-studio.ts
git commit -m "feat: add doc studio TypeScript types"
```

---

## Task 3: Zustand Store

**Files:**
- Create: `components/admin/DocStudioStore.ts`

- [ ] **Step 1: Create Zustand store**

```typescript
// components/admin/DocStudioStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DocumentType, LeadStage, Lead, Document,
  StudioProfile, DocumentContent, LeadNote
} from './types/doc-studio';

function todayStr(): string {
  return new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Default content generators
function getDefaultContent(type: DocumentType): DocumentContent {
  switch (type) {
    case 'ratecard':
      return {
        items: [
          { name: 'Still Render — Exterior (per view)', price: '₹3,000 – ₹6,000' },
          { name: 'Still Render — Interior (per view)', price: '₹2,500 – ₹5,000' },
          { name: 'Animation / Walkthrough (per 30 sec)', price: '₹15,000 – ₹30,000' },
          { name: 'WebXR Experience (per project)', price: 'From ₹25,000' },
          { name: 'WebAR Configurator (per project)', price: 'From ₹30,000' },
          { name: 'Virtual Reality Build (per project)', price: 'From ₹40,000' },
          { name: 'Virtual Tour — 360° (per property)', price: '₹10,000 – ₹20,000' },
          { name: 'Pixel Streaming Demo (per project)', price: 'From ₹50,000' },
        ]
      };
    case 'proposal':
      return {
        client: '', project: '', date: todayStr(),
        challengeQuote: '[Client], right now [problem summary]. This is costing you [time / money / leads / experience]. Here\'s how we solve it.',
        solutionWhat: 'What we\'re building — one short paragraph, plain language, no jargon.',
        solutionWhy: 'Why this approach solves the specific problem.',
        phase1: 'Feature — what it does for them\nFeature — what it does for them\nFeature — what it does for them',
        phase2: 'Feature — what it does for them',
        timelineItems: [
          { milestone: 'Kickoff', date: '' },
          { milestone: 'Design / Prototype Review', date: '' },
          { milestone: 'Development Complete', date: '' },
          { milestone: 'Testing & Revisions', date: '' },
          { milestone: 'Launch', date: '' },
        ],
        investmentItems: [
          { item: 'Phase 1', cost: '' },
          { item: 'Phase 2 (if applicable)', cost: '' },
          { item: 'Ongoing maintenance / retainer (optional)', cost: '' },
        ],
        payment: '40% upfront, 30% at midpoint, 30% on delivery',
        whyViztr: '2–3 sentences on relevant experience.',
        nextSteps: 'Sign-off / deposit to begin\nKickoff call scheduled within 3 days of approval',
        validity: 'This proposal is valid for 14 days from date of issue.',
      };
    case 'agreement':
      return {
        client: '', project: '', date: todayStr(),
        scope: 'As per the agreed proposal dated ',
        revisions: '2 rounds of revisions are included. Additional rounds billed at ₹1,500 per round.',
        timeline: 'Delivery timeline as specified in the proposal.',
        payment: '50% advance before work begins, 50% on final delivery.',
        ip: 'On full payment, client receives final deliverables.',
        cancel: 'If client cancels after production starts, advance is non-refundable.',
        law: 'Governed by laws of India, jurisdiction in Lucknow, Uttar Pradesh.',
      };
    case 'nda':
      return {
        partyA: 'VizTR', partyB: '', date: todayStr(),
        purpose: 'evaluating a potential architectural visualization / XR project',
        term: '2 years from the date of signing',
      };
    case 'invoice':
      return {
        number: `INV-${Date.now().toString(36).toUpperCase()}`,
        date: todayStr(), due: '', client: '', clientAddr: '',
        items: [{ desc: 'Service description', qty: '1', rate: '' }],
        gst: false, gstPercent: '18', notes: 'Payment due within 7 days.',
      };
    case 'onboarding':
      return { project: '' };
    case 'release':
      return { client: '', project: '', date: todayStr(), showName: true };
    case 'casestudy':
      return {
        project: '', client: '', location: '', services: 'Virtual Tour, WebAR Configurator',
        challenge: 'The client needed a way for remote buyers to experience an unbuilt property.',
        approach: 'VizTR modeled the property in 3ds Max, rendered it, and built a WebAR configurator.',
        result: 'Buyer engagement increased significantly after launch.',
        testimonial: '', author: '',
      };
  }
}

interface DocStudioState {
  // Profile
  profile: StudioProfile;
  setProfile: (profile: Partial<StudioProfile>) => void;
  
  // Documents
  documents: Document[];
  activeTab: DocumentType;
  activeDocument: Document | null;
  setActiveTab: (tab: DocumentType) => void;
  setActiveDocument: (doc: Document | null) => void;
  createDocument: (type: DocumentType) => Document;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  
  // CRM
  leads: Lead[];
  activeLeadId: string | null;
  staleDays: number;
  setActiveLead: (id: string | null) => void;
  setStaleDays: (days: number) => void;
  createLead: () => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addLeadNote: (id: string, text: string) => void;
}

export const useDocStudioStore = create<DocStudioState>()(
  persist(
    (set, get) => ({
      // Profile defaults
      profile: {
        name: 'VizTR',
        owner: 'Rahul',
        phone: '',
        email: '',
        address: 'Lucknow, India',
        upi_id: '',
        bank_details: '',
        gstin: '',
        paper_size: 'A4',
        show_logo: true,
      },
      setProfile: (updates) => set((s) => ({
        profile: { ...s.profile, ...updates }
      })),
      
      // Documents
      documents: [],
      activeTab: 'ratecard',
      activeDocument: null,
      setActiveTab: (tab) => set({ activeTab: tab, activeDocument: null }),
      setActiveDocument: (doc) => set({ activeDocument: doc }),
      createDocument: (type) => {
        const doc: Document = {
          id: uid(),
          type,
          title: DOCUMENT_TABS.find(t => t.id === type)?.label || type,
          client_name: '',
          project_name: '',
          content: getDefaultContent(type),
          status: 'draft',
          created_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((s) => ({ documents: [doc, ...s.documents], activeDocument: doc }));
        return doc;
      },
      updateDocument: (id, updates) => set((s) => ({
        documents: s.documents.map(d => 
          d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d
        ),
        activeDocument: s.activeDocument?.id === id 
          ? { ...s.activeDocument, ...updates, updated_at: new Date().toISOString() }
          : s.activeDocument,
      })),
      deleteDocument: (id) => set((s) => ({
        documents: s.documents.filter(d => d.id !== id),
        activeDocument: s.activeDocument?.id === id ? null : s.activeDocument,
      })),
      
      // CRM
      leads: [],
      activeLeadId: null,
      staleDays: 7,
      setActiveLead: (id) => set({ activeLeadId: id }),
      setStaleDays: (days) => set({ staleDays: days }),
      createLead: () => {
        const lead: Lead = {
          id: uid(),
          name: 'New Lead',
          contact: '',
          source: '',
          service: 'Stills',
          stage: 'lead',
          quoted_price: '',
          advance_status: 'Not requested',
          next_followup: null,
          notes: [],
          assigned_to: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((s) => ({ leads: [lead, ...s.leads] }));
        return lead;
      },
      updateLead: (id, updates) => set((s) => ({
        leads: s.leads.map(l => 
          l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
        ),
      })),
      deleteLead: (id) => set((s) => ({
        leads: s.leads.filter(l => l.id !== id),
        activeLeadId: s.activeLeadId === id ? null : s.activeLeadId,
      })),
      addLeadNote: (id, text) => set((s) => ({
        leads: s.leads.map(l => {
          if (l.id !== id) return l;
          const note: LeadNote = { id: uid(), date: todayStr(), text };
          return { 
            ...l, 
            notes: [...l.notes, note],
            updated_at: new Date().toISOString(),
          };
        }),
      })),
    }),
    { name: 'viztr-doc-studio-store-v1' }
  )
);
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/DocStudioStore.ts
git commit -m "feat: add doc studio zustand store"
```

---

## Task 4: DocStudioTabs Component

**Files:**
- Create: `components/admin/DocStudioTabs.tsx`

- [ ] **Step 1: Create DocStudioTabs component**

```tsx
// components/admin/DocStudioTabs.tsx
'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { DOCUMENT_TABS, DocumentType } from './types/doc-studio';
import { useDocStudioStore } from './DocStudioStore';

interface DocStudioTabsProps {
  readOnly?: boolean;
}

export default function DocStudioTabs({ readOnly = false }: DocStudioTabsProps) {
  const { activeTab, setActiveTab } = useDocStudioStore();
  
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-[var(--border)] px-1 -mx-1 scrollbar-thin">
      {DOCUMENT_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !readOnly && setActiveTab(tab.id as DocumentType)}
          disabled={readOnly}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium 
            whitespace-nowrap transition-all shrink-0 cursor-pointer
            ${activeTab === tab.id
              ? 'bg-[var(--primary)] text-black font-bold shadow-sm'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
            }
            ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/DocStudioTabs.tsx
git commit -m "feat: add doc studio tabs component"
```

---

## Task 5: DocStudioProfile Component

**Files:**
- Create: `components/admin/DocStudioProfile.tsx`

- [ ] **Step 1: Create DocStudioProfile component**

```tsx
// components/admin/DocStudioProfile.tsx
'use client';

import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useDocStudioStore } from './DocStudioStore';

export default function DocStudioProfile() {
  const { profile, setProfile } = useDocStudioStore();
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const handleChange = (key: string, value: string | boolean) => {
    setProfile({ [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  
  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
            Business Profile
          </span>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-[10px] font-mono text-[var(--primary)] flex items-center gap-1">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-[var(--bg-primary)] space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Studio Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Owner / Signatory
              </label>
              <input
                type="text"
                value={profile.owner}
                onChange={(e) => handleChange('owner', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Phone
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Email
              </label>
              <input
                type="text"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Address
              </label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                UPI ID
              </label>
              <input
                type="text"
                value={profile.upi_id}
                onChange={(e) => handleChange('upi_id', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                GSTIN
              </label>
              <input
                type="text"
                value={profile.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Paper Size
              </label>
              <select
                value={profile.paper_size}
                onChange={(e) => handleChange('paper_size', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="A4">A4</option>
                <option value="Letter">US Letter</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.show_logo}
                  onChange={(e) => handleChange('show_logo', e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="text-xs text-[var(--text-primary)]">Show VizTR logo</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/DocStudioProfile.tsx
git commit -m "feat: add doc studio profile component"
```

---

## Task 6: DocStudioForm Component

**Files:**
- Create: `components/admin/DocStudioForm.tsx`

- [ ] **Step 1: Create DocStudioForm component**

```tsx
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
          <SectionLabel>3 · What's Included (Phase 1)</SectionLabel>
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
          <LineItemsEditor
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
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/DocStudioForm.tsx
git commit -m "feat: add doc studio form component"
```

---

## Task 7: DocStudioPreview Component

**Files:**
- Create: `components/admin/DocStudioPreview.tsx`

- [ ] **Step 1: Create DocStudioPreview component**

```tsx
// components/admin/DocStudioPreview.tsx
'use client';

import React, { useRef } from 'react';
import { Printer, Copy, Check } from 'lucide-react';
import { useDocStudioStore } from './DocStudioStore';
import type {
  RateCardContent, ProposalContent, AgreementContent, NDAContent,
  InvoiceContent, OnboardingContent, ReleaseContent, CaseStudyContent
} from './types/doc-studio';

// VizTR Logo SVG Mark
const LOGO_MARK = `<svg viewBox="0 0 300 300" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(150,150)">
    <path d="M -110,-90 L -110,-120 L -80,-120" stroke="#8a7433" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M 110,-90 L 110,-120 L 80,-120" stroke="#8a7433" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M -110,90 L -110,120 L -80,120" stroke="#8a7433" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M 110,90 L 110,120 L 80,120" stroke="#8a7433" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M -45,-55 L 0,55 L 45,-55" stroke="#8a7433" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

function escapeHtml(s: string): string {
  return String(s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] || c));
}

function BrandBlock({ profile }: { profile: any }) {
  return (
    <div className="text-right text-[11px] text-[#4a4438] leading-150">
      <b className="text-[14px] text-[#1a1712] block">{escapeHtml(profile.name)}</b>
      {escapeHtml(profile.owner)}<br />
      {escapeHtml(profile.phone)}{profile.phone && profile.email ? ' · ' : ''}{escapeHtml(profile.email)}<br />
      {escapeHtml(profile.address)}
      {profile.gstin ? <><br />GSTIN: {escapeHtml(profile.gstin)}</> : null}
    </div>
  );
}

function LogoRow({ profile }: { profile: any }) {
  if (profile.show_logo === false) return null;
  return (
    <div className="flex items-center gap-2 mb-2">
      <span dangerouslySetInnerHTML={{ __html: LOGO_MARK }} />
      <span className="font-serif text-[15px] font-bold tracking-wide text-[#1a1712]">
        {escapeHtml(profile.name)}
      </span>
    </div>
  );
}

function DocHeader({ profile, title, subtitle }: { profile: any; title: string; subtitle?: string }) {
  return (
    <div className="flex justify-between items-start border-b-2 border-[#8a7433] pb-3 mb-4">
      <div>
        <p className="font-serif text-[22px] font-bold tracking-wide text-[#1a1712] m-0">{title}</p>
        {subtitle && (
          <p className="text-[11px] tracking-widest uppercase text-[#8a7433] mt-0.5">{subtitle}</p>
        )}
      </div>
      <BrandBlock profile={profile} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[13px] uppercase tracking-wider text-[#8a7433] border-b border-[#ddd4bf] pb-1 mb-2 mt-6">
      {children}
    </h3>
  );
}

function QuoteBlock({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-3 border-[#8a7433] pl-3 my-3 italic text-[13.5px] text-[#1a1712]">
      {children}
    </blockquote>
  );
}

function SignBlock() {
  return (
    <div className="flex justify-between mt-12 gap-4">
      <div className="flex-1 border-t border-[#4a4438] pt-1.5 text-[11px] text-[#4a4438]"></div>
      <div className="flex-1 border-t border-[#4a4438] pt-1.5 text-[11px] text-[#4a4438] text-right"></div>
    </div>
  );
}

export default function DocStudioPreview() {
  const { activeDocument, profile } = useDocStudioStore();
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  const handleCopy = async () => {
    if (!printRef.current) return;
    const text = printRef.current.innerText.replace(/\n{3,}/g, '\n\n').trim();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };
  
  const handlePrint = () => window.print();
  
  if (!activeDocument) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-[var(--text-muted)] text-xs">
          Select or create a document to see preview
        </p>
      </div>
    );
  }
  
  const content = activeDocument.content;
  const docType = activeDocument.type;
  
  // Paper background styles
  const paperClass = profile.paper_size === 'Letter' 
    ? 'max-w-[816px]' 
    : 'max-w-[800px]';
  
  return (
    <div className="space-y-3">
      {/* Action buttons */}
      <div className="flex gap-2 px-1">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-black text-xs font-mono font-bold hover:bg-[var(--primary-hover)] transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / Save PDF
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] hover:border-[var(--primary)] transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[var(--primary)]" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy as Text'}
        </button>
      </div>
      
      {/* Paper preview */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 overflow-auto max-h-[600px]">
        <div
          ref={printRef}
          className={`bg-[#faf7f0] text-[#1a1712] rounded-lg p-8 mx-auto shadow-lg font-serif ${paperClass}`}
          style={{ minHeight: '400px' }}
        >
          {/* Rate Card */}
          {docType === 'ratecard' && (
            <>
              <LogoRow profile={profile} />
              <DocHeader profile={profile} title="Rate Card" subtitle="Studio & XR World Services" />
              <table className="w-full border-collapse mt-2">
                <thead>
                  <tr>
                    <th className="text-left text-[10.5px] uppercase tracking-wider text-[#7a6f52] border-b border-[#ddd4bf] pb-1.5 font-sans">Service</th>
                    <th className="text-right text-[10.5px] uppercase tracking-wider text-[#7a6f52] border-b border-[#ddd4bf] pb-1.5 font-sans">Starting Price</th>
                  </tr>
                </thead>
                <tbody>
                  {(content as RateCardContent).items.map((item, i) => (
                    <tr key={i} className="border-b border-[#ece6d6]">
                      <td className="py-2 text-[13px] font-sans">{escapeHtml(item.name)}</td>
                      <td className="py-2 text-[13px] font-sans text-right">{escapeHtml(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-[11.5px] text-[#7a6f52] font-sans">
                Final pricing depends on scope, complexity, and turnaround. Get a custom quote on a discovery call.
              </p>
              <div className="mt-8 text-center text-[10.5px] text-[#8a8168] tracking-wide">
                {escapeHtml(profile.name)} — {escapeHtml(profile.phone)} · {escapeHtml(profile.email)}
              </div>
            </>
          )}
          
          {/* Proposal */}
          {docType === 'proposal' && (
            <>
              <LogoRow profile={profile} />
              <DocHeader 
                profile={profile} 
                title="Proposal" 
                subtitle={`${escapeHtml((content as ProposalContent).project || 'Untitled')} for ${escapeHtml((content as ProposalContent).client || 'Client')}`} 
              />
              <p className="text-[13px] font-sans mb-4">
                <b>Prepared by:</b> {escapeHtml(profile.owner)} — {escapeHtml(profile.name)} &nbsp; <b>Date:</b> {escapeHtml((content as ProposalContent).date)}
              </p>
              <SectionTitle>1. Understanding Your Challenge</SectionTitle>
              <QuoteBlock>{escapeHtml((content as ProposalContent).challengeQuote)}</QuoteBlock>
              <SectionTitle>2. Proposed Solution</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as ProposalContent).solutionWhat)}</p>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as ProposalContent).solutionWhy)}</p>
              <SectionTitle>3. What's Included</SectionTitle>
              <p className="text-[13px] font-sans font-bold mb-1">Phase 1 — Core Build</p>
              <ul className="my-2 pl-5 font-sans">
                {(content as ProposalContent).phase1.split('\n').filter(x => x.trim()).map((line, i) => (
                  <li key={i} className="text-[13px] leading-relaxed">{escapeHtml(line)}</li>
                ))}
              </ul>
              <SectionTitle>5. Investment</SectionTitle>
              <table className="w-full border-collapse mt-2">
                <tbody>
                  {(content as ProposalContent).investmentItems.filter(i => i.item).map((item, i) => (
                    <tr key={i} className="border-b border-[#ece6d6]">
                      <td className="py-2 text-[13px] font-sans">{escapeHtml(item.item)}</td>
                      <td className="py-2 text-[13px] font-sans text-right">{escapeHtml(item.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-[13px] font-sans"><b>Payment terms:</b> {escapeHtml((content as ProposalContent).payment)}</p>
              <SectionTitle>6. Why VizTR</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as ProposalContent).whyViztr)}</p>
              <SectionTitle>7. Next Steps</SectionTitle>
              <ul className="my-2 pl-5 font-sans">
                {(content as ProposalContent).nextSteps.split('\n').filter(x => x.trim()).map((line, i) => (
                  <li key={i} className="text-[13px] leading-relaxed">{escapeHtml(line)}</li>
                ))}
              </ul>
              <p className="mt-4 text-[11.5px] text-[#7a6f52] font-sans">{escapeHtml((content as ProposalContent).validity)}</p>
              <SignBlock />
            </>
          )}
          
          {/* Agreement */}
          {docType === 'agreement' && (
            <>
              <LogoRow profile={profile} />
              <DocHeader profile={profile} title="Service Agreement" subtitle={escapeHtml((content as AgreementContent).project || 'Untitled')} />
              <p className="text-[13px] font-sans mb-4">
                <b>Between:</b> {escapeHtml(profile.name)} ("Studio") and {escapeHtml((content as AgreementContent).client || 'Client')} ("Client") &nbsp; <b>Date:</b> {escapeHtml((content as AgreementContent).date)}
              </p>
              <SectionTitle>1. Scope of Work</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as AgreementContent).scope)}</p>
              <SectionTitle>2. Revisions</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as AgreementContent).revisions)}</p>
              <SectionTitle>3. Timeline</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as AgreementContent).timeline)}</p>
              <SectionTitle>4. Payment</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as AgreementContent).payment)}</p>
              <SectionTitle>5. IP & Usage Rights</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as AgreementContent).ip)}</p>
              <SectionTitle>6. Cancellation</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as AgreementContent).cancel)}</p>
              <SectionTitle>7. Governing Law</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as AgreementContent).law)}</p>
              <SignBlock />
            </>
          )}
          
          {/* NDA */}
          {docType === 'nda' && (
            <>
              <LogoRow profile={profile} />
              <DocHeader profile={profile} title="Mutual Non-Disclosure Agreement" subtitle="Confidential" />
              <p className="text-[13px] font-sans mb-4">
                This agreement is made on {escapeHtml((content as NDAContent).date)} between <b>{escapeHtml((content as NDAContent).partyA)}</b> and <b>{escapeHtml((content as NDAContent).partyB || 'Client')}</b> for the purpose of {escapeHtml((content as NDAContent).purpose)}.
              </p>
              <SectionTitle>1. Confidential Information</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">Includes any project files, drawings, floor plans, business or design information shared by either party.</p>
              <SectionTitle>2. Obligations</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">Both parties agree not to disclose, copy, or use confidential information for any purpose outside this project.</p>
              <SectionTitle>3. Term</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">This agreement remains in effect for {escapeHtml((content as NDAContent).term)}.</p>
              <SignBlock />
            </>
          )}
          
          {/* Invoice */}
          {docType === 'invoice' && (
            <>
              <LogoRow profile={profile} />
              <DocHeader profile={profile} title="Invoice" subtitle={escapeHtml((content as InvoiceContent).number)} />
              <p className="text-[13px] font-sans mb-4">
                <b>Billed to:</b> {escapeHtml((content as InvoiceContent).client || '—')}<br />
                <b>Date:</b> {escapeHtml((content as InvoiceContent).date)} &nbsp; <b>Due:</b> {escapeHtml((content as InvoiceContent).due || 'On receipt')}
              </p>
              <table className="w-full border-collapse mt-2">
                <thead>
                  <tr>
                    <th className="text-left text-[10.5px] uppercase tracking-wider text-[#7a6f52] border-b border-[#ddd4bf] pb-1.5 font-sans">Description</th>
                    <th className="text-right text-[10.5px] uppercase tracking-wider text-[#7a6f52] border-b border-[#ddd4bf] pb-1.5 font-sans">Qty</th>
                    <th className="text-right text-[10.5px] uppercase tracking-wider text-[#7a6f52] border-b border-[#ddd4bf] pb-1.5 font-sans">Rate (₹)</th>
                    <th className="text-right text-[10.5px] uppercase tracking-wider text-[#7a6f52] border-b border-[#ddd4bf] pb-1.5 font-sans">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(content as InvoiceContent).items.map((item, i) => {
                    const qty = parseFloat(item.qty) || 0;
                    const rate = parseFloat(item.rate) || 0;
                    return (
                      <tr key={i} className="border-b border-[#ece6d6]">
                        <td className="py-2 text-[13px] font-sans">{escapeHtml(item.desc)}</td>
                        <td className="py-2 text-[13px] font-sans text-right">{escapeHtml(item.qty)}</td>
                        <td className="py-2 text-[13px] font-sans text-right">{escapeHtml(item.rate)}</td>
                        <td className="py-2 text-[13px] font-sans text-right">₹{(qty * rate).toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td colSpan={3} className="py-2 text-[13px] font-sans text-right font-bold border-t-2 border-[#8a7433]">Total Due</td>
                    <td className="py-2 text-[13px] font-sans text-right font-bold border-t-2 border-[#8a7433]">
                      ₹{(content as InvoiceContent).items.reduce((sum, item) => {
                        const qty = parseFloat(item.qty) || 0;
                        const rate = parseFloat(item.rate) || 0;
                        return sum + (qty * rate);
                      }, 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
              <SectionTitle>Payment Details</SectionTitle>
              <p className="text-[13px] font-sans">
                UPI: {escapeHtml(profile.upi_id || '—')}<br />
                Bank: {escapeHtml(profile.bank_details || '—')}
              </p>
              <p className="mt-2 text-[12px] text-[#5a533f] font-sans">{escapeHtml((content as InvoiceContent).notes)}</p>
            </>
          )}
          
          {/* Onboarding */}
          {docType === 'onboarding' && (
            <>
              <LogoRow profile={profile} />
              <DocHeader profile={profile} title="Client Onboarding Brief" subtitle={escapeHtml((content as OnboardingContent).project) || 'Please complete before we begin'} />
              {[
                'Project name', 'Location / plot address', 'Plot size / built-up area',
                'Number of rooms / views needed', 'Reference images or links',
                'Preferred style', 'Any Vastu or specific compliance requirements',
                'Budget band', 'Deadline / target date', 'Preferred delivery format',
                'Best contact person & time to call'
              ].map((q, i) => (
                <p key={i} className="mb-4 text-[13px] font-sans">
                  <b>{escapeHtml(q)}:</b><br />
                  <span className="inline-block w-full border-b border-[#ccc3a8] h-4 mt-1"></span>
                </p>
              ))}
            </>
          )}
          
          {/* Release */}
          {docType === 'release' && (
            <>
              <LogoRow profile={profile} />
              <DocHeader profile={profile} title="Portfolio Release Form" subtitle={escapeHtml((content as ReleaseContent).project || 'Untitled')} />
              <p className="text-[13px] font-sans leading-relaxed mb-4">
                I, <b>{escapeHtml((content as ReleaseContent).client || '_______________')}</b>, give {escapeHtml(profile.name)} permission to use renders, animations, videos, and related materials from the project <b>{escapeHtml((content as ReleaseContent).project || 'above')}</b> for portfolio, marketing, website, and social media purposes.
              </p>
              <p className="text-[13px] font-sans leading-relaxed">
                {(content as ReleaseContent).showName 
                  ? 'My name / project name may be publicly credited alongside the work.'
                  : 'I request that my name and project details remain confidential — the work may be shown without attribution to me.'}
              </p>
              <p className="text-[13px] font-sans leading-relaxed mt-4">
                This permission does not transfer ownership of the design or property itself.
              </p>
              <SignBlock />
            </>
          )}
          
          {/* Case Study */}
          {docType === 'casestudy' && (
            <>
              <LogoRow profile={profile} />
              <DocHeader profile={profile} title="Case Study" subtitle={escapeHtml((content as CaseStudyContent).project || 'Untitled')} />
              <p className="text-[13px] font-sans mb-4">
                <b>Client:</b> {escapeHtml((content as CaseStudyContent).client || '—')} &nbsp; <b>Location:</b> {escapeHtml((content as CaseStudyContent).location || '—')}<br />
                <b>Services used:</b> {escapeHtml((content as CaseStudyContent).services)}
              </p>
              <SectionTitle>The Challenge</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as CaseStudyContent).challenge)}</p>
              <SectionTitle>The Approach</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as CaseStudyContent).approach)}</p>
              <SectionTitle>The Result</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as CaseStudyContent).result)}</p>
              {(content as CaseStudyContent).testimonial && (
                <QuoteBlock>
                  "{escapeHtml((content as CaseStudyContent).testimonial)}"
                  {content.author && <><br />— {escapeHtml((content as CaseStudyContent).author)}</>}
                </QuoteBlock>
              )}
              <div className="mt-8 text-center text-[10.5px] text-[#8a8168] tracking-wide">
                Want results like this for your project? {escapeHtml(profile.phone)} · {escapeHtml(profile.email)}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #preview-print-area, #preview-print-area * { visibility: visible; }
          #preview-print-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border-radius: 0; padding: 20px; }
        }
        @page { size: ${profile.paper_size}; margin: 14mm; }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/DocStudioPreview.tsx
git commit -m "feat: add doc studio preview component with print support"
```

---

## Task 8: CRM Kanban Board Component

**Files:**
- Create: `components/admin/CRMKanbanBoard.tsx`

- [ ] **Step 1: Create CRMKanbanBoard component**

```tsx
// components/admin/CRMKanbanBoard.tsx
'use client';

import React, { useState } from 'react';
import { Plus, Download, AlertCircle } from 'lucide-react';
import { useDocStudioStore } from './DocStudioStore';
import { LEAD_STAGES, type Lead, type LeadStage } from './types/doc-studio';

function daysSince(iso: string): number {
  if (!iso) return 999;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

function csvEscape(v: string): string {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export default function CRMKanbanBoard() {
  const { leads, createLead, updateLead, deleteLead, staleDays, setStaleDays } = useDocStudioStore();
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
      {/* Toolbar */}
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
      
      {/* Kanban columns */}
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
                        onClick={() => {/* TODO: Open lead detail */}}
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
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/CRMKanbanBoard.tsx
git commit -m "feat: add CRM kanban board component"
```

---

## Task 9: DocStudioCRM Main Container

**Files:**
- Create: `components/admin/DocStudioCRM.tsx`

- [ ] **Step 1: Create DocStudioCRM main container**

```tsx
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
      {/* Header */}
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
        
        {/* View switcher */}
        <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
          <button
            onClick={() => setView('studio')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              view === 'studio'
                ? 'bg-[var(--primary)] text-black font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            📄 Doc Studio
          </button>
          <button
            onClick={() => setView('crm')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              view === 'crm'
                ? 'bg-[var(--primary)] text-black font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            📊 CRM
          </button>
        </div>
      </div>
      
      {view === 'studio' ? (
        <>
          {/* Tabs */}
          <DocStudioTabs />
          
          {/* Profile */}
          <DocStudioProfile />
          
          {/* Document list + Form + Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Document list + Form */}
            <div className="space-y-3">
              {/* Document list for current tab */}
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
              
              {/* Form */}
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
                <DocStudioForm />
              </div>
            </div>
            
            {/* Right: Preview */}
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
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/DocStudioCRM.tsx
git commit -m "feat: add main DocStudioCRM container component"
```

---

## Task 10: Integrate into Super Admin Dashboard

**Files:**
- Modify: `app/admin/dashboard/page.tsx`

- [ ] **Step 1: Add sidebar section and render case**

Add to `SIDEBAR_SECTIONS`:
```typescript
{
  title: 'Doc Studio & CRM',
  items: [
    { id: 'doc-studio-crm', label: 'Doc Studio & CRM', icon: FileText },
  ]
}
```

Add `'doc-studio-crm'` to `ActiveSection` type.

Add render case in the main section area:
```tsx
{activeSection === 'doc-studio-crm' && <DocStudioCRM />}
```

Import at top:
```tsx
import DocStudioCRM from '@/components/admin/DocStudioCRM';
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/dashboard/page.tsx
git commit -m "feat: integrate DocStudioCRM into super admin dashboard"
```

---

## Task 11: Integrate into Client Dashboard

**Files:**
- Modify: `app/client-dashboard/page.tsx`

- [ ] **Step 1: Add Documents tab and render case**

Add to `TABS` array:
```tsx
{ id: 'documents', label: 'Documents', icon: '📄' }
```

Add render case:
```tsx
{activeDashboardTab === 'documents' && <div className="text-[var(--text-muted)] text-xs">Documents view coming soon...</div>}
```

- [ ] **Step 2: Commit**

```bash
git add app/client-dashboard/page.tsx
git commit -m "feat: add documents tab to client dashboard"
```

---

## Task 12: Final Verification

- [ ] **Step 1: Run build**

```bash
npm run build
```

- [ ] **Step 2: Fix any TypeScript errors**

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

- [ ] **Step 4: Commit final changes**

```bash
git add -A
git commit -m "feat: complete doc studio CRM integration"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|----------------|------|
| FR-01 Business Profile | Task 5 (DocStudioProfile) |
| FR-02 8 Document Types | Tasks 6, 7 (Form + Preview) |
| FR-03 Live Preview + Print | Task 7 (DocStudioPreview) |
| FR-04 CRM Kanban | Task 8 (CRMKanbanBoard) |
| FR-05 Lead Detail | Not implemented (placeholder in Task 8) |
| FR-06 Stale Detection | Task 8 (CRMKanbanBoard) |
| FR-07 CSV Export | Task 8 (CRMKanbanBoard) |
| FR-08 Client Read-only | Task 11 (Client Dashboard) |
| FR-09 Theme Support | Uses CSS variables |
| FR-10 Supabase Persistence | Task 1 (Migration) - localStorage works offline |

---

**Plan complete.** Two execution options:

**1. Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?