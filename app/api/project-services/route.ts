import { NextRequest, NextResponse } from 'next/server';
import { listProjectServices, getProjectService } from '@/lib/services/projectServices';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const serviceId = searchParams.get('serviceId');

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'projectId required' }, { status: 400 });
    }

    const rows = await listProjectServices(projectId);
    let filtered = rows;
    if (serviceId) {
      filtered = rows.filter((r) => r.service_id === serviceId);
    }

    return NextResponse.json({ success: true, count: filtered.length, projectServices: filtered });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const projectId = body.projectId;
    const serviceId = body.serviceId;

    if (!projectId || !serviceId) {
      return NextResponse.json({ success: false, error: 'projectId and serviceId required' }, { status: 400 });
    }

    const row = await getProjectService(projectId, serviceId);
    if (!row) {
      return NextResponse.json({ success: false, error: 'project service not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, projectService: row });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
