import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import {
  XRLinkRecord,
  XR_LINKS_DB,
  getXRLinksFromDB,
  saveXRLinkToDB,
  deleteXRLinkFromDB,
  generateSlug,
  generateQRCodeUrl,
} from '@/lib/xr-links-store';

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const sceneId = searchParams.get('sceneId');
  const status = searchParams.get('status');
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
      name, 
      projectId, 
      sceneId,
      modelUrl,
      thumbnailUrl,
      environment = 'studio', 
      arPlacement = 'floor', 
      passwordProtected = false, 
      accessPassword = '',
      expiresAt,
      engineType = 'three',
      entitiesCount = 0,
      fileSizeMB = 0,
      formats = ['glb'],
    } = body;

    // Validation
    if (!name || !projectId) {
      return NextResponse.json({ 
        success: false, 
        error: 'name and projectId are required' 
      }, { status: 400 });
    }

    const id = `xr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const slug = generateSlug(name);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://viztr.studio';
    const shareUrl = `${baseUrl}/xr/${slug}`;
    
    const now = new Date().toISOString();
    const expiresAtDate = expiresAt || new Date(Date.now() + 90 * 86400000).toISOString();

    // Determine delivery capabilities based on engine
    const deliveryCapabilities = {
      webAR: true,
      webXR: ['three', 'playcanvas'].includes(engineType),
      iOSQuickLook: true,
      androidAR: true,
    };

    const newXRLink: XRLinkRecord = {
      id,
      name,
      projectId,
      sceneId,
      modelUrl: modelUrl || `${process.env.NEXT_PUBLIC_CDN_URL || baseUrl}/models/${slug}.glb`,
      thumbnailUrl,
      shareUrl,
      qrCodeUrl: generateQRCodeUrl(shareUrl),
      environment,
      arPlacement,
      passwordProtected: !!passwordProtected,
      accessPassword: passwordProtected ? accessPassword : undefined,
      viewsCount: 0,
      uniqueVisitors: 0,
      avgEngagementSecs: 0,
      status: 'active',
      expiresAt: expiresAtDate,
      createdAt: now,
      updatedAt: now,
      metadata: {
        engineType,
        entitiesCount,
        fileSizeMB,
        formats,
        arConfig: { placement: arPlacement, environment, passwordProtected: !!passwordProtected },
        delivery: deliveryCapabilities,
      }
    };

    // Save to database
    const saved = await saveXRLinkToDB(newXRLink);
    if (!saved) {
      // Fallback to in-memory
      XR_LINKS_DB.unshift(newXRLink);
    }

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