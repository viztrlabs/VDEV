import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/services/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const projectServiceId = searchParams.get('projectServiceId');
    const id = searchParams.get('id');

    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    if (id) {
      const { data, error } = await svc.from('experiences').select('*').eq('id', id).maybeSingle();
      if (error || !data) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
      return NextResponse.json({ success: true, experience: data });
    }

    if (!projectId && !projectServiceId) {
      return NextResponse.json({ success: false, error: 'projectId or projectServiceId required' }, { status: 400 });
    }

    let query = svc.from('experiences').select('*');
    if (projectId) query = query.eq('project_id', projectId);
    if (projectServiceId) query = query.eq('project_service_id', projectServiceId);

    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, count: data?.length || 0, experiences: data || [] });
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
      project_id: body.project_id,
      project_service_id: body.project_service_id,
      title: body.title || 'New Experience',
      slug: body.slug || `experience-${Date.now()}`,
      description: body.description || '',
      status: body.status || 'draft',
      version: body.version ?? 1,
      metadata: body.metadata || {},
    };

    const { data, error } = await svc.from('experiences').insert(payload).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, experience: data }, { status: 201 });
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

    const { data, error } = await svc.from('experiences').update(body).eq('id', body.id).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, experience: data });
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

    const { error } = await svc.from('experiences').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
