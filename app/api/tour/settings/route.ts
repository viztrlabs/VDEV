import { NextRequest, NextResponse } from 'next/server';
import { getTourSettings, saveTourSettings } from '@/lib/toursRepo';
import { requireAuth } from '@/lib/api-guard';

// GET /api/tour/settings — admin-controlled public tour settings (live flag + feature toggles)
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const settings = await getTourSettings();
    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}

// PUT /api/tour/settings — persist admin changes (including full VTED nested object)
export async function PUT(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const body = await req.json();
    const saved = await saveTourSettings({
      live: !!body.live,
      publicUrl: typeof body.publicUrl === 'string' ? body.publicUrl : '/xr-world/virtual-tour',
      features: body.features || {},
      theme: body.theme || {},
      accessLevel: body.accessLevel === 'private' ? 'private' : 'public',
      version: typeof body.version === 'number' ? body.version : 1,
      vted: body.vted || {},
    });
    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}
