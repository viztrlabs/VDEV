export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/services/client';
import { requireAuth } from '@/lib/api-guard';
import { verifyProjectAccess } from '@/lib/auth/project-access';

/**
 * PATCH /api/project-services/[id]
 *
 * Enable/disable or reconfigure a service entitlement on a project.
 * Body: { status?: 'active'|'paused'|'completed'|'archived', config?: object }
 *
 * Permission: project owner, project member, or admin (verifyProjectAccess).
 * Clients cannot reach this route (no project access).
 */

const ALLOWED_STATUSES = ['active', 'paused', 'completed', 'archived'];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAuth(req, ['super_admin', 'admin', 'user']);
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    // Resolve the parent project for access verification
    const { data: row, error: rowErr } = await svc
      .from('project_services')
      .select('id, project_id, status')
      .eq('id', id)
      .single();
    if (rowErr || !row) return NextResponse.json({ success: false, error: 'project service not found' }, { status: 404 });

    const access = await verifyProjectAccess(guard.userId, row.project_id, guard.role);
    if (!access.allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const update: Record<string, any> = {};
    if (body.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return NextResponse.json({ success: false, error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` }, { status: 400 });
      }
      update.status = body.status;
      if (body.status === 'active') {
        update.enabled_at = new Date().toISOString();
        update.disabled_at = null;
      } else {
        update.disabled_at = new Date().toISOString();
      }
    }
    if (body.config !== undefined) {
      if (typeof body.config !== 'object' || body.config === null || Array.isArray(body.config)) {
        return NextResponse.json({ success: false, error: 'config must be an object' }, { status: 400 });
      }
      update.config = body.config;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, error: 'nothing to update (status or config required)' }, { status: 400 });
    }

    const { data, error } = await svc.from('project_services').update(update).eq('id', id).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, projectService: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
