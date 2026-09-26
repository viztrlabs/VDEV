/**
 * @jest-environment node
 *
 * F1 regression coverage (see docs/superpowers/plans/2026-09-24-tour-dev-audit-report.md):
 * an EMPTY TourScope must resolve to null — never to the first/oldest row, never to
 * an arbitrary tour. Valid identity scopes keep resolving exactly as before.
 */
import {
  resolveTourRow,
  saveTour,
  saveTourSettings,
  resolvePublicTour,
} from '@/lib/toursRepo';
import { makeFakeSupabaseClient } from '../test-helpers/fakeSupabaseClient';
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

const roomsA: TourRoom[] = [room('r1', 'Alpha Room', '/a1.jpg')];
const roomsB: TourRoom[] = [room('r2', 'Beta Room', '/b1.jpg')];

async function seedTwoTours(client: any) {
  await saveTour(roomsA, 1, { slug: 'tour-alpha', projectId: 'proj_a', experienceId: 'exp_a', title: 'Alpha' }, client);
  await saveTour(roomsB, 1, { slug: 'tour-beta', projectId: 'proj_b', experienceId: 'exp_b', title: 'Beta' }, client);
}

describe('resolveTourRow — empty scope never resolves a tour (F1)', () => {
  it('Test A: empty scope resolves to null', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    await seedTwoTours(client);

    await expect(resolveTourRow({}, client)).resolves.toBeNull();
  });

  it('Test F: with two tours present, empty scope is NOT the first row', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    await seedTwoTours(client);
    expect(rows).toHaveLength(2);

    const result = await resolveTourRow({}, client);
    expect(result).toBeNull();
    expect(result).not.toBe(rows[0]);
  });

  it('public path: resolvePublicTour({}) is null even after publishing a tour', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    await seedTwoTours(client);
    await saveTourSettings({ live: true, accessLevel: 'public' }, { slug: 'tour-alpha' }, client);

    await expect(resolvePublicTour({}, client)).resolves.toBeNull();
    await expect(resolvePublicTour({ slug: 'does-not-exist' }, client)).resolves.toBeNull();
    // The published tour itself stays reachable by its real slug.
    const published = await resolvePublicTour({ slug: 'tour-alpha' }, client);
    expect(published?.slug).toBe('tour-alpha');
  });

  it('Test B: valid project-only scope still resolves that project tour', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    await seedTwoTours(client);

    const row = await resolveTourRow({ projectId: 'proj_a' }, client);
    expect(row?.slug).toBe('tour-alpha');
  });

  it('Test C: valid experience scope still resolves by experience', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    await seedTwoTours(client);

    const row = await resolveTourRow({ experienceId: 'exp_a' }, client);
    expect(row?.slug).toBe('tour-alpha');
  });

  it('Test D: valid slug scope still resolves by slug', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    await seedTwoTours(client);

    const row = await resolveTourRow({ slug: 'tour-alpha' }, client);
    expect(row?.slug).toBe('tour-alpha');
  });

  it('Test E: nonexistent identity resolves to null', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    await seedTwoTours(client);

    await expect(resolveTourRow({ slug: 'does-not-exist' }, client)).resolves.toBeNull();
    await expect(resolveTourRow({ experienceId: 'does-not-exist' }, client)).resolves.toBeNull();
    await expect(resolveTourRow({ projectId: 'does-not-exist' }, client)).resolves.toBeNull();
  });

  it('F5 preserved: unique experienceId still wins over a contradictory project', async () => {
    const rows: any[] = [];
    const client = makeFakeSupabaseClient(rows);
    await seedTwoTours(client);

    const row = await resolveTourRow({ experienceId: 'exp_a', projectId: 'proj_b' }, client);
    expect(row?.slug).toBe('tour-alpha');
  });
});