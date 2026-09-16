import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/services/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const svc = getServiceClient();
    if (!svc) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
    }

    const { data: deliverable, error } = await svc
      .from('deliverables')
      .select('id, project_id, type, title, description, url, file_size, mime_type, metadata, created_at')
      .eq('id', id)
      .maybeSingle();

    if (error || !deliverable) {
      return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 });
    }

    const { data: project, error: projectError } = await svc
      .from('projects')
      .select('status, name')
      .eq('id', deliverable.project_id)
      .maybeSingle();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const isPublic =
      project.status === 'completed' ||
      project.status === 'active' ||
      deliverable.metadata?.public === true;

    if (!isPublic) {
      return NextResponse.json({ error: 'Deliverable is not public' }, { status: 403 });
    }

    return NextResponse.json({
      id: deliverable.id,
      title: deliverable.title,
      description: deliverable.description,
      url: deliverable.url,
      mime_type: deliverable.mime_type,
      file_size: deliverable.file_size,
      type: deliverable.type,
      project_name: project.name,
      created_at: deliverable.created_at,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
