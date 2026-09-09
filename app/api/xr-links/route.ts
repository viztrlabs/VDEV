import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface XRLinkRecord {
  id: string;
  name: string;
  projectId: string;
  sceneId?: string;
  modelUrl: string;
  thumbnailUrl?: string;
  shareUrl: string;
  qrCodeUrl: string;
  environment: 'studio' | 'sunset' | 'urban' | 'interior';
  arPlacement: 'floor' | 'tabletop' | 'wall' | 'image';
  passwordProtected: boolean;
  accessPassword?: string;
  viewsCount: number;
  uniqueVisitors: number;
  avgEngagementSecs: number;
  status: 'draft' | 'active' | 'expired' | 'revoked' | 'processing';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    engineType: string;
    entitiesCount: number;
    fileSizeMB: number;
    formats: string[];
    arConfig: {
      placement: string;
      environment: string;
      passwordProtected: boolean;
    };
    delivery: {
      webAR: boolean;
      webXR: boolean;
      iOSQuickLook: boolean;
      androidAR: boolean;
    };
  };
}

// In-memory fallback (will be replaced by Supabase)
let XR_LINKS_DB: XRLinkRecord[] = [];

// Initialize with sample data if empty
if (XR_LINKS_DB.length === 0) {
  XR_LINKS_DB = [
    {
      id: 'xr_link_01',
      name: 'Lumina Sky Atrium — WebXR Spatial Tour',
      projectId: 'PRJ-VTR-8821',
      sceneId: 'scene_lumina_01',
      modelUrl: 'https://cdn.viztr.studio/models/lumina-sky-atrium.glb',
      thumbnailUrl: 'https://cdn.viztr.studio/thumbs/lumina-sky-atrium.jpg',
      shareUrl: 'https://viztr.studio/xr/lumina-sky-atrium',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://viztr.studio/xr/lumina-sky-atrium',
      environment: 'interior',
      arPlacement: 'floor',
      passwordProtected: true,
      accessPassword: 'LUMINA-2025-XR',
      viewsCount: 428,
      uniqueVisitors: 312,
      avgEngagementSecs: 184,
      status: 'active',
      expiresAt: '2025-12-31T23:59:59Z',
      createdAt: '2025-06-10T11:00:00Z',
      updatedAt: '2025-06-10T11:00:00Z',
      metadata: {
        engineType: 'three',
        entitiesCount: 142,
        fileSizeMB: 24.5,
        formats: ['glb', 'usdz', 'gltf'],
        arConfig: { placement: 'floor', environment: 'interior', passwordProtected: true },
        delivery: { webAR: true, webXR: true, iOSQuickLook: true, androidAR: true }
      }
    },
    {
      id: 'xr_link_02',
      name: 'Aura Waterfront Organic Pavilion — AR QuickLook',
      projectId: 'PRJ-VTR-9042',
      sceneId: 'scene_aura_01',
      modelUrl: 'https://cdn.viztr.studio/models/aura-pavilion.glb',
      thumbnailUrl: 'https://cdn.viztr.studio/thumbs/aura-pavilion.jpg',
      shareUrl: 'https://viztr.studio/xr/aura-pavilion',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://viztr.studio/xr/aura-pavilion',
      environment: 'sunset',
      arPlacement: 'tabletop',
      passwordProtected: false,
      viewsCount: 684,
      uniqueVisitors: 540,
      avgEngagementSecs: 215,
      status: 'active',
      expiresAt: '2025-11-30T23:59:59Z',
      createdAt: '2025-06-25T14:30:00Z',
      updatedAt: '2025-06-25T14:30:00Z',
      metadata: {
        engineType: 'playcanvas',
        entitiesCount: 89,
        fileSizeMB: 18.2,
        formats: ['glb', 'usdz'],
        arConfig: { placement: 'tabletop', environment: 'sunset', passwordProtected: false },
        delivery: { webAR: true, webXR: false, iOSQuickLook: true, androidAR: true }
      }
    },
  ];
}

async function getXRLinksFromDB() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('xr_links')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        return data as XRLinkRecord[];
      }
    } catch (err) {
      console.warn('[XR Links] Supabase fetch failed:', err);
    }
  }
  return XR_LINKS_DB;
}

async function saveXRLinkToDB(link: XRLinkRecord) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('xr_links')
        .upsert(link, { onConflict: 'id' });
      
      if (error) {
        console.warn('[XR Links] Supabase upsert failed:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[XR Links] Supabase upsert error:', err);
      return false;
    }
  }
  return false;
}

async function deleteXRLinkFromDB(id: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('xr_links')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.warn('[XR Links] Supabase delete failed:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[XR Links] Supabase delete error:', err);
      return false;
    }
  }
  return false;
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function generateQRCodeUrl(data: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
}

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
      XR_LINKS_DB = links;
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
    XR_LINKS_DB = links;
  }

  return NextResponse.json({ success: true, message: `XR Link ${id} deleted successfully` });
}