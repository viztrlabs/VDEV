import {
  SECTION_DEFS,
  SECTION_TYPES,
  buildDefaultSiteContent,
  getDefaultSection,
  getListItems,
  getListItemValues,
  getMediaUrls,
  getTextField,
} from '@/lib/site-content';

it('defines every section type with a name and fields', () => {
  expect(SECTION_TYPES).toHaveLength(17);
  for (const type of SECTION_TYPES) {
    expect(SECTION_DEFS[type].name).toBeTruthy();
    expect(Array.isArray(SECTION_DEFS[type].fields)).toBe(true);
  }
});

it('seeds defaults with type, instance id, style, and version 2', () => {
  const content = buildDefaultSiteContent();
  expect(content.version).toBe(2);
  const home = content.pages.find((p) => p.id === 'home')!;
  expect(home.sections.map((s) => s.id)).toEqual([
    'hero', 'marquee', 'four-pillars', 'studio', 'xr-world', 'creator', 'solutions',
    'showreel', 'portfolio-preview', 'xr-experience', 'track-project', 'benefits',
    'how-it-works', 'use-cases', 'testimonials', 'faq', 'final-cta',
  ]);
  for (const section of home.sections) {
    expect(section.type).toBe(section.id as never);
    expect(section.style).toEqual(expect.any(Object));
  }
});

it('seeds hero copy and gallery from homepageData', () => {
  const hero = getDefaultSection('hero');
  expect(getTextField(hero, 'headline', '')).toBe('VIZTR');
  expect(getMediaUrls(hero, 'heroImages', [])).toHaveLength(6);
  expect(getTextField(hero, 'primaryCtaHref', '')).toBeTruthy();
});

it('seeds list fields with ids and values', () => {
  const faq = getDefaultSection('faq');
  const items = getListItems(faq, 'faq');
  expect(items).toHaveLength(7);
  expect(items[0].id).toBeTruthy();
  expect(getListItemValues(faq, 'faq', items[0].id).q).toBeTruthy();
});

it('marks studio badge as a seeded field (previously empty)', () => {
  expect(getTextField(getDefaultSection('studio'), 'badge', '')).toBeTruthy();
});
