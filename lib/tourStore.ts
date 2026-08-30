import { promises as fs } from 'node:fs';
import path from 'node:path';
import { LOCAL_TOUR_ROOMS } from './localTour';

// Editable tour persistence. The tour graph (nodes + their hotspots, including
// 1->many portal links) is stored as JSON on disk so the dedicated editor can
// CRUD it and the viewer can load the saved version. Falls back to the seeded
// LOCAL_TOUR_ROOMS when no saved file exists yet.

export interface SavedTour {
  version: number;
  rooms: typeof LOCAL_TOUR_ROOMS;
}

const DATA_DIR = path.join(process.cwd(), '.data', 'tour');
const TOUR_FILE = path.join(DATA_DIR, 'local-tour.json');

export async function getTour(): Promise<SavedTour> {
  try {
    const raw = await fs.readFile(TOUR_FILE, 'utf8');
    const parsed = JSON.parse(raw) as SavedTour;
    if (parsed && Array.isArray(parsed.rooms)) return parsed;
  } catch {
    // no saved tour yet — seed from the hardcoded local tour
  }
  const seeded: SavedTour = { version: 1, rooms: LOCAL_TOUR_ROOMS };
  await saveTour(seeded);
  return seeded;
}

export async function saveTour(tour: SavedTour): Promise<SavedTour> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(TOUR_FILE, JSON.stringify(tour, null, 2), 'utf8');
  return tour;
}
