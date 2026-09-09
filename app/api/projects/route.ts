import { NextRequest, NextResponse } from 'next/server';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/projectsStore';
import type { VtedProject } from '@/lib/vted-types';
import { requireAuth, sanitizeString, validateEnum } from '@/lib/api-guard';

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

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
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  try {
    const body = await req.json();

    // Input validation
    const name = sanitizeString(body.name, 255);
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'name is required and must be a non-empty string' },
        { status: 422 }
      );
    }

    const status = validateEnum(body.status, ['draft', 'published']) || 'draft';

    const p = await createProject({
      name,
      tourId: sanitizeString(body.tourId, 100) || 'default',
      author: sanitizeString(body.author, 100) || guard.userId || 'You',
      sceneCount: typeof body.sceneCount === 'number' && body.sceneCount >= 0 ? Math.floor(body.sceneCount) : 0,
      status,
      thumbnailUrl: sanitizeString(body.thumbnailUrl, 2048) || undefined,
    });
    return NextResponse.json({ success: true, project: p }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  try {
    const body = await req.json();
    if (!body.id || typeof body.id !== 'string') {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    }

    const patch: Partial<VtedProject> = {};

    if (body.name !== undefined) {
      const name = sanitizeString(body.name, 255);
      if (!name) {
        return NextResponse.json(
          { success: false, error: 'name must be a non-empty string' },
          { status: 422 }
        );
      }
      patch.name = name;
    }

    if (body.tourId !== undefined) patch.tourId = sanitizeString(body.tourId, 100);
    if (body.author !== undefined) patch.author = sanitizeString(body.author, 100);
    if (typeof body.sceneCount === 'number' && body.sceneCount >= 0) patch.sceneCount = Math.floor(body.sceneCount);

    const validStatus = validateEnum(body.status, ['draft', 'published']);
    if (validStatus) patch.status = validStatus;

    if (body.thumbnailUrl !== undefined) patch.thumbnailUrl = sanitizeString(body.thumbnailUrl, 2048);

    const p = await updateProject(body.id, patch);
    if (!p) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
    return NextResponse.json({ success: true, project: p });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAuth(req, ['super_admin', 'admin']);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
  }
  const ok = await deleteProject(id);
  if (!ok) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
