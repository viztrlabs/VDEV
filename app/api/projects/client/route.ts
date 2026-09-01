import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_MANAGED_PROJECTS, ManagedProject } from '@/lib/projects-data';
import { listProjectsSupabase, isSupabaseAdminReady } from '@/lib/supabase/repositories';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');
  const clientEmail = searchParams.get('clientEmail');
  const clientName = searchParams.get('clientName');

  // Try Supabase first if configured
  if (isSupabaseAdminReady()) {
    const rows = await listProjectsSupabase({
      clientId: clientId || undefined,
      clientEmail: clientEmail || undefined,
      clientName: clientName || undefined,
    });
    if (rows !== null) {
      return NextResponse.json({
        success: true,
        count: rows.length,
        data: rows,
        projects: rows,
        source: 'supabase',
      });
    }
  }

  // Fallback: in-memory demo data
  let filtered: ManagedProject[] = [...INITIAL_MANAGED_PROJECTS];

  if (clientId) {
    const id = clientId.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.id.toLowerCase() === id ||
        p.id.toLowerCase().includes(id) ||
        p.clientName.toLowerCase().includes(id),
    );
  }
  if (clientEmail) {
    const email = clientEmail.toLowerCase();
    filtered = filtered.filter((p) => p.clientEmail.toLowerCase() === email);
  }
  if (clientName) {
    const name = clientName.toLowerCase();
    filtered = filtered.filter((p) => p.clientName.toLowerCase() === name);
  }

  return NextResponse.json({
    success: true,
    count: filtered.length,
    data: filtered,
    projects: filtered,
    source: 'memory',
  });
}
