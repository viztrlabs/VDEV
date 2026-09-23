import {
  slugify,
  buildSlug,
  identityKey,
  sanitizeKeyForFile,
  looksLikeId,
} from '@/lib/tourIdentity';

describe('tourIdentity', () => {
  describe('slugify', () => {
    it('lowercases and replaces spaces with dashes', () => {
      expect(slugify('Luxury Villa')).toBe('luxury-villa');
    });

    it('collapses runs of non-alphanumeric characters into a single dash', () => {
      expect(slugify('Solarium   Sky Penthouse!')).toBe('solarium-sky-penthouse');
    });

    it('strips leading and trailing dashes', () => {
      expect(slugify('--Tribeca, Manhattan--')).toBe('tribeca-manhattan');
    });

    it('empties to an empty string for non-alpha input', () => {
      expect(slugify('!!!!')).toBe('');
    });
  });

  describe('buildSlug', () => {
    it('appends the provided suffix to the slugified title', () => {
      expect(buildSlug('Luxury Villa', 'a1b2c3')).toBe('luxury-villa-a1b2c3');
    });

    it('falls back to a default base and a short random suffix', () => {
      const s = buildSlug('!!!');
      expect(s).toMatch(/^viztr-tour-[a-z0-9]{4,}$/);
    });

    it('produces distinct slugs for distinct titles (same suffix)', () => {
      expect(buildSlug('Villa A', 'x1')).toBe('villa-a-x1');
      expect(buildSlug('Villa B', 'x1')).toBe('villa-b-x1');
    });
  });

  describe('identityKey', () => {
    it('prefers tourId over other fields', () => {
      expect(
        identityKey({
          tourId: 't-1',
          slug: 'villa',
          experienceId: 'exp-1',
          projectId: 'proj-1',
          ownerId: 'u-1',
        }),
      ).toBe('t-1');
    });

    it('uses slug when no tourId', () => {
      expect(identityKey({ slug: 'villa', experienceId: 'exp-1' })).toBe('villa');
    });

    it('uses experienceId when no tourId/slug', () => {
      expect(identityKey({ experienceId: 'exp-1', projectId: 'proj-1' })).toBe('exp-exp-1');
    });

    it('uses projectId then ownerId as fallbacks', () => {
      expect(identityKey({ projectId: 'proj-1' })).toBe('proj-proj-1');
      expect(identityKey({ ownerId: 'u-1' })).toBe('owner-u-1');
    });

    it('is empty when scope is empty', () => {
      expect(identityKey({})).toBe('');
    });
  });

  describe('sanitizeKeyForFile', () => {
    it('keeps safe chars and collapses the rest', () => {
      expect(sanitizeKeyForFile('Tour Agent/Mod v2')).toBe('tour-agent-mod-v2');
    });
  });

  describe('looksLikeId', () => {
    it('recognizes uuids and rejects slugs', () => {
      expect(looksLikeId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(looksLikeId('luxury-villa-a1b2c3')).toBe(false);
    });
  });
});