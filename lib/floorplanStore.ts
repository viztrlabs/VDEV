import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { VtedFloorplan } from '@/lib/vted-types';

const DATA_DIR = path.join(process.cwd(), '.data', 'tour');
const FLOORPLANS_FILE = path.join(DATA_DIR, 'floorplans.json');

interface FloorplanStore {
  version: number;
  floorplans: VtedFloorplan[];
}

const DEFAULT_STORE: FloorplanStore = {
  version: 1,
  floorplans: [],
};

export async function getFloorplans(): Promise<VtedFloorplan[]> {
  try {
    const raw = await fs.readFile(FLOORPLANS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as FloorplanStore;
    if (parsed && Array.isArray(parsed.floorplans)) return parsed.floorplans;
  } catch {
    // no file yet
  }
  return DEFAULT_STORE.floorplans;
}

export async function getFloorplan(id: string): Promise<VtedFloorplan | null> {
  const list = await getFloorplans();
  return list.find((f) => f.id === id) || null;
}

export async function createFloorplan(input: Omit<VtedFloorplan, 'id' | 'createdAt' | 'updatedAt'>): Promise<VtedFloorplan> {
  const list = await getFloorplans();
  const now = new Date().toISOString();
  const fp: VtedFloorplan = {
    ...input,
    id: `fp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: now,
    updatedAt: now,
  };
  list.unshift(fp);
  await saveFloorplans(list);
  return fp;
}

export async function updateFloorplan(id: string, patch: Partial<VtedFloorplan>): Promise<VtedFloorplan | null> {
  const list = await getFloorplans();
  const idx = list.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
  await saveFloorplans(list);
  return list[idx];
}

export async function deleteFloorplan(id: string): Promise<boolean> {
  const list = await getFloorplans();
  const next = list.filter((f) => f.id !== id);
  if (next.length === list.length) return false;
  await saveFloorplans(next);
  return true;
}

async function saveFloorplans(list: VtedFloorplan[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    FLOORPLANS_FILE,
    JSON.stringify({ version: 1, floorplans: list } satisfies FloorplanStore, null, 2),
    'utf8',
  );
}
