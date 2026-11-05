export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/services/client';
import { requireAuth, sanitizeString } from '@/lib/api-guard';
import { verifyProjectAccess, verifyResourceAccess } from '@/lib/auth/project-access';

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const id = searchParams.get('id');

    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    if (id) {
      const access = await verifyResourceAccess(guard.userId, 'project_members', id, 'project_id', guard.role);
      if (!access.allowed) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.json({ success: true, member: access.resource });
    }

    if (!projectId) return NextResponse.json({ success: false, error: 'projectId or id required' }, { status: 400 });

    const access = await verifyProjectAccess(guard.userId, projectId, guard.role);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await svc.from('project_members').select('*').eq('project_id', projectId).order('created_at', { ascending: true });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, count: data?.length || 0, members: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const body = await req.json();
    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    const projectId = sanitizeString(body.project_id);
    if (!projectId) {
      return NextResponse.json({ success: false, error: 'project_id required' }, { status: 400 });
    }

    // Only project owner or admin can add members
    const access = await verifyProjectAccess(guard.userId, projectId, guard.role);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const allowedRoles = ['owner', 'admin', 'editor', 'staff', 'client', 'viewer'];
    const allowedStatuses = ['pending', 'active', 'removed'];

    const payload: Record<string, any> = {
      project_id: projectId,
      user_id: body.user_id || null,
      role: allowedRoles.includes(body.role) ? body.role : 'viewer',
      email: sanitizeString(body.email),
      status: allowedStatuses.includes(body.status) ? body.status : 'pending',
      invited_by: guard.userId,
    };

    const { data, error } = await svc.from('project_members').insert(payload).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, member: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const body = await req.json();
    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });
    if (!body.id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    const access = await verifyResourceAccess(guard.userId, 'project_members', body.id, 'project_id', guard.role);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed fields
    const allowedFields = ['role', 'status', 'email'];
    const updatePayload: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updatePayload[field] = body[field];
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await svc.from('project_members').update(updatePayload).eq('id', body.id).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, member: data });
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
    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    const access = await verifyResourceAccess(guard.userId, 'project_members', id, 'project_id', guard.role);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await svc.from('project_members').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
