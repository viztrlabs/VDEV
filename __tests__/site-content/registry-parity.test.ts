import { SECTION_TYPES, SECTION_DEFS, buildDefaultSiteContent, getSectionDef } from '@/lib/site-content';
import { homepageData } from '@/data/homepage';

it('every section type has a component in the renderer map', () => {
  const rendererSource = require('fs').readFileSync('components/site/HomeSectionRenderer.tsx', 'utf8');
  for (const type of SECTION_TYPES) {
    const keyPattern = new RegExp(`['"]?${type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]?\\s*:`);
    expect(keyPattern.test(rendererSource)).toBe(true);
  }
});

it('every default section has fields and an id equal to its type', () => {
  const content = buildDefaultSiteContent();
  for (const section of content.pages[0].sections) {
    expect(section.type).toBe(section.id as never);
    expect(section.fields.length).toBeGreaterThan(0);
    expect(SECTION_DEFS[section.type]).toBeTruthy();
  }
});

it('every rich field is a text field and every list has item ids', () => {
  const content = buildDefaultSiteContent();
  for (const type of SECTION_TYPES) {
    for (const def of getSectionDef(type).fields) {
      if (def.kind === 'text') expect(typeof def.rich === 'boolean' || def.rich === undefined).toBe(true);
      if (def.kind === 'list') {
        expect(def.itemFields.length).toBeGreaterThan(0);
        const section = content.pages[0].sections.find((s) => s.type === type)!;
        const field = section.fields.find((f) => f.id === def.id) as any;
        for (const item of field.items) {
          expect(item.id).toBeTruthy();
        }
      }
    }
  }
});

it('hero defaults match homepageData copy', () => {
  const hero = buildDefaultSiteContent().pages[0].sections.find((s) => s.type === 'hero')!;
  const headline = hero.fields.find((f) => f.id === 'headline') as any;
  expect(headline.value).toBe(homepageData.hero.headline);
});
