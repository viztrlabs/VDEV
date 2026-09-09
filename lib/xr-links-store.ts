import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface XRLinkRecord {
  id: string;
  name: string;
  slug: string;
  projectId: string;
  sceneId?: string;
  modelUrl: string;
  thumbnailUrl?: string;
  shareUrl: string;
  qrCodeUrl: string;
  environment: 'studio' | 'sunset' | 'urban' | 'interior';
  arPlacement: 'floor' | 'tabletop' | 'wall' | 'image';
  passwordProtected: boolean;
  accessPassword?: string;
  viewsCount: number;
  uniqueVisitors: number;
  avgEngagementSecs: number;
  status: 'draft' | 'active' | 'expired' | 'revoked' | 'processing';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    engineType: string;
    entitiesCount: number;
    fileSizeMB: number;
    formats: string[];
    arConfig: {
      placement: string;
      environment: string;
      passwordProtected: boolean;
    };
    delivery: {
      webAR: boolean;
      webXR: boolean;
      iOSQuickLook: boolean;
      androidAR: boolean;
    };
  };
}

export const XR_LINKS_DB: XRLinkRecord[] = [
  {
    id: 'xr_link_01',
    name: 'Lumina Sky Atrium — WebXR Spatial Tour',
    slug: 'lumina-sky-atrium',
    projectId: 'PRJ-VTR-8821',
    sceneId: 'scene_lumina_01',
    modelUrl: 'https://cdn.viztr.studio/models/lumina-sky-atrium.glb',
    thumbnailUrl: 'https://cdn.viztr.studio/thumbs/lumina-sky-atrium.jpg',
    shareUrl: 'https://viztr.studio/xr/lumina-sky-atrium',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://viztr.studio/xr/lumina-sky-atrium',
    environment: 'interior',
    arPlacement: 'floor',
    passwordProtected: true,
    accessPassword: 'LUMINA-2025-XR',
    viewsCount: 428,
    uniqueVisitors: 312,
    avgEngagementSecs: 184,
    status: 'active',
    expiresAt: '2025-12-31T23:59:59Z',
    createdAt: '2025-06-10T11:00:00Z',
    updatedAt: '2025-06-10T11:00:00Z',
    metadata: {
      engineType: 'three',
      entitiesCount: 142,
      fileSizeMB: 24.5,
      formats: ['glb', 'usdz', 'gltf'],
      arConfig: { placement: 'floor', environment: 'interior', passwordProtected: true },
      delivery: { webAR: true, webXR: true, iOSQuickLook: true, androidAR: true }
    }
  },
  {
    id: 'xr_link_02',
    name: 'Aura Waterfront Organic Pavilion — AR QuickLook',
    slug: 'aura-waterfront-pavilion',
    projectId: 'PRJ-VTR-9042',
    sceneId: 'scene_aura_01',
    modelUrl: 'https://cdn.viztr.studio/models/aura-pavilion.glb',
    thumbnailUrl: 'https://cdn.viztr.studio/thumbs/aura-pavilion.jpg',
    shareUrl: 'https://viztr.studio/xr/aura-pavilion',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://viztr.studio/xr/aura-pavilion',
    environment: 'sunset',
    arPlacement: 'tabletop',
    passwordProtected: false,
    viewsCount: 684,
    uniqueVisitors: 540,
    avgEngagementSecs: 215,
    status: 'active',
    expiresAt: '2025-11-30T23:59:59Z',
    createdAt: '2025-06-25T14:30:00Z',
    updatedAt: '2025-06-25T14:30:00Z',
    metadata: {
      engineType: 'playcanvas',
      entitiesCount: 89,
      fileSizeMB: 18.2,
      formats: ['glb', 'usdz'],
      arConfig: { placement: 'tabletop', environment: 'sunset', passwordProtected: false },
      delivery: { webAR: true, webXR: false, iOSQuickLook: true, androidAR: true }
    }
  },
  {
    id: 'xr_link_gp',
    name: 'Glass Pavilion — Ultra-Res Interior',
    slug: 'glass-pavilion-v1',
    projectId: 'glass-pavilion',
    modelUrl: 'https://cdn.viztr.studio/models/glass-pavilion.glb',
    environment: 'interior',
    arPlacement: 'tabletop',
    passwordProtected: false,
    viewsCount: 0,
    uniqueVisitors: 0,
    avgEngagementSecs: 0,
    status: 'active',
    expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shareUrl: '/xr-world/view/glass-pavilion-v1',
    qrCodeUrl: '',
    metadata: { engineType: 'three', entitiesCount: 142, fileSizeMB: 24.5, formats: ['glb', 'usdz'], arConfig: { placement: 'tabletop', environment: 'interior', passwordProtected: false }, delivery: { webAR: true, webXR: true, iOSQuickLook: true, androidAR: true } }
  },
  {
    id: 'xr_link_ts',
    name: 'Tokyo Skyloft XR',
    slug: 'tokyo-skyloft-xr',
    projectId: 'tokyo-skyloft',
    modelUrl: 'https://cdn.viztr.studio/models/tokyo-skyloft.glb',
    environment: 'urban',
    arPlacement: 'floor',
    passwordProtected: false,
    viewsCount: 0,
    uniqueVisitors: 0,
    avgEngagementSecs: 0,
    status: 'active',
    expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shareUrl: '/xr-world/view/tokyo-skyloft-xr',
    qrCodeUrl: '',
    metadata: { engineType: 'playcanvas', entitiesCount: 142, fileSizeMB: 24.5, formats: ['glb', 'usdz'], arConfig: { placement: 'floor', environment: 'urban', passwordProtected: false }, delivery: { webAR: true, webXR: true, iOSQuickLook: true, androidAR: true } }
  },
  {
    id: 'xr_link_bg',
    name: 'Brutalist Garden AR',
    slug: 'brutalist-garden-ar',
    projectId: 'brutalist-garden',
    modelUrl: 'https://cdn.viztr.studio/models/brutalist-garden.glb',
    environment: 'studio',
    arPlacement: 'image',
    passwordProtected: false,
    viewsCount: 0,
    uniqueVisitors: 0,
    avgEngagementSecs: 0,
    status: 'active',
    expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shareUrl: '/xr-world/view/brutalist-garden-ar',
    qrCodeUrl: '',
    metadata: { engineType: 'three', entitiesCount: 142, fileSizeMB: 24.5, formats: ['glb', 'usdz'], arConfig: { placement: 'image', environment: 'studio', passwordProtected: false }, delivery: { webAR: true, webXR: true, iOSQuickLook: true, androidAR: true } }
  },
];

export async function getXRLinksFromDB(): Promise<XRLinkRecord[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('xr_links')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        return data as XRLinkRecord[];
      }
    } catch (err) {
      console.warn('[XR Links] Supabase fetch failed:', err);
    }
  }
  return XR_LINKS_DB;
}

export async function saveXRLinkToDB(link: XRLinkRecord): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('xr_links')
        .upsert(link, { onConflict: 'id' });
      
      if (error) {
        console.warn('[XR Links] Supabase upsert failed:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[XR Links] Supabase upsert error:', err);
      return false;
    }
  }
  return false;
}

export async function deleteXRLinkFromDB(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('xr_links')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.warn('[XR Links] Supabase delete failed:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[XR Links] Supabase delete error:', err);
      return false;
    }
  }
  return false;
}

export function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function generateQRCodeUrl(data: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
}

export function getXRLinkBySlug(slug: string, links: XRLinkRecord[]): XRLinkRecord | undefined {
  const target = slug.toLowerCase();
  return links.find((l) => l.slug.toLowerCase() === target);
}
