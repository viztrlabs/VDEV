import { NextRequest, NextResponse } from 'next/server';

export interface MediaAssetRecord {
  id: string;
  name: string;
  type: 'image' | 'video' | '3d_model' | 'panorama' | 'document';
  url: string;
  fileSize: string;
  dimensions?: string;
  format: string;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
  projectId?: string;
  category: 'Renders' | '3D Models' | 'Panoramas' | 'Animations' | 'CAD/BIM';
}

let MEDIA_DB: MediaAssetRecord[] = [
  {
    id: 'med_01',
    name: 'Lumina_Tower_Exterior_Day_8K_Master.tiff',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80',
    fileSize: '142.4 MB',
    dimensions: '7680 x 4320 (8K)',
    format: 'TIFF (16-bit float)',
    uploadedAt: '2025-07-15T14:20:00Z',
    uploadedBy: 'Sarah Lin',
    tags: ['Exterior', 'Commercial', '8K', 'Sunlight'],
    projectId: 'PRJ-VTR-8821',
    category: 'Renders',
  },
  {
    id: 'med_02',
    name: 'Aura_Pavilion_Draco_Optimized.glb',
    type: '3d_model',
    url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    fileSize: '14.8 MB',
    format: 'GLTF / Binary (Draco + KTX2)',
    uploadedAt: '2025-07-12T09:45:00Z',
    uploadedBy: 'David Kalu',
    tags: ['WebXR', '3D Model', 'Draco', 'Optimized'],
    projectId: 'PRJ-VTR-9042',
    category: '3D Models',
  },
  {
    id: 'med_03',
    name: 'Sky_Atrium_360_Spherical_Nocturnal.hdr',
    type: 'panorama',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&auto=format&fit=crop&q=80',
    fileSize: '88.2 MB',
    dimensions: '8192 x 4096 (Equirectangular)',
    format: 'Radiance HDR (32-bit)',
    uploadedAt: '2025-07-08T18:10:00Z',
    uploadedBy: 'Elena Rostova',
    tags: ['360 Panorama', 'Interior', 'Lighting Study'],
    projectId: 'PRJ-VTR-8821',
    category: 'Panoramas',
  },
  {
    id: 'med_04',
    name: 'Komorebi_Timber_Cinematic_Walkthrough_4K.mp4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    fileSize: '310.5 MB',
    dimensions: '3840 x 2160 (4K UHD 60fps)',
    format: 'ProRes 422 / H.265 MP4',
    uploadedAt: '2025-06-28T11:30:00Z',
    uploadedBy: 'Sarah Lin',
    tags: ['Cinematic', 'Flythrough', '4K 60FPS'],
    projectId: 'PRJ-VTR-7719',
    category: 'Animations',
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const projectId = searchParams.get('projectId');
  const query = searchParams.get('q')?.toLowerCase();

  let filtered = [...MEDIA_DB];
  if (type && type !== 'ALL') {
    filtered = filtered.filter((m) => m.type === type);
  }
  if (category && category !== 'ALL') {
    filtered = filtered.filter((m) => m.category === category);
  }
  if (projectId) {
    filtered = filtered.filter((m) => m.projectId === projectId);
  }
  if (query) {
    filtered = filtered.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.tags.some((t) => t.toLowerCase().includes(query)) ||
        m.format.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({ success: true, count: filtered.length, media: filtered });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newAsset: MediaAssetRecord = {
      id: `med_${Date.now()}`,
      name: body.name || `Asset_${Date.now()}`,
      type: body.type || 'image',
      url: body.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80',
      fileSize: body.fileSize || '12.4 MB',
      dimensions: body.dimensions || '3840 x 2160',
      format: body.format || 'PNG',
      uploadedAt: new Date().toISOString(),
      uploadedBy: body.uploadedBy || 'VizTR Admin',
      tags: body.tags || ['ArchViz', 'Uploaded'],
      projectId: body.projectId,
      category: body.category || 'Renders',
    };

    MEDIA_DB.unshift(newAsset);
    return NextResponse.json({ success: true, media: newAsset }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'Asset ID is required' }, { status: 400 });
  }

  const initialLength = MEDIA_DB.length;
  MEDIA_DB = MEDIA_DB.filter((m) => m.id !== id);

  if (MEDIA_DB.length === initialLength) {
    return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: `Media asset ${id} removed successfully` });
}
