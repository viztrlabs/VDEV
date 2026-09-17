export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// GET /api/tour/views — total public tour opens (for the admin analytics counter)
// POST /api/tour/views — increment the counter when a visitor opens the tour

async function readCount(): Promise<number> {
  if (!getSupabaseAdmin()) return 0;
  const { data } = await getSupabaseAdmin()!
    .from('tours')
    .select('views_count')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.views_count ?? 0;
}

export async function GET() {
  return NextResponse.json({ count: await readCount() });
}

export async function POST() {
  try {
    if (!getSupabaseAdmin()) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }
    const { data: tour } = await getSupabaseAdmin()!
      .from('tours')
      .select('id')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!tour) {
      return NextResponse.json({ count: 0 });
    }
    const { data } = await getSupabaseAdmin()!
      .from('tours')
      .update({ views_count: (await readCount()) + 1 })
      .eq('id', tour.id)
      .select('views_count')
      .single();
    return NextResponse.json({ count: data?.views_count ?? 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}
