/**
 * @jest-environment node
 */
import { XR_LINKS_DB, getXRLinkBySlug } from '@/lib/xr-links-store';

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
});
