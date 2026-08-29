export interface XRToken {
  id: string;
  token: string;
  name: string;
  projectId: string;
  projectName: string;
  modelUrl: string;
  modelFormat: 'glb' | 'gltf' | 'usdz';
  experienceType: 'webxr' | 'webar' | 'vr_tour' | 'pixel_stream';
  scale: number;
  environmentPreset: 'studio' | 'sunset' | 'city' | 'dawn';
  requiresPasscode: boolean;
  passcode?: string;
  expiresAt: string | null; // null = never
  maxViews: number | null; // null = unlimited
  currentViews: number;
  createdAt: string;
  status: 'active' | 'expired' | 'revoked';
  qrCodeUrl?: string;
  notes?: string;
}

export interface StorageFileItem {
  id: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: '3d_model' | 'render' | 'video' | 'cad_bim' | 'document';
  format: string; // e.g. 'glb', 'exr', 'mp4', 'dwg', 'png'
  provider: 'aws_s3' | 'cloudflare_r2' | 'google_drive' | 'local_fs';
  providerBucket?: string;
  cdnUrl: string;
  symbolicPath?: string;
  projectId?: string;
  projectName?: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
  dimensions?: string; // e.g. "8192 x 4320" or "1.2M Polygons"
}

export const INITIAL_XR_TOKENS: XRToken[] = [
  {
    id: 'xrt-01',
    token: 'apex-tower-vip-2026',
    name: 'The Apex Tower - VIP Investor WebXR Link',
    projectId: 'VIZTR-882',
    projectName: 'The Apex Tower (WebXR Commercial)',
    modelUrl: '/models/apex-tower-v3-draco.glb',
    modelFormat: 'glb',
    experienceType: 'webxr',
    scale: 1.0,
    environmentPreset: 'sunset',
    requiresPasscode: true,
    passcode: '8820',
    expiresAt: '2026-12-31T23:59:59Z',
    maxViews: 500,
    currentViews: 142,
    createdAt: '2026-08-01T10:00:00Z',
    status: 'active',
    notes: 'Primary executive showcase for Dubai Sovereign Wealth review.'
  },
  {
    id: 'xrt-02',
    token: 'nordic-monolith-ar-quicklook',
    name: 'Nordic Monolith - AR QuickLook Mobile Anchor',
    projectId: 'VIZTR-904',
    projectName: 'Nordic Monolith Residence',
    modelUrl: '/models/nordic-monolith-hull.glb',
    modelFormat: 'glb',
    experienceType: 'webar',
    scale: 0.25,
    environmentPreset: 'studio',
    requiresPasscode: false,
    expiresAt: '2026-09-30T23:59:59Z',
    maxViews: 200,
    currentViews: 89,
    createdAt: '2026-08-10T14:30:00Z',
    status: 'active',
    notes: 'Optimized 14MB GLB model with Draco compression for instant iOS USDZ / Android AR.'
  },
  {
    id: 'xrt-03',
    token: 'solarium-penthouse-vr360',
    name: 'Solarium Sky Penthouse - VR Teleport Tour',
    projectId: 'VIZTR-771',
    projectName: 'Solarium Sky Penthouse (VR Tour)',
    modelUrl: '/models/solarium-suite-pbr.gltf',
    modelFormat: 'gltf',
    experienceType: 'vr_tour',
    scale: 1.0,
    environmentPreset: 'city',
    requiresPasscode: false,
    expiresAt: null,
    maxViews: null,
    currentViews: 310,
    createdAt: '2026-07-15T09:00:00Z',
    status: 'active',
    notes: 'Direct bridge to full WebXR headset mode (Meta Quest 3 & Apple Vision Pro).'
  },
  {
    id: 'xrt-04',
    token: 'tok-temp-cad-review-expired',
    name: 'Metropolitan Arts Center - Preliminary Geometry Review',
    projectId: 'VIZTR-650',
    projectName: 'Metropolitan Arts Center',
    modelUrl: '/models/metropolitan-arts.glb',
    modelFormat: 'glb',
    experienceType: 'webxr',
    scale: 1.0,
    environmentPreset: 'studio',
    requiresPasscode: true,
    passcode: '9911',
    expiresAt: '2026-08-01T00:00:00Z',
    maxViews: 50,
    currentViews: 50,
    createdAt: '2026-07-20T12:00:00Z',
    status: 'expired',
    notes: 'Preliminary stage 2 review token. Expired on schedule.'
  }
];

export const INITIAL_STORAGE_FILES: StorageFileItem[] = [
  {
    id: 'file-01',
    fileName: 'apex_tower_master_facade_draco.glb',
    fileSize: 8808038, // ~8.4 MB
    fileType: '3d_model',
    format: 'glb',
    provider: 'cloudflare_r2',
    providerBucket: 'viztr-spatial-models-prod',
    cdnUrl: 'https://cdn.viztr.io/models/apex_tower_master_facade_draco.glb',
    symbolicPath: '/var/storage/models/VIZTR-882/apex_tower_master_facade_draco.glb',
    projectId: 'VIZTR-882',
    projectName: 'The Apex Tower',
    thumbnailUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
    uploadedAt: '2026-08-15T11:20:00Z',
    uploadedBy: 'Elena Rostova (Lead 3D)',
    tags: ['Draco', 'LOD0', 'WebXR Ready', 'PBR MetalRough'],
    dimensions: '1.42M Polygons • 8.4 MB'
  },
  {
    id: 'file-02',
    fileName: 'apex_tower_twilight_hero_cam01_8k.exr',
    fileSize: 48234496, // ~46 MB
    fileType: 'render',
    format: 'exr',
    provider: 'aws_s3',
    providerBucket: 'viztr-studio-assets-prod-us-east-1',
    cdnUrl: 'https://s3.amazonaws.com/viztr-studio-assets-prod-us-east-1/renders/apex_tower_twilight_8k.exr',
    symbolicPath: '/var/storage/renders/VIZTR-882/apex_tower_twilight_hero_cam01_8k.exr',
    projectId: 'VIZTR-882',
    projectName: 'The Apex Tower',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
    uploadedAt: '2026-08-18T16:45:00Z',
    uploadedBy: 'Julian Vance (Lighting Director)',
    tags: ['8K UHD', '32-bit float', 'ACEScg', 'Camera 01'],
    dimensions: '8192 x 4320 px • 46 MB'
  },
  {
    id: 'file-03',
    fileName: 'nordic_monolith_cinematic_walkthrough_4k60.mp4',
    fileSize: 184549376, // ~176 MB
    fileType: 'video',
    format: 'mp4',
    provider: 'cloudflare_r2',
    providerBucket: 'viztr-spatial-video-cdn',
    cdnUrl: 'https://cdn.viztr.io/videos/nordic_monolith_cinematic_walkthrough_4k60.mp4',
    symbolicPath: '/var/storage/videos/VIZTR-904/nordic_monolith_cinematic_walkthrough_4k60.mp4',
    projectId: 'VIZTR-904',
    projectName: 'Nordic Monolith Residence',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    uploadedAt: '2026-08-20T09:15:00Z',
    uploadedBy: 'Marcus Sterling (Cinematics)',
    tags: ['4K 60FPS', 'ProRes 422 to H.265', 'Color Graded'],
    dimensions: '3840 x 2160 • 60 FPS • 176 MB'
  },
  {
    id: 'file-04',
    fileName: 'solarium_suite_revit_arch_model.rvt',
    fileSize: 96468992, // ~92 MB
    fileType: 'cad_bim',
    format: 'rvt',
    provider: 'google_drive',
    providerBucket: 'Google Drive Fleet / BIM Submittals',
    cdnUrl: 'https://drive.google.com/file/d/1SolariumSuiteRevitModelArch_BIM/view',
    symbolicPath: '/var/storage/cad/VIZTR-771/solarium_suite_revit_arch_model.rvt',
    projectId: 'VIZTR-771',
    projectName: 'Solarium Sky Penthouse',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80',
    uploadedAt: '2026-08-12T14:00:00Z',
    uploadedBy: 'Foster & Partners BIM Lead',
    tags: ['Revit 2026', 'IFC 4.3', 'Level 350 LOD'],
    dimensions: 'Autodesk Revit 2026 • 92 MB'
  },
  {
    id: 'file-05',
    fileName: 'solarium_pbr_material_textures_atlas_4k.zip',
    fileSize: 64225280, // ~61 MB
    fileType: '3d_model',
    format: 'zip',
    provider: 'local_fs',
    providerBucket: 'Local Studio NVMe Cache (/mnt/studio-nvme)',
    cdnUrl: '/storage/local/solarium_pbr_material_textures_atlas_4k.zip',
    symbolicPath: '/mnt/studio-nvme/cache/VIZTR-771/solarium_pbr_material_textures_atlas_4k.zip',
    projectId: 'VIZTR-771',
    projectName: 'Solarium Sky Penthouse',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80',
    uploadedAt: '2026-08-22T17:30:00Z',
    uploadedBy: 'Sarah Chen (Materials Lead)',
    tags: ['PBR Roughness/Metallic', 'Normal OpenGL', 'Height 16-bit'],
    dimensions: '4096 x 4096 Textures • 61 MB'
  }
];
