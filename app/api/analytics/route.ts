import { NextRequest, NextResponse } from 'next/server';

// Analytics ingestion endpoint. Receives batched events + performance samples
// from the client AnalyticsEngine (see components/xr/analytics/analyticsEngine.ts)
// and stores them. In production this would write to a warehouse / queue; here
// we keep an in-memory ring buffer (process-scoped) and also log for visibility.

interface IngestBody {
  events?: Array<Record<string, unknown>>;
  perf?: Array<Record<string, unknown>>;
  recommendations?: Array<Record<string, unknown>>;
  sessionId?: string;
}

const RING: Array<Record<string, unknown>> = [];
const MAX = 1000;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as IngestBody;
    const ts = Date.now();
    const sessionId = body.sessionId || 'unknown';

    for (const e of body.events ?? []) RING.push({ kind: 'event', sessionId, ts, ...e });
    for (const p of body.perf ?? []) RING.push({ kind: 'perf', sessionId, ts, ...p });
    for (const r of body.recommendations ?? []) RING.push({ kind: 'rec', sessionId, ts, ...r });

    while (RING.length > MAX) RING.shift();

    return NextResponse.json({ success: true, ingested: (body.events?.length ?? 0) + (body.perf?.length ?? 0) });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'bad request' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, count: RING.length, recent: RING.slice(-25) });
}
