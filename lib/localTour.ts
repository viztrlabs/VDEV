// Local 360° Virtual Tour rooms built from real equirectangular JPGs in
// /public/tour (copied from the user's PC: C:\Users\Arch_Viz\Desktop\Portfolio\360\JPG).
//
// Each node shows one capture frame. Hotspots are NOT auto-added — authors
// place them in-app (Layers → Add Hotspot) only where needed. Navigation
// between nodes is via the minimap / room dropdown.

import type { TourRoom } from '@/components/viewers/PanoramaViewer';

const TOTAL = 18;

function roomName(i: number): string {
  return `Tour Node ${String(i).padStart(2, '0')}`;
}

function portalHotspots(): TourRoom['defaultHotspots'] {
  // No auto-hotspots: every capture frame starts clean. Authors place
  // hotspots themselves in-app (Layers → Add Hotspot) only where needed,
  // and navigation between nodes happens via the minimap / room dropdown.
  return [];
}

export const LOCAL_TOUR_ROOMS: TourRoom[] = Array.from({ length: TOTAL }, (_, i) => {
  const id = `local-node-${String(i).padStart(2, '0')}`;
  return {
    id,
    name: roomName(i),
    subtitle: 'Local 360° Capture Sequence',
    panoramaUrl: `/tour/${String(i).padStart(2, '0')}.jpg`,
    thumbnailUrl: `/tour/${String(i).padStart(2, '0')}.jpg`,
    initialYaw: 180,
    initialPitch: 0,
    defaultHotspots: portalHotspots(),
  } as TourRoom;
});
