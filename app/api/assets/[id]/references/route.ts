export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient, getRouteClient } from '@/lib/services/client';
import { requireAuth } from '@/lib/api-guard';
import { verifyResourceAccess } from '@/lib/auth/project-access';

/**
 * GET  /api/assets/[id]/references — list experience/service usages of an asset
 * POST /api/assets/[id]/references — register a usage (enables deletion protection)
 * DELETE /api/assets/[id]/references?refId=... — remove a usage
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

    const { data, error } = await svc.from('asset_references').select('*').eq('asset_id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, count: data?.length || 0, references: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const svc = getRouteClient(guard.supabaseAccessToken);
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    const access = await verifyResourceAccess(guard.userId, 'assets', id, 'project_id', guard.role);
    if (!access.allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    if (!body.experience_id && !body.project_service_id) {
      return NextResponse.json({ success: false, error: 'experience_id or project_service_id required' }, { status: 400 });
    }

    const payload: Record<string, any> = {
      asset_id: id,
      experience_id: body.experience_id || null,
      project_service_id: body.project_service_id || null,
      created_by: guard.userId,
    };

    const { data, error } = await svc.from('asset_references').insert(payload).select('*').single();
    if (error) {
      const isDup = (error as any).code === '23505';
      return NextResponse.json({ success: false, error: isDup ? 'reference already exists' : error.message }, { status: isDup ? 409 : 500 });
    }
    return NextResponse.json({ success: true, reference: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const refId = searchParams.get('refId');
    const svc = getRouteClient(guard.supabaseAccessToken);
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });
    if (!refId) return NextResponse.json({ success: false, error: 'refId required' }, { status: 400 });

    const access = await verifyResourceAccess(guard.userId, 'assets', id, 'project_id', guard.role);
    if (!access.allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { error } = await svc.from('asset_references').delete().eq('id', refId).eq('asset_id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
