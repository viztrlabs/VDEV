import type { TourScene, TourHotspot, HotspotType } from '@/lib/tourClientStore';

export type { TourScene, TourHotspot, HotspotType };

export type ManifestHotspotKind = 'nav' | 'info' | 'metadata' | 'media' | 'link' | 'other';

export function kindForType(type: string): ManifestHotspotKind {
  switch (type) {
    case 'navigation':
    case 'floor':
    case 'room_link':
    case 'teleport':
      return 'nav';
    case 'metadata':
      return 'metadata';
    case 'info':
    case 'info_popup':
      return 'info';
    case 'link':
    case 'external':
      return 'link';
    case 'image':
    case 'gallery':
    case 'video':
    case 'audio':
    case 'model3d':
    case 'splat':
      return 'media';
    default:
      return 'other';
  }
}
