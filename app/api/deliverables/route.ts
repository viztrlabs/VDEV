import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/services/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const id = searchParams.get('id');
    const service = searchParams.get('service');

    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    if (id) {
      const { data, error } = await svc.from('deliverables').select('*').eq('id', id).maybeSingle();
      if (error || !data) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
      return NextResponse.json({ success: true, deliverable: data });
    }

    if (!projectId) return NextResponse.json({ success: false, error: 'projectId or id required' }, { status: 400 });

    let query = svc.from('deliverables').select('*').eq('project_id', projectId);
    if (service) {
      const { data: projectServices } = await svc.from('project_services').select('service_id').eq('project_id', projectId);
      const serviceIds = (projectServices || [])
        .map((r: any) => r.service_id)
        .filter((id: string) => id.includes(service));
      if (serviceIds.length > 0) {
        query = query.in('type', serviceIds);
      } else {
        query = query.eq('id', '00000000-0000-0000-0000-000000000000');
      }
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, count: data?.length || 0, deliverables: data || [] });
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
      experience_id: body.experience_id || null,
      title: body.title || 'New Deliverable',
      type: body.type || 'file',
      description: body.description || '',
      url: body.url || '',
      file_size: body.file_size || 0,
      mime_type: body.mime_type || '',
      status: body.status || 'pending',
      metadata: body.metadata || {},
    };

    const { data, error } = await svc.from('deliverables').insert(payload).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deliverable: data }, { status: 201 });
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

    const { data, error } = await svc.from('deliverables').update(body).eq('id', body.id).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deliverable: data });
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

    const { error } = await svc.from('deliverables').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
