export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_MANAGED_PROJECTS, ManagedProject } from '@/lib/projects-data';
import { listProjectsSupabase, isSupabaseAdminReady } from '@/lib/supabase/repositories';
import { requireAuth } from '@/lib/api-guard';

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  const { session, role } = guard;

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');
  const clientEmail = searchParams.get('clientEmail');
  const clientName = searchParams.get('clientName');

  // For client role, restrict to their own projects by email
  const isClient = role === 'client';
  const userEmail = session?.user?.email;

  // Try Supabase first if configured
  if (isSupabaseAdminReady()) {
    const rows = await listProjectsSupabase({
      clientId: clientId || undefined,
      clientEmail: isClient && userEmail ? userEmail : (clientEmail || undefined),
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

  // Client role: only show their own projects
  if (isClient && userEmail) {
    filtered = filtered.filter((p) => p.clientEmail.toLowerCase() === userEmail.toLowerCase());
  }

  if (clientId) {
    const id = clientId.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.id.toLowerCase() === id ||
        p.id.toLowerCase().includes(id) ||
        p.clientName.toLowerCase().includes(id),
    );
  }
  if (clientEmail && !isClient) {
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
