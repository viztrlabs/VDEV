import {
  buildDefaultSiteContent,
  getTextField,
  getMediaUrls,
  isMediaPlaceholder,
} from '@/lib/site-content';
import { homepageData } from '@/data/homepage';

describe('site-content schema', () => {
  it('builds default content with a home page whose sections match homepage order', () => {
    const content = buildDefaultSiteContent();
    const home = content.pages.find((p) => p.id === 'home');
    expect(home).toBeDefined();
    expect(home!.route).toBe('/');
    const ids = home!.sections.map((s) => s.id);
    expect(ids).toEqual([
      'hero', 'marquee', 'four-pillars', 'studio', 'xr-world', 'creator',
      'solutions', 'showreel', 'portfolio-preview', 'xr-experience',
      'track-project', 'benefits', 'how-it-works', 'use-cases',
      'testimonials', 'faq', 'final-cta',
    ]);
    expect(home!.sections.every((s) => s.isVisible)).toBe(true);
  });

  it('seeds hero fields from homepageData', () => {
    const content = buildDefaultSiteContent();
    const hero = content.pages[0].sections.find((s) => s.id === 'hero')!;
    expect(getTextField(hero, 'headline', '')).toBe(homepageData.hero.headline);
    expect(getMediaUrls(hero, 'heroImages', [])).toEqual(homepageData.hero.images);
  });

  it('getTextField falls back when field is missing', () => {
    const section = { id: 'x', name: 'X', isVisible: true, fields: [] };
    expect(getTextField(section, 'headline', 'FALLBACK')).toBe('FALLBACK');
  });

  it('getMediaUrls falls back and isMediaPlaceholder reads the flag', () => {
    const section = {
      id: 'x',
      name: 'X',
      isVisible: true,
      fields: [
        {
          kind: 'media',
          id: 'videoUrl',
          label: 'Video',
          mediaType: 'video',
          urls: ['https://example.com/v.mp4'],
          placeholderUrl: '/images/placeholder.jpg',
          isPlaceholder: true,
        },
      ],
    };
    expect(getMediaUrls(section, 'videoUrl', [])).toEqual(['https://example.com/v.mp4']);
    expect(getMediaUrls(section, 'missing', ['FB'])).toEqual(['FB']);
    expect(isMediaPlaceholder(section, 'videoUrl')).toBe(true);
    expect(isMediaPlaceholder(section, 'missing')).toBe(false);
  });
});
