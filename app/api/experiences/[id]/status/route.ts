export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/services/client';
import { requireAuth } from '@/lib/api-guard';
import { verifyExperienceAccess } from '@/lib/auth/project-access';

/**
 * PATCH /api/experiences/[id]/status
 *
 * Control the publishing lifecycle of an experience:
 *   draft → review → published → archived (any step-back also allowed for staff)
 *
 * Body: { status: 'draft'|'review'|'published'|'archived' }
 *
 * Permission: staff roles only (super_admin, admin, user). Clients use the
 * Experience Dashboard approval surface, never the publishing control.
 */

const ALLOWED_STATUSES = ['draft', 'review', 'published', 'archived'];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAuth(req, ['super_admin', 'admin', 'user']);
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    if (!body.status || !ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json({ success: false, error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` }, { status: 400 });
    }

    const access = await verifyExperienceAccess(guard.userId, id, guard.role);
    if (!access.allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const update: Record<string, any> = { status: body.status };
    if (body.status === 'published') {
      // Set published_at on first publish only (preserve original publish date)
      const current = access.experience?.published_at;
      if (!current) update.published_at = new Date().toISOString();
    }

    const { data, error } = await svc.from('experiences').update(update).eq('id', id).select('id, title, slug, status, published_at').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, experience: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
