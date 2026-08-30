import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// Analytics ingestion endpoint. Receives batched events + performance samples
// from the client AnalyticsEngine (see components/xr/analytics/analyticsEngine.ts).
//
// Local feature build: events are persisted to a JSONL file under .data/analytics
// so telemetry survives server restarts without requiring an external DB. In a
// later production phase this can be swapped for a warehouse / queue.

interface IngestBody {
  events?: Array<Record<string, unknown>>;
  perf?: Array<Record<string, unknown>>;
  recommendations?: Array<Record<string, unknown>>;
  sessionId?: string;
}

const DATA_DIR = path.join(process.cwd(), '.data', 'analytics');
const DATA_FILE = path.join(DATA_DIR, 'events.jsonl');
const MAX_FILE_BYTES = 5 * 1024 * 1024; // roll at 5MB

async function append(line: string) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(DATA_FILE, line + '\n', 'utf8');
  } catch {
    /* best-effort persistence */
  }
}

async function readRecent(limit: number): Promise<Array<Record<string, unknown>>> {
  try {
    const buf = await fs.readFile(DATA_FILE, 'utf8');
    const lines = buf.split('\n').filter(Boolean).slice(-limit);
    return lines.map((l) => {
      try { return JSON.parse(l); } catch { return {}; }
    });
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as IngestBody;
    const ts = Date.now();
    const sessionId = body.sessionId || 'unknown';

    const writes: string[] = [];
    for (const e of body.events ?? []) writes.push(JSON.stringify({ kind: 'event', sessionId, ts, ...e }));
    for (const p of body.perf ?? []) writes.push(JSON.stringify({ kind: 'perf', sessionId, ts, ...p }));
    for (const r of body.recommendations ?? []) writes.push(JSON.stringify({ kind: 'rec', sessionId, ts, ...r }));

    await append(writes.join('\n'));

    return NextResponse.json({ success: true, ingested: writes.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'bad request' }, { status: 400 });
  }
}

export async function GET() {
  const recent = await readRecent(25);
  return NextResponse.json({ success: true, count: recent.length, recent });
}
