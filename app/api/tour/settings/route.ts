export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getTourSettings, saveTourSettings, TourOwnershipError } from '@/lib/toursRepo';
import { requireAuth } from '@/lib/api-guard';
import { parseTourParams } from '@/lib/tourScope';

const isDev = process.env.NODE_ENV !== 'production';

// GET /api/tour/settings?tour=<id-or-slug>[&experience=&project=] —
// per-tour admin settings (live flag + feature toggles). Returns the stable
// slug so clients can build the canonical public URL.
export async function GET(req: NextRequest) {
  const { scope } = parseTourParams(req.nextUrl.searchParams);
  if (!isDev) {
    const guard = await requireAuth(req);
    if (guard.error) return guard.error;
    scope.ownerId = guard.userId;
  }
  try {
    const bundle = await getTourSettings(scope);
    return NextResponse.json(bundle);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}

// PUT /api/tour/settings?tour=<id-or-slug> — persist publish state per tour.
export async function PUT(req: NextRequest) {
  const { scope } = parseTourParams(req.nextUrl.searchParams);
  if (!isDev) {
    const guard = await requireAuth(req);
    if (guard.error) return guard.error;
    scope.ownerId = guard.userId;
  }
  try {
    const body = await req.json();
    const existing = await getTourSettings(scope);
    const slug = scope.slug ?? existing.slug;
    const saved = await saveTourSettings(
      {
        live: typeof body.live === 'boolean' ? body.live : existing.settings.live,
        publicUrl:
          typeof body.publicUrl === 'string' && body.publicUrl
            ? body.publicUrl
            : slug
              ? `/virtual-tour/${slug}`
              : existing.settings.publicUrl,
        features: body.features
          ? { ...existing.settings.features, ...body.features }
          : existing.settings.features,
        theme: body.theme
          ? { ...existing.settings.theme, ...body.theme }
          : existing.settings.theme,
        accessLevel:
          typeof body.accessLevel === 'string'
            ? body.accessLevel === 'private'
              ? 'private'
              : 'public'
            : existing.settings.accessLevel,
        version:
          typeof body.version === 'number' ? body.version : existing.settings.version,
        vted: body.vted ? { ...(existing.settings.vted || {}), ...body.vted } : existing.settings.vted,
      },
      scope,
    );
    return NextResponse.json(saved);
  } catch (err: any) {
    if (err instanceof TourOwnershipError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}