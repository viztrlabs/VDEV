/**
 * @jest-environment node
 *
 * Tests the P0-3/P0-2 contract of lib/toursRepo:
 *  - deterministic per-tour addressing (never "global newest")
 *  - two-tour isolation: saving/editing/settings/views on one tour never touch another
 *  - ownership guard rejects cross-owner writes
 *  - stable slug identity survives round-trips
 *  - the local fallback actually persists (regression: it used to be a no-op)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  getTour,
  saveTour,
  getTourSettings,
  saveTourSettings,
  getTourViews,
  onTourView,
  TourOwnershipError,
} from '@/lib/toursRepo';
import { makeFakeSupabaseClient, FAKE_USER_ID } from '../test-helpers/fakeSupabaseClient';
import type { TourRoom } from '@/components/viewers/PanoramaViewer';

function room(id: string, name: string, url: string): TourRoom {
  return {
    id,
    name,
    subtitle: '',
    panoramaUrl: url,
    thumbnailUrl: url,
    initialYaw: 180,
    initialPitch: 0,
    defaultHotspots: [],
  };
}

const roomsA: TourRoom[] = [room('r1', 'Living', '/a1.jpg')];
const roomsB: TourRoom[] = [room('r2', 'Kitchen', '/b1.jpg')];

const ORIGINAL_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ORIGINAL_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ORIGINAL_TOUR_DIR = process.env.TOUR_STORE_DIR;

function withLocalDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tourstore-'));
  process.env.TOUR_STORE_DIR = dir;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  return dir;
}

afterEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGINAL_URL;
  process.env.SUPABASE_SERVICE_ROLE_KEY = ORIGINAL_SERVICE;
  process.env.TOUR_STORE_DIR = ORIGINAL_TOUR_DIR;
});

describe('toursRepo (Supabase path, injected fake client)', () => {
  it('creates isolated rows per tour and keeps slugs distinct', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);

    const a = await saveTour(roomsA, 1, { title: 'Tour Alpha', slug: 'tour-alpha-1', ownerId: 'u1' }, client);
    const b = await saveTour(roomsB, 1, { title: 'Tour Beta', slug: 'tour-beta-1', ownerId: 'u1' }, client);

    expect(rows).toHaveLength(2);
    expect(a.slug).toBe('tour-alpha-1');
    expect(b.slug).toBe('tour-beta-1');
    expect(a.id).not.toBe(b.id);
  });

  it('two-tour isolation: editing tour A never clobbers tour B', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    await saveTour(roomsA, 1, { slug: 'tour-alpha-1', title: 'Alpha' }, client);
    await saveTour(roomsB, 1, { slug: 'tour-beta-1', title: 'Beta' }, client);

    const editedA = [...roomsA];
    editedA[0] = { ...roomsA[0], name: 'Renamed Living' };
    await saveTour(editedA, 2, { slug: 'tour-alpha-1' }, client);

    const reloadedA = await getTour({ slug: 'tour-alpha-1' }, client);
    const reloadedB = await getTour({ slug: 'tour-beta-1' }, client);

    expect(reloadedA.version).toBe(2);
    expect(reloadedA.rooms[0].name).toBe('Renamed Living');
    expect(reloadedB.version).toBe(1);
    expect(reloadedB.rooms).toEqual(roomsB);
  });

  it('second tour in the SAME project with a different experienceId does not clobber the first', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);

    await saveTour(roomsA, 1, { projectId: 'proj-x', experienceId: 'exp-a', title: 'A' }, client);
    await saveTour(roomsB, 1, { projectId: 'proj-x', experienceId: 'exp-b', title: 'B' }, client);

    expect(rows).toHaveLength(2);

    const ra = await getTour({ projectId: 'proj-x', experienceId: 'exp-a' }, client);
    const rb = await getTour({ projectId: 'proj-x', experienceId: 'exp-b' }, client);
    expect(ra.rooms).toEqual(roomsA);
    expect(rb.rooms).toEqual(roomsB);
  });

  it('scopes a project-only lookup to that project\u2019s tours (identity jsonb)', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    await saveTour(roomsA, 1, { projectId: 'proj-1', experienceId: 'exp-a', title: 'A' }, client);
    await saveTour(roomsB, 1, { projectId: 'proj-2', experienceId: 'exp-b', title: 'B' }, client);

    const ra = await getTour({ projectId: 'proj-1' }, client);
    expect(ra.rooms).toEqual(roomsA);
  });

  it('experienceId never adopts a row claimed by another project', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    // Project 1 claims the single legacy (unclaimed) row first.
    await saveTour(roomsA, 1, { projectId: 'proj-1', experienceId: 'legacy', title: 'Legacy' }, client);
    expect(rows).toHaveLength(1);

    // Project 2 saving with a different experienceId must NOT reuse that row.
    const b = await saveTour(roomsB, 1, { projectId: 'proj-2', experienceId: 'exp-b', title: 'B' }, client);
    expect(rows).toHaveLength(2);
    expect(b.id).not.toBe(rows[0].id);
    expect(rows[1].data?.identity?.projectId).toBe('proj-2');
    expect(rows[0].data?.identity?.projectId).toBe('proj-1');
  });

  it('inserts with the fallback owner when no ownerId is provided (dev path)', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    await saveTour(roomsA, 1, { slug: 'tour-alpha-1', title: 'Alpha' }, client);

    expect(rows[0].owner_id).toBe(FAKE_USER_ID);
    // A later save with a real owner must not silently take over the row.
    await expect(
      saveTour(roomsB, 2, { slug: 'tour-alpha-1', ownerId: 'u-real', title: 'Alpha' }, client),
    ).rejects.toBeInstanceOf(TourOwnershipError);
  });

  it('resolves by id or slug, never by global newest row', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    await saveTour(roomsA, 1, { slug: 'tour-alpha-1', title: 'Alpha' }, client);
    await saveTour(roomsB, 5, { slug: 'tour-beta-1', title: 'Beta' }, client);

    const byIdA = await getTour({ tourId: rows[0].id }, client);
    const byIdB = await getTour({ tourId: rows[1].id }, client);
    expect(byIdA.slug).toBe('tour-alpha-1');
    expect(byIdB.slug).toBe('tour-beta-1');
    expect(byIdA.rooms).toEqual(roomsA);
    expect(byIdB.rooms).toEqual(roomsB);
  });

  it('rejects a write to another owner\u2019s tour', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    await saveTour(roomsA, 1, { slug: 'tour-alpha-1', ownerId: 'u1', title: 'Alpha' }, client);

    await expect(
      saveTour(roomsB, 2, { slug: 'tour-alpha-1', ownerId: 'u2' }, client),
    ).rejects.toBeInstanceOf(TourOwnershipError);
  });

  it('persists per-tour settings without leaking into other tours', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    await saveTour(roomsA, 1, { slug: 'tour-alpha-1', title: 'Alpha' }, client);
    await saveTour(roomsB, 1, { slug: 'tour-beta-1', title: 'Beta' }, client);

    await saveTourSettings({ live: false }, { slug: 'tour-alpha-1' }, client);
    await saveTourSettings({ live: true, accessLevel: 'private' }, { slug: 'tour-beta-1' }, client);

    const alpha = await getTourSettings({ slug: 'tour-alpha-1' }, client);
    const beta = await getTourSettings({ slug: 'tour-beta-1' }, client);
    expect(alpha.settings.live).toBe(false);
    expect(beta.settings.live).toBe(true);
    expect(beta.settings.accessLevel).toBe('private');
  });

  it('settings saves keep the tour rooms intact (no clobber)', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    await saveTour(roomsA, 1, { slug: 'tour-alpha-1', title: 'Alpha' }, client);
    await saveTourSettings({ live: true }, { slug: 'tour-alpha-1' }, client);

    const reloaded = await getTour({ slug: 'tour-alpha-1' }, client);
    expect(reloaded.rooms).toEqual(roomsA);
    expect(reloaded.version).toBe(1);
  });

  it('views are scoped per tour and never clobber rooms', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    await saveTour(roomsA, 1, { slug: 'tour-alpha-1', title: 'Alpha' }, client);

    const v1 = await onTourView({ slug: 'tour-alpha-1' }, client);
    const v2 = await onTourView({ slug: 'tour-alpha-1' }, client);
    expect(v1.views).toBe(1);
    expect(v2.views).toBe(2);

    const other = await getTourViews({ slug: 'tour-beta-1' }, client);
    expect(other.views).toBe(0);

    const untouched = await getTour({ slug: 'tour-alpha-1' }, client);
    expect(untouched.rooms).toEqual(roomsA);
    expect(untouched.version).toBe(1);
  });
});

describe('toursRepo (local fallback path)', () => {
  it('persists per-tour files so a save is no longer a no-op', async () => {
    const dir = withLocalDir();

    await saveTour(roomsA, 1, { slug: 'tour-alpha-1', title: 'Alpha' });
    const reloaded = await getTour({ slug: 'tour-alpha-1' });

    expect(reloaded.rooms).toEqual(roomsA);
    expect(reloaded.version).toBe(1);

    const files = fs.readdirSync(path.join(dir));
    expect(files.some((f) => f.startsWith('tour-') && f.endsWith('.json'))).toBe(true);
  });

  it('isolates local tours from each other by slug', async () => {
    withLocalDir();

    await saveTour(roomsA, 1, { slug: 'tour-alpha-1', title: 'Alpha' });
    await saveTour(roomsB, 1, { slug: 'tour-beta-1', title: 'Beta' });

    const editedA = [...roomsA];
    editedA[0] = { ...roomsA[0], name: 'Edited Only A' };
    await saveTour(editedA, 2, { slug: 'tour-alpha-1' });

    const ra = await getTour({ slug: 'tour-alpha-1' });
    const rb = await getTour({ slug: 'tour-beta-1' });
    expect(ra.rooms[0].name).toBe('Edited Only A');
    expect(rb.rooms).toEqual(roomsB);
    expect(rb.version).toBe(1);
  });

  it('persists local per-tour settings files', async () => {
    withLocalDir();

    const saved = await saveTourSettings({ live: false }, { slug: 'tour-alpha-1' });
    expect(saved.settings.live).toBe(false);

    const loaded = await getTourSettings({ slug: 'tour-alpha-1' });
    expect(loaded.settings.live).toBe(false);
  });
});