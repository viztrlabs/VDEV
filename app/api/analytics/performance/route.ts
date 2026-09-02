import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

interface PerfBody {
  timestamp?: number;
  sessionId?: string;
  metrics?: Array<{
    name: string;
    value: number;
    unit: string;
    timestamp: number;
    route?: string;
    context?: Record<string, unknown>;
  }>;
  summary?: Record<string, { avg: number; min: number; max: number; count: number }>;
}

const DATA_DIR = path.join(process.cwd(), '.data', 'analytics');
const PERF_FILE = path.join(DATA_DIR, 'performance.jsonl');
const MAX_BYTES = 5 * 1024 * 1024;

async function appendJsonl(line: string) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(PERF_FILE, line + '\n', 'utf8');
    const stat = await fs.stat(PERF_FILE).catch(() => null);
    if (stat && stat.size > MAX_BYTES) {
      const rolled = path.join(DATA_DIR, `performance-${Date.now()}.jsonl`);
      await fs.rename(PERF_FILE, rolled).catch(() => undefined);
    }
  } catch {
    /* best-effort */
  }
}

export async function POST(req: NextRequest) {
  // Accept both text/plain (sendBeacon) and application/json
  let body: PerfBody = {};
  try {
    const ct = req.headers.get('content-type') ?? '';
    const raw = await req.text();
    if (ct.includes('application/json')) {
      body = raw ? JSON.parse(raw) : {};
    } else {
      // sendBeacon typically sends as text/plain; try to parse anyway
      try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }
    }
  } catch {
    body = {};
  }

  const ts = Date.now();
  const sessionId = body.sessionId || 'unknown';

  const records: string[] = [];
  for (const m of body.metrics ?? []) {
    records.push(JSON.stringify({ kind: 'metric', sessionId, ts, ...m }));
  }
  if (body.summary) {
    records.push(JSON.stringify({ kind: 'summary', sessionId, ts, summary: body.summary }));
  }

  if (records.length > 0) {
    await appendJsonl(records.join('\n'));
  }

  return NextResponse.json({ success: true, ingested: records.length });
}

export async function GET() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const buf = await fs.readFile(PERF_FILE, 'utf8').catch(() => '');
    const lines = buf.split('\n').filter(Boolean).slice(-25);
    const recent = lines.map((l) => { try { return JSON.parse(l); } catch { return {}; } });
    return NextResponse.json({ success: true, count: recent.length, recent });
  } catch (err) {
    const e = err as Error;
    return NextResponse.json({ success: false, error: e?.message ?? 'read failed' }, { status: 500 });
  }
}
