import { NextRequest, NextResponse } from 'next/server';

export interface ServiceRecord {
  id: string;
  title: string;
  slug: string;
  category: 'CGI Renders' | 'WebXR & 3D' | 'Unreal 5.4 Pixel Streaming' | 'Animation & Film' | 'VR / AR Worlds';
  description: string;
  startingPrice: string;
  turnaroundTime: string;
  deliverables: string[];
  featured: boolean;
  status: 'active' | 'archived';
  heroImageUrl: string;
  badge?: string;
}

let SERVICES_DB: ServiceRecord[] = [
  {
    id: 'srv_01',
    title: '8K Ultra-Photorealistic Architectural CGI',
    slug: '8k-architectural-cgi',
    category: 'CGI Renders',
    description: 'Lossless 8K master renders generated with spectral lighting solvers, sub-surface scattering materials, and real-world IES photometric profiles.',
    startingPrice: '$2,800 / view',
    turnaroundTime: '3 – 5 Business Days',
    deliverables: ['8K TIFF Master Renders', 'Color-Graded 4K Web Packages', 'Alpha Mask Passes (ID, Depth, Specular)', 'Clay Render Geometry Signoffs'],
    featured: true,
    status: 'active',
    heroImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    badge: 'Popular Choice',
  },
  {
    id: 'srv_02',
    title: 'Unreal Engine 5.4 Pixel Streaming Worlds',
    slug: 'unreal-pixel-streaming',
    category: 'Unreal 5.4 Pixel Streaming',
    description: 'Zero-latency cloud GPU streaming allowing clients and stakeholders to walk through photorealistic architectural worlds on any browser or mobile tablet.',
    startingPrice: '$14,500 / project',
    turnaroundTime: '2 – 3 Weeks',
    deliverables: ['Custom WebRTC Player Portal', 'Real-Time Sun & Season Controls', 'Interactive Material Switchers', 'Global GPU Cloud Deployment'],
    featured: true,
    status: 'active',
    heroImageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
    badge: 'Enterprise Tier',
  },
  {
    id: 'srv_03',
    title: 'WebXR Spatial & AR Browser Experiences',
    slug: 'webxr-spatial-browser',
    category: 'WebXR & 3D',
    description: 'Zero-install interactive 3D models with Draco mesh compression, Apple Vision Pro spatial audio support, and Instant AR surface projection.',
    startingPrice: '$4,200 / model',
    turnaroundTime: '5 – 7 Business Days',
    deliverables: ['Draco Optimized .GLB Asset', 'Custom Embeddable 3D Viewer', 'AR QuickLook USDZ Container', 'Client Sharing Link & QR Code'],
    featured: true,
    status: 'active',
    heroImageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
    badge: 'Zero-Install Web',
  },
  {
    id: 'srv_04',
    title: 'Cinematic 4K Architectural Films & Flythroughs',
    slug: 'cinematic-architectural-film',
    category: 'Animation & Film',
    description: 'Narrative-driven architectural films featuring choreographed drone paths, atmospheric volumetric fog, dynamic foliage wind simulation, and orchestral audio mixing.',
    startingPrice: '$8,500 / minute',
    turnaroundTime: '2 – 4 Weeks',
    deliverables: ['ProRes 422 HQ 4K Master Video', 'Custom Sound Design & Music Stems', 'Social Media 9:16 Cutdowns', 'Storyboards & Animatics'],
    featured: false,
    status: 'active',
    heroImageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80',
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const query = searchParams.get('q')?.toLowerCase();

  let filtered = [...SERVICES_DB];
  if (category && category !== 'ALL') {
    filtered = filtered.filter((s) => s.category === category);
  }
  if (query) {
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.slug.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({ success: true, count: filtered.length, services: filtered });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newService: ServiceRecord = {
      id: `srv_${Date.now()}`,
      title: body.title || 'New Architectural Service',
      slug: body.slug || (body.title ? body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `service-${Date.now()}`),
      category: body.category || 'CGI Renders',
      description: body.description || 'High fidelity architectural visualization capability.',
      startingPrice: body.startingPrice || '$3,000 / commission',
      turnaroundTime: body.turnaroundTime || '5 Business Days',
      deliverables: body.deliverables || ['8K Master Deliverables', 'Web Delivery Package'],
      featured: !!body.featured,
      status: body.status || 'active',
      heroImageUrl: body.heroImageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      badge: body.badge,
    };

    SERVICES_DB.unshift(newService);
    return NextResponse.json({ success: true, service: newService }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Service ID is required' }, { status: 400 });
    }

    const index = SERVICES_DB.findIndex((s) => s.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }

    SERVICES_DB[index] = {
      ...SERVICES_DB[index],
      ...body,
    };

    return NextResponse.json({ success: true, service: SERVICES_DB[index] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'Service ID is required' }, { status: 400 });
  }

  const initialLength = SERVICES_DB.length;
  SERVICES_DB = SERVICES_DB.filter((s) => s.id !== id);

  if (SERVICES_DB.length === initialLength) {
    return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: `Service ${id} removed successfully` });
}
