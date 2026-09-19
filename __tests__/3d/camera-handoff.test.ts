import {
  yawPitchToDirection,
  panoramaDirectionToWorld,
  worldDirectionToPanorama,
  IDENTITY_ALIGNMENT,
  normalizeQuaternion,
} from '@/lib/3d/bridge/spatial';
import type { SpatialAlignment } from '@/lib/3d/bridge/types';

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

describe('Camera Handoff - Direction Transforms', () => {
  describe('panoramaDirectionToWorld applies rotation only (no translation)', () => {
    it('identity alignment preserves direction', () => {
      const direction = yawPitchToDirection(0, 0); // faces +Z
      const worldDir = panoramaDirectionToWorld(direction, IDENTITY_ALIGNMENT);
      expect(worldDir.x).toBeCloseTo(0, 6);
      expect(worldDir.y).toBeCloseTo(0, 6);
      expect(worldDir.z).toBeCloseTo(1, 6);
    });

    it('direction with non-zero translation alignment does NOT add translation', () => {
      const alignment: SpatialAlignment = {
        version: 1,
        position: { x: 100, y: 200, z: 300 }, // large translation
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: 1,
      };
      const direction = yawPitchToDirection(0, 0);
      const worldDir = panoramaDirectionToWorld(direction, alignment);
      // Direction should NOT be affected by translation
      expect(worldDir.x).toBeCloseTo(0, 6);
      expect(worldDir.y).toBeCloseTo(0, 6);
      expect(worldDir.z).toBeCloseTo(1, 6);
    });

    it('yaw rotation transforms direction correctly', () => {
      const alignment: SpatialAlignment = {
        version: 1,
        position: { x: 0, y: 0, z: 0 },
        rotation: normalizeQuaternion({ x: 0, y: Math.sin(Math.PI / 4), z: 0, w: Math.cos(Math.PI / 4) }),
        scale: 1,
      };
      const direction = yawPitchToDirection(0, 0); // faces +Z
      const worldDir = panoramaDirectionToWorld(direction, alignment);
      // 90-degree yaw rotation should rotate +Z toward +X
      expect(worldDir.x).toBeGreaterThan(0.5);
      expect(worldDir.z).toBeGreaterThan(-0.5);
    });
  });

  describe('worldDirectionToPanorama is inverse of panoramaDirectionToWorld', () => {
    it('round trip preserves direction for identity alignment', () => {
      const direction = yawPitchToDirection(45, 30);
      const worldDir = panoramaDirectionToWorld(direction, IDENTITY_ALIGNMENT);
      const panoDir = worldDirectionToPanorama(worldDir, IDENTITY_ALIGNMENT);
      expect(panoDir.x).toBeCloseTo(direction.x, 5);
      expect(panoDir.y).toBeCloseTo(direction.y, 5);
      expect(panoDir.z).toBeCloseTo(direction.z, 5);
    });

    it('round trip preserves direction for non-trivial alignment', () => {
      const alignment: SpatialAlignment = {
        version: 1,
        position: { x: 5, y: 3, z: -2 },
        rotation: normalizeQuaternion({ x: 0.1, y: 0.3, z: 0.0, w: 0.9 }),
        scale: 1,
      };
      const direction = yawPitchToDirection(120, -15);
      const worldDir = panoramaDirectionToWorld(direction, alignment);
      const panoDir = worldDirectionToPanorama(worldDir, alignment);
      expect(panoDir.x).toBeCloseTo(direction.x, 5);
      expect(panoDir.y).toBeCloseTo(direction.y, 5);
      expect(panoDir.z).toBeCloseTo(direction.z, 5);
    });
  });

  describe('Marzipano-to-Splat conversion logic', () => {
    it('converts yaw/pitch to camera pose with correct direction', () => {
      const alignment = IDENTITY_ALIGNMENT;
      const yaw = 0;
      const pitch = 0;
      const fov = 75;

      const direction = yawPitchToDirection(yaw, pitch);
      const worldDir = panoramaDirectionToWorld(direction, alignment);
      const distance = 10;

      const pose = {
        position: { ...alignment.position },
        target: {
          x: alignment.position.x + worldDir.x * distance,
          y: alignment.position.y + worldDir.y * distance,
          z: alignment.position.z + worldDir.z * distance,
        },
        fov,
      };

      expect(pose.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(pose.target.x).toBeCloseTo(0, 5);
      expect(pose.target.y).toBeCloseTo(0, 5);
      expect(pose.target.z).toBeCloseTo(10, 5);
      expect(pose.fov).toBe(75);
    });
  });

  describe('Splat-to-Marzipano conversion logic', () => {
    it('converts camera pose to yaw/pitch', () => {
      const alignment = IDENTITY_ALIGNMENT;
      const pose = {
        position: { x: 0, y: 0, z: 0 },
        target: { x: 10, y: 0, z: 0 }, // looking toward +X
        fov: 75,
      };

      const direction = {
        x: pose.target.x - pose.position.x,
        y: pose.target.y - pose.position.y,
        z: pose.target.z - pose.position.z,
      };
      const panoDir = worldDirectionToPanorama(direction, alignment);
      const yaw = Math.atan2(panoDir.x, panoDir.z) * RAD_TO_DEG;
      const pitch = Math.asin(Math.min(1, Math.max(-1, panoDir.y))) * RAD_TO_DEG;

      expect(yaw).toBeCloseTo(90, 1); // +X direction = 90 degrees yaw
      expect(pitch).toBeCloseTo(0, 1);
    });
  });

  describe('Origin token loop protection', () => {
    it('tracks last seen originId', () => {
      const lastOriginRef = { current: null as string | null };

      const isOwnOrigin = (originId: string | undefined): boolean => {
        if (!originId) return false;
        if (lastOriginRef.current === originId) return true;
        lastOriginRef.current = originId;
        return false;
      };

      // First time seeing origin "abc" → not own, ref set to "abc"
      expect(isOwnOrigin('abc')).toBe(false);
      // Second time seeing "abc" → own (loop protection)
      expect(isOwnOrigin('abc')).toBe(true);
      // New origin "def" → not own, ref updated to "def"
      expect(isOwnOrigin('def')).toBe(false);
      // "def" again → own (ref is "def")
      expect(isOwnOrigin('def')).toBe(true);
      // New origin "ghi" → not own
      expect(isOwnOrigin('ghi')).toBe(false);
    });

    it('undefined originId is never own', () => {
      const lastOriginRef = { current: 'something' as string | null };
      const isOwnOrigin = (originId: string | undefined): boolean => {
        if (!originId) return false;
        if (lastOriginRef.current === originId) return true;
        lastOriginRef.current = originId;
        return false;
      };
      expect(isOwnOrigin(undefined)).toBe(false);
    });

    it('generates unique originIds', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const id = `align-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        ids.add(id);
      }
      expect(ids.size).toBe(100);
    });

    it('simulates Marzipano→Splat→Marzipano chain stops at step 3', () => {
      const lastOriginRef = { current: null as string | null };
      const isOwnOrigin = (originId: string | undefined): boolean => {
        if (!originId) return false;
        if (lastOriginRef.current === originId) return true;
        lastOriginRef.current = originId;
        return false;
      };
      const generateOriginId = (): string => {
        const id = `align-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        lastOriginRef.current = id;
        return id;
      };

      // Step 1: User moves Marzipano → generate origin
      const origin1 = generateOriginId();
      expect(isOwnOrigin(origin1)).toBe(true); // we generated it, ignore echo

      // Step 2: Splat receives origin1 → processes it, emits with same origin
      expect(isOwnOrigin(origin1)).toBe(true); // already seen, would be ignored

      // Step 3: Marzipano receives origin1 back → ignored (loop protection)
      expect(isOwnOrigin(origin1)).toBe(true); // still seen, ignored

      // Step 4: New user action → new origin
      const origin2 = generateOriginId();
      expect(isOwnOrigin(origin2)).toBe(true); // we generated it
    });
  });
});
