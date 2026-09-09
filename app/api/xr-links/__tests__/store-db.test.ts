/**
 * @jest-environment node
 */
import {
  getXRLinksFromDB,
  saveXRLinkToDB,
  deleteXRLinkFromDB,
  buildXRLinkRecord,
} from '@/lib/xr-links-store';
import { adminClient } from '@/lib/supabase-admin';

jest.mock('@/lib/supabase-admin', () => ({
  isSupabaseAdminConfigured: true,
  adminClient: {
    from: jest.fn(),
  },
}));

const mockedFrom = adminClient!.from as jest.Mock;

const snakeRow = {
  id: 'xr_db_1',
  name: 'DB Link',
  slug: 'db-link',
  project_id: 'PRJ-XR-1',
  scene_id: null,
  model_url: 'https://example.test/models/db-link.glb',
  thumbnail_url: null,
  share_url: '/xr-world/view/db-link',
  qr_code_url: '',
  environment: 'studio' as const,
  ar_placement: 'floor' as const,
  password_protected: false,
  access_password: null,
  views_count: 0,
  unique_visitors: 0,
  avg_engagement_secs: 0,
  status: 'active' as const,
  expires_at: '2026-12-08T00:00:00Z',
  metadata: {
    engineType: 'three',
    entitiesCount: 1,
    fileSizeMB: 1,
    formats: ['glb'],
    arConfig: { placement: 'floor', environment: 'studio', passwordProtected: false },
    delivery: { webAR: true, webXR: false, iOSQuickLook: true, androidAR: false },
  },
  created_at: '2026-09-09T00:00:00Z',
  updated_at: '2026-09-09T00:00:00Z',
};

describe('xr-links-store admin DB path', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getXRLinksFromDB maps snake_case rows to camelCase records', async () => {
    mockedFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [snakeRow], error: null }),
      }),
    });

    const links = await getXRLinksFromDB();
    expect(links).toHaveLength(1);
    expect(links[0].projectId).toBe('PRJ-XR-1');
    expect(links[0].modelUrl).toBe('https://example.test/models/db-link.glb');
    expect(links[0].createdAt).toBe('2026-09-09T00:00:00Z');
    expect(links[0].sceneId).toBeUndefined();
    expect(links[0].accessPassword).toBeUndefined();
    expect(links[0].metadata).toEqual(snakeRow.metadata);
  });

  it('getXRLinksFromDB falls back to in-memory on admin error', async () => {
    mockedFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: null, error: { message: 'boom' } }),
      }),
    });

    const links = await getXRLinksFromDB();
    expect(links.length).toBeGreaterThan(0);
    expect(links[0].id).not.toBe('xr_db_1');
  });

  it('saveXRLinkToDB upserts the snake_case row and returns true', async () => {
    const { upsert } = { upsert: jest.fn().mockResolvedValue({ error: null }) };
    mockedFrom.mockReturnValue({ upsert });

    const link = buildXRLinkRecord({ name: 'Save Me', projectId: 'PRJ-SAVE', origin: 'https://example.test' });
    const ok = await saveXRLinkToDB(link);
    expect(ok).toBe(true);
    expect(mockedFrom).toHaveBeenCalledWith('xr_links');
    const [row, opts] = upsert.mock.calls[0];
    expect(opts).toEqual({ onConflict: 'id' });
    expect(row.id).toBe(link.id);
    expect(row.project_id).toBe('PRJ-SAVE');
    expect(row.created_at).toBe(link.createdAt);
    expect(row.model_url).toBe('https://example.test/models/save-me.glb');
    expect(row.access_password).toBeNull();
  });

  it('saveXRLinkToDB returns false on upsert error', async () => {
    mockedFrom.mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: { message: 'constraint' } }),
    });

    const ok = await saveXRLinkToDB(buildXRLinkRecord({ name: 'Fail', projectId: 'PRJ-FAIL' }));
    expect(ok).toBe(false);
  });

  it('deleteXRLinkFromDB deletes by id', async () => {
    const eq = jest.fn().mockResolvedValue({ error: null });
    const del = jest.fn().mockReturnValue({ eq });
    mockedFrom.mockReturnValue({ delete: del });

    const ok = await deleteXRLinkFromDB('xr_db_1');
    expect(ok).toBe(true);
    expect(mockedFrom).toHaveBeenCalledWith('xr_links');
    expect(del).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 'xr_db_1');
  });
});