export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getTour, saveTour, resolvePublicTour, TourOwnershipError } from '@/lib/toursRepo';
import { requireAuth } from '@/lib/api-guard';
import { parseTourParams } from '@/lib/tourScope';

const isDev = process.env.NODE_ENV !== 'production';

// GET /api/tour?tour=<id-or-slug>[&experience=&project=&public=1]
//  - `public=1`      → strict public read: ONLY live + public tours (404 otherwise)
//  - editor/builder  → full editable graph for the addressed tour (auth-gated in prod)
export async function GET(req: NextRequest) {
  const { scope, isPublic } = parseTourParams(req.nextUrl.searchParams);

  if (isPublic) {
    try {
      const tour = await resolvePublicTour(scope);
      if (!tour) {
        return NextResponse.json({ error: 'Tour not found or not published' }, { status: 404 });
      }
      return NextResponse.json(tour);
    } catch (err: any) {
      return NextResponse.json({ error: err?.message || 'failed to load tour' }, { status: 500 });
    }
  }

  if (!isDev) {
    const guard = await requireAuth(req);
    if (guard.error) {
      // Unauthenticated visitor in prod: allow only live + public tours.
      try {
        const tour = await resolvePublicTour(scope);
        if (tour) return NextResponse.json(tour);
      } catch {
        /* fall through to the auth error */
      }
      return guard.error;
    }
    scope.ownerId = guard.userId;
  }

  try {
    const tour = await getTour(scope);
    return NextResponse.json(tour);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed to load tour' }, { status: 500 });
  }
}

// PUT /api/tour?tour=<id-or-slug> body: { rooms, version, title, projectId, experienceId, slug }
export async function PUT(req: NextRequest) {
  if (!isDev) {
    const guard = await requireAuth(req);
    if (guard.error) return guard.error;
  }
  try {
    const body = await req.json();
    if (!body || !Array.isArray(body.rooms)) {
      return NextResponse.json({ error: 'invalid tour payload' }, { status: 400 });
    }
    const { scope } = parseTourParams(req.nextUrl.searchParams);
    scope.experienceId = scope.experienceId ?? (typeof body.experienceId === 'string' ? body.experienceId : undefined);
    scope.projectId = scope.projectId ?? (typeof body.projectId === 'string' ? body.projectId : undefined);
    if (typeof body.slug === 'string' && body.slug) scope.slug = body.slug;
    if (typeof body.title === 'string' && body.title) scope.title = body.title;

    if (!isDev) {
      const guard = await requireAuth(req);
      if (guard.error) return guard.error;
      scope.ownerId = guard.userId;
    }

    const saved = await saveTour(body.rooms, typeof body.version === 'number' ? body.version : 1, scope);
    return NextResponse.json(saved);
  } catch (err: any) {
    if (err instanceof TourOwnershipError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: err?.message || 'failed to save tour' }, { status: 500 });
  }
}