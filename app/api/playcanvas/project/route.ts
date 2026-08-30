import { NextRequest, NextResponse } from 'next/server';

// PlayCanvas Cloud API integration.
// Reads the API key from PLAYCANVAS_API_KEY (server env) and proxies a request
// to the PlayCanvas REST API for a given project id. The project id is passed
// via ?projectId= or falls back to PLAYCANVAS_PROJECT_ID.
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
