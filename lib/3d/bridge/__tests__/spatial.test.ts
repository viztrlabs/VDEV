import {
  directionToYawPitch,
  panoramaToWorld,
  worldToPanorama,
  yawPitchToDirection,
} from '../spatial';

describe('spatial bridge coordinates', () => {
  it('uses the Marzipano forward direction for a level view', () => {
    expect(yawPitchToDirection(0, 0)).toEqual({ x: 0, y: 0, z: 1 });
    expect(yawPitchToDirection(90, 0).x).toBeCloseTo(1, 10);
    expect(yawPitchToDirection(0, 90).y).toBeCloseTo(1, 10);
  });

  it('round-trips a panorama direction through yaw and pitch', () => {
    const pose = directionToYawPitch(yawPitchToDirection(-127.5, 22.25));
    expect(pose.yaw).toBeCloseTo(-127.5, 10);
    expect(pose.pitch).toBeCloseTo(22.25, 10);
  });

  it('round-trips points through a persisted world alignment', () => {
    const alignment = {
      version: 1 as const,
      position: { x: 12, y: 1.5, z: -8 },
      rotation: { x: 0, y: Math.SQRT1_2, z: 0, w: Math.SQRT1_2 },
      scale: 2,
    };
    const local = { x: 1, y: -0.5, z: 3 };
    const result = worldToPanorama(panoramaToWorld(local, alignment), alignment);
    expect(result.x).toBeCloseTo(local.x, 10);
    expect(result.y).toBeCloseTo(local.y, 10);
    expect(result.z).toBeCloseTo(local.z, 10);
  });
});
