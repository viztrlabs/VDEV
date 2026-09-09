import { promises as fs } from 'node:fs';
import path from 'node:path';

export type LeadType =
  | 'contact'
  | 'booking'
  | 'demo'
  | 'inquiry'
  | 'newsletter'
  | 'portfolio-enquiry';

export interface LeadRecord {
  id: string;
  type: LeadType;
  payload: Record<string, unknown>;
  receivedAt: string;
}

const LEAD_TYPES: LeadType[] = [
  'contact',
  'booking',
  'demo',
  'inquiry',
  'newsletter',
  'portfolio-enquiry',
];

const DATA_DIR = path.join(process.cwd(), '.data', 'leads');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

export function isLeadType(value: unknown): value is LeadType {
  return typeof value === 'string' && LEAD_TYPES.includes(value as LeadType);
}

export async function listLeads(): Promise<LeadRecord[]> {
  try {
    const raw = await fs.readFile(LEADS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as LeadRecord[];
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // no file yet
  }
  return [];
}

export async function saveLead(
  type: LeadType,
  payload: Record<string, unknown>
): Promise<LeadRecord> {
  const lead: LeadRecord = {
    id: `lead_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    type,
    payload,
    receivedAt: new Date().toISOString(),
  };
  const list = await listLeads();
  list.push(lead);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(LEADS_FILE, JSON.stringify(list, null, 2), 'utf8');
  return lead;
}