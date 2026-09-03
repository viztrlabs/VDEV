import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/services/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const id = searchParams.get('id');

    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    if (id) {
      const { data, error } = await svc.from('project_members').select('*').eq('id', id).maybeSingle();
      if (error || !data) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
      return NextResponse.json({ success: true, member: data });
    }

    if (!projectId) return NextResponse.json({ success: false, error: 'projectId or id required' }, { status: 400 });

    const { data, error } = await svc.from('project_members').select('*').eq('project_id', projectId).order('created_at', { ascending: true });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, count: data?.length || 0, members: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    const allowedRoles = ['owner', 'admin', 'editor', 'staff', 'client', 'viewer'];
    const allowedStatuses = ['pending', 'active', 'removed'];

    const payload: Record<string, any> = {
      project_id: body.project_id,
      user_id: body.user_id || null,
      role: allowedRoles.includes(body.role) ? body.role : 'viewer',
      email: body.email || null,
      status: allowedStatuses.includes(body.status) ? body.status : 'pending',
      invited_by: body.invited_by || null,
    };

    const { data, error } = await svc.from('project_members').insert(payload).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, member: data }, { status: 201 });
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

    const { data, error } = await svc.from('project_members').update(body).eq('id', body.id).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, member: data });
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

    const { error } = await svc.from('project_members').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
