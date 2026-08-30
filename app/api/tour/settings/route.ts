import { NextRequest, NextResponse } from 'next/server';
import { getTourSettings, saveTourSettings } from '@/lib/tourSettings';

// GET /api/tour/settings — admin-controlled public tour settings (live flag + feature toggles)
export async function GET() {
  try {
    const settings = await getTourSettings();
    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}

// PUT /api/tour/settings — persist admin changes
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const saved = await saveTourSettings({
      live: !!body.live,
      publicUrl: typeof body.publicUrl === 'string' ? body.publicUrl : '/xr-world/virtual-tour',
      features: body.features || {},
      theme: body.theme || {},
      accessLevel: body.accessLevel === 'private' ? 'private' : 'public',
      version: typeof body.version === 'number' ? body.version : 1,
    });
    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}
