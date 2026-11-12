import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  SiteContent,
  buildDefaultSiteContent,
} from '@/lib/site-content';

export const SITE_CONTENT_STORAGE_KEYS = {
  draft: 'viztr-site-content-draft',
  published: 'viztr-site-content',
} as const;

interface SiteContentState {
  content: SiteContent;
  hydrated: boolean;
  setHydrated: () => void;
  updateTextField: (pageId: string, sectionId: string, fieldId: string, value: string) => void;
  updateMediaField: (
    pageId: string,
    sectionId: string,
    fieldId: string,
    patch: { urls?: string[]; isPlaceholder?: boolean; mediaType?: 'image' | 'video'; placeholderUrl?: string },
  ) => void;
  toggleSection: (pageId: string, sectionId: string) => void;
  moveSection: (pageId: string, sectionId: string, dir: 'up' | 'down') => void;
  replaceContent: (content: SiteContent) => void;
}

type MediaPatch = Parameters<SiteContentState['updateMediaField']>[3];

function mapSection(
  content: SiteContent,
  pageId: string,
  sectionId: string,
  fn: (s: SiteContent['pages'][number]['sections'][number]) => SiteContent['pages'][number]['sections'][number],
): SiteContent {
  return {
    ...content,
    pages: content.pages.map((page) =>
      page.id !== pageId
        ? page
        : { ...page, sections: page.sections.map((s) => (s.id === sectionId ? fn(s) : s)) },
    ),
  };
}

function createSiteContentStore(storageKey: string) {
  return create<SiteContentState>()(
    persist(
      (set, get) => ({
        content: buildDefaultSiteContent(),
        hydrated: false,
        setHydrated: () => set({ hydrated: true }),
        updateTextField: (pageId, sectionId, fieldId, value) =>
          set({
            content: mapSection(get().content, pageId, sectionId, (s) => ({
              ...s,
              fields: s.fields.map((f) => (f.kind === 'text' && f.id === fieldId ? { ...f, value } : f)),
            })),
          }),
        updateMediaField: (pageId, sectionId, fieldId, patch: MediaPatch) =>
          set({
            content: mapSection(get().content, pageId, sectionId, (s) => ({
              ...s,
              fields: s.fields.map((f) =>
                f.kind === 'media' && f.id === fieldId
                  ? { ...f, ...patch, urls: patch.urls ?? f.urls }
                  : f,
              ),
            })),
          }),
        toggleSection: (pageId, sectionId) =>
          set({
            content: mapSection(get().content, pageId, sectionId, (s) => ({ ...s, isVisible: !s.isVisible })),
          }),
        moveSection: (pageId, sectionId, dir) =>
          set({
            content: {
              ...get().content,
              pages: get().content.pages.map((page) => {
                if (page.id !== pageId) return page;
                const sections = [...page.sections];
                const idx = sections.findIndex((s) => s.id === sectionId);
                const target = dir === 'up' ? idx - 1 : idx + 1;
                if (idx < 0 || target < 0 || target >= sections.length) return page;
                [sections[idx], sections[target]] = [sections[target], sections[idx]];
                return { ...page, sections };
              }),
            },
          }),
        replaceContent: (content) => set({ content }),
      }),
      {
        name: storageKey,
        storage: createJSONStorage(() => localStorage),
        version: 1,
        onRehydrateStorage: () => (state) => {
          state?.setHydrated();
        },
      },
    ),
  );
}

export const useSiteContentStore = createSiteContentStore(SITE_CONTENT_STORAGE_KEYS.published);

export const useSiteContentDraftStore = createSiteContentStore(SITE_CONTENT_STORAGE_KEYS.draft);

export function publishSiteContent(): void {
  useSiteContentStore.getState().replaceContent(useSiteContentDraftStore.getState().content);
}

export function resetSiteContentDraft(): void {
  useSiteContentDraftStore.getState().replaceContent(buildDefaultSiteContent());
}
