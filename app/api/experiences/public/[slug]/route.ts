export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/services/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    const { data: experience, error } = await svc
      .from('experiences')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error || !experience) {
      return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
    }

    const { data: config } = await svc
      .from('experience_configs')
      .select('*')
      .eq('experience_id', experience.id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      experience,
      config: config || null,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
