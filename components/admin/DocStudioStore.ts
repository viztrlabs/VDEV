// components/admin/DocStudioStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DocumentType, Lead, Document,
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
          title: '',
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
