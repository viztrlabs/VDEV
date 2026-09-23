import { promises as fs } from 'node:fs';
import path from 'node:path';
import { LOCAL_TOUR_ROOMS } from './localTour';
import { sanitizeKeyForFile } from './tourIdentity';

// Editable tour persistence. The tour graph (nodes + their hotspots, including
// 1->many portal links) is stored as JSON on disk so the dedicated editor can
// CRUD it and the viewer can load the saved version. Each tour is namespaced
// by its identity key (tourId/slug/experienceId/...) so multiple tours never
// clobber each other — the P0-3 global-collision fix. Falls back to the
// seeded LOCAL_TOUR_ROOMS when no saved file exists yet.

export interface SavedTour {
  version: number;
  rooms: typeof LOCAL_TOUR_ROOMS;
  views?: number;
}

function dataDir(): string {
  return process.env.TOUR_STORE_DIR || path.join(process.cwd(), '.data', 'tour');
}

function filePath(key?: string): string {
  const name = key ? `tour-${sanitizeKeyForFile(key)}.json` : 'local-tour.json';
  return path.join(dataDir(), name);
}

export async function getTour(key?: string): Promise<SavedTour> {
  const existing = await readTour(key);
  if (existing) return existing;
  const seeded: SavedTour = { version: 1, rooms: LOCAL_TOUR_ROOMS };
  await saveTour(seeded, key);
  return seeded;
}

// Non-seeding read: returns null when no saved file exists (used by the strict
// public-read path so a random slug never materializes a seeded tour).
export async function readTour(key?: string): Promise<SavedTour | null> {
  try {
    const raw = await fs.readFile(filePath(key), 'utf8');
    const parsed = JSON.parse(raw) as SavedTour;
    if (parsed && Array.isArray(parsed.rooms)) return parsed;
  } catch {
    // not saved yet
  }
  return null;
}

export async function saveTour(tour: SavedTour, key?: string): Promise<SavedTour> {
  await fs.mkdir(dataDir(), { recursive: true });
  await fs.writeFile(filePath(key), JSON.stringify(tour, null, 2), 'utf8');
  return tour;
}