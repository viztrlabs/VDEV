export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  handleApiError,
  successResponse,
  applyRateLimit,
  generateRequestId,
  addRequestIdHeaders,
} from '@/lib/api/validation';
import { getAuthUser, requireAdmin } from '@/lib/api/auth';
import {
  CreateXRLinkSchema,
  type XRLink,
} from '@/lib/api/contracts/schemas';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function requireDb() {
  const db = getSupabaseAdmin();
  if (!db) {
    throw new Error('Database unavailable: server storage not configured');
  }
  return db;
}

function toContract(row: any, projectName?: string): XRLink {
  const meta = (row.metadata ?? {}) as Record<string, any>;
  return {
    id: row.id,
    projectId: row.project_id,
    projectName: projectName ?? meta.projectName ?? row.project_id,
    token: row.slug,
    url: row.share_url,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    createdBy: meta.createdBy ?? 'system',
    accessCount: row.views_count ?? 0,
    maxAccess: meta.maxAccess ?? 100,
    allowedDomains: meta.allowedDomains,
    passwordProtected: !!row.password_protected,
  };
}

// GET /api/admin/xr-links - List XR links (Supabase `xr_links`)
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 100, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    const { searchParams } = request.nextUrl;
    const projectId = searchParams.get('projectId') || undefined;

    const db = requireDb();
    let query = db.from('xr_links').select('*').order('created_at', { ascending: false });
    if (projectId) query = query.eq('project_id', projectId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as any[];
    const projectIds = [...new Set(rows.map((r) => r.project_id).filter(Boolean))];
    let names: Record<string, string> = {};
    if (projectIds.length > 0) {
      const { data: projects } = await db.from('projects').select('id,name').in('id', projectIds);
      for (const p of (projects ?? []) as any[]) names[p.id] = p.name;
    }

    return addRequestIdHeaders(successResponse(rows.map((r) => toContract(r, names[r.project_id])), { requestId }), requestId);
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}

// POST /api/admin/xr-links - Create XR link (persists to `xr_links`)
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const user = await getAuthUser();
    requireAdmin(user);

    const rateLimitResponse = await applyRateLimit(request, { limit: 50, window: '60 s' });
    if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

    const body = await request.json().catch(() => ({}));
    const data = CreateXRLinkSchema.parse(body);

    const db = requireDb();
    const { data: project, error: projectError } = await db
      .from('projects')
      .select('id,name')
      .eq('id', data.projectId)
      .maybeSingle();
    if (projectError) throw new Error(projectError.message);
    if (!project) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `Project ${data.projectId} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    const slug = `xrt_${(project as any).name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Math.random().toString(36).slice(2, 10)}`;
    const now = new Date().toISOString();
    const row = {
      id: `xrl-${Date.now()}`,
      name: `${(project as any).name} — XR link`,
      slug,
      project_id: data.projectId,
      scene_id: null,
      model_url: '',
      thumbnail_url: null,
      share_url: `https://xr.viztr.studio/${slug}`,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://xr.viztr.studio/${slug}`)}`,
      environment: 'studio',
      ar_placement: 'floor',
      password_protected: !!data.password,
      access_password: data.password ?? null,
      views_count: 0,
      unique_visitors: 0,
      avg_engagement_secs: 0,
      status: 'active',
      expires_at: data.expiresAt,
      metadata: {
        projectName: (project as any).name,
        maxAccess: data.maxAccess ?? 100,
        allowedDomains: data.allowedDomains ?? [],
        createdBy: user.id,
      },
      created_at: now,
      updated_at: now,
    };

    const { data: inserted, error } = await db.from('xr_links').insert(row).select('*').single();
    if (error) throw new Error(error.message);

    return addRequestIdHeaders(
      NextResponse.json(
        { success: true, data: toContract(inserted, (project as any).name), meta: { timestamp: new Date().toISOString(), requestId } },
        { status: 201 }
      ),
      requestId
    );
  } catch (error) {
    return addRequestIdHeaders(handleApiError(error), requestId);
  }
}
