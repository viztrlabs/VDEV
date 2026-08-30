import { NextRequest, NextResponse } from 'next/server';

// DORMANT PlayCanvas Cloud API integration.
// The engine + scenes run fully LOCAL (node_modules/playcanvas + /assets/), so
// this is NOT required for the viewer to function. It only reflects a published
// project's NAME/VERSION from the cloud editor for the HUD, and only when
// PLAYCANVAS_API_KEY + PLAYCANVAS_PROJECT_ID are set. Leave them unset to keep
// the cloud API fully inactive. Activate only when syncing published builds.
//
// Docs: https://developer.playcanvas.com/user-manual/api/
const PLAYCANVAS_BASE = 'https://playcanvas.com/api';

export async function GET(req: NextRequest) {
  const apiKey = process.env.PLAYCANVAS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'PLAYCANVAS_API_KEY not configured on server' },
      { status: 500 }
    );
  }

  const projectId = req.nextUrl.searchParams.get('projectId') || process.env.PLAYCANVAS_PROJECT_ID;
  if (!projectId) {
    return NextResponse.json({ success: false, error: 'projectId required (?projectId=)' }, { status: 400 });
  }

  try {
    const res = await fetch(`${PLAYCANVAS_BASE}/projects/${encodeURIComponent(projectId)}?branchId=*,`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ success: false, status: res.status, error: text.slice(0, 300) }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json({ success: true, project: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'request failed' }, { status: 502 });
  }
}
