import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/services/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const experienceId = searchParams.get('experienceId');
    const id = searchParams.get('id');

    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    if (id) {
      const { data, error } = await svc.from('experience_configs').select('*').eq('id', id).maybeSingle();
      if (error || !data) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
      return NextResponse.json({ success: true, config: data });
    }

    if (!projectId && !experienceId) {
      return NextResponse.json({ success: false, error: 'projectId or experienceId required' }, { status: 400 });
    }

    let query = svc.from('experience_configs').select('*');
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
    return NextResponse.json({ success: true, count: data?.length || 0, configs: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    const payload: Record<string, any> = {
      experience_id: body.experience_id,
      config: body.config || {},
      assets: body.assets || [],
      settings: body.settings || {},
    };

    const { data, error } = await svc.from('experience_configs').insert(payload).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, config: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });
    if (!body.id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    const { data, error } = await svc.from('experience_configs').update(body).eq('id', body.id).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, config: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    const { error } = await svc.from('experience_configs').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
