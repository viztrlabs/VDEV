'use client';

import { useCallback, useRef } from 'react';
import type { SpatialAlignment, CameraPose } from '@/lib/3d/bridge/types';
import {
  panoramaDirectionToWorld,
  worldDirectionToPanorama,
  yawPitchToDirection,
} from '@/lib/3d/bridge/spatial';

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

type CameraSource = 'marzipano' | 'splat' | 'alignment';

/**
 * Camera handoff between Marzipano (panorama yaw/pitch) and PlayCanvas (3D camera pose).
 *
 * Uses origin-token pattern for loop protection: each camera-move sequence gets
 * a unique originId. When an engine receives an event with an originId it has
 * already seen, it ignores the update to prevent feedback loops.
 *
 * Direction transforms use panoramaDirectionToWorld (rotation only, no translation)
 * to avoid the bug of applying translation to direction vectors.
 */
export function useCameraHandoff(alignment: SpatialAlignment) {
  const lastOriginRef = useRef<string | null>(null);

  const convertMarzipanoToSplat = useCallback(
    (yaw: number, pitch: number, fov: number): CameraPose => {
      const direction = yawPitchToDirection(yaw, pitch);
      // Direction transform: rotation only, NO translation
      const worldDir = panoramaDirectionToWorld(direction, alignment);
      const distance = 10; // look-at distance from camera position
      return {
        position: { ...alignment.position },
        target: {
          x: alignment.position.x + worldDir.x * distance,
          y: alignment.position.y + worldDir.y * distance,
          z: alignment.position.z + worldDir.z * distance,
        },
        fov,
      };
    },
    [alignment],
  );

  const convertSplatToMarzipano = useCallback(
    (pose: CameraPose): { yaw: number; pitch: number; fov: number } => {
      const direction = {
        x: pose.target.x - pose.position.x,
        y: pose.target.y - pose.position.y,
        z: pose.target.z - pose.position.z,
      };
      // Direction transform: rotation only, NO translation
      const panoDir = worldDirectionToPanorama(direction, alignment);
      const yaw = Math.atan2(panoDir.x, panoDir.z) * RAD_TO_DEG;
      const pitch = Math.asin(Math.min(1, Math.max(-1, panoDir.y))) * RAD_TO_DEG;
      return { yaw, pitch, fov: pose.fov ?? 75 };
    },
    [alignment],
  );

  /**
   * Check if an event has an originId we have already processed.
   * Returns true if this event should be IGNORED (loop protection).
   */
  const isOwnOrigin = useCallback((originId: string | undefined): boolean => {
    if (!originId) return false;
    if (lastOriginRef.current === originId) return true;
    lastOriginRef.current = originId;
    return false;
  }, []);

  /**
   * Generate a new originId for a camera-move sequence we are initiating.
   * Records it so we ignore the resulting echo event.
   */
  const generateOriginId = useCallback((): string => {
    const id = `align-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    lastOriginRef.current = id;
    return id;
  }, []);

  return {
    convertMarzipanoToSplat,
    convertSplatToMarzipano,
    isOwnOrigin,
    generateOriginId,
    lastOriginRef,
  };
}
