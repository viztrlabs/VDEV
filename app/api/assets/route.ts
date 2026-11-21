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

    // Dedup lookup by content hash (scoped to the project to avoid cross-tenant leaks)
    const hash = searchParams.get('hash');
    if (hash) {
      const { data: matches, error: hashErr } = await svc
        .from('assets')
        .select('*')
        .eq('project_id', projectId)
        .eq('hash_sha256', hash)
        .limit(1);
      if (hashErr) return NextResponse.json({ success: false, error: hashErr.message }, { status: 500 });
      return NextResponse.json({ success: true, deduplicated: (matches?.length || 0) > 0, asset: matches?.[0] || null });
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

    const assetRole = body.asset_role === 'derivative' ? 'derivative' : 'master';
    const hashSha256 = typeof body.hash_sha256 === 'string' ? body.hash_sha256 : null;

    // Master dedup: same content hash within the same project reuses the existing record.
    if (hashSha256 && assetRole === 'master') {
      const { data: existing } = await svc
        .from('assets')
        .select('*')
        .eq('project_id', projectId)
        .eq('hash_sha256', hashSha256)
        .limit(1);
      if (existing && existing.length > 0) {
        return NextResponse.json({ success: true, deduplicated: true, asset: existing[0] }, { status: 200 });
      }
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
      asset_role: assetRole,
      hash_sha256: hashSha256,
      service_slug: typeof body.service_slug === 'string' ? body.service_slug : null,
      version: Number.isFinite(body.version) ? Math.max(1, parseInt(body.version, 10)) : 1,
      thumbnail_url: typeof body.thumbnail_url === 'string' ? body.thumbnail_url : null,
    };

    // Derivatives must reference a master within the same project.
    if (assetRole === 'derivative') {
      const parentId = body.parent_asset_id;
      if (!parentId) {
        return NextResponse.json({ success: false, error: 'parent_asset_id required for derivative assets' }, { status: 400 });
      }
      const { data: parent, error: parentErr } = await svc
        .from('assets')
        .select('id, project_id, asset_role')
        .eq('id', parentId)
        .single();
      if (parentErr || !parent) {
        return NextResponse.json({ success: false, error: 'parent asset not found' }, { status: 404 });
      }
      if (parent.project_id !== projectId) {
        return NextResponse.json({ success: false, error: 'parent asset belongs to a different project' }, { status: 400 });
      }
      if (parent.asset_role === 'derivative') {
        return NextResponse.json({ success: false, error: 'parent asset must be a master' }, { status: 400 });
      }
      payload.parent_asset_id = parentId;
    }

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
    const allowedFields = ['type', 'url', 'storage_path', 'mime_type', 'size', 'width', 'height', 'duration_seconds', 'metadata', 'service_id', 'experience_id', 'deliverable_id', 'service_slug', 'thumbnail_url'];
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

    // Deletion protection: block while the asset is referenced by an experience/service.
    const { data: refs, error: refsErr } = await svc.from('asset_references').select('id').eq('asset_id', id);
    if (refsErr) return NextResponse.json({ success: false, error: refsErr.message }, { status: 500 });
    if (refs && refs.length > 0) {
      return NextResponse.json(
        { success: false, error: 'asset is still referenced by one or more experiences/services', referenceCount: refs.length },
        { status: 409 }
      );
    }

    // Deletion protection: block deleting a master that still has derivatives.
    const { data: children, error: childErr } = await svc.from('assets').select('id').eq('parent_asset_id', id).limit(1);
    if (childErr) return NextResponse.json({ success: false, error: childErr.message }, { status: 500 });
    if (children && children.length > 0) {
      return NextResponse.json(
        { success: false, error: 'master asset still has derivative assets; delete derivatives first' },
        { status: 409 }
      );
    }

    const { error } = await svc.from('assets').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
