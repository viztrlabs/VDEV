// Local 360° Virtual Tour rooms built from real equirectangular JPGs in
// /public/tour (copied from the user's PC: C:\Users\Arch_Viz\Desktop\Portfolio\360\JPG).
//
// Each node links to the next via a portal hotspot, giving genuine node-hopping
// through the captured sequence. Swap these for authored marketing rooms when
// real property photography is available.

import type { TourRoom } from '@/components/viewers/PanoramaViewer';

const TOTAL = 18;

function roomName(i: number): string {
  return `Tour Node ${String(i).padStart(2, '0')}`;
}

function portalHotspots(): TourRoom['defaultHotspots'] {
  const out: TourRoom['defaultHotspots'] = [];
  // Link forward (and wrap from last -> first) so the tour is navigable.
  for (let i = 0; i < TOTAL; i++) {
    const next = (i + 1) % TOTAL;
    out.push({
      id: `lp-${String(i).padStart(2, '0')}-next`,
      xPercent: 50,
      yPercent: 52,
      title: `Walk to ${roomName(next)}`,
      type: 'room_link',
      category: 'portal',
      description: `Navigate forward along the captured tour sequence to node ${String(next).padStart(2, '0')}.`,
      targetRoomId: `local-node-${String(next).padStart(2, '0')}`,
      targetRoomName: roomName(next),
      targetPanoramaUrl: `/tour/${String(next).padStart(2, '0')}.jpg`,
      targetYaw: 180,
      icon: 'door',
      color: 'emerald',
      pulseStyle: 'radar',
    });
  }
  return out;
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
