export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth } from '@/lib/api-guard';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAuth(_request);
    if (guard.error) return guard.error;
    const db = getSupabaseAdmin();
    if (!db) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { id } = await params;

    const { data, error } = await db
        .from('editor_projects')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (data.owner_id !== guard.userId && guard.role !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(data);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAuth(request);
  if (guard.error) return guard.error;
  const db = getSupabaseAdmin();
  if (!db) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { id } = await params;
    const body = await request.json();

    // SECURITY: Whitelist allowed fields to prevent mass assignment
    const allowedFields = ['name', 'description', 'settings', 'thumbnail', 'fork_from'];
    const updatePayload: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updatePayload[field] = body[field];
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: existing } = await db
        .from('editor_projects')
        .select('owner_id')
        .eq('id', id)
        .single();

    if (!existing) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existing.owner_id !== guard.userId && guard.role !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await db
        .from('editor_projects')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAuth(_request, ['super_admin', 'admin']);
  if (guard.error) return guard.error;
  const db = getSupabaseAdmin();
  if (!db) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { id } = await params;

    const { data: existing } = await db
        .from('editor_projects')
        .select('owner_id')
        .eq('id', id)
        .single();

    if (!existing) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existing.owner_id !== guard.userId && guard.role !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await db
        .from('editor_projects')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
