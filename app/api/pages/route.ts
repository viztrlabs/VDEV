import { NextRequest, NextResponse } from 'next/server';

export interface PageRecord {
  id: string;
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  status: 'published' | 'draft';
  sections: Array<{
    id: string;
    name: string;
    type: string;
    enabled: boolean;
    order: number;
  }>;
  lastUpdated: string;
  template: 'default' | 'studio' | 'portfolio' | 'landing';
}

let PAGES_DB: PageRecord[] = [
  {
    id: 'page_home',
    title: 'Home — Visual Tech Reality',
    slug: '/',
    seoTitle: 'VizTR — Architecture Visualization Studio & XR World',
    seoDescription: 'Premier Architecture Visualization Studio & XR World. Real-time Unreal 5.4 Pixel Streaming, 8K ArchViz CGI, and zero-install WebXR for visionary architects.',
    keywords: ['ArchViz Studio', 'Unreal Engine 5.4', 'Pixel Streaming', 'WebXR', '8K CGI', 'Architectural Visualization'],
    status: 'published',
    sections: [
      { id: 'sec_hero', name: 'Futuristic Hero & Spatial Viewport', type: 'hero', enabled: true, order: 1 },
      { id: 'sec_services', name: 'Core Visualization Capabilities', type: 'services', enabled: true, order: 2 },
      { id: 'sec_portfolio', name: 'Master Commissions Showcase', type: 'portfolio', enabled: true, order: 3 },
      { id: 'sec_xr', name: 'WebXR & Pixel Streaming Interactive Deck', type: 'xr', enabled: true, order: 4 },
      { id: 'sec_testimonials', name: 'Global Architecture Reviews', type: 'testimonials', enabled: true, order: 5 },
      { id: 'sec_booking', name: 'Consultation & Milestone Booking', type: 'booking', enabled: true, order: 6 },
    ],
    lastUpdated: '2025-07-20T10:00:00Z',
    template: 'default',
  },
  {
    id: 'page_studio',
    title: 'Studio & Spatial Technology',
    slug: '/studio',
    seoTitle: 'Studio & Technology | VizTR Visualization',
    seoDescription: 'Explore VizTR’s computational pipeline: Unreal 5.4 Lumen ray tracing, WebXR spatial engines, and lossless 8K CGI delivery.',
    keywords: ['Studio Pipeline', 'ArchViz Tech', 'Unreal 5.4', 'Photorealistic Lighting'],
    status: 'published',
    sections: [
      { id: 'sec_studio_hero', name: 'Studio Philosophy & Tech Stack', type: 'hero', enabled: true, order: 1 },
      { id: 'sec_pipeline', name: '7-Stage Production Pipeline', type: 'pipeline', enabled: true, order: 2 },
      { id: 'sec_team', name: 'Specialist CG Artists & Engineers', type: 'team', enabled: true, order: 3 },
    ],
    lastUpdated: '2025-07-18T14:30:00Z',
    template: 'studio',
  },
  {
    id: 'page_portfolio',
    title: 'Commissions & Architectural Archive',
    slug: '/portfolio',
    seoTitle: 'Portfolio Archive | VizTR ArchViz & XR',
    seoDescription: 'Browse master architectural CGI, 360 spherical panoramic tours, and interactive WebXR models crafted for leading global architects.',
    keywords: ['ArchViz Portfolio', 'Architectural Renders', '360 Tours', 'Commercial CGI'],
    status: 'published',
    sections: [
      { id: 'sec_port_grid', name: 'Filterable Project Vault', type: 'portfolio', enabled: true, order: 1 },
      { id: 'sec_case_study', name: 'Deep-Dive Interactive Showcase', type: 'case_study', enabled: true, order: 2 },
    ],
    lastUpdated: '2025-07-15T09:00:00Z',
    template: 'portfolio',
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const query = searchParams.get('q')?.toLowerCase();

  if (slug) {
    const page = PAGES_DB.find((p) => p.slug === slug);
    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, page });
  }

  let filtered = [...PAGES_DB];
  if (query) {
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        p.seoTitle.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({ success: true, count: filtered.length, pages: filtered });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newPage: PageRecord = {
      id: `page_${Date.now()}`,
      title: body.title || 'New CMS Page',
      slug: body.slug || `/page-${Date.now()}`,
      seoTitle: body.seoTitle || body.title || 'VizTR Page',
      seoDescription: body.seoDescription || 'High-end architectural visualization and spatial exploration page.',
      keywords: body.keywords || ['VizTR', 'Architecture'],
      status: body.status || 'published',
      sections: body.sections || [
        { id: `sec_hero_${Date.now()}`, name: 'Hero Section', type: 'hero', enabled: true, order: 1 },
        { id: `sec_content_${Date.now()}`, name: 'Content Block', type: 'content', enabled: true, order: 2 },
      ],
      lastUpdated: new Date().toISOString(),
      template: body.template || 'default',
    };

    PAGES_DB.push(newPage);
    return NextResponse.json({ success: true, page: newPage }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Page ID is required' }, { status: 400 });
    }

    const index = PAGES_DB.findIndex((p) => p.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    PAGES_DB[index] = {
      ...PAGES_DB[index],
      ...body,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, page: PAGES_DB[index] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'Page ID is required' }, { status: 400 });
  }

  const initialLength = PAGES_DB.length;
  PAGES_DB = PAGES_DB.filter((p) => p.id !== id);

  if (PAGES_DB.length === initialLength) {
    return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: `Page ${id} removed successfully` });
}
