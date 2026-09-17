export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/services/client';
import { requireAuth } from '@/lib/api-guard';

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
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
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const body = await req.json();
    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    let projectServiceId = body.project_service_id;
    if (!projectServiceId && body.project_id) {
      const { data: services, error: svcErr } = await svc
        .from('project_services')
        .select('id, service_id')
        .eq('project_id', body.project_id);
      if (svcErr) return NextResponse.json({ success: false, error: svcErr.message }, { status: 500 });
      if (!services || services.length === 0) {
        return NextResponse.json({ success: false, error: 'No project services found for this project' }, { status: 400 });
      }
      if (services.length === 1) {
        projectServiceId = services[0].id;
      } else {
        return NextResponse.json({
          success: false,
          error: `Multiple services exist for this project. Please provide project_service_id. Available: ${services.map((s: any) => `${s.id} (${s.service_id})`).join(', ')}`,
        }, { status: 400 });
      }
    }

    const payload: Record<string, any> = {
      project_id: body.project_id,
      project_service_id: projectServiceId,
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
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const body = await req.json();
    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });
    if (!body.id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    const updatePayload = { ...body };

    if (body.status === 'published') {
      const { data: current } = await svc.from('experiences').select('status, slug, metadata').eq('id', body.id).maybeSingle();
      if (current && current.status !== 'published') {
        const origin = req.headers.get('origin') || 'http://localhost:3000';
        const shareUrl = `${origin}/experience/${current.slug}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;
        const existingMetadata = current.metadata || {};
        updatePayload.published_at = new Date().toISOString();
        updatePayload.metadata = {
          ...existingMetadata,
          shareUrl,
          qrCodeUrl,
        };
      }
    }

    const { data, error } = await svc.from('experiences').update(updatePayload).eq('id', body.id).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, experience: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAuth(req, ['super_admin', 'admin']);
  if (guard.error) return guard.error;
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
