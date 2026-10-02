import type { TourScene, TourHotspot, HotspotType } from '@/lib/tourClientStore';

export type { TourScene, TourHotspot, HotspotType };

export type ManifestHotspotKind = 'nav' | 'info' | 'metadata' | 'media' | 'link' | 'other';

export function kindForType(type: string): ManifestHotspotKind {
  switch (type) {
    case 'navigation':
    case 'floor':
      return 'nav';
    case 'metadata':
      return 'metadata';
    case 'info':
      return 'info';
    case 'link':
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
