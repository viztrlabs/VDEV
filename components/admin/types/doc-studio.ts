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
