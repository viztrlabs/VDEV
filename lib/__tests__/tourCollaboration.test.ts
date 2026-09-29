import { toTourSummary } from '@/lib/tourCollaboration';

describe('toTourSummary', () => {
  it('maps a tours row to a dashboard summary with enrichment', () => {
    const row = {
      id: 'uuid-1',
      title: 'Sunset Villa',
      slug: 'sunset-villa',
      is_live: true,
      access_level: 'public',
      updated_at: '2026-09-29T10:00:00Z',
      data: {
        views: 42,
        rooms: [
          { id: 'r1', name: 'Living', thumbnailUrl: 'https://x/t.jpg', panoramaUrl: 'https://x/p.jpg' },
          { id: 'r2', name: 'Kitchen', thumbnailUrl: 'https://x/k.jpg' },
        ],
      },
    };
    const s = toTourSummary(row);
    expect(s.id).toBe('uuid-1');
    expect(s.title).toBe('Sunset Villa');
    expect(s.slug).toBe('sunset-villa');
    expect(s.is_live).toBe(true);
    expect(s.access_level).toBe('public');
    expect(s.views).toBe(42);
    expect(s.sceneCount).toBe(2);
    expect(s.thumbnailUrl).toBe('https://x/t.jpg');
  });

  it('falls back to the panorama url when a room has no thumbnail', () => {
    const row = {
      id: 'u',
      title: 'T',
      slug: 't',
      is_live: false,
      access_level: 'private',
      data: { rooms: [{ name: 'R', panoramaUrl: 'https://x/pano.jpg' }] },
    };
    expect(toTourSummary(row).thumbnailUrl).toBe('https://x/pano.jpg');
  });

  it('is safe for empty/missing rooms, views, and slug (new tours)', () => {
    const s = toTourSummary({ id: 'u2', title: 'Empty', data: { version: 1, rooms: [], settings: {} } });
    expect(s.views).toBe(0);
    expect(s.sceneCount).toBe(0);
    expect(s.thumbnailUrl).toBeNull();
    expect(s.slug).toBeNull();
    expect(s.is_live).toBe(false);
    expect(s.access_level).toBe('public');
  });

  it('tolerates a null data blob entirely', () => {
    const s = toTourSummary({ id: 'u3', title: 'Bare', is_live: true, access_level: 'private' });
    expect(s.sceneCount).toBe(0);
    expect(s.views).toBe(0);
    expect(s.is_live).toBe(true);
    expect(s.access_level).toBe('private');
  });

  it('falls back to the views_count column when data.views is absent', () => {
    const s = toTourSummary({ id: 'u4', title: 'T', slug: 't', is_live: false, access_level: 'public', views_count: 7, data: { rooms: [] } });
    expect(s.views).toBe(7);
  });

  it('ignores collab-only columns that do not exist on the real table', () => {
    const s = toTourSummary({ id: 'u5', title: 'T', custom_domain: 'ignored.example', data: { rooms: [] } });
    expect(s.custom_domain).toBe('ignored.example');
  });
});