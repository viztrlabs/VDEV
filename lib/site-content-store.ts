import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  SiteContent,
  SiteField,
  SiteListField,
  SiteListItem,
  SiteMediaField,
  SiteSection,
  SiteSectionStyle,
  buildDefaultSiteContent,
} from '@/lib/site-content';
import { sanitizeRichText } from '@/lib/sanitize-rich-text';

export const SITE_CONTENT_STORAGE_KEYS = {
  draft: 'viztr-site-content-draft',
  published: 'viztr-site-content',
} as const;

interface SiteContentState {
  content: SiteContent;
  hydrated: boolean;
  setHydrated: () => void;
  updateTextField: (pageId: string, sectionId: string, fieldId: string, value: string) => void;
  updateTextFieldAlign: (
    pageId: string,
    sectionId: string,
    fieldId: string,
    align: 'left' | 'center' | 'right' | undefined,
  ) => void;
  updateMediaField: (
    pageId: string,
    sectionId: string,
    fieldId: string,
    patch: { urls?: string[]; isPlaceholder?: boolean; mediaType?: 'image' | 'video'; placeholderUrl?: string },
  ) => void;
  updateMediaUrl: (pageId: string, sectionId: string, fieldId: string, index: number, url: string) => void;
  moveMediaUrl: (pageId: string, sectionId: string, fieldId: string, from: number, to: number) => void;
  addMediaUrl: (pageId: string, sectionId: string, fieldId: string, url: string) => void;
  removeMediaUrl: (pageId: string, sectionId: string, fieldId: string, index: number) => void;
  toggleSection: (pageId: string, sectionId: string) => void;
  moveSection: (pageId: string, sectionId: string, dir: 'up' | 'down') => void;
  duplicateSection: (pageId: string, sectionId: string) => string | null;
  deleteSection: (pageId: string, sectionId: string) => void;
  updateSectionStyle: (pageId: string, sectionId: string, patch: Partial<SiteSectionStyle>) => void;
  updateListItem: (
    pageId: string,
    sectionId: string,
    fieldId: string,
    itemId: string,
    values: Record<string, string>,
  ) => void;
  addListItem: (pageId: string, sectionId: string, fieldId: string) => string | null;
  removeListItem: (pageId: string, sectionId: string, fieldId: string, itemId: string) => void;
  moveListItem: (
    pageId: string,
    sectionId: string,
    fieldId: string,
    itemId: string,
    direction: 'up' | 'down',
  ) => void;
  resetToDefaults: () => void;
  replaceContent: (content: SiteContent) => void;
}

type MediaPatch = Parameters<SiteContentState['updateMediaField']>[3];
type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === 'object' && value !== null ? (value as UnknownRecord) : null;
}

function readStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.every((entry) => typeof entry === 'string') ? (value as string[]) : null;
}

function isSiteContentV2(value: unknown): value is SiteContent {
  const record = asRecord(value);
  if (!record || record.version !== 2 || !Array.isArray(record.pages)) return false;
  return record.pages.every((page) => {
    const pageRecord = asRecord(page);
    if (!pageRecord || typeof pageRecord.id !== 'string' || !Array.isArray(pageRecord.sections)) {
      return false;
    }
    return pageRecord.sections.every((section) => {
      const sectionRecord = asRecord(section);
      if (!sectionRecord) return false;
      return (
        typeof sectionRecord.id === 'string' &&
        typeof sectionRecord.type === 'string' &&
        typeof sectionRecord.name === 'string' &&
        typeof sectionRecord.isVisible === 'boolean' &&
        asRecord(sectionRecord.style) !== null &&
        Array.isArray(sectionRecord.fields)
      );
    });
  });
}

function overlaySection(section: SiteSection, stored: UnknownRecord): SiteSection {
  const storedFields = Array.isArray(stored.fields)
    ? stored.fields.map(asRecord).filter((field): field is UnknownRecord => field !== null)
    : [];

  return {
    ...section,
    fields: section.fields.map((field) => {
      const storedField = storedFields.find((entry) => entry.id === field.id);
      if (!storedField) return field;
      if (field.kind === 'text' && typeof storedField.value === 'string') {
        return { ...field, value: storedField.value };
      }
      if (field.kind === 'media') {
        const urls = readStringArray(storedField.urls);
        if (urls) return { ...field, urls };
      }
      return field;
    }),
  };
}

export function migrateSiteContent(persisted: unknown): SiteContent {
  if (isSiteContentV2(persisted)) return persisted;

  const defaults = buildDefaultSiteContent();
  const storedRecord = asRecord(persisted);
  const storedPages = Array.isArray(storedRecord?.pages) ? storedRecord.pages : [];

  if (storedPages.length === 0) return defaults;

  return {
    version: 2,
    pages: defaults.pages.map((page) => {
      const storedPage = storedPages
        .map(asRecord)
        .find((entry): entry is UnknownRecord => entry !== null && entry.id === page.id);
      if (!storedPage || !Array.isArray(storedPage.sections)) return page;
      const storedSections = storedPage.sections
        .map(asRecord)
        .filter((entry): entry is UnknownRecord => entry !== null);

      return {
        ...page,
        sections: page.sections.map((section) => {
          const storedSection = storedSections.find((entry) => entry.id === section.id);
          return storedSection ? overlaySection(section, storedSection) : section;
        }),
      };
    }),
  };
}

function mapSection(
  content: SiteContent,
  pageId: string,
  sectionId: string,
  fn: (section: SiteSection) => SiteSection,
): SiteContent {
  return {
    ...content,
    pages: content.pages.map((page) =>
      page.id !== pageId
        ? page
        : { ...page, sections: page.sections.map((section) => (section.id === sectionId ? fn(section) : section)) },
    ),
  };
}

function mapMediaField(
  content: SiteContent,
  pageId: string,
  sectionId: string,
  fieldId: string,
  fn: (field: SiteMediaField) => SiteMediaField,
): SiteContent {
  return mapSection(content, pageId, sectionId, (section) => ({
    ...section,
    fields: section.fields.map((field) =>
      field.kind === 'media' && field.id === fieldId ? fn(field) : field,
    ),
  }));
}

function mapListField(
  content: SiteContent,
  pageId: string,
  sectionId: string,
  fieldId: string,
  fn: (field: SiteListField) => SiteListField,
): SiteContent {
  return mapSection(content, pageId, sectionId, (section) => ({
    ...section,
    fields: section.fields.map((field) =>
      field.kind === 'list' && field.id === fieldId ? fn(field) : field,
    ),
  }));
}

function findSection(content: SiteContent, pageId: string, sectionId: string): SiteSection | null {
  return content.pages.find((page) => page.id === pageId)?.sections.find((s) => s.id === sectionId) ?? null;
}

function findListField(section: SiteSection | null, fieldId: string): SiteListField | null {
  if (!section) return null;
  return (
    section.fields.find((field): field is SiteListField => field.kind === 'list' && field.id === fieldId) ?? null
  );
}

function nextSectionId(sections: SiteSection[], type: string): string {
  let n = 1;
  while (sections.some((section) => section.id === `${type}-${n}`)) n += 1;
  return `${type}-${n}`;
}

function nextItemId(items: SiteListItem[], prefix: string): string {
  let n = 1;
  while (items.some((item) => item.id === `${prefix}-${n}`)) n += 1;
  return `${prefix}-${n}`;
}

function cloneItem(item: SiteListItem): SiteListItem {
  const values = { ...item.values };
  return item.meta ? { id: item.id, values, meta: { ...item.meta } } : { id: item.id, values };
}

function cloneField(field: SiteField): SiteField {
  if (field.kind === 'text') return { ...field };
  if (field.kind === 'media') return { ...field, urls: [...field.urls] };
  return {
    ...field,
    itemFields: field.itemFields.map((def) => ({ ...def })),
    items: field.items.map(cloneItem),
  };
}

function cloneStyle(style: SiteSectionStyle | undefined): SiteSectionStyle {
  const base = style ?? {};
  return base.media ? { ...base, media: { ...base.media } } : { ...base };
}

function sanitizeField(field: SiteField): SiteField {
  if (field.kind === 'text') {
    return field.rich ? { ...field, value: sanitizeRichText(field.value) } : { ...field };
  }
  if (field.kind === 'media') return { ...field, urls: [...field.urls] };

  const richItemFields = new Set(field.itemFields.filter((def) => def.rich).map((def) => def.id));

  return {
    ...field,
    itemFields: field.itemFields.map((def) => ({ ...def })),
    items: field.items.map((item) => {
      const values: Record<string, string> = {};
      Object.entries(item.values).forEach(([key, value]) => {
        values[key] = richItemFields.has(key) ? sanitizeRichText(value) : value;
      });
      return item.meta ? { id: item.id, values, meta: { ...item.meta } } : { id: item.id, values };
    }),
  };
}

function cloneContent(content: SiteContent): SiteContent {
  return {
    version: 2,
    pages: content.pages.map((page) => ({
      ...page,
      sections: page.sections.map((section) => ({
        ...section,
        style: cloneStyle(section.style),
        fields: section.fields.map(cloneField),
      })),
    })),
  };
}

function sanitizeContent(content: SiteContent): SiteContent {
  return {
    version: 2,
    pages: content.pages.map((page) => ({
      ...page,
      sections: page.sections.map((section) => ({
        ...section,
        style: cloneStyle(section.style),
        fields: section.fields.map(sanitizeField),
      })),
    })),
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
            content: mapSection(get().content, pageId, sectionId, (section) => ({
              ...section,
              fields: section.fields.map((field) =>
                field.kind === 'text' && field.id === fieldId ? { ...field, value } : field,
              ),
            })),
          }),
        updateTextFieldAlign: (pageId, sectionId, fieldId, align) =>
          set({
            content: mapSection(get().content, pageId, sectionId, (section) => ({
              ...section,
              fields: section.fields.map((field) => {
                if (field.kind !== 'text' || field.id !== fieldId) return field;
                if (align === undefined) {
                  const next = { ...field };
                  delete next.align;
                  return next;
                }
                return { ...field, align };
              }),
            })),
          }),
        updateMediaField: (pageId, sectionId, fieldId, patch: MediaPatch) =>
          set({
            content: mapMediaField(get().content, pageId, sectionId, fieldId, (field) => ({
              ...field,
              ...patch,
              urls: patch.urls ?? field.urls,
            })),
          }),
        updateMediaUrl: (pageId, sectionId, fieldId, index, url) =>
          set({
            content: mapMediaField(get().content, pageId, sectionId, fieldId, (field) => ({
              ...field,
              urls: field.urls.map((entry, i) => (i === index ? url : entry)),
            })),
          }),
        moveMediaUrl: (pageId, sectionId, fieldId, from, to) =>
          set({
            content: mapMediaField(get().content, pageId, sectionId, fieldId, (field) => {
              const urls = [...field.urls];
              if (
                from === to ||
                from < 0 ||
                to < 0 ||
                from >= urls.length ||
                to >= urls.length
              ) {
                return field;
              }
              const [moved] = urls.splice(from, 1);
              urls.splice(to, 0, moved);
              return { ...field, urls };
            }),
          }),
        addMediaUrl: (pageId, sectionId, fieldId, url) =>
          set({
            content: mapMediaField(get().content, pageId, sectionId, fieldId, (field) => ({
              ...field,
              urls: [...field.urls, url],
            })),
          }),
        removeMediaUrl: (pageId, sectionId, fieldId, index) =>
          set({
            content: mapMediaField(get().content, pageId, sectionId, fieldId, (field) => {
              if (index < 0 || index >= field.urls.length) return field;
              return { ...field, urls: field.urls.filter((_, i) => i !== index) };
            }),
          }),
        toggleSection: (pageId, sectionId) =>
          set({
            content: mapSection(get().content, pageId, sectionId, (section) => ({
              ...section,
              isVisible: !section.isVisible,
            })),
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
        duplicateSection: (pageId, sectionId) => {
          const content = get().content;
          const page = content.pages.find((p) => p.id === pageId);
          const source = page?.sections.find((s) => s.id === sectionId);
          if (!page || !source) return null;

          const idx = page.sections.findIndex((s) => s.id === sectionId);
          const newId = nextSectionId(page.sections, source.type);
          const copy: SiteSection = {
            ...source,
            id: newId,
            name: `${source.name} copy`,
            style: cloneStyle(source.style),
            fields: source.fields.map(cloneField),
          };
          const sections = [...page.sections];
          sections.splice(idx + 1, 0, copy);

          set({
            content: {
              ...content,
              pages: content.pages.map((p) => (p.id === pageId ? { ...p, sections } : p)),
            },
          });
          return newId;
        },
        deleteSection: (pageId, sectionId) =>
          set({
            content: {
              ...get().content,
              pages: get().content.pages.map((page) =>
                page.id !== pageId
                  ? page
                  : { ...page, sections: page.sections.filter((s) => s.id !== sectionId) },
              ),
            },
          }),
        updateSectionStyle: (pageId, sectionId, patch) =>
          set({
            content: mapSection(get().content, pageId, sectionId, (section) => ({
              ...section,
              style: { ...section.style, ...patch },
            })),
          }),
        updateListItem: (pageId, sectionId, fieldId, itemId, values) =>
          set({
            content: mapListField(get().content, pageId, sectionId, fieldId, (field) => ({
              ...field,
              items: field.items.map((item) =>
                item.id === itemId ? { ...item, values: { ...item.values, ...values } } : item,
              ),
            })),
          }),
        addListItem: (pageId, sectionId, fieldId) => {
          const content = get().content;
          const field = findListField(findSection(content, pageId, sectionId), fieldId);
          if (!field) return null;

          const id = nextItemId(field.items, fieldId);
          const values = field.itemFields.reduce<Record<string, string>>((acc, def) => {
            acc[def.id] = '';
            return acc;
          }, {});

          set({
            content: mapListField(content, pageId, sectionId, fieldId, (listField) => ({
              ...listField,
              items: [...listField.items, { id, values }],
            })),
          });
          return id;
        },
        removeListItem: (pageId, sectionId, fieldId, itemId) =>
          set({
            content: mapListField(get().content, pageId, sectionId, fieldId, (field) => ({
              ...field,
              items: field.items.filter((item) => item.id !== itemId),
            })),
          }),
        moveListItem: (pageId, sectionId, fieldId, itemId, direction) =>
          set({
            content: mapListField(get().content, pageId, sectionId, fieldId, (field) => {
              const items = [...field.items];
              const idx = items.findIndex((item) => item.id === itemId);
              const target = direction === 'up' ? idx - 1 : idx + 1;
              if (idx < 0 || target < 0 || target >= items.length) return field;
              [items[idx], items[target]] = [items[target], items[idx]];
              return { ...field, items };
            }),
          }),
        resetToDefaults: () => set({ content: buildDefaultSiteContent() }),
        replaceContent: (content) => set({ content }),
      }),
      {
        name: storageKey,
        storage: createJSONStorage(() => localStorage),
        version: 2,
        migrate: (persisted) => {
          const stored = asRecord(persisted);
          return { content: migrateSiteContent(stored?.content) } as SiteContentState;
        },
        onRehydrateStorage: () => (state) => {
          state?.setHydrated();
        },
      },
    ),
  );
}

export const useSiteContentStore = createSiteContentStore(SITE_CONTENT_STORAGE_KEYS.published);

export const useSiteContentDraftStore = createSiteContentStore(SITE_CONTENT_STORAGE_KEYS.draft);

export function isDraftDirty(): boolean {
  return (
    JSON.stringify(useSiteContentDraftStore.getState().content) !==
    JSON.stringify(useSiteContentStore.getState().content)
  );
}

export function useIsDraftDirty(): boolean {
  useSiteContentDraftStore((state) => state.content);
  useSiteContentStore((state) => state.content);
  return isDraftDirty();
}

export function publishSiteContent(): void {
  const sanitized = sanitizeContent(useSiteContentDraftStore.getState().content);
  useSiteContentStore.getState().replaceContent(cloneContent(sanitized));
  useSiteContentDraftStore.getState().replaceContent(sanitized);
}

export function resetSiteContentDraft(): void {
  useSiteContentDraftStore.getState().replaceContent(buildDefaultSiteContent());
}
