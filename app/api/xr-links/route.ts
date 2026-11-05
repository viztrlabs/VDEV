export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/api-guard';
import {
  XR_LINKS_DB,
  getXRLinksFromDB,
  saveXRLinkToDB,
  deleteXRLinkFromDB,
  buildXRLinkRecord,
} from '@/lib/xr-links-store';

const CreateXRLinkSchema = z.object({
  name: z.string().min(1).max(255),
  projectId: z.string().min(1),
  sceneId: z.string().max(255).optional(),
  modelUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  slug: z.string().max(255).optional(),
  environment: z.string().optional(),
  arPlacement: z.string().optional(),
  passwordProtected: z.boolean().optional(),
  accessPassword: z.string().max(255).optional(),
  expiresAt: z.string().optional(),
  engineType: z.string().optional(),
  entitiesCount: z.number().int().optional(),
  fileSizeMB: z.number().optional(),
  formats: z.array(z.string()).optional(),
});

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

  // SECURITY: Non-admin users must scope by projectId to prevent IDOR
  if (!projectId && guard.role !== 'super_admin') {
    return NextResponse.json({ success: true, count: 0, total: 0, xrLinks: [] });
  }

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
    const parsed = CreateXRLinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { name, projectId, sceneId, modelUrl, thumbnailUrl, slug,
      environment, arPlacement, passwordProtected, accessPassword,
      expiresAt, engineType, entitiesCount, fileSizeMB, formats } = parsed.data;

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

    // SECURITY: Whitelist allowed fields to prevent mass assignment
    const allowedFields = ['title', 'description', 'slug', 'type', 'url', 'status', 'metadata', 'projectId', 'expiresAt'];
    const safeUpdates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        safeUpdates[field] = updates[field];
      }
    }

    let links = await getXRLinksFromDB();
    const index = links.findIndex((x) => x.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'XR Link not found' }, { status: 404 });
    }

    const updatedLink = {
      ...links[index],
      ...safeUpdates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
      metadata: {
        ...links[index].metadata,
        ...(safeUpdates.metadata || {}),
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