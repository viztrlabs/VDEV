import { NextRequest, NextResponse } from 'next/server';

export interface TestimonialRecord {
  id: string;
  clientName: string;
  role: string;
  firmName: string;
  location: string;
  avatarUrl: string;
  rating: number;
  quote: string;
  projectReference: string;
  featured: boolean;
  status: 'published' | 'pending';
  date: string;
}

let TESTIMONIALS_DB: TestimonialRecord[] = [
  {
    id: 'tst_01',
    clientName: 'Alexander Sterling',
    role: 'Senior Design Partner',
    firmName: 'Foster + Partners',
    location: 'London, UK',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    quote: 'VizTR delivered an exceptional level of spectral fidelity for our 64-story tower commission. The real-time Lumen lighting study and zero-latency WebRTC streaming allowed our international client committee to approve the design in a single session.',
    projectReference: 'PRJ-VTR-8821',
    featured: true,
    status: 'published',
    date: '2025-05-18',
  },
  {
    id: 'tst_02',
    clientName: 'Helena Berg',
    role: 'Principal Architect',
    firmName: 'Snøhetta',
    location: 'Oslo, Norway',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    quote: 'The WebXR spatial model loaded instantly on Apple Vision Pro and mobile tablets without requiring any app installations. The Draco compression workflow reduced our massive BIM dataset into a lightning-fast spatial link.',
    projectReference: 'PRJ-VTR-9042',
    featured: true,
    status: 'published',
    date: '2025-06-22',
  },
  {
    id: 'tst_03',
    clientName: 'Kenji Takahashi',
    role: 'Studio Director',
    firmName: 'Kengo Kuma & Associates',
    location: 'Tokyo, Japan',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    quote: 'Capturing the micro-texture of Japanese cedar joinery in sub-millimeter detail is extraordinarily difficult. VizTR’s PBR shaders and 8K master frames achieved tactile realism that exceeded our highest expectations.',
    projectReference: 'PRJ-VTR-7719',
    featured: true,
    status: 'published',
    date: '2025-07-09',
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get('featured');
  const query = searchParams.get('q')?.toLowerCase();

  let filtered = [...TESTIMONIALS_DB];
  if (featured === 'true') {
    filtered = filtered.filter((t) => t.featured);
  }
  if (query) {
    filtered = filtered.filter(
      (t) =>
        t.clientName.toLowerCase().includes(query) ||
        t.firmName.toLowerCase().includes(query) ||
        t.quote.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({ success: true, count: filtered.length, testimonials: filtered });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newTestimonial: TestimonialRecord = {
      id: `tst_${Date.now()}`,
      clientName: body.clientName || 'Architectural Partner',
      role: body.role || 'Design Principal',
      firmName: body.firmName || 'Global Architecture Studio',
      location: body.location || 'New York, USA',
      avatarUrl: body.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      rating: body.rating || 5,
      quote: body.quote || 'Outstanding architectural visualization fidelity and responsiveness.',
      projectReference: body.projectReference || 'PRJ-VTR-GEN',
      featured: !!body.featured,
      status: body.status || 'published',
      date: new Date().toISOString().split('T')[0],
    };

    TESTIMONIALS_DB.unshift(newTestimonial);
    return NextResponse.json({ success: true, testimonial: newTestimonial }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Testimonial ID is required' }, { status: 400 });
    }

    const index = TESTIMONIALS_DB.findIndex((t) => t.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Testimonial not found' }, { status: 404 });
    }

    TESTIMONIALS_DB[index] = {
      ...TESTIMONIALS_DB[index],
      ...body,
    };

    return NextResponse.json({ success: true, testimonial: TESTIMONIALS_DB[index] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'Testimonial ID is required' }, { status: 400 });
  }

  const initialLength = TESTIMONIALS_DB.length;
  TESTIMONIALS_DB = TESTIMONIALS_DB.filter((t) => t.id !== id);

  if (TESTIMONIALS_DB.length === initialLength) {
    return NextResponse.json({ success: false, error: 'Testimonial not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: `Testimonial ${id} removed successfully` });
}
