import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth } from '@/lib/api-guard';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAuth(_request);
    if (guard.error) return guard.error;
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { id } = await params;

    const { data, error } = await supabaseAdmin
        .from('editor_scenes')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
}
