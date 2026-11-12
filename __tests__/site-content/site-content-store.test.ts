import {
  useSiteContentStore,
  useSiteContentDraftStore,
  publishSiteContent,
  resetSiteContentDraft,
} from '@/lib/site-content-store';
import { buildDefaultSiteContent } from '@/lib/site-content';

const draft = () => useSiteContentDraftStore.getState();
const published = () => useSiteContentStore.getState();

describe('site content stores', () => {
  beforeEach(() => {
    resetSiteContentDraft();
    useSiteContentStore.setState({ content: buildDefaultSiteContent() });
  });

  it('initializes both stores with default content', () => {
    expect(draft().content.pages).toHaveLength(1);
    expect(published().content.pages).toHaveLength(1);
  });

  it('updateTextField edits only the draft', () => {
    draft().updateTextField('home', 'hero', 'headline', 'EDITED HEADLINE');
    const dHero = draft().content.pages[0].sections.find((s) => s.id === 'hero')!;
    const pHero = published().content.pages[0].sections.find((s) => s.id === 'hero')!;
    const dField = dHero.fields.find((f) => f.id === 'headline') as { value: string };
    const pField = pHero.fields.find((f) => f.id === 'headline') as { value: string };
    expect(dField.value).toBe('EDITED HEADLINE');
    expect(pField.value).not.toBe('EDITED HEADLINE');
  });

  it('updateMediaField replaces urls and placeholder flag', () => {
    draft().updateMediaField('home', 'hero', 'heroImages', {
      urls: ['https://cdn.example.com/a.jpg'],
      isPlaceholder: true,
    });
    const hero = draft().content.pages[0].sections.find((s) => s.id === 'hero')!;
    const field = hero.fields.find((f) => f.id === 'heroImages') as { urls: string[]; isPlaceholder: boolean };
    expect(field.urls).toEqual(['https://cdn.example.com/a.jpg']);
    expect(field.isPlaceholder).toBe(true);
  });

  it('toggleSection flips isVisible', () => {
    draft().toggleSection('home', 'hero');
    expect(draft().content.pages[0].sections.find((s) => s.id === 'hero')!.isVisible).toBe(false);
    draft().toggleSection('home', 'hero');
    expect(draft().content.pages[0].sections.find((s) => s.id === 'hero')!.isVisible).toBe(true);
  });

  it('moveSection reorders sections and is a no-op at edges', () => {
    const idsBefore = draft().content.pages[0].sections.map((s) => s.id);
    draft().moveSection('home', 'marquee', 'up');
    const idsAfter = draft().content.pages[0].sections.map((s) => s.id);
    expect(idsAfter).toEqual([idsBefore[1], idsBefore[0], ...idsBefore.slice(2)]);
    draft().moveSection('home', 'marquee', 'up');
    expect(draft().content.pages[0].sections[0].id).toBe('marquee');
  });

  it('publish copies draft into published', () => {
    draft().updateTextField('home', 'hero', 'headline', 'PUBLISHED HEADLINE');
    publishSiteContent();
    const hero = published().content.pages[0].sections.find((s) => s.id === 'hero')!;
    const field = hero.fields.find((f) => f.id === 'headline') as { value: string };
    expect(field.value).toBe('PUBLISHED HEADLINE');
  });

  it('resetSiteContentDraft restores defaults in draft only', () => {
    draft().updateTextField('home', 'hero', 'headline', 'EDITED');
    resetSiteContentDraft();
    const hero = draft().content.pages[0].sections.find((s) => s.id === 'hero')!;
    const field = hero.fields.find((f) => f.id === 'headline') as { value: string };
    expect(field.value).toBe('VIZTR');
  });
});
