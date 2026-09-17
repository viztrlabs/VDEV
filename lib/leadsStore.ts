import { getSupabaseAdmin } from '@/lib/supabase-admin';

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

export function isLeadType(value: unknown): value is LeadType {
  return typeof value === 'string' && LEAD_TYPES.includes(value as LeadType);
}

export async function listLeads(): Promise<LeadRecord[]> {
  if (!getSupabaseAdmin()) {
    console.warn('[leadsStore] Supabase not configured — returning empty leads list');
    return [];
  }
  const { data } = await getSupabaseAdmin()!
    .from('leads')
    .select('id, service, name, contact, source, stage, metadata, created_at')
    .order('created_at', { ascending: false });
  if (!data) return [];
  return data.map((row: any) => ({
    id: row.id,
    type: (row.service as LeadType) || 'contact',
    payload: row.metadata || {},
    receivedAt: row.created_at || new Date().toISOString(),
  }));
}

export async function saveLead(
  type: LeadType,
  payload: Record<string, unknown>
): Promise<LeadRecord> {
  if (!getSupabaseAdmin()) {
    console.warn('[leadsStore] Supabase not configured — lead not persisted');
    return {
      id: `lead_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      payload,
      receivedAt: new Date().toISOString(),
    };
  }
  const now = new Date().toISOString();
  const { data } = await getSupabaseAdmin()!
    .from('leads')
    .insert({
      name: (payload.name as string) || 'Unknown',
      contact: (payload.email as string) || (payload.contact as string) || '',
      source: (payload.source as string) || type,
      service: type,
      stage: 'new',
      metadata: payload,
      created_at: now,
    })
    .select('id, service, metadata, created_at')
    .single();
  return {
    id: data?.id || `lead_${Date.now()}`,
    type,
    payload,
    receivedAt: data?.created_at || now,
  };
}