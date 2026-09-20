/**
 * Tour Config Serializer
 *
 * Converts editor TourRoom data into the Experience Config format
 * for persistence via /api/experience-configs.
 *
 * Replaces the broken @/forks/editor-src import with a standalone
 * implementation that includes alignment data.
 */

import type { SpatialAlignment, AlignmentMarker } from '@/lib/3d/bridge/types';
import { IDENTITY_ALIGNMENT } from '@/lib/3d/bridge/spatial';

interface TourRoom {
  id: string;
  name: string;
  subtitle?: string;
  panoramaUrl: string;
  thumbnailUrl?: string;
  initialYaw?: number;
  initialPitch?: number;
  defaultHotspots?: any[];
  featured?: boolean;
  backgroundAudioUrl?: string;
  nadirLogoUrl?: string;
  brightness?: number;
  contrast?: number;
  modelUrl?: string;
  lat?: number;
  lng?: number;
  floorPlanX?: number;
  floorPlanY?: number;
  spatialAlignment?: SpatialAlignment;
  alignmentMarkers?: AlignmentMarker[];
}

interface TourSettings {
  version?: number;
  [key: string]: any;
}

interface SerializedTourConfig {
  tour: {
    engine: 'tour';
    rooms: Array<{
      id: string;
      name: string;
      panorama: string;
      hotspots: any[];
      spatialAlignment?: SpatialAlignment;
      alignmentMarkers?: AlignmentMarker[];
      [key: string]: any;
    }>;
    initialRoom: string;
    transitions: Record<string, any>;
  };
  assets: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  settings: {
    tour: Record<string, any>;
    assets: any[];
    metadata: Record<string, any>;
  };
  metadata: Record<string, any>;
}

/**
 * Serialize editor TourRoom data into the Experience Config format.
 *
 * Includes spatialAlignment and alignmentMarkers on each room,
 * preserving the full alignment state for the runtime viewer.
 */
export function serializeTourForExperienceConfig(
  rooms: TourRoom[],
  settings: TourSettings | null,
  projectId: string,
  experienceId?: string,
): SerializedTourConfig {
  const serializedRooms = rooms.map((room) => ({
    id: room.id,
    name: room.name,
    panorama: room.panoramaUrl,
    hotspots: (room.defaultHotspots || []).map((h: any) => ({
      id: h.id,
      xPercent: h.xPercent,
      yPercent: h.yPercent,
      title: h.title,
      type: h.type,
      category: h.category,
      description: h.description,
      targetRoomId: h.targetRoomId,
      targetRoomName: h.targetRoomName,
      targetPanoramaUrl: h.targetPanoramaUrl,
      targetYaw: h.targetYaw,
      icon: h.icon,
      color: h.color,
      mediaUrl: h.mediaUrl,
      article: h.article,
      externalUrl: h.externalUrl,
      audioUrl: h.audioUrl,
    })),
    // Alignment data — preserved for runtime spatial relationship
    spatialAlignment: room.spatialAlignment || { ...IDENTITY_ALIGNMENT },
    alignmentMarkers: room.alignmentMarkers || [],
    // Additional room properties
    thumbnail: room.thumbnailUrl || '',
    initialViewParameters: {
      yaw: (room.initialYaw || 0) * (Math.PI / 180),
      pitch: (room.initialPitch || 0) * (Math.PI / 180),
      fov: Math.PI / 3,
    },
    ...(room.backgroundAudioUrl && { backgroundAudio: room.backgroundAudioUrl }),
    ...(room.nadirLogoUrl && { nadirLogo: room.nadirLogoUrl }),
    ...(room.brightness !== undefined && { brightness: room.brightness }),
    ...(room.contrast !== undefined && { contrast: room.contrast }),
    ...(room.modelUrl && { modelUrl: room.modelUrl }),
    ...(room.lat !== undefined && { lat: room.lat }),
    ...(room.lng !== undefined && { lng: room.lng }),
    ...(room.floorPlanX !== undefined && { floorPlanX: room.floorPlanX }),
    ...(room.floorPlanY !== undefined && { floorPlanY: room.floorPlanY }),
  }));

  const initialRoom = rooms[0]?.id || '';

  // Build asset list from panorama URLs
  const assets = rooms
    .filter((r) => r.panoramaUrl)
    .map((r) => ({
      id: `panorama-${r.id}`,
      name: r.name,
      type: 'panorama',
      url: r.panoramaUrl,
    }));

  return {
    tour: {
      engine: 'tour',
      rooms: serializedRooms,
      initialRoom,
      transitions: {},
    },
    assets,
    settings: {
      tour: {
        version: settings?.version || 1,
        totalRooms: rooms.length,
        hasAlignment: rooms.some((r) => r.spatialAlignment && !isIdentityAlignment(r.spatialAlignment)),
      },
      assets,
      metadata: {
        projectId,
        experienceId: experienceId || null,
        serializedAt: new Date().toISOString(),
        alignmentVersion: 1,
      },
    },
    metadata: {
      projectId,
      experienceId: experienceId || null,
      roomCount: rooms.length,
      alignmentCount: rooms.filter((r) => r.alignmentMarkers && r.alignmentMarkers.length > 0).length,
    },
  };
}

function isIdentityAlignment(a: SpatialAlignment): boolean {
  return (
    a.position.x === 0 && a.position.y === 0 && a.position.z === 0 &&
    a.rotation.x === 0 && a.rotation.y === 0 && a.rotation.z === 0 && a.rotation.w === 1 &&
    a.scale === 1
  );
}
