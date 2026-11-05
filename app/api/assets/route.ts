export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient, getRouteClient } from '@/lib/services/client';
import { requireAuth, sanitizeString } from '@/lib/api-guard';
import { verifyProjectAccess, verifyResourceAccess } from '@/lib/auth/project-access';
import type { AssetCategory } from '@/lib/asset-types';

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const id = searchParams.get('id');
    const service = searchParams.get('service');
    const experienceId = searchParams.get('experienceId');

    const svc = getRouteClient(guard.supabaseAccessToken);
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    // Single asset by ID — verify access via project chain
    if (id) {
      const access = await verifyResourceAccess(guard.userId, 'assets', id, 'project_id', guard.role);
      if (!access.allowed) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.json({ success: true, asset: access.resource });
    }

    if (!projectId) return NextResponse.json({ success: false, error: 'projectId or id required' }, { status: 400 });

    // Verify user has access to this project
    const access = await verifyProjectAccess(guard.userId, projectId, guard.role);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    let query = svc.from('assets').select('*').eq('project_id', projectId);
    if (service) {
      const { data: projectServices } = await svc.from('project_services').select('service_id').eq('project_id', projectId);
      const serviceIds = (projectServices || [])
        .map((r: any) => r.service_id)
        .filter((id: string) => id.includes(service));
      if (serviceIds.length > 0) {
        query = query.in('service_id', serviceIds);
      } else {
        query = query.eq('id', '00000000-0000-0000-0000-000000000000');
      }
    }

    if (experienceId) {
      query = query.eq('experience_id', experienceId);
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, count: data?.length || 0, assets: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  try {
    const body = await req.json();
    const svc = getRouteClient(guard.supabaseAccessToken);
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    const projectId = sanitizeString(body.project_id);
    if (!projectId) {
      return NextResponse.json({ success: false, error: 'project_id required' }, { status: 400 });
    }

    // Verify user has access to this project
    const access = await verifyProjectAccess(guard.userId, projectId, guard.role);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const payload: Record<string, any> = {
      project_id: projectId,
      service_id: body.service_id || null,
      experience_id: body.experience_id || null,
      deliverable_id: body.deliverable_id || null,
      type: (body.type as AssetCategory) || 'image',
      url: body.url || '',
      storage_path: body.storage_path || '',
      mime_type: body.mime_type || '',
      size: body.size || 0,
      width: body.width || null,
      height: body.height || null,
      duration_seconds: body.duration_seconds || null,
      metadata: body.metadata || {},
    };

    const { data, error } = await svc.from('assets').insert(payload).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, asset: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  try {
    const body = await req.json();
    const svc = getRouteClient(guard.supabaseAccessToken);
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });
    if (!body.id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    // Verify access via project chain
    const access = await verifyResourceAccess(guard.userId, 'assets', body.id, 'project_id', guard.role);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed fields
    const allowedFields = ['type', 'url', 'storage_path', 'mime_type', 'size', 'width', 'height', 'duration_seconds', 'metadata', 'service_id', 'experience_id', 'deliverable_id'];
    const updatePayload: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updatePayload[field] = body[field];
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await svc.from('assets').update(updatePayload).eq('id', body.id).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, asset: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const svc = getRouteClient(guard.supabaseAccessToken);
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    // Verify access via project chain
    const access = await verifyResourceAccess(guard.userId, 'assets', id, 'project_id', guard.role);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await svc.from('assets').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
