// Canonical, framework-free adapter from authored TourRoom[] to the viewer-facing
// tour manifest (scenes + only-authored links + featured start). FABRICATION-FREE:
// links exist strictly for authored room_link hotspots whose target room resolves.
import { xyPercentsToYawPitch } from './marzipano/coords';
import { readHotspots, toManifestHotspot } from './tour-schema/compat';
import type { ManifestHotspotKind } from './tour-schema';
import type { TourScene, TourHotspot } from '@/lib/tourClientStore';
import type { EditorRoomLike } from './tourRoomToScene';

export type { ManifestHotspotKind } from './tour-schema';

export interface ManifestHotspot {
  id: string;
  xPercent: number;
  yPercent: number;
  yaw: number;
  pitch: number;
  type: string;
  kind: ManifestHotspotKind;
  title: string;
  description: string;
  targetRoomId?: string;
  targetYaw?: number;
  images?: string[];
  externalUrl?: string;
  icon?: string;
  openMode?: 'new_tab' | 'same_tab';
  color?: string;
  [key: string]: unknown;
}

export interface ManifestScene {
  id: string;
  name: string;
  panoramaUrl: string;
  thumbnailUrl: string;
  initialYaw: number;
  initialPitch: number;
  floorPlanX?: number;
  floorPlanY?: number;
  hotspots: ManifestHotspot[];
  [key: string]: unknown;
}

export interface ManifestLink { from: string; to: string; }
export interface GalaxyNode { id: string; x: number; y: number; name: string; thumbnailUrl: string; }
export interface GalaxyEdge { from: string; to: string; }

export interface TourManifest {
  scenes: ManifestScene[];
  links: ManifestLink[];
  featuredId: string | null;
}

export interface ManifestRoomLike extends EditorRoomLike {
  initialYaw?: number;
  initialPitch?: number;
  featured?: boolean;
  floorPlanX?: number;
  floorPlanY?: number;
}

export function classifyHotspot(h: any): ManifestHotspotKind {
  const t = h?.type;
  if (t === 'room_link' || t === 'navigation' || t === 'teleport' || (t === 'image_overlay' && h.targetRoomId)) return 'nav';
  if (t === 'metadata') return 'metadata';
  if (t === 'info' || t === 'info_popup') return 'info';
  if (t === 'image' || t === 'gallery' || t === 'video' || t === 'audio' || t === 'model3d' || t === 'splat') return 'media';
  if ((t === 'link' || t === 'external') && h.externalUrl) return 'link';
  return 'other';
}

export function buildTourManifest(rooms: ManifestRoomLike[]): TourManifest {
  const valid = (rooms ?? []).filter((r) => r && r.id && (r.panoramaUrl || r.url));
  const idSet = new Set(valid.map((r) => r.id));

  const scenes: ManifestScene[] = valid.map((r) => {
    const rawHotspots = readHotspots({
      hotspots: (r as any).hotspots,
      defaultHotspots: r.defaultHotspots,
    });
    const hotspots: ManifestHotspot[] = rawHotspots
      .map((h: any) => {
        if (typeof h.yaw === 'number') return toManifestHotspot(h as TourHotspot);
        if (typeof h.xPercent === 'number' && typeof h.yPercent === 'number') {
          const { yaw, pitch } = xyPercentsToYawPitch(h.xPercent, h.yPercent);
          return toManifestHotspot({ ...h, yaw, pitch } as TourHotspot);
        }
        return toManifestHotspot({ ...h, yaw: 0, pitch: 0 } as TourHotspot);
      })
      .map((h) => h as ManifestHotspot)
      .filter((h: ManifestHotspot) => h.kind !== 'nav' || (h.targetRoomId && idSet.has(h.targetRoomId!)));

    return {
      ...r,
      id: r.id,
      name: r.name || 'Untitled Scene',
      panoramaUrl: r.panoramaUrl ?? r.url ?? '',
      thumbnailUrl: r.thumbnailUrl ?? '',
      initialYaw: typeof r.initialYaw === 'number' ? r.initialYaw : 0,
      initialPitch: typeof r.initialPitch === 'number' ? r.initialPitch : 0,
      floorPlanX: r.floorPlanX,
      floorPlanY: r.floorPlanY,
      hotspots,
    } as ManifestScene;
  });

  const links: ManifestLink[] = scenes.flatMap((sc) =>
    sc.hotspots
      .filter((h) => h.kind === 'nav' && h.targetRoomId && idSet.has(h.targetRoomId!))
      .map((h) => ({ from: sc.id, to: h.targetRoomId! } as ManifestLink)),
  );

  return {
    scenes,
    links,
    featuredId: valid.find((r) => r.featured)?.id ?? null,
  };
}

export function manifestSceneToTourScene(room: ManifestRoomLike, manifest: TourManifest): TourScene {
  const sc = manifest.scenes.find((s) => s.id === room.id);
  const hotspots: TourHotspot[] = (sc?.hotspots ?? []).map((h) => ({
    ...h,
    id: h.id,
    yaw: h.yaw,
    pitch: h.pitch,
    type: h.type as TourHotspot['type'],
    title: h.title,
    description: h.description,
    targetSceneId: h.targetRoomId,
    targetYaw: h.targetYaw,
    targetPitch: h.pitch,
    images: Array.isArray(h.images) && h.images.length ? h.images : undefined,
    externalUrl: h.externalUrl,
    icon: h.icon,
    color: h.color,
    openMode: h.openMode,
  } as TourHotspot));

  return {
    id: room.id,
    name: room.name || 'Untitled Scene',
    type: '360',
    url: room.panoramaUrl ?? room.url ?? '',
    thumbnailUrl: room.thumbnailUrl ?? '',
    initialYaw: sc?.initialYaw ?? 0,
    initialPitch: sc?.initialPitch ?? 0,
    initialFov: 90,
    hotspots,
    viewConstraints: { top: -90, bottom: 90, left: -180, right: 180, zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false },
    autorotateEnabled: true,
    autorotateSpeed: 0.5,
  };
}

export function layoutGalaxyNodes(scenes: ManifestScene[], width: number, height: number): GalaxyNode[] {
  const seed = (id: string) => {
    let n = 0;
    for (let i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) % 997;
    return n / 997;
  };

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.max(60, Math.min(width, height) * 0.38);

  return scenes.map((s, i) => {
    if (s.floorPlanX != null && s.floorPlanY != null) {
      return {
        id: s.id, name: s.name, thumbnailUrl: s.thumbnailUrl,
        x: Math.round((s.floorPlanX / 100) * width),
        y: Math.round((s.floorPlanY / 100) * height),
      };
    }
    const angle = (i / Math.max(1, scenes.length)) * 2 * Math.PI - Math.PI / 2 + seed(s.id) * 0.2;
    return {
      id: s.id, name: s.name, thumbnailUrl: s.thumbnailUrl,
      x: Math.round(cx + radius * Math.cos(angle)),
      y: Math.round(cy + radius * Math.sin(angle)),
    };
  });
}

export function layoutGalaxyEdges(nodes: GalaxyNode[], links: ManifestLink[]): GalaxyEdge[] {
  const ids = new Set(nodes.map((n) => n.id));
  const seen = new Set<string>();
  const edges: GalaxyEdge[] = [];
  for (const l of links) {
    if (!ids.has(l.from) || !ids.has(l.to)) continue;
    const key = [l.from, l.to].sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push({ from: l.from, to: l.to });
  }
  return edges;
}