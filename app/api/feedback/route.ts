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

  try {
    let query = supabaseAdmin
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, feedback: data || [] });
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

    const content = sanitizeString(body.content, 5000);
    const authorName = sanitizeString(body.author_name, 255);

    if (!content || !authorName) {
      return NextResponse.json(
        { success: false, error: 'content and author_name are required' },
        { status: 422 }
      );
    }

    const projectId = sanitizeString(body.project_id, 100);
    const experienceId = sanitizeString(body.experience_id, 100) || null;
    const authorEmail = sanitizeString(body.author_email, 255) || guard.session?.user?.email || null;
    const annotation = body.annotation && typeof body.annotation === 'object' ? body.annotation : {};

    const { data, error } = await supabaseAdmin
      .from('feedback')
      .insert({
        project_id: projectId || null,
        experience_id: experienceId,
        author_name: authorName,
        author_email: authorEmail,
        content,
        annotation,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, feedback: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 400 });
  }
}
