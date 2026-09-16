import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, sanitizeString } from '@/lib/api-guard';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const limit = Math.min(Number(searchParams.get('limit') || '50'), 200);

  try {
    let query = supabaseAdmin
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, logs: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();

    const action = sanitizeString(body.action, 255);
    const entityType = sanitizeString(body.entity_type, 100);

    if (!action || !entityType) {
      return NextResponse.json(
        { success: false, error: 'action and entity_type are required' },
        { status: 422 }
      );
    }

    const projectId = sanitizeString(body.project_id, 100);
    const entityId = sanitizeString(body.entity_id, 255);
    const userName = sanitizeString(body.user_name, 255) || guard.session?.user?.name || guard.userId;
    const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {};

    const { data, error } = await supabaseAdmin
      .from('activity_logs')
      .insert({
        project_id: projectId || null,
        user_id: guard.userId || null,
        user_name: userName,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        metadata,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, log: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 400 });
  }
}
