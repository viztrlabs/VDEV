'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { homepageData } from '@/data/homepage';
import { servicePagesData, blogPosts as initialBlogPosts } from '@/data/pages';

export interface CMSPageItem {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  category: 'core' | 'studio' | 'xr' | 'legal' | 'custom';
  templateName?: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl: string;
    ogImage?: string;
    noIndex: boolean;
  };
  contentSummary: string;
  sectionsCount: number;
  viewCount: number;
}

export interface CMSBlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string[];
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  image: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  tags: string[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl: string;
  };
}

export interface CMSService {
  id: string;
  name: string;
  slug: string;
  category: 'studio' | 'xr_world' | 'cloud_gpu';
  heroBadge: string;
  tagline: string;
  description: string;
  heroImage: string;
  status: 'draft' | 'published';
  priceStartingFrom: string;
  timeline: string;
  capabilities: string[];
  deliverables: string[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

export interface CMSProject {
  id: string;
  title: string;
  slug: string;
  client: string;
  category: 'Exterior' | 'Interior' | 'Animation' | 'WebXR' | 'Pixel Streaming';
  year: string;
  coverImage: string;
  gallery: string[];
  status: 'draft' | 'published';
  featured: boolean;
  model3dUrl?: string;
  description: string;
  location: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

export interface CMSTestimonial {
  id: string;
  clientName: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  avatarUrl?: string;
  projectReference?: string;
  isVisible: boolean;
  createdAt: string;
}

export interface CMSMediaItem {
  id: string;
  name: string;
  url: string;
  placeholderUrl: string;
  isPlaceholder: boolean;
  type: 'image' | 'video' | '3d_model' | 'document';
  format: string;
  sizeBytes: number;
  dimensions?: string;
  category: 'hero' | 'gallery' | 'models' | 'renders' | 'branding';
  uploadedAt: string;
  tags: string[];
}

export interface CMSNavItem {
  id: string;
  label: string;
  url: string;
  isExternal: boolean;
  isVisible: boolean;
  order: number;
  badge?: string;
  children?: Array<{
    id: string;
    label: string;
    url: string;
    description?: string;
    badge?: string;
    isVisible: boolean;
  }>;
}

export interface CMSSocialLink {
  id: string;
  platform: 'Instagram' | 'LinkedIn' | 'Twitter' | 'YouTube' | 'GitHub' | 'Facebook' | 'Pinterest' | 'Behance' | 'ArtStation' | 'Discord' | 'Vimeo';
  url: string;
  handle: string;
  isVisible: boolean;
  order: number;
}

export interface CMSThemeCustomization {
  colorPalette: {
    primary: string;
    accent: string;
    background: string;
    card: string;
    border: string;
    text: string;
  };
  typography: {
    headingFont: 'Cabinet Grotesk' | 'Playfair Display' | 'Space Grotesk' | 'Plus Jakarta Sans' | 'Syne' | 'Outfit';
    bodyFont: 'Plus Jakarta Sans' | 'Inter' | 'Space Mono' | 'DM Sans';
    headingScale: 'High (1.333)' | 'Medium (1.25)' | 'Dense (1.125)';
  };
  layoutMode: 'High Density (Studio)' | 'Spaced Architectural' | 'Ultra-wide 1600px';
  sectionOrder: Array<{
    id: string;
    name: string;
    description: string;
    isVisible: boolean;
  }>;
}

interface CMSState {
  // Collections
  pages: CMSPageItem[];
  blogPosts: CMSBlogPost[];
  services: CMSService[];
  projects: CMSProject[];
  testimonials: CMSTestimonial[];
  mediaLibrary: CMSMediaItem[];
  navigationMenu: CMSNavItem[];
  socialLinks: CMSSocialLink[];
  themeCustomization: CMSThemeCustomization;

  // Pages Actions
  addPage: (page: Omit<CMSPageItem, 'id' | 'updatedAt' | 'publishedAt' | 'viewCount'>) => void;
  updatePage: (id: string, updates: Partial<CMSPageItem>) => void;
  deletePage: (id: string) => void;
  loadPageTemplate: (templateKey: string) => CMSPageItem | null;

  // Blog Actions
  addBlogPost: (post: Omit<CMSBlogPost, 'id' | 'date'>) => void;
  updateBlogPost: (id: string, updates: Partial<CMSBlogPost>) => void;
  deleteBlogPost: (id: string) => void;

  // Services Actions
  addService: (service: Omit<CMSService, 'id'>) => void;
  updateService: (id: string, updates: Partial<CMSService>) => void;
  deleteService: (id: string) => void;

  // Projects Actions
  addProject: (project: Omit<CMSProject, 'id'>) => void;
  updateProject: (id: string, updates: Partial<CMSProject>) => void;
  deleteProject: (id: string) => void;

  // Testimonials Actions
  addTestimonial: (item: Omit<CMSTestimonial, 'id' | 'createdAt'>) => void;
  updateTestimonial: (id: string, updates: Partial<CMSTestimonial>) => void;
  deleteTestimonial: (id: string) => void;
  toggleTestimonialVisibility: (id: string) => void;

  // Media Actions
  addMediaItem: (item: Omit<CMSMediaItem, 'id' | 'uploadedAt'>) => void;
  deleteMediaItem: (id: string) => void;
  replaceWithPlaceholder: (id: string) => void;
  restoreOriginalMedia: (id: string, originalUrl: string) => void;

  // Navigation Actions
  addNavItem: (item: Omit<CMSNavItem, 'id' | 'order'>) => void;
  updateNavItem: (id: string, updates: Partial<CMSNavItem>) => void;
  deleteNavItem: (id: string) => void;
  reorderNavItems: (sourceIndex: number, destIndex: number) => void;
  toggleNavItemVisibility: (id: string) => void;

  // Social Links Actions
  addSocialLink: (item: Omit<CMSSocialLink, 'id' | 'order'>) => void;
  updateSocialLink: (id: string, updates: Partial<CMSSocialLink>) => void;
  deleteSocialLink: (id: string) => void;
  toggleSocialVisibility: (id: string) => void;
  reorderSocialLinks: (sourceIndex: number, destIndex: number) => void;

  // Theme & Layout Customization Actions
  updateThemeCustomization: (updates: Partial<CMSThemeCustomization>) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  reorderSections: (sourceIndex: number, destIndex: number) => void;
  resetToDefaults: () => void;
}

// Initial Data Seed
const INITIAL_PAGES: CMSPageItem[] = [
  {
    id: 'pg-home',
    title: 'Homepage / Spatial Master Landing',
    slug: '/',
    status: 'published',
    category: 'core',
    templateName: 'Spatial Master Landing',
    publishedAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-25T14:30:00Z',
    author: 'Chief Architect',
    seo: {
      metaTitle: 'VizTR — High-Density Architectural CGI & WebXR Spatial Computing',
      metaDescription: 'Photorealistic 8K exterior & interior CGI, cinematic walkthroughs, and real-time cloud Unreal Engine 5 pixel streaming for visionary architects and developers.',
      keywords: ['architectural cgi', 'webxr', 'pixel streaming', 'unreal engine 5', 'photorealistic renders', '3d virtual tour'],
      canonicalUrl: 'https://viztr.studio/',
      noIndex: false,
    },
    contentSummary: 'Master homepage containing Hero Canvas, Dual Architectural Core, Studio & XR Showcases, Benefits Matrix, Testimonials, and Live Project Trackers.',
    sectionsCount: 10,
    viewCount: 48920,
  },
  {
    id: 'pg-studio',
    title: 'Studio Services Overview',
    slug: '/studio',
    status: 'published',
    category: 'studio',
    templateName: 'Studio Service Directory',
    publishedAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-08-20T11:00:00Z',
    author: 'Creative Director',
    seo: {
      metaTitle: 'Studio Services — 8K Exterior, Interior & Cinematic Animation | VizTR',
      metaDescription: 'Explore our complete suite of architectural visualization services, from photorealistic daylight stills to 60 FPS cinematic walkthrough films.',
      keywords: ['exterior visualization', 'interior staging', 'architectural animation', '8k rendering'],
      canonicalUrl: 'https://viztr.studio/studio',
      noIndex: false,
    },
    contentSummary: 'Comprehensive directory of studio production pipelines, render specifications, and turnaround timelines.',
    sectionsCount: 6,
    viewCount: 22400,
  },
  {
    id: 'pg-exterior',
    title: 'Exterior Architectural Visualization',
    slug: '/studio/exterior',
    status: 'published',
    category: 'studio',
    templateName: 'Service Detail Page',
    publishedAt: '2026-01-15T12:00:00Z',
    updatedAt: '2026-08-22T09:15:00Z',
    author: 'Lead CGI Supervisor',
    seo: {
      metaTitle: 'Exterior Architectural Visualization (8K Photorealistic) | VizTR',
      metaDescription: 'Spectacular daylight, sunset, and twilight architectural exterior rendering with drone-matched context and physical biophilic foliage.',
      keywords: ['exterior rendering', 'architectural cgi exterior', '8k exterior stills', 'drone montage'],
      canonicalUrl: 'https://viztr.studio/studio/exterior',
      noIndex: false,
    },
    contentSummary: 'Detailed pipeline for CAD/BIM import, spectral HDRI lighting, high-poly procedural vegetation, and 8K master output.',
    sectionsCount: 5,
    viewCount: 18340,
  },
  {
    id: 'pg-interior',
    title: 'Interior Architectural Visualization',
    slug: '/studio/interior',
    status: 'published',
    category: 'studio',
    templateName: 'Service Detail Page',
    publishedAt: '2026-01-18T14:00:00Z',
    updatedAt: '2026-08-21T16:00:00Z',
    author: 'Interior Staging Lead',
    seo: {
      metaTitle: 'Luxury Interior Architectural Visualization | VizTR',
      metaDescription: 'Bespoke designer furniture modeling, micro-roughness material calibration, and daylight vs artificial luminaire studies.',
      keywords: ['interior rendering', 'luxury interior cgi', '3d furniture staging', 'ies lighting'],
      canonicalUrl: 'https://viztr.studio/studio/interior',
      noIndex: false,
    },
    contentSummary: 'Tactile material calibration, designer staging (Minotti, Poliform), and daylight vs night lighting comparison.',
    sectionsCount: 5,
    viewCount: 15200,
  },
  {
    id: 'pg-walkthrough',
    title: 'Cinematic Walkthrough Animation',
    slug: '/studio/walkthrough',
    status: 'published',
    category: 'studio',
    templateName: 'Service Detail Page',
    publishedAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-08-19T13:40:00Z',
    author: 'Cinematography Director',
    seo: {
      metaTitle: '4K 60FPS Cinematic Architectural Walkthrough Films | VizTR',
      metaDescription: 'Film-grade architectural cinema with fluid camera choreographies, dynamic sunlight shifts, and custom spatial sound design.',
      keywords: ['architectural walkthrough', '4k 60fps cgi film', 'architectural animation flythrough'],
      canonicalUrl: 'https://viztr.studio/studio/walkthrough',
      noIndex: false,
    },
    contentSummary: 'Camera choreography, time-lapse sun transitions, and multi-node render farm dispatch.',
    sectionsCount: 5,
    viewCount: 14100,
  },
  {
    id: 'pg-xr-world',
    title: 'XR World — Spatial Computing Hub',
    slug: '/xr-world',
    status: 'published',
    category: 'xr',
    templateName: 'XR World Hub',
    publishedAt: '2026-01-22T11:00:00Z',
    updatedAt: '2026-08-24T18:00:00Z',
    author: 'XR Engineering Lead',
    seo: {
      metaTitle: 'XR World — In-Browser WebXR, WebAR & Cloud Pixel Streaming | VizTR',
      metaDescription: 'Explore zero-installation real-time 3D spatial architecture, AR surface anchors, and 16K panoramic virtual tours.',
      keywords: ['webxr', 'webar', 'virtual tour', 'pixel streaming', 'spatial computing architecture'],
      canonicalUrl: 'https://viztr.studio/xr-world',
      noIndex: false,
    },
    contentSummary: 'Interactive portal to WebXR, WebAR, VR Tours, and cloud-hosted Unreal Engine 5 Pixel Streaming.',
    sectionsCount: 7,
    viewCount: 31200,
  },
  {
    id: 'pg-pixel-streaming',
    title: 'Unreal Engine 5 Cloud Pixel Streaming',
    slug: '/xr-world/pixel-streaming',
    status: 'published',
    category: 'xr',
    templateName: 'Flagship Interactive Tech',
    publishedAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-08-25T19:30:00Z',
    author: 'Systems Architect',
    seo: {
      metaTitle: 'Cloud Pixel Streaming (UE5.4 Lumen & Nanite) | VizTR',
      metaDescription: 'Zero-install real-time ray-traced architectural configurator streamed live from NVIDIA RTX 4090 cloud nodes to any mobile or desktop browser.',
      keywords: ['unreal pixel streaming', 'ue5 webrtc', 'real-time ray tracing', 'cloud architectural configurator'],
      canonicalUrl: 'https://viztr.studio/xr-world/pixel-streaming',
      noIndex: false,
    },
    contentSummary: 'Live WebRTC telemetry simulator, regional cluster controls, bitrate profiles, and interactive material switcher.',
    sectionsCount: 6,
    viewCount: 29800,
  },
  {
    id: 'pg-about',
    title: 'About VizTR Architectural Studio',
    slug: '/about',
    status: 'published',
    category: 'core',
    templateName: 'Editorial Studio Profile',
    publishedAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-08-15T12:00:00Z',
    author: 'Founding Partner',
    seo: {
      metaTitle: 'About VizTR — Architectural Precision & Spatial Innovation',
      metaDescription: 'Founded by architects and computer graphics researchers to bridge high-end architectural craft with real-time immersive computing.',
      keywords: ['about viztr', 'architectural visualization firm', 'spatial computing agency'],
      canonicalUrl: 'https://viztr.studio/about',
      noIndex: false,
    },
    contentSummary: 'Studio history, technical philosophy, global team roster, and cloud render cluster infrastructure.',
    sectionsCount: 6,
    viewCount: 11400,
  },
  {
    id: 'pg-blog',
    title: 'Perspectives & Research Blog',
    slug: '/blog',
    status: 'published',
    category: 'core',
    templateName: 'Blog Magazine Index',
    publishedAt: '2026-01-08T09:00:00Z',
    updatedAt: '2026-08-25T10:00:00Z',
    author: 'Editorial Desk',
    seo: {
      metaTitle: 'Architectural CGI, XR & Cloud Innovation Journal | VizTR',
      metaDescription: 'In-depth essays, technical breakdowns, and case studies on architectural visualization, WebXR, and real-time computing.',
      keywords: ['architectural blog', 'webxr research', 'ue5 architecture case studies'],
      canonicalUrl: 'https://viztr.studio/blog',
      noIndex: false,
    },
    contentSummary: 'Curated technical papers, client success stories, and spatial computing benchmarks.',
    sectionsCount: 4,
    viewCount: 16800,
  },
];

const INITIAL_BLOG_POSTS: CMSBlogPost[] = initialBlogPosts.map((post, idx) => ({
  id: `blog-${post.slug || idx}`,
  title: post.title,
  slug: post.slug,
  category: post.category,
  excerpt: post.excerpt,
  content: post.content,
  author: post.author,
  authorRole: post.authorRole || 'Senior Visualization Director',
  date: post.date,
  readTime: post.readTime,
  image: post.image,
  status: 'published',
  featured: idx === 0,
  tags: [post.category, 'Architecture', 'CGI', 'Spatial XR'],
  seo: {
    metaTitle: `${post.title} | VizTR Journal`,
    metaDescription: post.excerpt,
    keywords: [post.category.toLowerCase(), 'architectural visualization', 'webxr', 'real-time 3d'],
    canonicalUrl: `https://viztr.studio/blog/${post.slug}`,
  },
}));

const INITIAL_SERVICES: CMSService[] = [
  {
    id: 'srv-exterior',
    name: 'Exterior Architectural Visualization',
    slug: 'exterior',
    category: 'studio',
    heroBadge: '8K Master Photorealistic',
    tagline: 'Monumental architectural form, environmental context, and physical lighting.',
    description: servicePagesData.exterior?.description || 'Photorealistic daylight, twilight, and drone montage exterior renders for luxury real estate.',
    heroImage: servicePagesData.exterior?.heroImage || '/images/services/exterior.jpg',
    status: 'published',
    priceStartingFrom: '$1,800 / view',
    timeline: '5-7 Business Days',
    capabilities: servicePagesData.exterior?.capabilities || [],
    deliverables: servicePagesData.exterior?.deliverables || [],
    seo: {
      metaTitle: 'Exterior Architectural Visualization (8K) | VizTR Studio',
      metaDescription: 'Photorealistic daylight, twilight, and drone montage exterior renders for luxury real estate.',
      keywords: ['exterior cgi', '8k exterior render', 'architectural facade lighting'],
    },
  },
  {
    id: 'srv-interior',
    name: 'Interior Architectural Visualization',
    slug: 'interior',
    category: 'studio',
    heroBadge: 'Designer Staging & PBR',
    tagline: 'Tactile materials, curated designer furnishings, and bespoke architectural lighting.',
    description: servicePagesData.interior?.description || 'Bespoke interior spaces tailored to your style and needs, featuring premium materials and custom design solutions.',
    heroImage: servicePagesData.interior?.heroImage || '/images/services/interior.jpg',
    status: 'published',
    priceStartingFrom: '$1,400 / view',
    timeline: '4-6 Business Days',
    capabilities: servicePagesData.interior?.capabilities || [],
    deliverables: servicePagesData.interior?.deliverables || [],
    seo: {
      metaTitle: 'Interior Architectural Visualization | VizTR Studio',
      metaDescription: 'Bespoke interior staging, Calacatta marble shaders, and layered architectural lighting.',
      keywords: ['interior cgi', '3d staging', 'luxury interior renders'],
    },
  },
  {
    id: 'srv-walkthrough',
    name: 'Cinematic Walkthrough Animation',
    slug: 'walkthrough',
    category: 'studio',
    heroBadge: '4K 60FPS Film',
    tagline: 'Film-grade motion, choreographed lighting, and custom spatial audio.',
    description: servicePagesData.walkthrough?.description || 'Cinematic walkthrough animations with professional lighting and motion design for architectural presentation and marketing.',
    heroImage: servicePagesData.walkthrough?.heroImage || '/images/services/walkthrough.jpg',
    status: 'published',
    priceStartingFrom: '$4,500 / 60s reel',
    timeline: '10-14 Business Days',
    capabilities: servicePagesData.walkthrough?.capabilities || [],
    deliverables: servicePagesData.walkthrough?.deliverables || [],
    seo: {
      metaTitle: '4K 60FPS Cinematic Architectural Walkthrough | VizTR Studio',
      metaDescription: 'High-speed camera choreography and cinematic architectural film reels.',
      keywords: ['architectural flythrough', '4k walkthrough', 'real estate film'],
    },
  },
  {
    id: 'srv-pixel-streaming',
    name: 'Cloud Pixel Streaming (UE5.4)',
    slug: 'pixel-streaming',
    category: 'cloud_gpu',
    heroBadge: 'FLAGSHIP REAL-TIME GPU',
    tagline: 'Zero-install real-time ray-traced architectural configurator streamed live.',
    description: 'NVIDIA RTX 4090 cluster instances rendering Lumen and Nanite geometry streamed at 60 FPS WebRTC with under 30ms latency.',
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1800&q=85',
    status: 'published',
    priceStartingFrom: '$3,200 setup + hourly GPU tier',
    timeline: '1-2 Weeks Integration',
    capabilities: [
      'Unreal Engine 5.4 Lumen global illumination',
      'Dynamic daylight & weather switching',
      'Real-time material & floorplan configurator',
      'Ultra low latency WebRTC stream under 30ms'
    ],
    deliverables: [
      'Custom branded WebRTC client frontend',
      'Dedicated cloud GPU streaming orchestration',
      'Multi-user synchronized presentation mode'
    ],
    seo: {
      metaTitle: 'Unreal Engine 5 Cloud Pixel Streaming | VizTR',
      metaDescription: 'Zero-install real-time ray-traced architectural configurator streamed live to any browser.',
      keywords: ['pixel streaming', 'unreal engine webrtc', 'cloud gpu architecture'],
    },
  },
];

const INITIAL_PROJECTS: CMSProject[] = [
  {
    id: 'prj-01',
    title: 'The Apex Tower Commercial Masterpiece',
    slug: 'the-apex-tower',
    client: 'Mori Building Development & Foster Partners',
    category: 'Exterior',
    year: '2026',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    ],
    status: 'published',
    featured: true,
    model3dUrl: '/models/apex-tower-v3-draco.glb',
    description: '64-story mixed-use skyscraper in Tokyo featuring double-curved parametric glass facade and biophilic sky gardens.',
    location: 'Tokyo, Japan',
    seo: {
      metaTitle: 'The Apex Tower Case Study | VizTR Studio',
      metaDescription: '8K exterior visualization and WebXR commercial sales configurator for Tokyo flagship tower.',
      keywords: ['apex tower', 'tokyo skyscraper cgi', 'foster partners 3d'],
    },
  },
  {
    id: 'prj-02',
    title: 'Nordic Monolith Coastal Residence',
    slug: 'nordic-monolith',
    client: 'Snøhetta Atelier & Private Client',
    category: 'Interior',
    year: '2026',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
    ],
    status: 'published',
    featured: true,
    model3dUrl: '/models/nordic-monolith-hull.glb',
    description: 'Brutalist concrete and Siberian larch cliffside estate overlooking Norwegian fjords.',
    location: 'Bergen, Norway',
    seo: {
      metaTitle: 'Nordic Monolith Residence Case Study | VizTR',
      metaDescription: 'Photorealistic daylight and twilight interior staging with tactile concrete roughness.',
      keywords: ['nordic monolith', 'norway architecture cgi', 'fjord villa render'],
    },
  },
  {
    id: 'prj-03',
    title: 'Solarium Sky Penthouse Collection',
    slug: 'solarium-sky-penthouse',
    client: 'Al-Jazeera Luxury Hospitality',
    category: 'WebXR',
    year: '2025',
    coverImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    ],
    status: 'published',
    featured: true,
    model3dUrl: '/models/solarium-suite-pbr.gltf',
    description: '14,000 sq ft dual-level penthouse with custom infinity sky pool and 360° panoramic virtual tour.',
    location: 'Dubai Marina, UAE',
    seo: {
      metaTitle: 'Solarium Sky Penthouse WebXR Tour | VizTR',
      metaDescription: 'Interactive 16K panoramic tour and WebXR VR walkthrough for Dubai penthouse.',
      keywords: ['solarium penthouse', 'dubai luxury real estate 3d', 'vr penthouse tour'],
    },
  },
];

const INITIAL_TESTIMONIALS: CMSTestimonial[] = homepageData.testimonials.map((t, idx) => ({
  id: `test-${idx + 1}`,
  clientName: t.clientName,
  role: t.role.split(',')[0] || 'Executive',
  company: t.role.split(',')[1]?.trim() || 'Global Architecture Group',
  quote: t.quote,
  rating: t.rating || 5,
  isVisible: true,
  createdAt: '2026-02-10T12:00:00Z',
}));

const INITIAL_MEDIA: CMSMediaItem[] = [
  {
    id: 'med-01',
    name: 'Apex Tower 8K Master Hero Render.tiff',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=85',
    placeholderUrl: 'https://picsum.photos/seed/apex-exterior/1920/1080',
    isPlaceholder: false,
    type: 'image',
    format: 'TIFF (8K)',
    sizeBytes: 245000000,
    dimensions: '7680 x 4320 (300 DPI)',
    category: 'renders',
    uploadedAt: '2026-08-20T14:30:00Z',
    tags: ['exterior', '8k', 'hero', 'tokyo'],
  },
  {
    id: 'med-02',
    name: 'Nordic Monolith Larch Living Room.exr',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85',
    placeholderUrl: 'https://picsum.photos/seed/nordic-living/1920/1080',
    isPlaceholder: false,
    type: 'image',
    format: 'EXR 32-bit',
    sizeBytes: 180000000,
    dimensions: '8192 x 4608',
    category: 'renders',
    uploadedAt: '2026-08-22T09:15:00Z',
    tags: ['interior', '32bit', 'exr', 'lighting'],
  },
  {
    id: 'med-03',
    name: 'apex-tower-v3-draco.glb',
    url: '/models/apex-tower-v3-draco.glb',
    placeholderUrl: '/models/standard-box-placeholder.glb',
    isPlaceholder: false,
    type: '3d_model',
    format: 'GLB (Draco)',
    sizeBytes: 14680000,
    dimensions: '1.2M Polygons (10:1 Draco)',
    category: 'models',
    uploadedAt: '2026-08-18T16:00:00Z',
    tags: ['3d', 'glb', 'draco', 'webxr'],
  },
  {
    id: 'med-04',
    name: 'VizTR Architectural Reel 2026.mp4',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-minimalist-living-room-with-modern-furniture-4156-large.mp4',
    placeholderUrl: 'https://picsum.photos/seed/reel-placeholder/1920/1080',
    isPlaceholder: false,
    type: 'video',
    format: 'MP4 (4K 60FPS AV1)',
    sizeBytes: 420000000,
    dimensions: '3840 x 2160 (60 FPS)',
    category: 'gallery',
    uploadedAt: '2026-08-15T11:00:00Z',
    tags: ['video', 'showreel', '4k', 'animation'],
  },
  {
    id: 'med-05',
    name: 'Solarium Penthouse 16K Panorama Node.jpg',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
    placeholderUrl: 'https://picsum.photos/seed/panorama-node/1920/1080',
    isPlaceholder: false,
    type: 'image',
    format: 'Equirectangular JPEG',
    sizeBytes: 45000000,
    dimensions: '16384 x 8192',
    category: 'gallery',
    uploadedAt: '2026-08-12T10:20:00Z',
    tags: ['360', 'panorama', 'virtual-tour'],
  },
];

const INITIAL_NAV_ITEMS: CMSNavItem[] = [
  {
    id: 'nav-home',
    label: 'Home',
    url: '/',
    isExternal: false,
    isVisible: true,
    order: 1,
  },
  {
    id: 'nav-studio',
    label: 'Studio',
    url: '/studio',
    isExternal: false,
    isVisible: true,
    order: 2,
    children: [
      { id: 'sub-ext', label: 'Exterior Visualization', url: '/studio/exterior', description: 'Photorealistic daylight & twilight CGI', badge: '8K', isVisible: true },
      { id: 'sub-int', label: 'Interior Visualization', url: '/studio/interior', description: 'Bespoke luxury staging & finishes', isVisible: true },
      { id: 'sub-wlk', label: 'Walkthrough Animation', url: '/studio/walkthrough', description: 'Cinematic 4K 60FPS architectural films', isVisible: true },
    ],
  },
  {
    id: 'nav-xr',
    label: 'XR World',
    url: '/xr-world',
    isExternal: false,
    isVisible: true,
    order: 3,
    badge: 'SPATIAL',
    children: [
      { id: 'sub-ps', label: 'Pixel Streaming', url: '/xr-world/pixel-streaming', description: 'Real-time UE5 cloud GPU stream', badge: 'FLAGSHIP', isVisible: true },
      { id: 'sub-wx', label: 'WebXR Spatial 3D', url: '/xr-world/webxr', description: 'In-browser interactive spatial models', isVisible: true },
      { id: 'sub-ar', label: 'WebAR Surface Anchor', url: '/xr-world/webar', description: '1:1 scale iOS USDZ / Android AR', isVisible: true },
      { id: 'sub-vr', label: 'Virtual Reality Tour', url: '/xr-world/virtual-reality', description: 'Meta Quest & Apple Vision Pro', isVisible: true },
      { id: 'sub-vt', label: '16K Virtual Tour', url: '/xr-world/virtual-tour', description: 'Spherical panoramic hotspot tours', isVisible: true },
    ],
  },
  {
    id: 'nav-portfolio',
    label: 'Portfolio',
    url: '/portfolio',
    isExternal: false,
    isVisible: true,
    order: 4,
  },
  {
    id: 'nav-blog',
    label: 'Perspectives',
    url: '/blog',
    isExternal: false,
    isVisible: true,
    order: 5,
  },
  {
    id: 'nav-contact',
    label: 'Contact',
    url: '/contact',
    isExternal: false,
    isVisible: true,
    order: 6,
  },
];

const INITIAL_SOCIAL_LINKS: CMSSocialLink[] = [
  { id: 'soc-1', platform: 'Instagram', url: 'https://instagram.com/viztr.studio', handle: '@viztr.studio', isVisible: true, order: 1 },
  { id: 'soc-2', platform: 'LinkedIn', url: 'https://linkedin.com/company/viztr-studio', handle: 'VizTR Studio Global', isVisible: true, order: 2 },
  { id: 'soc-3', platform: 'Twitter', url: 'https://twitter.com/viztr_studio', handle: '@viztr_studio', isVisible: true, order: 3 },
  { id: 'soc-4', platform: 'YouTube', url: 'https://youtube.com/@viztr-studio', handle: 'VizTR Architectural Cinema', isVisible: true, order: 4 },
  { id: 'soc-5', platform: 'ArtStation', url: 'https://artstation.com/viztr', handle: 'viztr-masterpieces', isVisible: false, order: 5 },
  { id: 'soc-6', platform: 'Behance', url: 'https://behance.net/viztr', handle: 'viztr-portfolio', isVisible: false, order: 6 },
  { id: 'soc-7', platform: 'Discord', url: 'https://discord.gg/viztr', handle: 'VizTR XR Community', isVisible: true, order: 7 },
];

const INITIAL_THEME_CUSTOMIZATION: CMSThemeCustomization = {
  colorPalette: {
    primary: '#3ECF8E',
    accent: '#34B27B',
    background: '#09090B',
    card: '#18181B',
    border: '#27272A',
    text: '#FAFAFA',
  },
  typography: {
    headingFont: 'Space Grotesk',
    bodyFont: 'Plus Jakarta Sans',
    headingScale: 'High (1.333)',
  },
  layoutMode: 'High Density (Studio)',
  sectionOrder: [
    { id: 'hero', name: 'Hero Spatial Canvas', description: 'Top full-bleed header with headline, 3 CTAs and visual loop', isVisible: true },
    { id: 'marquee', name: 'Precision Engineering Marquee', description: 'Infinite scrolling tape of studio capabilities & framerates', isVisible: true },
    { id: 'dual-core', name: 'Dual Architectural Core Cards', description: 'Studio Photorealism vs. XR World Immersive split presentation', isVisible: true },
    { id: 'studio-showcase', name: 'Studio Services Showcase', description: 'Exterior, Interior, and Walkthrough interactive feature grid', isVisible: true },
    { id: 'xr-showcase', name: 'XR World Spatial Grid', description: 'WebXR, WebAR, VR, and Pixel Streaming flagship cards', isVisible: true },
    { id: 'showreel', name: 'Cinematic Showreel Video Player', description: 'Embedded 4K architectural film reel with custom audio', isVisible: true },
    { id: 'benefits', name: 'Architectural Advantage Matrix', description: '8 key strategic benefits of working with VizTR', isVisible: true },
    { id: 'process', name: 'Production Pipeline (4 Stages)', description: 'Step-by-step workflow from CAD import to master delivery', isVisible: true },
    { id: 'use-cases', name: 'Client Use Cases & Solutions', description: 'Solutions for Developers, Architects, Designers & Marketers', isVisible: true },
    { id: 'testimonials', name: 'Executive Testimonials & Reviews', description: 'Social proof quotes with star ratings and client roles', isVisible: true },
    { id: 'stats', name: 'Production Telemetry & Metrics', description: '200+ projects, 50+ clients, 99% satisfaction tally', isVisible: true },
    { id: 'faq', name: 'Technical Architectural FAQ', description: 'Accordion answering common file format and WebXR questions', isVisible: true },
    { id: 'consultation-cta', name: 'Book Consultation Callout', description: 'Direct link to Google Meet / calendar consultation scheduler', isVisible: true },
  ],
};

export const useCMSStore = create<CMSState>()(
  persist(
    (set, get) => ({
      pages: INITIAL_PAGES,
      blogPosts: INITIAL_BLOG_POSTS,
      services: INITIAL_SERVICES,
      projects: INITIAL_PROJECTS,
      testimonials: INITIAL_TESTIMONIALS,
      mediaLibrary: INITIAL_MEDIA,
      navigationMenu: INITIAL_NAV_ITEMS,
      socialLinks: INITIAL_SOCIAL_LINKS,
      themeCustomization: INITIAL_THEME_CUSTOMIZATION,

      // Page CRUD
      addPage: (pageData) => {
        const id = `pg-${Date.now().toString(36)}`;
        const now = new Date().toISOString();
        const newPage: CMSPageItem = {
          ...pageData,
          id,
          publishedAt: pageData.status === 'published' ? now : '',
          updatedAt: now,
          viewCount: 0,
        };
        set((state) => ({ pages: [newPage, ...state.pages] }));
      },

      updatePage: (id, updates) => {
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                  publishedAt:
                    updates.status === 'published' && !p.publishedAt
                      ? new Date().toISOString()
                      : p.publishedAt,
                }
              : p
          ),
        }));
      },

      deletePage: (id) => {
        set((state) => ({
          pages: state.pages.filter((p) => p.id !== id),
        }));
      },

      loadPageTemplate: (templateKey) => {
        const matching = get().pages.find((p) => p.id === templateKey || p.slug === templateKey);
        if (matching) {
          return {
            ...matching,
            id: `pg-${Date.now().toString(36)}`,
            title: `Copy of ${matching.title}`,
            slug: `${matching.slug}-copy-${Math.floor(Math.random() * 1000)}`,
            status: 'draft',
            publishedAt: '',
            updatedAt: new Date().toISOString(),
            viewCount: 0,
          };
        }
        return null;
      },

      // Blog CRUD
      addBlogPost: (postData) => {
        const id = `blog-${Date.now().toString(36)}`;
        const newPost: CMSBlogPost = {
          ...postData,
          id,
          date: new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
        };
        set((state) => ({ blogPosts: [newPost, ...state.blogPosts] }));
      },

      updateBlogPost: (id, updates) => {
        set((state) => ({
          blogPosts: state.blogPosts.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
      },

      deleteBlogPost: (id) => {
        set((state) => ({
          blogPosts: state.blogPosts.filter((b) => b.id !== id),
        }));
      },

      // Services CRUD
      addService: (serviceData) => {
        const id = `srv-${Date.now().toString(36)}`;
        const newService: CMSService = { ...serviceData, id };
        set((state) => ({ services: [...state.services, newService] }));
      },

      updateService: (id, updates) => {
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
      },

      deleteService: (id) => {
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        }));
      },

      // Projects CRUD
      addProject: (projectData) => {
        const id = `prj-${Date.now().toString(36)}`;
        const newProject: CMSProject = { ...projectData, id };
        set((state) => ({ projects: [newProject, ...state.projects] }));
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
      },

      // Testimonials CRUD
      addTestimonial: (itemData) => {
        const id = `test-${Date.now().toString(36)}`;
        const newItem: CMSTestimonial = {
          ...itemData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ testimonials: [newItem, ...state.testimonials] }));
      },

      updateTestimonial: (id, updates) => {
        set((state) => ({
          testimonials: state.testimonials.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTestimonial: (id) => {
        set((state) => ({
          testimonials: state.testimonials.filter((t) => t.id !== id),
        }));
      },

      toggleTestimonialVisibility: (id) => {
        set((state) => ({
          testimonials: state.testimonials.map((t) =>
            t.id === id ? { ...t, isVisible: !t.isVisible } : t
          ),
        }));
      },

      // Media Actions
      addMediaItem: (itemData) => {
        const id = `med-${Date.now().toString(36)}`;
        const newItem: CMSMediaItem = {
          ...itemData,
          id,
          uploadedAt: new Date().toISOString(),
        };
        set((state) => ({ mediaLibrary: [newItem, ...state.mediaLibrary] }));
      },

      deleteMediaItem: (id) => {
        set((state) => ({
          mediaLibrary: state.mediaLibrary.filter((m) => m.id !== id),
        }));
      },

      replaceWithPlaceholder: (id) => {
        set((state) => ({
          mediaLibrary: state.mediaLibrary.map((m) => {
            if (m.id === id) {
              const placeholderUrl =
                m.type === '3d_model'
                  ? '/models/standard-box-placeholder.glb'
                  : m.type === 'video'
                  ? 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4'
                  : `https://picsum.photos/seed/arch-placeholder-${Date.now() % 100}/1920/1080`;
              return {
                ...m,
                isPlaceholder: true,
                placeholderUrl,
                url: placeholderUrl,
              };
            }
            return m;
          }),
        }));
      },

      restoreOriginalMedia: (id, originalUrl) => {
        set((state) => ({
          mediaLibrary: state.mediaLibrary.map((m) =>
            m.id === id ? { ...m, isPlaceholder: false, url: originalUrl } : m
          ),
        }));
      },

      // Navigation Actions
      addNavItem: (itemData) => {
        const id = `nav-${Date.now().toString(36)}`;
        const order = get().navigationMenu.length + 1;
        set((state) => ({
          navigationMenu: [...state.navigationMenu, { ...itemData, id, order }],
        }));
      },

      updateNavItem: (id, updates) => {
        set((state) => ({
          navigationMenu: state.navigationMenu.map((n) =>
            n.id === id ? { ...n, ...updates } : n
          ),
        }));
      },

      deleteNavItem: (id) => {
        set((state) => ({
          navigationMenu: state.navigationMenu.filter((n) => n.id !== id),
        }));
      },

      reorderNavItems: (sourceIndex, destIndex) => {
        set((state) => {
          const items = [...state.navigationMenu];
          const [moved] = items.splice(sourceIndex, 1);
          items.splice(destIndex, 0, moved);
          return {
            navigationMenu: items.map((item, idx) => ({ ...item, order: idx + 1 })),
          };
        });
      },

      toggleNavItemVisibility: (id) => {
        set((state) => ({
          navigationMenu: state.navigationMenu.map((n) =>
            n.id === id ? { ...n, isVisible: !n.isVisible } : n
          ),
        }));
      },

      // Social Links Actions
      addSocialLink: (itemData) => {
        const id = `soc-${Date.now().toString(36)}`;
        const order = get().socialLinks.length + 1;
        set((state) => ({
          socialLinks: [...state.socialLinks, { ...itemData, id, order }],
        }));
      },

      updateSocialLink: (id, updates) => {
        set((state) => ({
          socialLinks: state.socialLinks.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteSocialLink: (id) => {
        set((state) => ({
          socialLinks: state.socialLinks.filter((s) => s.id !== id),
        }));
      },

      toggleSocialVisibility: (id) => {
        set((state) => ({
          socialLinks: state.socialLinks.map((s) =>
            s.id === id ? { ...s, isVisible: !s.isVisible } : s
          ),
        }));
      },

      reorderSocialLinks: (sourceIndex, destIndex) => {
        set((state) => {
          const links = [...state.socialLinks];
          const [moved] = links.splice(sourceIndex, 1);
          links.splice(destIndex, 0, moved);
          return {
            socialLinks: links.map((link, idx) => ({ ...link, order: idx + 1 })),
          };
        });
      },

      // Theme Customization Actions
      updateThemeCustomization: (updates) => {
        set((state) => ({
          themeCustomization: {
            ...state.themeCustomization,
            ...updates,
          },
        }));
      },

      toggleSectionVisibility: (sectionId) => {
        set((state) => ({
          themeCustomization: {
            ...state.themeCustomization,
            sectionOrder: state.themeCustomization.sectionOrder.map((sec) =>
              sec.id === sectionId ? { ...sec, isVisible: !sec.isVisible } : sec
            ),
          },
        }));
      },

      reorderSections: (sourceIndex, destIndex) => {
        set((state) => {
          const sections = [...state.themeCustomization.sectionOrder];
          const [moved] = sections.splice(sourceIndex, 1);
          sections.splice(destIndex, 0, moved);
          return {
            themeCustomization: {
              ...state.themeCustomization,
              sectionOrder: sections,
            },
          };
        });
      },

      resetToDefaults: () => {
        set({
          pages: INITIAL_PAGES,
          blogPosts: INITIAL_BLOG_POSTS,
          services: INITIAL_SERVICES,
          projects: INITIAL_PROJECTS,
          testimonials: INITIAL_TESTIMONIALS,
          mediaLibrary: INITIAL_MEDIA,
          navigationMenu: INITIAL_NAV_ITEMS,
          socialLinks: INITIAL_SOCIAL_LINKS,
          themeCustomization: INITIAL_THEME_CUSTOMIZATION,
        });
      },
    }),
    {
      name: 'viztr-super-admin-cms',
    }
  )
);
