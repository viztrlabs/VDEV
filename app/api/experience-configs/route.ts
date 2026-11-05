export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient, getRouteClient } from '@/lib/services/client';
import { requireAuth, sanitizeString } from '@/lib/api-guard';
import { verifyExperienceAccess, verifyConfigAccess } from '@/lib/auth/project-access';
import { validateExperienceConfig } from '@/lib/validation/experience-config';

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const experienceId = searchParams.get('experienceId');
    const id = searchParams.get('id');

    const svc = getRouteClient(guard.supabaseAccessToken);
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    // Single config by ID — verify access via experience chain
    if (id) {
      const access = await verifyConfigAccess(guard.userId, id, guard.role);
      if (!access.allowed) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.json({ success: true, config: access.config });
    }

    if (!projectId && !experienceId) {
      return NextResponse.json({ success: false, error: 'projectId or experienceId required' }, { status: 400 });
    }

    // projectId scope — verify user has access to this project
    if (projectId) {
      const { verifyProjectAccess } = await import('@/lib/auth/project-access');
      const access = await verifyProjectAccess(guard.userId, projectId, guard.role);
      if (!access.allowed) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    // experienceId scope — verify user has access to this experience's project
    if (experienceId && !projectId) {
      const access = await verifyExperienceAccess(guard.userId, experienceId, guard.role);
      if (!access.allowed) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    let query = svc.from('experience_configs').select('*, experiences!inner(id, slug, title, status, published_at, metadata)');
    if (experienceId) {
      query = query.eq('experience_id', experienceId);
    } else if (projectId) {
      const { data: experiences } = await svc.from('experiences').select('id').eq('project_id', projectId);
      const expIds = (experiences || []).map((e: any) => e.id);
      if (expIds.length === 0) {
        return NextResponse.json({ success: true, count: 0, configs: [] });
      }
      query = query.in('experience_id', expIds);
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    const configs = (data || []).map((row: any) => ({
      ...row,
      published_at: row.experiences?.published_at || null,
    }));

    return NextResponse.json({ success: true, count: configs.length, configs });
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

    // SECURITY: Validate request body against Zod schema
    const validation = validateExperienceConfig(body, 'POST');
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body', details: validation.errors },
        { status: 400 }
      );
    }

    const experienceId = sanitizeString(body.experience_id);
    if (!experienceId) {
      return NextResponse.json({ success: false, error: 'experience_id required' }, { status: 400 });
    }

    // CRITICAL: Verify the user has access to this experience before inserting
    const access = await verifyExperienceAccess(guard.userId, experienceId, guard.role);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden: you do not have access to this experience' }, { status: 403 });
    }

    const payload: Record<string, any> = {
      experience_id: experienceId,
      config: validation.data.config,
      assets: validation.data.assets,
      settings: validation.data.settings,
    };

    const { data, error } = await svc.from('experience_configs').insert(payload).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, config: data }, { status: 201 });
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

    // SECURITY: Validate request body against Zod schema
    const validation = validateExperienceConfig(body, 'PUT');
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body', details: validation.errors },
        { status: 400 }
      );
    }

    // CRITICAL: Verify the user has access to this config before updating
    const access = await verifyConfigAccess(guard.userId, body.id, guard.role);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed fields — never pass raw body to .update()
    const allowedFields = ['config', 'assets', 'settings'];
    const updatePayload: Record<string, any> = {};
    for (const field of allowedFields) {
      if (validation.data[field] !== undefined) {
        updatePayload[field] = validation.data[field];
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await svc.from('experience_configs').update(updatePayload).eq('id', body.id).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, config: data });
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

    // Verify access even for admins (project-scoped)
    const access = await verifyConfigAccess(guard.userId, id, guard.role);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await svc.from('experience_configs').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
