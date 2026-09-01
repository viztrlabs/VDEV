# VizTR Doc Studio + CRM Integration Design

**Date**: 2026-09-01  
**Status**: Approved for Implementation  
**Author**: Super Admin Team

---

## 1. Executive Summary

Integrate the VizTR Doc Studio + CRM (from the provided HTML prototype) into the existing Super Admin Dashboard and Client Dashboard. This feature enables studio admins to create, manage, and share 8 types of client-facing documents (Rate Card, Proposal, Agreement/SOW, NDA, Invoice, Onboarding Brief, Portfolio Release, Case Study) while managing a lead pipeline via Kanban board. Clients get read-only access to view documents shared with them.

---

## 2. Requirements

### 2.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Super Admin can edit Business Profile (studio name, owner, contact, UPI, bank, GSTIN, paper size, logo toggle) | P0 |
| FR-02 | Super Admin can create/edit/delete 8 document types with live preview | P0 |
| FR-03 | Live preview renders professional paper-styled documents (A4/Letter) with print/PDF and copy-text actions | P0 |
| FR-04 | Super Admin can manage leads via Kanban board (11 stages: Lead → Testimonial/Upsell) | P0 |
| FR-05 | Lead detail sheet: edit fields, stage pills, notes log, generate document from lead | P0 |
| FR-06 | Stale lead detection (configurable days) with visual badge | P0 |
| FR-07 | CSV export of leads | P0 |
| FR-08 | Client Dashboard: read-only "Documents" tab showing documents where client_name matches their firm | P0 |
| FR-09 | Theme compatibility across all 6 VizTR themes (dark, light, obsidian, bronze, blueprint, glass) | P0 |
| FR-10 | Data persistence: Supabase (primary) + Zustand localStorage cache (offline-first) | P0 |

### 2.2 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | Follow existing code patterns (Tailwind + CSS variables, hd-card/hd-badge, lucide-react icons) |
| NFR-02 | Use existing auth (NextAuth + Supabase SSR) and user session from `useAppStore` |
| NFR-03 | Real-time updates via Supabase Realtime subscriptions |
| NFR-04 | RLS policies: Super Admin/Studio Admin = full CRUD; Client = SELECT own documents/leads |
| NFR-05 | Mobile-responsive (sidebar collapses, tabs scroll horizontally) |
| NFR-06 | Accessible: semantic HTML, keyboard navigation, ARIA labels |

---

## 3. Architecture

### 3.1 Component Hierarchy

```
app/admin/dashboard/page.tsx
  └── DocStudioCRM (new section)
      ├── DocStudioTabs
      ├── DocStudioProfile (collapsible)
      ├── DocStudioForm (left panel)
      └── DocStudioPreview (right panel)

app/client-dashboard/page.tsx
  └── Documents Tab
      └── DocStudioCRMClient (read-only)
          ├── DocStudioTabs (view only)
          └── DocStudioPreview (view only)

components/admin/
├── DocStudioCRM.tsx
├── DocStudioCRMClient.tsx
├── DocStudioTabs.tsx
├── DocStudioProfile.tsx
├── DocStudioForm.tsx
├── DocStudioPreview.tsx
├── CRMKanbanBoard.tsx
├── CRMLeadDetail.tsx
├── DocStudioStore.ts
└── types/doc-studio.ts
```

### 3.2 Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Supabase  │◄───►│ DocStudioStore│◄───►│   Components │
│  (PostgreSQL)│     │  (Zustand)   │     │  (React)    │
└─────────────┘     └──────────────┘     └─────────────┘
       ▲                   ▲                    ▲
       │                   │                    │
       ▼                   ▼                    ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Realtime   │     │ localStorage │     │  UI Events  │
│ Subscription│     │   (cache)    │     │  (onChange) │
└─────────────┘     └──────────────┘     └─────────────┘
```

### 3.3 Supabase Schema

```sql
-- Studio Profile (single row, upsert on update)
CREATE TABLE studio_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT DEFAULT 'VizTR',
  owner TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  upi_id TEXT,
  bank_details TEXT,
  gstin TEXT,
  paper_size TEXT DEFAULT 'A4',
  show_logo BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN (
    'ratecard','proposal','agreement','nda',
    'invoice','onboarding','release','casestudy'
  )),
  title TEXT,
  client_name TEXT,
  project_name TEXT,
  content JSONB NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','signed','archived')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_documents_client ON documents(client_name);
CREATE INDEX idx_documents_type ON documents(type);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  source TEXT,
  service TEXT,
  stage TEXT DEFAULT 'lead' CHECK (stage IN (
    'lead','qualified','discovery','proposal','contract',
    'production','revisions','delivered','testimonial','upsell'
  )),
  quoted_price TEXT,
  advance_status TEXT DEFAULT 'Not requested',
  next_followup DATE,
  notes JSONB DEFAULT '[]',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
```

### 3.4 RLS Policies

```sql
-- Studio Profile: Super Admin/Studio Admin full access
ALTER TABLE studio_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access" ON studio_profile
  FOR ALL USING (
    auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'ADMIN')
  );

-- Documents: Admins full, Clients read own
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access" ON documents
  FOR ALL USING (
    auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'ADMIN')
  );
CREATE POLICY "Clients read own" ON documents
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'CLIENT' AND
    client_name = auth.jwt() ->> 'client_firm'
  );

-- Leads: Admins full, Clients read own (if assigned)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access" ON leads
  FOR ALL USING (
    auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'ADMIN')
  );
CREATE POLICY "Clients read assigned" ON leads
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'CLIENT' AND
    assigned_to = auth.uid()
  );
```

---

## 4. TypeScript Types

```typescript
// types/doc-studio.ts

export type DocumentType = 
  | 'ratecard' | 'proposal' | 'agreement' | 'nda'
  | 'invoice' | 'onboarding' | 'release' | 'casestudy';

export type LeadStage = 
  | 'lead' | 'qualified' | 'discovery' | 'proposal' | 'contract'
  | 'production' | 'revisions' | 'delivered' | 'testimonial' | 'upsell';

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
  created_by: string;
  created_at: string;
  updated_at: string;
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

// ... similar for other document types

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
  notes: Array<{ id: string; date: string; text: string }>;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocStudioState {
  // Profile
  profile: StudioProfile;
  setProfile: (profile: Partial<StudioProfile>) => Promise<void>;
  
  // Documents
  documents: Document[];
  activeTab: DocumentType;
  activeDocument: Document | null;
  setActiveTab: (tab: DocumentType) => void;
  createDocument: (type: DocumentType) => Promise<void>;
  updateDocument: (id: string, content: Partial<DocumentContent>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  duplicateDocument: (id: string) => Promise<void>;
  
  // CRM
  leads: Lead[];
  staleDays: number;
  setStaleDays: (days: number) => void;
  createLead: (lead: Partial<Lead>) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  moveLeadStage: (id: string, stage: LeadStage) => Promise<void>;
  addLeadNote: (id: string, note: string) => Promise<void>;
  
  // Sync
  isSyncing: boolean;
  lastSynced: number | null;
  syncWithSupabase: () => Promise<void>;
  loadFromCache: () => void;
}
```

---

## 5. UI/UX Design

### 5.1 Super Admin View

**Sidebar Addition** (in `app/admin/dashboard/page.tsx`):
```typescript
{
  title: 'Doc Studio & CRM',
  items: [
    { id: 'doc-studio-crm', label: 'Doc Studio & CRM', icon: FileText },
  ]
}
```

**Main Layout** (two-column on desktop, stacked on mobile):
- Left: Tab navigation + Form panel (collapsible profile at top)
- Right: Live preview with print/copy actions
- Bottom: CRM Kanban board (full-width, horizontal scroll)

### 5.2 Client View

**Client Dashboard Tab**: "Documents" 
- Read-only tab list (filtered to 8 types)
- Document list per type (cards with title, client, date, status)
- Click → DocStudioPreview (read-only, no edit form)

### 5.3 Theme Integration

Use existing CSS variables from `globals.css`:
- `--bg-primary`, `--bg-secondary`, `--bg-card`
- `--text-primary`, `--text-secondary`, `--text-muted`
- `--border`, `--border-subtle`
- `--primary`, `--primary-hover` (emerald #3ECF8E)
- `--accent-glow`
- `hd-card`, `hd-badge` utility classes
- `glass-panel` for modals/sheets

All 6 themes supported automatically via `[data-theme="..."]` selectors.

---

## 6. Implementation Details

### 6.1 DocStudioStore (Zustand + Supabase)

Key patterns:
- `persist` middleware with `localStorage` for offline cache
- `subscribeWithSelector` for real-time updates
- Optimistic updates: update UI immediately, sync to Supabase in background
- Conflict resolution: server wins, show toast on conflict
- Debounced sync (500ms) for form inputs

### 6.2 Document Preview Rendering

- Reuse HTML/CSS from provided prototype
- Convert to React components with Tailwind classes
- Map CSS custom properties to VizTR theme variables
- Print styles: `@page { size: A4; margin: 14mm; }` via dynamic style injection
- PDF generation: `window.print()` (browser native)

### 6.3 CRM Kanban

- 11 columns (fixed, horizontal scroll)
- Drag-and-drop via `@dnd-kit/core` (add to deps) or native HTML5 DnD
- Lead cards show: name, service, follow-up date, price badge, advance badge, stale badge
- Click → LeadDetailSheet (bottom sheet on mobile, modal on desktop)

### 6.4 Lead → Document Generation

Map lead data to document templates:
- Lead.name → document.client_name
- Lead.service + Lead.name → document.project_name
- Lead.quoted_price → proposal.investmentItems[0].cost
- Lead.notes[latest] → proposal.challengeQuote

---

## 7. Integration Points

### 7.1 Super Admin Dashboard

Modify `app/admin/dashboard/page.tsx`:
1. Add `'doc-studio-crm'` to `ActiveSection` type
2. Add sidebar section "Doc Studio & CRM"
3. Add render case: `{activeSection === 'doc-studio-crm' && <DocStudioCRM />}`

### 7.2 Client Dashboard

Modify `app/client-dashboard/page.tsx`:
1. Add `'documents'` to `TABS` array
2. Add render case: `{activeDashboardTab === 'documents' && <DocStudioCRMClient />}`

### 7.3 Supabase Client

Use existing Supabase client from `@/lib/supabase/client` (or create if needed)
- Server components: `createServerClient()`
- Client components: `createBrowserClient()`

---

## 8. Testing Strategy

| Layer | Approach |
|-------|----------|
| Unit | Test store actions, type validators, content transformers |
| Integration | Test Supabase CRUD with RLS, real-time subscriptions |
| E2E | Playwright: create doc → preview → print → create lead → move stage → generate doc |
| Visual | Storybook stories for each document type preview |

---

## 9. Dependencies to Add

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2"
  }
}
```

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Supabase RLS complexity | Start with permissive policies, tighten after verification |
| Large document content in JSONB | Keep content under 1MB; use Supabase Storage for assets |
| Theme conflicts with inline styles | Use CSS variables exclusively, no hardcoded colors |
| Offline sync conflicts | Last-write-wins with timestamp; show conflict toast |
| Print layout differences across browsers | Test Chrome/Firefox/Safari; use `@page` standard |

---

## 11. Acceptance Criteria

1. ✅ Super Admin can access Doc Studio & CRM from sidebar
2. ✅ All 8 document types render correctly in preview
3. ✅ Print/PDF produces professional output matching HTML prototype
4. ✅ CRM Kanban shows 11 stages, drag-drop works
5. ✅ Lead detail sheet opens, allows edits, stage changes, notes
6. ✅ Stale lead detection works with configurable days
7. ✅ CSV export downloads valid CSV
8. ✅ Client Dashboard "Documents" tab shows only their documents
9. ✅ All 6 themes render correctly without visual bugs
10. ✅ Data persists to Supabase, survives reload, works offline

---

## 12. Next Steps

1. ✅ Design approved
2. ⏳ Write implementation plan (invoke `writing-plans` skill)
3. ⏳ Execute implementation in phases
4. ⏳ Verify with acceptance criteria
5. ⏳ Deploy to staging

---

*End of Design Document*