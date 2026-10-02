import { yawPitchToXYPercents } from '../marzipano/coords';
import { kindForType } from './index';
import type { TourHotspot } from './index';

export function readHotspots(scene: {
  hotspots?: TourHotspot[] | null;
  defaultHotspots?: any[] | null;
}): TourHotspot[] {
  if (scene.hotspots && scene.hotspots.length > 0) return scene.hotspots;
  const legacy = (scene.defaultHotspots ?? []) as any[];
  return legacy.filter((h) => h && h.id).map((h) => normalizeLegacyHotspot(h));
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
  return { ...h, type, title: h.title || 'Hotspot', description: h.description || '' } as TourHotspot;
}

export function toManifestHotspot(hs: TourHotspot): Record<string, unknown> {
  const { x, y } = yawPitchToXYPercents(hs.yaw ?? 0, hs.pitch ?? 0);
  return {
    ...hs,
    xPercent: Math.round(x * 10) / 10,
    yPercent: Math.round(y * 10) / 10,
    kind: kindForType(hs.type),
    targetRoomId: hs.targetSceneId,
  };
}
