/**
 * @jest-environment node
 */
import { XR_LINKS_DB, getXRLinkBySlug, toDbRow, fromDbRow } from '@/lib/xr-links-store';

describe('xr-links-store', () => {
  it('exports seeded records with slug fields', () => {
    expect(XR_LINKS_DB.length).toBeGreaterThan(0);
    const allHaveSlug = XR_LINKS_DB.every((r) => typeof r.slug === 'string' && r.slug.length > 0);
    expect(allHaveSlug).toBe(true);
  });

  it('resolves the generator default slugs', () => {
    expect(getXRLinkBySlug('glass-pavilion-v1', XR_LINKS_DB)?.slug).toBe('glass-pavilion-v1');
    expect(getXRLinkBySlug('tokyo-skyloft-xr', XR_LINKS_DB)?.slug).toBe('tokyo-skyloft-xr');
    expect(getXRLinkBySlug('brutalist-garden-ar', XR_LINKS_DB)?.slug).toBe('brutalist-garden-ar');
  });

  it('is case-insensitive and returns undefined for unknown slugs', () => {
    expect(getXRLinkBySlug('GLASS-PAVILION-V1', XR_LINKS_DB)?.slug).toBe('glass-pavilion-v1');
    expect(getXRLinkBySlug('nope-999', XR_LINKS_DB)).toBeUndefined();
  });

  describe('mappers', () => {
    it('toDbRow maps camelCase record to snake_case row', () => {
      const link = XR_LINKS_DB[0];
      const row = toDbRow(link);
      expect(row.id).toBe(link.id);
      expect(row.project_id).toBe(link.projectId);
      expect(row.model_url).toBe(link.modelUrl);
      expect(row.ar_placement).toBe(link.arPlacement);
      expect(row.password_protected).toBe(link.passwordProtected);
      expect(row.access_password).toBe(link.accessPassword);
      expect(row.views_count).toBe(link.viewsCount);
      expect(row.avg_engagement_secs).toBe(link.avgEngagementSecs);
      expect(row.expires_at).toBe(link.expiresAt);
      expect(row.created_at).toBe(link.createdAt);
      expect(row.updated_at).toBe(link.updatedAt);
      expect(row.metadata).toEqual(link.metadata);
    });

    it('toDbRow turns missing optional strings into null', () => {
      const row = toDbRow(XR_LINKS_DB[2]);
      expect(row.scene_id).toBeNull();
      expect(row.thumbnail_url).toBeNull();
      expect(row.access_password).toBeNull();
    });

    it('fromDbRow restores a round-trip record', () => {
      const original = XR_LINKS_DB[1];
      expect(fromDbRow(toDbRow(original))).toEqual(original);
    });

    it('fromDbRow maps null optionals back to undefined', () => {
      const link = fromDbRow(toDbRow(XR_LINKS_DB[2]));
      expect(link.sceneId).toBeUndefined();
      expect(link.thumbnailUrl).toBeUndefined();
      expect(link.accessPassword).toBeUndefined();
    });
  });
});
