import { homepageData } from '@/data/homepage';
import {
  SECTION_DEFS,
  SECTION_TYPES,
  type SectionType,
  type SiteContent,
  type SiteField,
  type SiteListItem,
  type SiteSection,
  type SiteSectionStyle,
} from '@/lib/site-content';

type TextValues = Partial<Record<SectionType, Record<string, string>>>;

const { hero, marquee, studio, xrWorld, creator, solutions, showreel } = homepageData;

const TEXT_VALUES: TextValues = {
  hero: {
    headline: hero.headline,
    subheadline: hero.subheadline,
    description: hero.description,
    primaryCtaLabel: hero.primaryCTA.label,
    primaryCtaHref: hero.primaryCTA.href,
    secondaryCtaLabel: hero.secondaryCTA.label,
    secondaryCtaHref: hero.secondaryCTA.href,
    eyebrowPrimary: 'NEXT-GEN SPATIAL ARCHITECTURE',
    eyebrowSecondary: 'CGI Studio & Real-time WebXR',
    scrollLabel: 'Scroll to explore',
  },
  'four-pillars': {
    eyebrow: 'THE VIZTR PLATFORM',
    heading: 'Four Pillars. One Vision.',
    subheading: 'From visualization to experience — from creation to delivery.',
    pillarCtaLabel: 'Explore',
    previewProjectName: 'LUXURY SMART VILLA',
    previewProjectId: 'Project #VTR-2048',
    previewProgressValue: '78%',
    previewStatusLabel: 'In Progress',
    previewLastUpdate: 'Last update · 12 min ago',
    previewCtaLabel: 'Review Project',
  },
  studio: {
    badge: 'VIZTR STUDIO',
    title: studio.title,
    tagline: studio.tagline,
    cardCtaLabel: 'Explore Studio',
  },
  'xr-world': {
    eyebrow: 'Section 02',
    title: xrWorld.title,
    tagline: xrWorld.tagline,
    ctaLabel: xrWorld.cta.label,
    cardCtaTemplate: 'Explore {name}',
  },
  creator: {
    eyebrow: 'Creator',
    title: creator.title,
    tagline: creator.tagline,
    openToolLabel: 'Open Tool',
    comingSoonLabel: 'Coming Soon',
    ctaLabel: creator.cta.label,
  },
  solutions: {
    eyebrow: 'Solutions',
    title: solutions.title,
    subtitle: solutions.subtitle,
    cardCtaLabel: 'Learn More',
  },
  showreel: {
    badge: 'CINEMATIC REEL 2026 // 4K 60FPS',
    title: showreel.title,
    subtitle: showreel.subtitle,
    ctaText: showreel.ctaText,
    ctaHref: showreel.ctaHref,
  },
  'portfolio-preview': {
    eyebrow: 'ARCHIVE & ARTIFACTS',
    heading: 'Selected Works',
    description: 'Filter between photorealistic still imagery, cinematic films, and WebXR experiences.',
    allProjectsLabel: 'ALL PROJECTS →',
    allProjectsHref: '/portfolio',
    ctaPanoramaLabel: '360° Node',
    ctaModelLabel: 'WebXR 3D',
    ctaGalleryLabel: 'Gallery',
    caseStudyTitle: 'Case Study Page',
  },
  'xr-experience': {
    eyebrow: 'LIVE INTERACTIVE RUNTIME',
    heading: 'Experience the Future of Architecture',
    description: 'Test zero-install spatial modules directly in your browser with hardware-accelerated WebXR.',
  },
  'track-project': {
    eyebrow: 'TELEMETRY & LOGS',
    heading: 'Track Active Pipeline Milestone',
    description: 'Monitor your 7-stage production pipeline, review draft proofs, and access master files in real time.',
  },
  benefits: {
    eyebrow: 'COMPETITIVE ADVANTAGE',
    heading: 'Why Visionaries Choose VizTR',
    description: 'Engineered to elevate architectural presentation, accelerate pre-sales, and eliminate client review friction.',
  },
  'how-it-works': {
    eyebrow: 'PIPELINE WORKFLOW',
    heading: 'How It Works',
    description: 'From raw CAD geometry to high-impact marketing imagery and interactive spatial links.',
    syncLabel: 'Full Portal Sync',
  },
  'use-cases': {
    eyebrow: 'VERTICAL SPECIALIZATION',
    heading: 'Built For Your Industry',
    description: 'Solving key commercialization and presentation hurdles across the built environment spectrum.',
    panelEyebrow: 'INDUSTRY SPECIFICATION',
    challengeLabel: 'The Challenge',
    solutionLabel: 'VizTR Solution',
    impactLabel: 'Commercial Impact',
  },
  testimonials: {
    eyebrow: 'CLIENT ENDORSEMENTS & METRICS',
    heading: 'What Clients Say',
    description: 'Trusted by premier architects, sovereign wealth developers, and luxury interior studios worldwide.',
  },
  faq: {
    eyebrow: 'KNOWLEDGE BASE',
    heading: 'Frequently Asked Questions',
    description: 'Architectural CGI, WebXR formats, and project delivery specs.',
  },
  'final-cta': {
    badge: 'INITIALIZE ARCHITECTURAL PIPELINE',
    heading: 'Ready to Transform Your Vision into Reality?',
    description: 'From unbuilt CAD masterplans to photorealistic 8K imagery, cinematic films, and interactive browser-based experiences.',
    primaryLabel: 'Start Your Project',
    primaryHref: '/contact',
    secondaryLabel: 'Book Consultation',
    secondaryHref: '/book-consultation',
  },
};

const MEDIA_URLS: Partial<Record<SectionType, Record<string, string[]>>> = {
  hero: {
    heroImages: [...hero.images],
  },
  showreel: {
    videoUrl: [showreel.videoUrl],
    poster: [showreel.poster],
  },
};

const item = (
  id: string,
  values: Record<string, string>,
  meta?: Record<string, string>,
): SiteListItem => (meta ? { id, values, meta } : { id, values });

type XrWorldExperienceSeed = {
  id: string;
  name: string;
  purpose: string;
  icon: string;
  href: string;
  badge?: string;
};

type CreatorToolSeed = {
  id: string;
  name: string;
  icon: string;
  description: string;
  href: string;
  comingSoon?: boolean;
};

const xrWorldSeeds: XrWorldExperienceSeed[] = xrWorld.experiences;
const creatorToolSeeds: CreatorToolSeed[] = creator.tools;

const LIST_ITEMS: Partial<Record<SectionType, Record<string, SiteListItem[]>>> = {
  marquee: {
    marqueeItems: marquee.items.map((value, index) =>
      item(`marquee-${index + 1}`, { value }),
    ),
  },
  'four-pillars': {
    pillars: [
      item(
        'studio',
        {
          number: '01',
          title: 'Studio',
          verb: 'Create.',
          description: 'Professional architectural visualization with photorealistic renders and cinematic walkthroughs.',
        },
        { icon: 'Palette', href: '/studio', color: 'text-[#00F0FF]', bgColor: 'bg-[#00F0FF]/10' },
      ),
      item(
        'xr-world',
        {
          number: '02',
          title: 'XR World',
          verb: 'Experience.',
          description: 'Interactive, immersive property experiences with WebXR, WebAR, VR, and virtual tours.',
        },
        { icon: 'Box', href: '/xr-world', color: 'text-[#42CF8B]', bgColor: 'bg-[#42CF8B]/10' },
      ),
      item(
        'project-hub',
        {
          number: '03',
          title: 'Project Hub',
          verb: 'Track.',
          description: 'Real-time project progress, feedback, and delivery — all in one place.',
        },
        { icon: 'BarChart3', href: '/track-project', color: 'text-[#F59E0B]', bgColor: 'bg-[#F59E0B]/10' },
      ),
      item(
        'creator',
        {
          number: '04',
          title: 'Creator',
          verb: 'Build.',
          description: 'Tools to create and configure experiences with 3D editing, Gaussian Splat, and publishing.',
        },
        { icon: 'Wrench', href: '/creator', color: 'text-[#EC4899]', bgColor: 'bg-[#EC4899]/10' },
      ),
    ],
    previewStages: [
      item('modeling', { label: 'Modeling' }, { status: '✓' }),
      item('visualization', { label: 'Visualization' }, { status: '78%' }),
      item('xr-experience', { label: 'XR Experience' }, { status: 'In Progress' }),
      item('final-delivery', { label: 'Final Delivery' }, { status: '—' }),
    ],
  },
  studio: {
    cards: studio.cards.map((card) =>
      item(
        card.id,
        { title: card.title, description: card.description },
        {
          icon: card.icon,
          href: card.cta.href,
          services: card.services.map((service) => service.label).join('\n'),
        },
      ),
    ),
  },
  'xr-world': {
    experiences: xrWorldSeeds.map((experience) =>
      item(
        experience.id,
        { name: experience.name, purpose: experience.purpose, badge: experience.badge ?? '' },
        { icon: experience.icon, href: experience.href },
      ),
    ),
  },
  creator: {
    tools: creatorToolSeeds.map((tool) =>
      item(
        tool.id,
        { name: tool.name, description: tool.description },
        tool.comingSoon
          ? { icon: tool.icon, href: tool.href, comingSoon: 'true' }
          : { icon: tool.icon, href: tool.href },
      ),
    ),
  },
  solutions: {
    audiences: solutions.audiences.map((audience) =>
      item(
        audience.id,
        { title: audience.title, description: audience.description },
        { icon: audience.icon, href: audience.href },
      ),
    ),
  },
  'portfolio-preview': {
    filterLabels: [
      item('all', { label: 'All Works' }, { category: 'all' }),
      item('exterior', { label: 'Exterior' }, { category: 'exterior' }),
      item('interior', { label: 'Interior' }, { category: 'interior' }),
      item('walkthrough', { label: 'Walkthrough' }, { category: 'walkthrough' }),
      item('xr', { label: 'XR' }, { category: 'xr' }),
      item('360', { label: '360' }, { category: '360' }),
    ],
  },
  'xr-experience': {
    experiences: [
      item(
        'webar',
        {
          title: 'WebAR Experience',
          desc: 'Project 3D spatial buildings onto physical tables or on-site parcels via mobile browser.',
          cta: 'Launch AR Simulator',
        },
        {
          actionType: 'modelViewer',
          actionTarget: 'WebAR Tabletop Model',
          icon: 'ScanLine',
          color: 'text-emerald-400',
        },
      ),
      item(
        'webxr',
        {
          title: 'WebXR 3D Orbit',
          desc: 'Real-time in-browser orbital exploration with PBR lighting and material variations.',
          cta: 'Explore 3D Model',
        },
        {
          actionType: 'modelViewer',
          actionTarget: 'WebXR Apex Tower Model',
          icon: 'Box',
          color: 'text-rose-400',
        },
      ),
      item(
        'vr',
        {
          title: 'VR Headset Immersion',
          desc: 'Full 90 FPS stereoscopic immersion optimized for Meta Quest and Apple Vision Pro.',
          cta: 'Request VR Package',
        },
        {
          actionType: 'link',
          actionTarget: '/xr-world/virtual-reality',
          icon: 'Headset',
          color: 'text-sky-400',
        },
      ),
      item(
        'tour',
        {
          title: '16K 360° Virtual Tour',
          desc: 'High-dynamic-range spherical nodes with pulsing spatial information hotspots.',
          cta: 'Explore 360° Tour',
        },
        {
          actionType: 'panorama',
          actionTarget: 'Desert Mirage Pavilion 360',
          icon: 'Compass',
          color: 'text-amber-400',
        },
      ),
    ],
  },
  benefits: {
    benefits: homepageData.benefits.map((benefit, index) =>
      item(
        `benefit-${index + 1}`,
        { title: benefit.title, desc: benefit.desc },
        {
          icon: [
            'Sparkles',
            'Zap',
            'Smartphone',
            'Eye',
            'TrendingUp',
            'HeartHandshake',
            'CloudCheck',
          ][index] ?? 'Sparkles',
        },
      ),
    ),
  },
  'how-it-works': {
    steps: homepageData.howItWorks.map((step) =>
      item(`step-${step.step}`, { title: step.title, desc: step.desc }),
    ),
  },
  'use-cases': {
    cases: homepageData.useCases.map((useCase, index) =>
      item(
        `case-${index + 1}`,
        {
          audience: useCase.audience,
          problem: useCase.problem,
          solution: useCase.solution,
          benefit: useCase.benefit,
        },
        {
          icon: ['Building2', 'Compass', 'Home', 'Megaphone', 'Globe'][index] ?? 'Building2',
        },
      ),
    ),
  },
  testimonials: {
    testimonials: homepageData.testimonials.map((testimonial, index) =>
      item(
        `testimonial-${index + 1}`,
        {
          quote: testimonial.quote,
          clientName: testimonial.clientName,
          role: testimonial.role,
        },
        { rating: String(testimonial.rating) },
      ),
    ),
    stats: homepageData.stats.map((stat, index) =>
      item(`stat-${index + 1}`, { value: stat.value, label: stat.label }),
    ),
  },
  faq: {
    faq: homepageData.faq.map((entry, index) =>
      item(`faq-${index + 1}`, { q: entry.q, a: entry.a }),
    ),
  },
};

const SECTION_STYLES: Partial<Record<SectionType, SiteSectionStyle>> = {
  showreel: { media: { autoplay: false, muted: true, loop: true } },
};

function buildFields(type: SectionType): SiteField[] {
  return SECTION_DEFS[type].fields.map((def) => {
    if (def.kind === 'text') {
      return { ...def, value: TEXT_VALUES[type]?.[def.id] ?? '' };
    }
    if (def.kind === 'media') {
      return { ...def, urls: MEDIA_URLS[type]?.[def.id] ?? [], isPlaceholder: false };
    }
    return { ...def, items: LIST_ITEMS[type]?.[def.id] ?? [] };
  });
}

function buildSection(type: SectionType): SiteSection {
  return {
    id: type,
    type,
    name: SECTION_DEFS[type].name,
    isVisible: true,
    style: { ...(SECTION_STYLES[type] ?? {}) },
    fields: buildFields(type),
  };
}

export function getDefaultSection(type: SectionType): SiteSection {
  return buildSection(type);
}

export function buildDefaultSections(): SiteSection[] {
  return SECTION_TYPES.map((type) => buildSection(type));
}

export function buildDefaultSiteContent(): SiteContent {
  return {
    version: 2,
    pages: [
      {
        id: 'home',
        label: 'Homepage',
        route: '/',
        sections: buildDefaultSections(),
      },
    ],
  };
}
