import { yawPitchToXYPercents } from '../marzipano/coords';
import { kindForType } from './index';
import type { TourHotspot } from './index';

export function readHotspots(scene: {
  hotspots?: TourHotspot[] | null;
  defaultHotspots?: any[] | null;
}): TourHotspot[] {
  const canonical = scene.hotspots ?? [];
  const seen = new Set(canonical.map((h) => h.id));
  const legacy = (scene.defaultHotspots ?? [])
    .filter((h: any) => h && h.id && !seen.has(h.id))
    .map((h: any) => normalizeLegacyHotspot(h));
  return [...canonical, ...legacy];
}

export function normalizeLegacyHotspot(h: any): TourHotspot {
  const t = h?.type;
  let type: string = t;
  switch (t) {
    case 'room_link':
    case 'teleport':
      type = 'navigation';
      break;
    case 'info_popup':
    case 'metadata':
      type = 'info';
      break;
    case 'image_overlay':
      type = 'image';
      break;
    case 'external':
      type = 'link';
      break;
    case 'product':
      type = 'model3d';
      break;
    case 'link':
      type = h.externalUrl ? 'link' : 'navigation';
      break;
  }
  return { ...h, type, legacyType: t, title: h.title || 'Hotspot', description: h.description || '' } as TourHotspot;
}

export function toManifestHotspot(hs: TourHotspot): Record<string, unknown> {
  const { x, y } = yawPitchToXYPercents(hs.yaw ?? 0, hs.pitch ?? 0);
  const rawType = (hs as any).legacyType ?? hs.type;
  return {
    ...hs,
    xPercent: Math.round(x * 10) / 10,
    yPercent: Math.round(y * 10) / 10,
    kind: kindForType(rawType),
    targetRoomId: hs.targetSceneId ?? (hs as any).targetRoomId,
  };
}
