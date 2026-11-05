export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient, getRouteClient } from '@/lib/services/client';
import { requireAuth, sanitizeString } from '@/lib/api-guard';
import { verifyProjectAccess, verifyResourceAccess } from '@/lib/auth/project-access';

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const id = searchParams.get('id');
    const service = searchParams.get('service');

    const svc = getRouteClient(guard.supabaseAccessToken);
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    if (id) {
      const access = await verifyResourceAccess(guard.userId, 'deliverables', id, 'project_id', guard.role);
      if (!access.allowed) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.json({ success: true, deliverable: access.resource });
    }

    if (!projectId) return NextResponse.json({ success: false, error: 'projectId or id required' }, { status: 400 });

    const access = await verifyProjectAccess(guard.userId, projectId, guard.role);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    let query = svc.from('deliverables').select('*').eq('project_id', projectId);
    if (service) {
      const { data: projectServices } = await svc.from('project_services').select('service_id').eq('project_id', projectId);
      const serviceIds = (projectServices || [])
        .map((r: any) => r.service_id)
        .filter((id: string) => id.includes(service));
      if (serviceIds.length > 0) {
        query = query.in('type', serviceIds);
      } else {
        query = query.eq('id', '00000000-0000-0000-0000-000000000000');
      }
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, count: data?.length || 0, deliverables: data || [] });
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

    const access = await verifyProjectAccess(guard.userId, projectId, guard.role);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const payload: Record<string, any> = {
      project_id: projectId,
      experience_id: body.experience_id || null,
      title: sanitizeString(body.title) || 'New Deliverable',
      type: body.type || 'file',
      description: sanitizeString(body.description, 2000) || '',
      url: body.url || '',
      file_size: body.file_size || 0,
      mime_type: body.mime_type || '',
      status: body.status || 'pending',
      metadata: body.metadata || {},
    };

    const { data, error } = await svc.from('deliverables').insert(payload).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deliverable: data }, { status: 201 });
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

    const access = await verifyResourceAccess(guard.userId, 'deliverables', body.id, 'project_id', guard.role);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed fields
    const allowedFields = ['title', 'type', 'description', 'url', 'file_size', 'mime_type', 'status', 'metadata', 'experience_id'];
    const updatePayload: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updatePayload[field] = body[field];
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await svc.from('deliverables').update(updatePayload).eq('id', body.id).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deliverable: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAuth(req, ['super_admin', 'admin']);
  if (guard.error) return guard.error;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const svc = getRouteClient(guard.supabaseAccessToken);
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    const access = await verifyResourceAccess(guard.userId, 'deliverables', id, 'project_id', guard.role);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await svc.from('deliverables').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
