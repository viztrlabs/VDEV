export type SectionType =
  | 'hero'
  | 'marquee'
  | 'four-pillars'
  | 'studio'
  | 'xr-world'
  | 'creator'
  | 'solutions'
  | 'showreel'
  | 'portfolio-preview'
  | 'xr-experience'
  | 'track-project'
  | 'benefits'
  | 'how-it-works'
  | 'use-cases'
  | 'testimonials'
  | 'faq'
  | 'final-cta';

export interface SiteTextField {
  kind: 'text';
  id: string;
  label: string;
  value: string;
  multiline?: boolean;
  rich?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface SiteMediaField {
  kind: 'media';
  id: string;
  label: string;
  mediaType: 'image' | 'video';
  urls: string[];
  placeholderUrl?: string;
  isPlaceholder?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export interface SiteListItem {
  id: string;
  values: Record<string, string>;
  meta?: Record<string, string>;
}

export interface SiteListItemFieldDef {
  id: string;
  label: string;
  multiline?: boolean;
  rich?: boolean;
}

export interface SiteListField {
  kind: 'list';
  id: string;
  label: string;
  itemLabel: string;
  itemFields: SiteListItemFieldDef[];
  items: SiteListItem[];
  canAdd?: boolean;
  canRemove?: boolean;
  canReorder?: boolean;
}

export type SiteField = SiteTextField | SiteMediaField | SiteListField;

export interface SiteSectionStyle {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  media?: { autoplay?: boolean; muted?: boolean; loop?: boolean };
}

export interface SiteSection {
  id: string;
  type: SectionType;
  name: string;
  isVisible: boolean;
  style: SiteSectionStyle;
  fields: SiteField[];
}

export interface SitePage {
  id: string;
  label: string;
  route: string;
  sections: SiteSection[];
}

export interface SiteContent {
  version: 2;
  pages: SitePage[];
}

export interface SiteTextDef {
  kind: 'text';
  id: string;
  label: string;
  multiline?: boolean;
  rich?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface SiteMediaDef {
  kind: 'media';
  id: string;
  label: string;
  mediaType: 'image' | 'video';
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export interface SiteListDef {
  kind: 'list';
  id: string;
  label: string;
  itemLabel: string;
  itemFields: SiteListItemFieldDef[];
  canAdd?: boolean;
  canRemove?: boolean;
  canReorder?: boolean;
}

export type SiteFieldDef = SiteTextDef | SiteMediaDef | SiteListDef;

export interface SiteSectionDef {
  name: string;
  fields: SiteFieldDef[];
}

export const SECTION_TYPES: SectionType[] = [
  'hero',
  'marquee',
  'four-pillars',
  'studio',
  'xr-world',
  'creator',
  'solutions',
  'showreel',
  'portfolio-preview',
  'xr-experience',
  'track-project',
  'benefits',
  'how-it-works',
  'use-cases',
  'testimonials',
  'faq',
  'final-cta',
];

export const SECTION_DEFS: Record<SectionType, SiteSectionDef> = {
  hero: {
    name: 'Hero',
    fields: [
      { kind: 'text', id: 'headline', label: 'Headline' },
      { kind: 'text', id: 'subheadline', label: 'Subheadline' },
      { kind: 'text', id: 'description', label: 'Description', multiline: true, rich: true },
      { kind: 'text', id: 'primaryCtaLabel', label: 'Primary CTA Label' },
      { kind: 'text', id: 'primaryCtaHref', label: 'Primary CTA Link' },
      { kind: 'text', id: 'secondaryCtaLabel', label: 'Secondary CTA Label' },
      { kind: 'text', id: 'secondaryCtaHref', label: 'Secondary CTA Link' },
      { kind: 'text', id: 'eyebrowPrimary', label: 'Primary Eyebrow' },
      { kind: 'text', id: 'eyebrowSecondary', label: 'Secondary Eyebrow' },
      { kind: 'text', id: 'scrollLabel', label: 'Scroll Label' },
      { kind: 'media', id: 'heroImages', label: 'Hero Slideshow Images', mediaType: 'image' },
    ],
  },
  marquee: {
    name: 'Marquee',
    fields: [
      {
        kind: 'list',
        id: 'marqueeItems',
        label: 'Marquee Items',
        itemLabel: 'Item',
        itemFields: [{ id: 'value', label: 'Value' }],
      },
    ],
  },
  'four-pillars': {
    name: 'Four Pillars',
    fields: [
      { kind: 'text', id: 'eyebrow', label: 'Eyebrow' },
      { kind: 'text', id: 'heading', label: 'Heading' },
      { kind: 'text', id: 'subheading', label: 'Subheading', multiline: true, rich: true },
      { kind: 'text', id: 'pillarCtaLabel', label: 'Pillar CTA Label' },
      { kind: 'text', id: 'previewProjectName', label: 'Preview Project Name' },
      { kind: 'text', id: 'previewProjectId', label: 'Preview Project ID' },
      { kind: 'text', id: 'previewProgressValue', label: 'Preview Progress Value' },
      { kind: 'text', id: 'previewStatusLabel', label: 'Preview Status Label' },
      { kind: 'text', id: 'previewLastUpdate', label: 'Preview Last Update' },
      { kind: 'text', id: 'previewCtaLabel', label: 'Preview CTA Label' },
      {
        kind: 'list',
        id: 'pillars',
        label: 'Pillars',
        itemLabel: 'Pillar',
        itemFields: [
          { id: 'number', label: 'Number' },
          { id: 'title', label: 'Title' },
          { id: 'verb', label: 'Verb' },
          { id: 'description', label: 'Description', multiline: true, rich: true },
        ],
      },
      {
        kind: 'list',
        id: 'previewStages',
        label: 'Preview Stages',
        itemLabel: 'Stage',
        itemFields: [{ id: 'label', label: 'Label' }],
        canAdd: false,
        canRemove: false,
      },
    ],
  },
  studio: {
    name: 'Studio',
    fields: [
      { kind: 'text', id: 'badge', label: 'Badge' },
      { kind: 'text', id: 'title', label: 'Title' },
      { kind: 'text', id: 'tagline', label: 'Tagline' },
      { kind: 'text', id: 'cardCtaLabel', label: 'Card CTA Label' },
      {
        kind: 'list',
        id: 'cards',
        label: 'Cards',
        itemLabel: 'Card',
        itemFields: [
          { id: 'title', label: 'Title' },
          { id: 'description', label: 'Description', multiline: true, rich: true },
        ],
      },
    ],
  },
  'xr-world': {
    name: 'XR World',
    fields: [
      { kind: 'text', id: 'eyebrow', label: 'Eyebrow' },
      { kind: 'text', id: 'title', label: 'Title' },
      { kind: 'text', id: 'tagline', label: 'Tagline' },
      { kind: 'text', id: 'ctaLabel', label: 'CTA Label' },
      { kind: 'text', id: 'cardCtaTemplate', label: 'Card CTA Template' },
      {
        kind: 'list',
        id: 'experiences',
        label: 'Experiences',
        itemLabel: 'Experience',
        itemFields: [
          { id: 'name', label: 'Name' },
          { id: 'purpose', label: 'Purpose', multiline: true, rich: true },
          { id: 'badge', label: 'Badge' },
        ],
      },
    ],
  },
  creator: {
    name: 'Creator',
    fields: [
      { kind: 'text', id: 'eyebrow', label: 'Eyebrow' },
      { kind: 'text', id: 'title', label: 'Title' },
      { kind: 'text', id: 'tagline', label: 'Tagline' },
      { kind: 'text', id: 'openToolLabel', label: 'Open Tool Label' },
      { kind: 'text', id: 'comingSoonLabel', label: 'Coming Soon Label' },
      { kind: 'text', id: 'ctaLabel', label: 'CTA Label' },
      {
        kind: 'list',
        id: 'tools',
        label: 'Tools',
        itemLabel: 'Tool',
        itemFields: [
          { id: 'name', label: 'Name' },
          { id: 'description', label: 'Description', multiline: true, rich: true },
        ],
      },
    ],
  },
  solutions: {
    name: 'Solutions',
    fields: [
      { kind: 'text', id: 'eyebrow', label: 'Eyebrow' },
      { kind: 'text', id: 'title', label: 'Title' },
      { kind: 'text', id: 'subtitle', label: 'Subtitle', multiline: true, rich: true },
      { kind: 'text', id: 'cardCtaLabel', label: 'Card CTA Label' },
      {
        kind: 'list',
        id: 'audiences',
        label: 'Audiences',
        itemLabel: 'Audience',
        itemFields: [
          { id: 'title', label: 'Title' },
          { id: 'description', label: 'Description', multiline: true, rich: true },
        ],
      },
    ],
  },
  showreel: {
    name: 'Showreel',
    fields: [
      { kind: 'text', id: 'badge', label: 'Badge' },
      { kind: 'text', id: 'title', label: 'Title' },
      { kind: 'text', id: 'subtitle', label: 'Subtitle', multiline: true, rich: true },
      { kind: 'text', id: 'ctaText', label: 'CTA Text' },
      { kind: 'text', id: 'ctaHref', label: 'CTA Link' },
      { kind: 'media', id: 'videoUrl', label: 'Video', mediaType: 'video' },
      { kind: 'media', id: 'poster', label: 'Poster Image', mediaType: 'image' },
    ],
  },
  'portfolio-preview': {
    name: 'Portfolio Preview',
    fields: [
      { kind: 'text', id: 'eyebrow', label: 'Eyebrow' },
      { kind: 'text', id: 'heading', label: 'Heading' },
      { kind: 'text', id: 'description', label: 'Description', multiline: true, rich: true },
      { kind: 'text', id: 'allProjectsLabel', label: 'All Projects Label' },
      { kind: 'text', id: 'allProjectsHref', label: 'All Projects Link' },
      { kind: 'text', id: 'ctaPanoramaLabel', label: 'Panorama CTA Label' },
      { kind: 'text', id: 'ctaModelLabel', label: 'Model CTA Label' },
      { kind: 'text', id: 'ctaGalleryLabel', label: 'Gallery CTA Label' },
      { kind: 'text', id: 'caseStudyTitle', label: 'Case Study Title' },
      {
        kind: 'list',
        id: 'filterLabels',
        label: 'Filter Labels',
        itemLabel: 'Filter',
        itemFields: [{ id: 'label', label: 'Label' }],
        canAdd: false,
        canRemove: false,
      },
    ],
  },
  'xr-experience': {
    name: 'XR Experience',
    fields: [
      { kind: 'text', id: 'eyebrow', label: 'Eyebrow' },
      { kind: 'text', id: 'heading', label: 'Heading' },
      { kind: 'text', id: 'description', label: 'Description', multiline: true, rich: true },
      {
        kind: 'list',
        id: 'experiences',
        label: 'Experiences',
        itemLabel: 'Experience',
        itemFields: [
          { id: 'title', label: 'Title' },
          { id: 'desc', label: 'Description', multiline: true, rich: true },
          { id: 'cta', label: 'CTA' },
        ],
      },
    ],
  },
  'track-project': {
    name: 'Track Project',
    fields: [
      { kind: 'text', id: 'eyebrow', label: 'Eyebrow' },
      { kind: 'text', id: 'heading', label: 'Heading' },
      { kind: 'text', id: 'description', label: 'Description', multiline: true, rich: true },
    ],
  },
  benefits: {
    name: 'Benefits',
    fields: [
      { kind: 'text', id: 'eyebrow', label: 'Eyebrow' },
      { kind: 'text', id: 'heading', label: 'Heading' },
      { kind: 'text', id: 'description', label: 'Description', multiline: true, rich: true },
      {
        kind: 'list',
        id: 'benefits',
        label: 'Benefits',
        itemLabel: 'Benefit',
        itemFields: [
          { id: 'title', label: 'Title' },
          { id: 'desc', label: 'Description', multiline: true, rich: true },
        ],
      },
    ],
  },
  'how-it-works': {
    name: 'How It Works',
    fields: [
      { kind: 'text', id: 'eyebrow', label: 'Eyebrow' },
      { kind: 'text', id: 'heading', label: 'Heading' },
      { kind: 'text', id: 'description', label: 'Description', multiline: true, rich: true },
      { kind: 'text', id: 'syncLabel', label: 'Sync Label' },
      {
        kind: 'list',
        id: 'steps',
        label: 'Steps',
        itemLabel: 'Step',
        itemFields: [
          { id: 'title', label: 'Title' },
          { id: 'desc', label: 'Description', multiline: true, rich: true },
        ],
      },
    ],
  },
  'use-cases': {
    name: 'Use Cases',
    fields: [
      { kind: 'text', id: 'eyebrow', label: 'Eyebrow' },
      { kind: 'text', id: 'heading', label: 'Heading' },
      { kind: 'text', id: 'description', label: 'Description', multiline: true, rich: true },
      { kind: 'text', id: 'panelEyebrow', label: 'Panel Eyebrow' },
      { kind: 'text', id: 'challengeLabel', label: 'Challenge Label' },
      { kind: 'text', id: 'solutionLabel', label: 'Solution Label' },
      { kind: 'text', id: 'impactLabel', label: 'Impact Label' },
      {
        kind: 'list',
        id: 'cases',
        label: 'Use Cases',
        itemLabel: 'Use Case',
        itemFields: [
          { id: 'audience', label: 'Audience' },
          { id: 'problem', label: 'Problem', multiline: true, rich: true },
          { id: 'solution', label: 'Solution', multiline: true, rich: true },
          { id: 'benefit', label: 'Benefit', multiline: true, rich: true },
        ],
      },
    ],
  },
  testimonials: {
    name: 'Testimonials',
    fields: [
      { kind: 'text', id: 'eyebrow', label: 'Eyebrow' },
      { kind: 'text', id: 'heading', label: 'Heading' },
      { kind: 'text', id: 'description', label: 'Description', multiline: true, rich: true },
      {
        kind: 'list',
        id: 'testimonials',
        label: 'Testimonials',
        itemLabel: 'Testimonial',
        itemFields: [
          { id: 'quote', label: 'Quote', multiline: true, rich: true },
          { id: 'clientName', label: 'Client Name' },
          { id: 'role', label: 'Role' },
        ],
      },
      {
        kind: 'list',
        id: 'stats',
        label: 'Stats',
        itemLabel: 'Stat',
        itemFields: [
          { id: 'value', label: 'Value' },
          { id: 'label', label: 'Label' },
        ],
      },
    ],
  },
  faq: {
    name: 'FAQ',
    fields: [
      { kind: 'text', id: 'eyebrow', label: 'Eyebrow' },
      { kind: 'text', id: 'heading', label: 'Heading' },
      { kind: 'text', id: 'description', label: 'Description', multiline: true, rich: true },
      {
        kind: 'list',
        id: 'faq',
        label: 'FAQ',
        itemLabel: 'FAQ',
        itemFields: [
          { id: 'q', label: 'Question' },
          { id: 'a', label: 'Answer', multiline: true, rich: true },
        ],
      },
    ],
  },
  'final-cta': {
    name: 'Final CTA',
    fields: [
      { kind: 'text', id: 'badge', label: 'Badge' },
      { kind: 'text', id: 'heading', label: 'Heading' },
      { kind: 'text', id: 'description', label: 'Description', multiline: true, rich: true },
      { kind: 'text', id: 'primaryLabel', label: 'Primary Label' },
      { kind: 'text', id: 'primaryHref', label: 'Primary Link' },
      { kind: 'text', id: 'secondaryLabel', label: 'Secondary Label' },
      { kind: 'text', id: 'secondaryHref', label: 'Secondary Link' },
    ],
  },
};

export function getSectionDef(type: SectionType): SiteSectionDef {
  return SECTION_DEFS[type];
}

export function getTextField(sectionData: SiteSection, id: string, fallback: string): string {
  const field = sectionData.fields.find(
    (f): f is SiteTextField => f.kind === 'text' && f.id === id,
  );
  return field?.value ?? fallback;
}

export function getMediaUrls(sectionData: SiteSection, id: string, fallback: string[]): string[] {
  const field = sectionData.fields.find(
    (f): f is SiteMediaField => f.kind === 'media' && f.id === id,
  );
  return field?.urls?.length ? field.urls : fallback;
}

export function isMediaPlaceholder(sectionData: SiteSection, id: string): boolean {
  const field = sectionData.fields.find(
    (f): f is SiteMediaField => f.kind === 'media' && f.id === id,
  );
  return field?.isPlaceholder ?? false;
}

export function getPlaceholderUrl(sectionData: SiteSection, id: string): string | undefined {
  const field = sectionData.fields.find(
    (f): f is SiteMediaField => f.kind === 'media' && f.id === id,
  );
  return field?.placeholderUrl;
}

export function getListItems(sectionData: SiteSection, id: string): SiteListItem[] {
  const field = sectionData.fields.find(
    (f): f is SiteListField => f.kind === 'list' && f.id === id,
  );
  return field?.items ?? [];
}

export function getListItemValues(
  sectionData: SiteSection,
  id: string,
  itemId: string,
): Record<string, string> {
  const item = getListItems(sectionData, id).find((i) => i.id === itemId);
  return item?.values ?? {};
}

export function getSectionStyle(sectionData: SiteSection): SiteSectionStyle {
  return sectionData.style ?? {};
}

export {
  buildDefaultSections,
  buildDefaultSiteContent,
  getDefaultSection,
} from './site-content-defaults';
