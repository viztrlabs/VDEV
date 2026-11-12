import { homepageData } from '@/data/homepage';

export interface SiteTextField {
  kind: 'text';
  id: string;
  label: string;
  value: string;
  multiline?: boolean;
}

export interface SiteMediaField {
  kind: 'media';
  id: string;
  label: string;
  mediaType: 'image' | 'video';
  urls: string[];
  placeholderUrl?: string;
  isPlaceholder?: boolean;
}

export type SiteField = SiteTextField | SiteMediaField;

export interface SiteSection {
  id: string;
  name: string;
  isVisible: boolean;
  fields: SiteField[];
}

export interface SitePage {
  id: string;
  label: string;
  route: string;
  sections: SiteSection[];
}

export interface SiteContent {
  pages: SitePage[];
}

const text = (id: string, label: string, value: string, multiline = false): SiteTextField => ({
  kind: 'text',
  id,
  label,
  value,
  multiline,
});

const media = (
  id: string,
  label: string,
  mediaType: 'image' | 'video',
  urls: string[],
  placeholderUrl?: string,
): SiteMediaField => ({ kind: 'media', id, label, mediaType, urls, placeholderUrl, isPlaceholder: false });

const section = (id: string, name: string, fields: SiteField[] = []): SiteSection => ({
  id,
  name,
  isVisible: true,
  fields,
});

export function buildDefaultSiteContent(): SiteContent {
  const hero = homepageData.hero;
  const showreel = homepageData.showreel;
  return {
    pages: [
      {
        id: 'home',
        label: 'Homepage',
        route: '/',
        sections: [
          section('hero', 'Hero', [
            text('headline', 'Headline', hero.headline),
            text('subheadline', 'Subheadline', hero.subheadline),
            text('description', 'Description', hero.description, true),
            text('primaryCtaLabel', 'Primary CTA Label', hero.primaryCTA.label),
            text('primaryCtaHref', 'Primary CTA Link', hero.primaryCTA.href),
            text('secondaryCtaLabel', 'Secondary CTA Label', hero.secondaryCTA.label),
            text('secondaryCtaHref', 'Secondary CTA Link', hero.secondaryCTA.href),
            media('heroImages', 'Hero Slideshow Images', 'image', [...hero.images]),
          ]),
          section('marquee', 'Marquee Ticker'),
          section('four-pillars', 'Four Pillars'),
          section('studio', 'Studio', [
            text('title', 'Title', homepageData.studio.title),
            text('tagline', 'Tagline', homepageData.studio.tagline),
          ]),
          section('xr-world', 'XR World', [
            text('title', 'Title', homepageData.xrWorld.title),
            text('tagline', 'Tagline', homepageData.xrWorld.tagline),
          ]),
          section('creator', 'Creator'),
          section('solutions', 'Solutions'),
          section('showreel', 'Showreel', [
            text('title', 'Title', showreel.title),
            text('subtitle', 'Subtitle', showreel.subtitle),
            media('videoUrl', 'Video', 'video', [showreel.videoUrl]),
            media('poster', 'Poster Image', 'image', [showreel.poster]),
          ]),
          section('portfolio-preview', 'Portfolio Preview'),
          section('xr-experience', 'XR Experience'),
          section('track-project', 'Track Project'),
          section('benefits', 'Benefits'),
          section('how-it-works', 'How It Works'),
          section('use-cases', 'Use Cases'),
          section('testimonials', 'Testimonials'),
          section('faq', 'FAQ'),
          section('final-cta', 'Final CTA', [
            text('badge', 'Badge Text', 'INITIALIZE ARCHITECTURAL PIPELINE'),
            text('heading', 'Heading', 'Ready to Transform Your Vision into Reality?'),
            text('description', 'Description', 'From unbuilt CAD masterplans to photorealistic 8K imagery, cinematic films, and interactive browser-based experiences.', true),
            text('primaryLabel', 'Primary Button Label', 'Start Your Project'),
            text('primaryHref', 'Primary Button Link', '/contact'),
            text('secondaryLabel', 'Secondary Button Label', 'Book Consultation'),
            text('secondaryHref', 'Secondary Button Link', '/book-consultation'),
          ]),
        ],
      },
    ],
  };
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
