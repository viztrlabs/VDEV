/**
 * Pure conversion helpers between Marzipano's scene/hotspot shapes and
 * VizTR's TourRoom[] / Hotspot shapes.
 *
 * Hotspot type mapping: the editor accepts a union including
 * 'metadata' | 'room_link' | 'image' | 'video' | 'info' | 'audio' | 'link'.
 * Marzipano has two distinct hotspot collections (`linkHotspots[]` and
 * `infoHotspots[]`). On import we map them straight across:
 *   linkHotspots → type: 'room_link'
 *   infoHotspots → type: 'info'
 * On export, any other type is serialized into an infoHotspot's `text`
 * field via JSON.stringify so nothing is silently dropped (lossy round-trip,
 * documented).
 */

import type {
  MarzipanoScene,
  MarzipanoInfoHotspot,
  MarzipanoLinkHotspot,
} from './types';
import { yawPitchToXYPercents, xyPercentsToYawPitch } from './coords';

// ----- VizTR shape (mirror the inline type in editor/page.tsx) -----

export type EditorHotspotType =
  | 'metadata'
  | 'room_link'
  | 'image'
  | 'video'
  | 'info'
  | 'audio'
  | 'link';

export interface EditorHotspot {
  id: string;
  xPercent: number;
  yPercent: number;
  title: string;
  type: EditorHotspotType;
  category: string;
  description: string;
  targetRoomId?: string;
  targetRoomName?: string;
  targetPanoramaUrl?: string;
  targetYaw?: number;
  icon?: string;
  color?: string;
  mediaUrl?: string;
  article?: string;
  externalUrl?: string;
  audioUrl?: string;
  [key: string]: unknown;
}

export interface EditorRoom {
  id: string;
  name: string;
  subtitle: string;
  panoramaUrl: string;
  thumbnailUrl: string;
  initialYaw: number;
  initialPitch: number;
  defaultHotspots: EditorHotspot[];
  [key: string]: unknown;
}

export interface ConversionWarning {
  code:
    | 'cube_tiles_rejected'
    | 'hotspot_dropped_link'
    | 'hotspot_dropped_oversize'
    | 'hotspot_dropped_invalid'
    | 'scene_id_fallback'
    | 'equirect_source_missing';
  sceneId?: string;
  message: string;
}

export function isCubeScene(scene: MarzipanoScene): boolean {
  if (!scene.levels || scene.levels.length === 0) return false;
  if (scene.levels.length > 1) return true;
  const size = scene.levels[0].size;
  if (scene.faceSize !== 256 && size > 512) return true;
  return false;
}

export function isOversizeHotspot(h: { yaw: number; pitch: number }): boolean {
  if (!Number.isFinite(h.yaw) || !Number.isFinite(h.pitch)) return true;
  if (h.yaw < -Math.PI || h.yaw > Math.PI) return true;
  if (h.pitch < -Math.PI / 2 || h.pitch > Math.PI / 2) return true;
  return false;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function makeHotspotId(seed: string): string {
  const safe = seed.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 24) || 'hp';
  return `hp-${safe}-${Math.floor(Math.random() * 100000)}`;
}

function makeRoomId(seed: string, index: number): string {
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(seed)) return seed;
  return `scene_${index}`;
}

/**
 * Convert a single Marzipano scene → VizTR EditorRoom.
 *
 * If the scene is cube-tiled, returns null and emits a `cube_tiles_rejected`
 * warning. If the panorama URL is missing, emits `equirect_source_missing`
 * and the caller decides whether to skip the scene.
 */
export function marzipanoSceneToEditorRoom(
  scene: MarzipanoScene,
  panoramaUrl: string | null,
  allSceneIds: Set<string>,
  sceneIndex: number,
): { room: EditorRoom | null; warnings: ConversionWarning[] } {
  const warnings: ConversionWarning[] = [];

  if (isCubeScene(scene)) {
    warnings.push({
      code: 'cube_tiles_rejected',
      sceneId: scene.id,
      message: `Scene "${scene.name}" uses cube tiles; skipped (not supported by VizTR).`,
    });
    return { room: null, warnings };
  }

  if (!panoramaUrl) {
    warnings.push({
      code: 'equirect_source_missing',
      sceneId: scene.id,
      message: `Scene "${scene.name}" has no equirect source in the ZIP; user must upload the panorama manually.`,
    });
    return { room: null, warnings };
  }

  const id = makeRoomId(scene.id, sceneIndex);
  if (id !== scene.id) {
    warnings.push({
      code: 'scene_id_fallback',
      sceneId: scene.id,
      message: `Scene id "${scene.id}" is not a valid identifier; renamed to "${id}".`,
    });
  }

  const hotspots: EditorHotspot[] = [];

  for (const link of scene.linkHotspots || []) {
    if (!link || typeof link.target !== 'string') continue;
    if (isOversizeHotspot(link)) {
      warnings.push({
        code: 'hotspot_dropped_oversize',
        sceneId: scene.id,
        message: `Dropped link hotspot with out-of-range yaw/pitch.`,
      });
      continue;
    }
    if (!allSceneIds.has(link.target)) {
      warnings.push({
        code: 'hotspot_dropped_link',
        sceneId: scene.id,
        message: `Dropped link hotspot targeting unknown scene "${link.target}".`,
      });
      continue;
    }
    const { x, y } = yawPitchToXYPercents(link.yaw, link.pitch);
    hotspots.push({
      id: makeHotspotId(`${scene.id}-link-${hotspots.length}`),
      xPercent: Number(x.toFixed(2)),
      yPercent: Number(y.toFixed(2)),
      title: 'Portal',
      type: 'room_link',
      category: 'portal',
      description: '',
      targetRoomId: link.target,
      icon: 'door',
      color: 'emerald',
    });
  }

  for (const info of scene.infoHotspots || []) {
    if (isOversizeHotspot(info)) {
      warnings.push({
        code: 'hotspot_dropped_oversize',
        sceneId: scene.id,
        message: `Dropped info hotspot with out-of-range yaw/pitch.`,
      });
      continue;
    }
    const { x, y } = yawPitchToXYPercents(info.yaw, info.pitch);
    hotspots.push({
      id: makeHotspotId(`${scene.id}-info-${hotspots.length}`),
      xPercent: Number(x.toFixed(2)),
      yPercent: Number(y.toFixed(2)),
      title: info.title || 'Info',
      type: 'info',
      category: 'custom',
      description: info.text || '',
      article: info.text || '',
      icon: 'info',
      color: 'cyan',
    });
  }

  const ivp = scene.initialViewParameters || { yaw: 0, pitch: 0, fov: Math.PI / 2 };

  const room: EditorRoom = {
    id,
    name: (scene.name || scene.id || 'Untitled').slice(0, 80),
    subtitle: 'Imported from Marzipano',
    panoramaUrl,
    thumbnailUrl: panoramaUrl,
    initialYaw: Number(radToDeg(ivp.yaw || 0).toFixed(2)),
    initialPitch: Number(radToDeg(ivp.pitch || 0).toFixed(2)),
    defaultHotspots: hotspots,
  };

  return { room, warnings };
}

export function editorRoomToMarzipanoScene(room: EditorRoom): MarzipanoScene {
  const linkHotspots: MarzipanoLinkHotspot[] = [];
  const infoHotspots: MarzipanoInfoHotspot[] = [];

  for (const h of room.defaultHotspots || []) {
    if (h.type === 'room_link' && h.targetRoomId) {
      const { yaw, pitch } = xyPercentsToYawPitch(
        Number(h.xPercent) || 0,
        Number(h.yPercent) || 0,
      );
      linkHotspots.push({ yaw, pitch, rotation: 0, target: h.targetRoomId });
      continue;
    }
    if (h.type === 'info') {
      const { yaw, pitch } = xyPercentsToYawPitch(
        Number(h.xPercent) || 0,
        Number(h.yPercent) || 0,
      );
      const title = String(h.title || 'Info');
      const text = String(h.description || h.article || '');
      infoHotspots.push({ yaw, pitch, title, text });
      continue;
    }
    // Any other VizTR hotspot type is preserved lossy as an info hotspot
    // containing the original payload as JSON. Round-trip will widen this
    // when the upstream tool is extended; for now it is best-effort.
    const { yaw, pitch } = xyPercentsToYawPitch(
      Number(h.xPercent) || 0,
      Number(h.yPercent) || 0,
    );
    infoHotspots.push({
      yaw,
      pitch,
      title: String(h.title || h.type || 'Hotspot'),
      text: JSON.stringify(h),
    });
  }

  const yawRad = (Number(room.initialYaw) || 0) * (Math.PI / 180);
  const pitchRad = (Number(room.initialPitch) || 0) * (Math.PI / 180);

  return {
    id: room.id,
    name: room.name,
    levels: [{ tileSize: 256, size: 256, fallbackOnly: true }],
    faceSize: 256,
    initialViewParameters: { yaw: yawRad, pitch: pitchRad, fov: Math.PI / 2 },
    linkHotspots,
    infoHotspots,
  };
}