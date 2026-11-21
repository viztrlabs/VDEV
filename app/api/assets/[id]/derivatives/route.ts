export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient, getRouteClient } from '@/lib/services/client';
import { requireAuth } from '@/lib/api-guard';
import { verifyResourceAccess } from '@/lib/auth/project-access';

/**
 * GET /api/assets/[id]/derivatives — list service-specific derivatives of a master asset.
 */

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const svc = getRouteClient(guard.supabaseAccessToken);
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    const access = await verifyResourceAccess(guard.userId, 'assets', id, 'project_id', guard.role);
    if (!access.allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const serviceSlug = searchParams.get('service');

    let query = svc.from('assets').select('*').eq('parent_asset_id', id).order('created_at', { ascending: true });
    if (serviceSlug) query = query.eq('service_slug', serviceSlug);

    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, count: data?.length || 0, derivatives: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
