import { NextRequest, NextResponse } from 'next/server';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/projectsStore';
import type { VtedProject } from '@/lib/vted-types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  try {
    if (id) {
      const p = await getProject(id);
      if (!p) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
      return NextResponse.json({ success: true, project: p });
    }
    const list = await getProjects();
    return NextResponse.json({ success: true, count: list.length, projects: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const p = await createProject({
      name: body.name || 'Untitled Project',
      tourId: body.tourId || 'default',
      author: body.author || 'You',
      sceneCount: body.sceneCount || 0,
      status: body.status === 'published' ? 'published' : 'draft',
      thumbnailUrl: body.thumbnailUrl,
    });
    return NextResponse.json({ success: true, project: p }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    }
    const patch: Partial<VtedProject> = {};
    if (typeof body.name === 'string') patch.name = body.name;
    if (typeof body.tourId === 'string') patch.tourId = body.tourId;
    if (typeof body.author === 'string') patch.author = body.author;
    if (typeof body.sceneCount === 'number') patch.sceneCount = body.sceneCount;
    if (body.status === 'published' || body.status === 'draft') patch.status = body.status;
    if (typeof body.thumbnailUrl === 'string') patch.thumbnailUrl = body.thumbnailUrl;
    const p = await updateProject(body.id, patch);
    if (!p) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
    return NextResponse.json({ success: true, project: p });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
  }
  const ok = await deleteProject(id);
  if (!ok) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
