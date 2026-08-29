import { NextRequest, NextResponse } from 'next/server';

export interface ProjectRecord {
  id: string;
  title: string;
  client: string;
  clientEmail: string;
  category: 'Commercial' | 'Residential' | 'Urban Planning' | 'Hospitality' | 'Cultural';
  status: 'In Production' | 'Clay Review' | 'Lighting & Shading' | 'Client Review' | 'Completed';
  progress: number;
  startDate: string;
  targetDelivery: string;
  budget: string;
  assignedTeam: Array<{ name: string; role: string; avatar: string }>;
  tags: string[];
  thumbnailUrl: string;
  modelsCount: number;
  rendersCount: number;
  xrEnabled: boolean;
  pixelStreamingEnabled: boolean;
  accessToken: string;
  description: string;
  milestones: Array<{
    id: string;
    title: string;
    stage: string;
    completed: boolean;
    dueDate: string;
    status: 'completed' | 'in_progress' | 'pending';
  }>;
}

let PROJECTS_DB: ProjectRecord[] = [
  {
    id: 'PRJ-VTR-8821',
    title: 'The Lumina Horizon Tower & Sky Atrium',
    client: 'Foster & Partners Architecture',
    clientEmail: 'architect@fosterpartners.com',
    category: 'Commercial',
    status: 'Lighting & Shading',
    progress: 72,
    startDate: '2025-05-10',
    targetDelivery: '2025-09-30',
    budget: '$185,000',
    assignedTeam: [
      { name: 'Sarah Lin', role: 'CGI Lead', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100' },
      { name: 'David Kalu', role: 'WebXR Engineer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    ],
    tags: ['Unreal 5.4', 'WebXR', '8K Still', 'Pixel Streaming'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    modelsCount: 14,
    rendersCount: 38,
    xrEnabled: true,
    pixelStreamingEnabled: true,
    accessToken: 'VTR-TOKEN-8821-XP',
    description: 'Ultra-high-fidelity 64-story parametric skyscraper with real-time solar study and WebXR interior walkthrough.',
    milestones: [
      { id: 'm1', title: 'CAD/BIM Ingestion & Cleanup', stage: 'CAD Ingestion', completed: true, dueDate: '2025-05-20', status: 'completed' },
      { id: 'm2', title: 'Parametric Geometry & Massing', stage: '3D Modeling', completed: true, dueDate: '2025-06-15', status: 'completed' },
      { id: 'm3', title: 'Clay Render Angle Signoff', stage: 'Clay Review', completed: true, dueDate: '2025-07-01', status: 'completed' },
      { id: 'm4', title: 'PBR Shading & Spectral Lighting', stage: 'Lighting & Shading', completed: false, dueDate: '2025-08-15', status: 'in_progress' },
      { id: 'm5', title: 'Interactive WebXR & Unreal Stream', stage: 'XR Assembly', completed: false, dueDate: '2025-09-10', status: 'pending' },
      { id: 'm6', title: '8K Master Delivery & Archive', stage: 'Delivery', completed: false, dueDate: '2025-09-30', status: 'pending' },
    ],
  },
  {
    id: 'PRJ-VTR-9042',
    title: 'Aura Waterfront Resort & Private Marina',
    client: 'Zaha Hadid Architects Global',
    clientEmail: 'contact@zaha-hadid.com',
    category: 'Hospitality',
    status: 'Client Review',
    progress: 88,
    startDate: '2025-04-01',
    targetDelivery: '2025-08-28',
    budget: '$240,000',
    assignedTeam: [
      { name: 'Marcus Vance', role: 'Super Admin / Lead', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
      { name: 'Elena Rostova', role: 'BIM Modeler', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100' },
    ],
    tags: ['Pixel Streaming', '4K Cinematic', 'VR Walkthrough'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
    modelsCount: 22,
    rendersCount: 52,
    xrEnabled: true,
    pixelStreamingEnabled: true,
    accessToken: 'VTR-TOKEN-9042-ZW',
    description: 'Biophilic curved waterfront development featuring real-time water wave dynamics in Unreal 5.4 Lumen.',
    milestones: [
      { id: 'm1', title: 'Site Topography & BIM Setup', stage: 'CAD Ingestion', completed: true, dueDate: '2025-04-15', status: 'completed' },
      { id: 'm2', title: 'Organic Pavilion Geometry', stage: '3D Modeling', completed: true, dueDate: '2025-05-20', status: 'completed' },
      { id: 'm3', title: 'Atmospheric Lighting & Water Sim', stage: 'Lighting & Shading', completed: true, dueDate: '2025-07-10', status: 'completed' },
      { id: 'm4', title: 'Client Director Milestone Review', stage: 'Client Review', completed: false, dueDate: '2025-08-15', status: 'in_progress' },
      { id: 'm5', title: 'Global 8K Master Package', stage: 'Delivery', completed: false, dueDate: '2025-08-28', status: 'pending' },
    ],
  },
  {
    id: 'PRJ-VTR-7719',
    title: 'Komorebi Minimalist Pavilion & Zen Gardens',
    client: 'Kengo Kuma & Associates',
    clientEmail: 'studio@kkaa.co.jp',
    category: 'Cultural',
    status: 'Completed',
    progress: 100,
    startDate: '2025-02-10',
    targetDelivery: '2025-05-18',
    budget: '$120,000',
    assignedTeam: [
      { name: 'David Kalu', role: 'WebXR Engineer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    ],
    tags: ['WebXR', '8K Panoramic', 'PBR Wood Shading'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
    modelsCount: 8,
    rendersCount: 26,
    xrEnabled: true,
    pixelStreamingEnabled: false,
    accessToken: 'VTR-TOKEN-7719-KK',
    description: 'Timber joinery pavilion rendered with sub-millimeter timber textures and realistic ambient occlusion.',
    milestones: [
      { id: 'm1', title: 'BIM Import & Wood Shader Setup', stage: 'CAD Ingestion', completed: true, dueDate: '2025-02-25', status: 'completed' },
      { id: 'm2', title: 'Lighting & Autumn Foliage', stage: 'Lighting & Shading', completed: true, dueDate: '2025-03-30', status: 'completed' },
      { id: 'm3', title: 'WebXR Spatial Experience', stage: 'XR Assembly', completed: true, dueDate: '2025-04-25', status: 'completed' },
      { id: 'm4', title: 'Final Master Delivery & Signoff', stage: 'Delivery', completed: true, dueDate: '2025-05-18', status: 'completed' },
    ],
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const query = searchParams.get('q')?.toLowerCase();

  let filtered = [...PROJECTS_DB];
  if (status && status !== 'ALL') {
    filtered = filtered.filter((p) => p.status === status);
  }
  if (category && category !== 'ALL') {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (query) {
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.client.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  return NextResponse.json({ success: true, count: filtered.length, projects: filtered });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newId = `PRJ-VTR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProject: ProjectRecord = {
      id: body.id || newId,
      title: body.title || 'Untitled Architectural Commission',
      client: body.client || 'Enterprise Client',
      clientEmail: body.clientEmail || 'client@firm.com',
      category: body.category || 'Commercial',
      status: body.status || 'In Production',
      progress: body.progress || 10,
      startDate: body.startDate || new Date().toISOString().split('T')[0],
      targetDelivery: body.targetDelivery || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      budget: body.budget || '$150,000',
      assignedTeam: body.assignedTeam || [
        { name: 'Sarah Lin', role: 'CGI Lead', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100' },
      ],
      tags: body.tags || ['WebXR', 'Unreal 5.4', '8K Still'],
      thumbnailUrl: body.thumbnailUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      modelsCount: body.modelsCount || 1,
      rendersCount: body.rendersCount || 4,
      xrEnabled: body.xrEnabled !== undefined ? body.xrEnabled : true,
      pixelStreamingEnabled: body.pixelStreamingEnabled !== undefined ? body.pixelStreamingEnabled : true,
      accessToken: `VTR-TOKEN-${Math.floor(1000 + Math.random() * 9000)}-EXP`,
      description: body.description || 'High-end architectural visualization and spatial exploration suite.',
      milestones: body.milestones || [
        { id: 'm1', title: 'CAD/BIM Ingestion & Validation', stage: 'CAD Ingestion', completed: true, dueDate: '2025-09-01', status: 'completed' },
        { id: 'm2', title: '3D Geometry & Environment Assembly', stage: '3D Modeling', completed: false, dueDate: '2025-09-15', status: 'in_progress' },
        { id: 'm3', title: 'PBR Shading & Spectral Lighting', stage: 'Lighting & Shading', completed: false, dueDate: '2025-10-01', status: 'pending' },
        { id: 'm4', title: 'WebXR & Pixel Streaming Integration', stage: 'XR Assembly', completed: false, dueDate: '2025-10-20', status: 'pending' },
        { id: 'm5', title: 'Master 8K Renders & Signoff', stage: 'Delivery', completed: false, dueDate: '2025-11-01', status: 'pending' },
      ],
    };

    PROJECTS_DB.unshift(newProject);
    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
    }

    const index = PROJECTS_DB.findIndex((p) => p.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    PROJECTS_DB[index] = {
      ...PROJECTS_DB[index],
      ...body,
    };

    return NextResponse.json({ success: true, project: PROJECTS_DB[index] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
  }

  const initialLength = PROJECTS_DB.length;
  PROJECTS_DB = PROJECTS_DB.filter((p) => p.id !== id);

  if (PROJECTS_DB.length === initialLength) {
    return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: `Project ${id} removed successfully` });
}
