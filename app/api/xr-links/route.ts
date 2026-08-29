import { NextRequest, NextResponse } from 'next/server';

export interface XRLinkRecord {
  id: string;
  name: string;
  projectId: string;
  modelUrl: string;
  shareUrl: string;
  qrCodeUrl: string;
  environment: 'studio' | 'sunset' | 'urban' | 'interior';
  arPlacement: 'floor' | 'tabletop' | 'wall';
  passwordProtected: boolean;
  accessPassword?: string;
  viewsCount: number;
  uniqueVisitors: number;
  avgEngagementSecs: number;
  status: 'active' | 'expired' | 'revoked';
  expiresAt: string;
  createdAt: string;
}

let XR_LINKS_DB: XRLinkRecord[] = [
  {
    id: 'xr_link_01',
    name: 'Lumina Sky Atrium — WebXR Spatial Tour',
    projectId: 'PRJ-VTR-8821',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
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
  },
  {
    id: 'xr_link_02',
    name: 'Aura Waterfront Organic Pavilion — AR QuickLook',
    projectId: 'PRJ-VTR-9042',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
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
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const status = searchParams.get('status');
  const query = searchParams.get('q')?.toLowerCase();

  let filtered = [...XR_LINKS_DB];
  if (projectId) {
    filtered = filtered.filter((x) => x.projectId === projectId);
  }
  if (status && status !== 'ALL') {
    filtered = filtered.filter((x) => x.status === status);
  }
  if (query) {
    filtered = filtered.filter(
      (x) =>
        x.name.toLowerCase().includes(query) ||
        x.shareUrl.toLowerCase().includes(query) ||
        x.projectId.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({ success: true, count: filtered.length, xrLinks: filtered });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = `xr_${Date.now()}`;
    const slug = body.name ? body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `spatial-${Date.now()}`;
    const shareUrl = `https://viztr.studio/xr/${slug}`;

    const newXRLink: XRLinkRecord = {
      id,
      name: body.name || 'New WebXR Experience',
      projectId: body.projectId || 'PRJ-VTR-8821',
      modelUrl: body.modelUrl || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
      shareUrl,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`,
      environment: body.environment || 'studio',
      arPlacement: body.arPlacement || 'floor',
      passwordProtected: !!body.passwordProtected,
      accessPassword: body.accessPassword || '',
      viewsCount: 0,
      uniqueVisitors: 0,
      avgEngagementSecs: 0,
      status: 'active',
      expiresAt: body.expiresAt || new Date(Date.now() + 90 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    XR_LINKS_DB.unshift(newXRLink);
    return NextResponse.json({ success: true, xrLink: newXRLink }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'XR Link ID is required' }, { status: 400 });
  }

  const initialLength = XR_LINKS_DB.length;
  XR_LINKS_DB = XR_LINKS_DB.filter((x) => x.id !== id);

  if (XR_LINKS_DB.length === initialLength) {
    return NextResponse.json({ success: false, error: 'XR Link not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: `XR Link ${id} deleted successfully` });
}
