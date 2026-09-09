import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import {
  XR_LINKS_DB,
  getXRLinksFromDB,
  saveXRLinkToDB,
  deleteXRLinkFromDB,
  buildXRLinkRecord,
} from '@/lib/xr-links-store';

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const sceneId = searchParams.get('sceneId');
  const status = searchParams.get('status');
  const slug = searchParams.get('slug');
  const query = searchParams.get('q')?.toLowerCase();
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let links = await getXRLinksFromDB();

  // Filter by project
  if (projectId) {
    links = links.filter((x) => x.projectId === projectId);
  }
  // Filter by scene
  if (sceneId) {
    links = links.filter((x) => x.sceneId === sceneId);
  }
  // Filter by status
  if (status && status !== 'ALL') {
    links = links.filter((x) => x.status === status);
  }
  // Filter by slug
  if (slug) {
    links = links.filter((x) => x.slug.toLowerCase() === slug.toLowerCase());
  }
  // Search query
  if (query) {
    links = links.filter(
      (x) =>
        x.name.toLowerCase().includes(query) ||
        x.shareUrl.toLowerCase().includes(query) ||
        x.projectId.toLowerCase().includes(query) ||
        (x.sceneId && x.sceneId.toLowerCase().includes(query))
    );
  }

  // Pagination
  const total = links.length;
  const paginated = links.slice(offset, offset + limit);

  return NextResponse.json({ 
    success: true, 
    count: paginated.length,
    total,
    offset,
    limit,
    xrLinks: paginated 
  });
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  try {
    const body = await req.json();
    const {
      name, projectId, sceneId, modelUrl, thumbnailUrl, slug,
      environment, arPlacement, passwordProtected, accessPassword,
      expiresAt, engineType, entitiesCount, fileSizeMB, formats,
    } = body;

    if (!name || !projectId) {
      return NextResponse.json({ success: false, error: 'name and projectId are required' }, { status: 400 });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const newXRLink = buildXRLinkRecord({
      name, projectId, sceneId, modelUrl, thumbnailUrl, slug,
      environment, arPlacement, passwordProtected, accessPassword,
      expiresAt, engineType, entitiesCount, fileSizeMB, formats, origin,
    });

    const saved = await saveXRLinkToDB(newXRLink);
    if (!saved) XR_LINKS_DB.unshift(newXRLink);

    return NextResponse.json({ success: true, xrLink: newXRLink }, { status: 201 });
  } catch (error: any) {
    console.error('[XR Links] POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'XR Link ID is required' }, { status: 400 });
    }

    let links = await getXRLinksFromDB();
    const index = links.findIndex((x) => x.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'XR Link not found' }, { status: 404 });
    }

    // Update fields
    const updatedLink = {
      ...links[index],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
      metadata: {
        ...links[index].metadata,
        ...(updates.metadata || {}),
      },
    };

    links[index] = updatedLink;

    const saved = await saveXRLinkToDB(updatedLink);
    if (!saved) {
      XR_LINKS_DB.splice(0, XR_LINKS_DB.length, ...links);
    }

    return NextResponse.json({ success: true, xrLink: updatedLink });
  } catch (error: any) {
    console.error('[XR Links] PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'XR Link ID is required' }, { status: 400 });
  }

  let links = await getXRLinksFromDB();
  const initialLength = links.length;
  links = links.filter((x) => x.id !== id);

  if (links.length === initialLength) {
    return NextResponse.json({ success: false, error: 'XR Link not found' }, { status: 404 });
  }

  const deleted = await deleteXRLinkFromDB(id);
  if (!deleted) {
    XR_LINKS_DB.splice(0, XR_LINKS_DB.length, ...links);
  }

  return NextResponse.json({ success: true, message: `XR Link ${id} deleted successfully` });
}