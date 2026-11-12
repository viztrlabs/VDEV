import { act, renderHook } from '@testing-library/react';
import {
  isDraftDirty,
  migrateSiteContent,
  publishSiteContent,
  useIsDraftDirty,
  useSiteContentDraftStore,
  useSiteContentStore,
} from '@/lib/site-content-store';
import {
  buildDefaultSiteContent,
  getListItems,
  getMediaUrls,
  getSectionStyle,
  getTextField,
  type SiteSection,
} from '@/lib/site-content';

const draft = () => useSiteContentDraftStore.getState();
const published = () => useSiteContentStore.getState();

const draftSection = (id: string): SiteSection =>
  draft().content.pages[0].sections.find((s) => s.id === id)!;

const publishedSection = (id: string): SiteSection =>
  published().content.pages[0].sections.find((s) => s.id === id)!;

describe('site content store v2', () => {
  beforeEach(() => {
    useSiteContentDraftStore.setState({ content: buildDefaultSiteContent() });
    useSiteContentStore.setState({ content: buildDefaultSiteContent() });
  });

  it('duplicates a section after the original with a new id and independent fields', () => {
    const newId = draft().duplicateSection('home', 'hero');
    const sections = draft().content.pages[0].sections;
    const idx = sections.findIndex((s) => s.id === 'hero');
    expect(sections[idx + 1].id).toBe(newId);
    expect(sections[idx + 1].type).toBe('hero');
    expect(sections[idx + 1].name).toBe('Hero copy');
    draft().updateTextField('home', newId!, 'headline', 'COPY');
    const copy = draft().content.pages[0].sections[idx + 1];
    const original = draft().content.pages[0].sections[idx];
    expect(copy.fields.find((f) => f.id === 'headline')).toMatchObject({ value: 'COPY' });
    expect(original.fields.find((f) => f.id === 'headline')).not.toMatchObject({ value: 'COPY' });
  });

  it('duplicates list fields without leaking item edits between instances', () => {
    const newId = draft().duplicateSection('home', 'faq')!;
    draft().updateListItem('home', newId, 'faq', 'faq-1', { q: 'COPY QUESTION' });
    expect(getListItems(draftSection(newId), 'faq')[0].values.q).toBe('COPY QUESTION');
    expect(getListItems(draftSection('faq'), 'faq')[0].values.q).not.toBe('COPY QUESTION');
  });

  it('uses the smallest unique id when duplicating repeatedly', () => {
    expect(draft().duplicateSection('home', 'hero')).toBe('hero-1');
    expect(draft().duplicateSection('home', 'hero')).toBe('hero-2');
    expect(draft().duplicateSection('home', 'hero-1')).toBe('hero-3');
  });

  it('deletes a section instance', () => {
    draft().deleteSection('home', 'marquee');
    expect(draft().content.pages[0].sections.some((s) => s.id === 'marquee')).toBe(false);
  });

  it('updates section style and media urls by index', () => {
    const s = draft();
    s.updateSectionStyle('home', 'hero', { padding: 'lg' });
    s.updateMediaUrl('home', 'hero', 'heroImages', 0, 'https://example.com/a.jpg');
    const hero = draft().content.pages[0].sections[0];
    expect(hero.style.padding).toBe('lg');
    expect(getSectionStyle(hero).padding).toBe('lg');
    expect((hero.fields.find((f) => f.id === 'heroImages') as { urls: string[] }).urls[0]).toBe(
      'https://example.com/a.jpg',
    );
  });

  it('adds, moves, and removes media urls', () => {
    const s = draft();
    const before = getMediaUrls(draftSection('hero'), 'heroImages', []);
    s.addMediaUrl('home', 'hero', 'heroImages', 'https://example.com/z.jpg');
    expect(getMediaUrls(draftSection('hero'), 'heroImages', [])).toHaveLength(before.length + 1);
    s.moveMediaUrl('home', 'hero', 'heroImages', before.length, 0);
    expect(getMediaUrls(draftSection('hero'), 'heroImages', [])[0]).toBe('https://example.com/z.jpg');
    s.removeMediaUrl('home', 'hero', 'heroImages', 0);
    expect(getMediaUrls(draftSection('hero'), 'heroImages', [])).toEqual(before);
  });

  it('treats out of range media operations as no-ops', () => {
    const before = getMediaUrls(draftSection('hero'), 'heroImages', []);
    const s = draft();
    s.updateMediaUrl('home', 'hero', 'heroImages', 99, 'https://example.com/x.jpg');
    s.moveMediaUrl('home', 'hero', 'heroImages', 0, 99);
    s.removeMediaUrl('home', 'hero', 'heroImages', 99);
    s.moveMediaUrl('home', 'hero', 'heroImages', 99, 0);
    expect(getMediaUrls(draftSection('hero'), 'heroImages', [])).toEqual(before);
  });

  it('adds, updates, moves, and removes list items', () => {
    const s = draft();
    const newItemId = s.addListItem('home', 'faq', 'faq');
    expect(newItemId).toBeTruthy();
    expect(getListItems(draftSection('faq'), 'faq')).toHaveLength(8);
    s.updateListItem('home', 'faq', 'faq', newItemId!, { q: 'Q?', a: 'A.' });
    expect(getListItems(draftSection('faq'), 'faq')[7]).toMatchObject({
      id: newItemId,
      values: { q: 'Q?', a: 'A.' },
    });
    s.moveListItem('home', 'faq', 'faq', newItemId!, 'up');
    expect(getListItems(draftSection('faq'), 'faq')[6].id).toBe(newItemId);
    s.removeListItem('home', 'faq', 'faq', newItemId!);
    expect(getListItems(draftSection('faq'), 'faq')).toHaveLength(7);
  });

  it('treats list operations as no-ops for missing fields or items', () => {
    const before = getListItems(draftSection('faq'), 'faq');
    const s = draft();
    expect(s.addListItem('home', 'faq', 'missingField')).toBeNull();
    expect(s.addListItem('home', 'missingSection', 'faq')).toBeNull();
    s.updateListItem('home', 'faq', 'faq', 'missing-item', { q: 'X' });
    s.removeListItem('home', 'faq', 'faq', 'missing-item');
    s.moveListItem('home', 'faq', 'faq', 'missing-item', 'up');
    expect(getListItems(draftSection('faq'), 'faq')).toEqual(before);
  });

  it('treats structural actions as no-ops for missing pages and sections', () => {
    const before = draft().content;
    const s = draft();
    s.toggleSection('nope', 'hero');
    s.moveSection('nope', 'hero', 'up');
    s.deleteSection('home', 'nope');
    s.updateSectionStyle('home', 'nope', { padding: 'sm' });
    s.updateTextField('home', 'nope', 'headline', 'X');
    s.updateMediaField('home', 'nope', 'heroImages', { urls: [] });
    expect(draft().content.pages[0].sections).toEqual(before.pages[0].sections);
    expect(s.duplicateSection('home', 'nope')).toBeNull();
    expect(s.duplicateSection('nope', 'hero')).toBeNull();
  });

  it('publishes the draft and clears dirty', () => {
    const { result } = renderHook(() => useIsDraftDirty());
    expect(result.current).toBe(false);
    act(() => {
      draft().updateTextField('home', 'hero', 'headline', 'NEW');
    });
    expect(isDraftDirty()).toBe(true);
    act(() => {
      publishSiteContent();
    });
    expect(isDraftDirty()).toBe(false);
    expect(published().content).toEqual(draft().content);
    expect(getTextField(draftSection('hero'), 'headline', '')).toBe('NEW');
  });

  it('resets a store to defaults through resetToDefaults', () => {
    draft().updateTextField('home', 'hero', 'headline', 'EDITED');
    draft().deleteSection('home', 'marquee');
    expect(typeof published().resetToDefaults).toBe('function');
    draft().resetToDefaults();
    expect(draft().content).toEqual(buildDefaultSiteContent());
    expect(getTextField(draftSection('hero'), 'headline', '')).toBe('VIZTR');
    published().resetToDefaults();
    expect(published().content).toEqual(buildDefaultSiteContent());
  });

  it('keeps published content independent of later draft edits after publish', () => {
    draft().updateTextField('home', 'hero', 'headline', 'LIVE');
    publishSiteContent();
    const publishedSnapshot = JSON.stringify(published().content);
    expect(published().content).not.toBe(draft().content);
    expect(publishedSection('hero')).not.toBe(draftSection('hero'));
    expect(publishedSection('hero').fields[0]).not.toBe(draftSection('hero').fields[0]);
    expect(publishedSection('faq').fields.find((f) => f.kind === 'list')).not.toBe(
      draftSection('faq').fields.find((f) => f.kind === 'list'),
    );

    draft().updateTextField('home', 'hero', 'headline', 'DRAFT ONLY');
    draft().updateListItem('home', 'faq', 'faq', 'faq-1', { q: 'CHANGED IN DRAFT' });
    draft().deleteSection('home', 'marquee');

    expect(JSON.stringify(published().content)).toBe(publishedSnapshot);
    expect(getTextField(publishedSection('hero'), 'headline', '')).toBe('LIVE');
    expect(getListItems(publishedSection('faq'), 'faq')[0].values.q).not.toBe('CHANGED IN DRAFT');
    expect(published().content.pages[0].sections.some((s) => s.id === 'marquee')).toBe(true);
  });

  it('sanitizes rich text on publish only', () => {
    draft().updateTextField('home', 'hero', 'description', '<b>Bold</b><script>alert(1)</script>');
    draft().updateListItem('home', 'faq', 'faq', 'faq-1', {
      a: '<script>alert(1)</script><em>Safe</em>',
    });
    expect(getTextField(draftSection('hero'), 'description', '')).toContain('<script>');
    publishSiteContent();
    const hero = published().content.pages[0].sections.find((s) => s.id === 'hero')!;
    expect(getTextField(hero, 'description', '')).toBe('<b>Bold</b>');
    const faq = published().content.pages[0].sections.find((s) => s.id === 'faq')!;
    expect(getListItems(faq, 'faq')[0].values.a).toBe('<em>Safe</em>');
    expect(getTextField(draftSection('hero'), 'description', '')).toBe('<b>Bold</b>');
    expect(getListItems(draftSection('faq'), 'faq')[0].values.a).toBe('<em>Safe</em>');
  });

  it('migrates v1 content by keeping stored copy and rebuilding v2 structure', () => {
    const v1 = {
      pages: [
        {
          id: 'home',
          label: 'Homepage',
          route: '/',
          sections: [
            {
              id: 'hero',
              name: 'Hero',
              isVisible: true,
              fields: [{ kind: 'text', id: 'headline', label: 'Headline', value: 'OLD HEADLINE' }],
            },
          ],
        },
      ],
    };
    const migrated = migrateSiteContent(v1);
    expect(migrated.version).toBe(2);
    const hero = migrated.pages[0].sections.find((s) => s.id === 'hero')!;
    expect(hero.type).toBe('hero');
    expect(hero.fields.find((f) => f.id === 'headline')).toMatchObject({ value: 'OLD HEADLINE' });
    expect(hero.fields.some((f) => f.id === 'heroImages')).toBe(true);
    expect(migrated.pages[0].sections).toHaveLength(buildDefaultSiteContent().pages[0].sections.length);
  });

  it('migrates stored media urls by field id', () => {
    const v1 = {
      pages: [
        {
          id: 'home',
          label: 'Homepage',
          route: '/',
          sections: [
            {
              id: 'hero',
              name: 'Hero',
              isVisible: true,
              fields: [{ kind: 'media', id: 'heroImages', label: 'Images', urls: ['/x.jpg'] }],
            },
          ],
        },
      ],
    };
    const hero = migrateSiteContent(v1).pages[0].sections.find((s) => s.id === 'hero')!;
    expect(getMediaUrls(hero, 'heroImages', [])).toEqual(['/x.jpg']);
  });

  it('falls back to defaults for malformed payloads', () => {
    const defaults = buildDefaultSiteContent();
    expect(migrateSiteContent(null)).toEqual(defaults);
    expect(migrateSiteContent(undefined)).toEqual(defaults);
    expect(migrateSiteContent('nope')).toEqual(defaults);
    expect(migrateSiteContent({ pages: 'nope' })).toEqual(defaults);
    expect(migrateSiteContent({ pages: [{ id: 'home' }] })).toEqual(defaults);
  });

  it('keeps already v2 content intact', () => {
    const content = buildDefaultSiteContent();
    content.pages[0].sections[0].style = { padding: 'sm' };
    expect(migrateSiteContent(content)).toBe(content);
    expect(migrateSiteContent(JSON.parse(JSON.stringify(content)))).toEqual(content);
  });
});
