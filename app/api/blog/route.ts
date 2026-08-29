import { NextRequest, NextResponse } from 'next/server';

export interface BlogPostRecord {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatarUrl: string;
  };
  category: 'Unreal Engine 5.4' | 'WebXR & Vision Pro' | 'Lighting & Materials' | 'Studio Case Studies' | 'AI & Spatial';
  tags: string[];
  readTime: string;
  publishedAt: string;
  featured: boolean;
  status: 'published' | 'draft' | 'archived';
  coverImageUrl: string;
  seoTitle?: string;
  seoDescription?: string;
}

let BLOG_DB: BlogPostRecord[] = [
  {
    id: 'post_01',
    title: 'Harnessing Unreal Engine 5.4 Lumen & Nanite for Uncompressed Real-Time ArchViz',
    slug: 'unreal-engine-5-4-lumen-nanite-archviz',
    excerpt: 'How our studio achieves 60 FPS 4K real-time architectural walkthroughs using hardware ray tracing and zero-latency WebRTC pixel streaming clusters.',
    content: `# The Next Era of Architectural Immersion

Architectural visualization has fundamentally transitioned from static 2D frames to real-time interactive spatial experiences. With Unreal Engine 5.4's enhanced Lumen global illumination solvers, architects and investors can interactively adjust solar azimuths, test nocturnal lighting scenarios, and validate spatial volumes at 1:1 human scale.

## Zero-Latency Pixel Streaming Architecture

Rather than requiring clients to possess high-end GPU workstations or download multi-gigabyte builds, our cloud fleet renders frames directly in edge data centers (AWS G5 & RunPod Ada 6000 clusters) and streams interactive WebRTC video feeds to standard mobile safari and desktop browsers.

\`\`\`json
{
  "codec": "H.264 / AV1",
  "resolution": "3840x2160",
  "framerate": 60,
  "averageLatencyMs": 18.4
}
\`\`\`

## Key Takeaways for Commercial Real Estate
1. **Accelerated Stakeholder Buy-in**: Interactive changes reduce revision cycle friction by 64%.
2. **Multi-Device Accessibility**: Instant URL access with no client-side engine installs.
3. **Photometric Accuracy**: Precise IES luminaire mapping and true spectral dispersion.`,
    author: {
      name: 'Sarah Lin',
      role: 'CGI & Unreal Engine Lead',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
    },
    category: 'Unreal Engine 5.4',
    tags: ['Unreal 5.4', 'Pixel Streaming', 'Lumen', 'WebRTC', 'ArchViz'],
    readTime: '6 min read',
    publishedAt: '2025-06-14',
    featured: true,
    status: 'published',
    coverImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    seoTitle: 'Unreal Engine 5.4 ArchViz & Pixel Streaming | VizTR Insights',
    seoDescription: 'Discover how VizTR powers zero-latency 4K interactive architectural walkthroughs using Unreal 5.4 and edge GPU streaming.',
  },
  {
    id: 'post_02',
    title: 'Draco Compression & Spatial Computing: Delivering Instant WebXR 3D Models in 2025',
    slug: 'draco-compression-webxr-spatial-computing',
    excerpt: 'A technical breakdown of how Google Draco and KTX2 texture transcoding compress 500MB BIM datasets into lightweight 12MB WebXR assets.',
    content: `# Optimizing Spatial Geometry for the Open Web

Web-based 3D viewing demands uncompromising performance. A client visiting an architectural model on a smartphone will abandon the experience if asset loading exceeds 3 seconds.

## The Optimization Pipeline
By combining Google Draco geometry quantization with basis Universal GPU texture compression (KTX2), we routinely achieve 94% file size reductions with zero visual degradation.

### Benchmark Results
- **Raw BIM / Revit Export**: 485 MB
- **Standard GLTF / GLB**: 142 MB
- **VizTR Draco + KTX2 WebXR Asset**: 11.8 MB
- **First Contentful Paint**: 0.85s over 5G`,
    author: {
      name: 'David Kalu',
      role: 'Spatial Computing Engineer',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    },
    category: 'WebXR & Vision Pro',
    tags: ['WebXR', 'Draco', 'Three.js', 'Apple Vision Pro', 'Optimization'],
    readTime: '5 min read',
    publishedAt: '2025-07-02',
    featured: true,
    status: 'published',
    coverImageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
    seoTitle: 'WebXR 3D Compression & Spatial Optimization | VizTR',
    seoDescription: 'Learn our technical pipeline for compressing complex BIM and architectural geometry for instant browser WebXR experiences.',
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const slug = searchParams.get('slug');
  const query = searchParams.get('q')?.toLowerCase();

  if (slug) {
    const post = BLOG_DB.find((p) => p.slug === slug);
    if (!post) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, post });
  }

  let filtered = [...BLOG_DB];
  if (category && category !== 'ALL') {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (query) {
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  return NextResponse.json({ success: true, count: filtered.length, posts: filtered });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newPost: BlogPostRecord = {
      id: `post_${Date.now()}`,
      title: body.title || 'Untitled Article',
      slug: body.slug || (body.title ? body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `post-${Date.now()}`),
      excerpt: body.excerpt || 'Brief summary of the architectural insights article.',
      content: body.content || '# New Article Content\n\nEnter markdown content here...',
      author: body.author || {
        name: 'VizTR Editorial',
        role: 'Spatial Technology Research',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      },
      category: body.category || 'Unreal Engine 5.4',
      tags: body.tags || ['ArchViz', 'WebXR'],
      readTime: body.readTime || '4 min read',
      publishedAt: new Date().toISOString().split('T')[0],
      featured: !!body.featured,
      status: body.status || 'published',
      coverImageUrl: body.coverImageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      seoTitle: body.seoTitle || body.title,
      seoDescription: body.seoDescription || body.excerpt,
    };

    BLOG_DB.unshift(newPost);
    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Post ID is required' }, { status: 400 });
    }

    const index = BLOG_DB.findIndex((p) => p.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    BLOG_DB[index] = {
      ...BLOG_DB[index],
      ...body,
    };

    return NextResponse.json({ success: true, post: BLOG_DB[index] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'Post ID is required' }, { status: 400 });
  }

  const initialLength = BLOG_DB.length;
  BLOG_DB = BLOG_DB.filter((p) => p.id !== id);

  if (BLOG_DB.length === initialLength) {
    return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: `Article ${id} removed successfully` });
}
