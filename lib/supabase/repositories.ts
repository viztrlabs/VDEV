import { createServiceClient } from './admin';
import type { ClientRecord } from '@/app/api/clients/route';

// Row shape coming from Postgres (snake_case) — mapped to ClientRecord (camelCase).
interface ClientRow {
  id: string;
  name: string;
  firm_name: string;
  email: string;
  phone: string | null;
  tier: 'Enterprise VIP' | 'Standard Studio' | 'Retainer Partner';
  active_projects: number;
  total_spend: string;
  status: 'Active' | 'Pending Review' | 'Archived';
  portal_access_code: string;
  assigned_director: string | null;
  joined_date: string;
  notes: string | null;
  logo_url: string | null;
}

function rowToRecord(r: ClientRow): ClientRecord {
  return {
    id: r.id,
    name: r.name,
    firmName: r.firm_name,
    email: r.email,
    phone: r.phone || '',
    tier: r.tier,
    activeProjects: r.active_projects,
    totalSpend: r.total_spend,
    status: r.status,
    portalAccessCode: r.portal_access_code,
    assignedDirector: r.assigned_director || '',
    joinedDate: r.joined_date,
    notes: r.notes || '',
    logoUrl: r.logo_url || undefined,
  };
}

export function isSupabaseAdminReady(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export interface ClientQuery {
  tier?: string;
  query?: string;
  accessCode?: string;
  id?: string;
}

export async function listClientsSupabase(q: ClientQuery): Promise<ClientRecord[] | null> {
  if (!isSupabaseAdminReady()) return null;
  const svc = createServiceClient();
  if (!svc) return null;

  try {
    let query = svc.from('clients').select('*');
    if (q.tier && q.tier !== 'ALL') query = query.eq('tier', q.tier);
    if (q.id) query = query.eq('id', q.id);
    if (q.accessCode) query = query.eq('portal_access_code', q.accessCode.toUpperCase());
    if (q.query) {
      const term = q.query.toLowerCase();
      // OR across name, firm_name, email, portal_access_code
      query = query.or(
        `name.ilike.%${term}%,firm_name.ilike.%${term}%,email.ilike.%${term}%,portal_access_code.ilike.%${term}%`,
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error('[supabase] listClients error:', error.message);
      return null;
    }
    return (data as ClientRow[]).map(rowToRecord);
  } catch (err) {
    console.error('[supabase] listClients exception:', err);
    return null;
  }
}

export async function getClientByAccessCodeSupabase(
  accessCode: string,
): Promise<ClientRecord | null> {
  if (!isSupabaseAdminReady()) return null;
  const svc = createServiceClient();
  if (!svc) return null;
  try {
    const { data, error } = await svc
      .from('clients')
      .select('*')
      .eq('portal_access_code', accessCode.toUpperCase())
      .maybeSingle();
    if (error) {
      console.error('[supabase] getClientByAccessCode error:', error.message);
      return null;
    }
    return data ? rowToRecord(data as ClientRow) : null;
  } catch (err) {
    console.error('[supabase] getClientByAccessCode exception:', err);
    return null;
  }
}

export async function getClientByEmailSupabase(
  email: string,
): Promise<ClientRecord | null> {
  if (!isSupabaseAdminReady()) return null;
  const svc = createServiceClient();
  if (!svc) return null;
  try {
    const { data, error } = await svc
      .from('clients')
      .select('*')
      .ilike('email', email)
      .maybeSingle();
    if (error || !data) return null;
    return rowToRecord(data as ClientRow);
  } catch {
    return null;
  }
}

// ============================================================
// PROJECTS
// ============================================================
export interface ProjectRow {
  id: string;
  name: string;
  client_name: string;
  client_email: string;
  client_company: string | null;
  category: string | null;
  project_type: string | null;
  status: string;
  payment_status: string;
  booking_amount: number;
  progress: number;
  lead_architect: string | null;
  image: string | null;
  last_update: string | null;
  xr_available: boolean;
  pixel_streaming_available: boolean;
  hours_monitoring: any;
  pipeline: any;
  documents: any;
  pending_revisions_count: number;
  revisions_summary: string | null;
  notes: string | null;
  client_id: string | null;
}

export interface ProjectQuery {
  clientId?: string;
  clientEmail?: string;
  clientName?: string;
  status?: string;
  category?: string;
  search?: string;
}

export async function listProjectsSupabase(
  q: ProjectQuery,
): Promise<ProjectRow[] | null> {
  if (!isSupabaseAdminReady()) return null;
  const svc = createServiceClient();
  if (!svc) return null;
  try {
    let query = svc.from('projects').select('*');
    if (q.clientId) query = query.eq('client_id', q.clientId);
    if (q.clientEmail) query = query.ilike('client_email', q.clientEmail);
    if (q.clientName) query = query.ilike('client_name', q.clientName);
    if (q.status && q.status !== 'ALL') query = query.eq('status', q.status);
    if (q.category && q.category !== 'ALL') query = query.eq('category', q.category);
    if (q.search) {
      const term = q.search.toLowerCase();
      query = query.or(
        `name.ilike.%${term}%,client_name.ilike.%${term}%,id.ilike.%${term}%`,
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error('[supabase] listProjects error:', error.message);
      return null;
    }
    return (data || []) as ProjectRow[];
  } catch (err) {
    console.error('[supabase] listProjects exception:', err);
    return null;
  }
}
