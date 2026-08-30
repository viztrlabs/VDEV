import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// GET /api/tour/views — total public tour opens (for the admin analytics counter)
// POST /api/tour/views — increment the counter when a visitor opens the tour
const DATA_DIR = path.join(process.cwd(), '.data', 'tour');
const VIEWS_FILE = path.join(DATA_DIR, 'views.json');

async function readCount(): Promise<number> {
  try {
    const raw = await fs.readFile(VIEWS_FILE, 'utf8');
    return (JSON.parse(raw).count as number) || 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  return NextResponse.json({ count: await readCount() });
}

export async function POST() {
  try {
    const count = (await readCount()) + 1;
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(VIEWS_FILE, JSON.stringify({ count }), 'utf8');
    return NextResponse.json({ count });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}
