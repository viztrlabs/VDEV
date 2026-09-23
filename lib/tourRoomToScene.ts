// Pure adapter from the editor's TourRoom/hotspot model to the XR viewer's
// XRScene model. Kept framework-free so it is unit-testable and reusable by
// both the editor preview and the public viewer.

import { xyPercentsToYawPitch } from './marzipano/coords';
import type { XRScene, HotspotItem } from '@/components/xr/xr.types';

export interface EditorHotspotLike {
  id: string;
  xPercent?: number;
  yPercent?: number;
  title?: string;
  type?: string;
  targetRoomId?: string;
  icon?: string;
  texType?: string;
}

export interface EditorRoomLike {
  id: string;
  name: string;
  panoramaUrl?: string;
  url?: string;
  thumbnailUrl?: string;
  defaultHotspots?: EditorHotspotLike[];
}

export interface TourRoomToSceneOptions {
  rooms?: EditorRoomLike[];
}

function hotspotToItem(h: EditorHotspotLike): HotspotItem | null {
  const position = xyPercentsToYawPitch(
    typeof h.xPercent === 'number' ? h.xPercent : 50,
    typeof h.yPercent === 'number' ? h.yPercent : 50,
  );
  const isNav = h.type === 'room_link' || h.type === 'link' || h.type === 'teleport';
  return {
    id: h.id,
    position: { yaw: position.yaw, pitch: position.pitch },
    action: isNav ? 'teleport' : 'open_info',
    target: isNav ? h.targetRoomId ?? h.id : h.id,
    title: h.title || 'Hotspot',
    icon: h.icon,
    visible: true,
  };
}

export function tourRoomToScene(
  room: EditorRoomLike,
  opts?: TourRoomToSceneOptions,
): XRScene {
  const hotspots: HotspotItem[] = (room.defaultHotspots ?? [])
    .map(hotspotToItem)
    .filter((h): h is HotspotItem => h !== null);

  const preload =
    opts?.rooms
      ?.filter((r) => r.id !== room.id)
      .map((r) => r.panoramaUrl ?? r.url ?? '')
      .filter(Boolean) ?? [];

  return {
    id: room.id,
    name: room.name,
    type: '360',
    url: room.panoramaUrl ?? room.url ?? '',
    thumbnail: room.thumbnailUrl,
    hotspots,
    annotations: [],
    teleportPoints: [],
    preload,
  };
}