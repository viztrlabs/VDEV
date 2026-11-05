import type { AlignmentMarker, Quaternion, SpatialAlignment, Vector3D } from './types';

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const EPSILON = 1e-8;

export const IDENTITY_ALIGNMENT: SpatialAlignment = {
  version: 1,
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
  scale: 1,
};

/** yaw=0/pitch=0 faces +Z; positive yaw faces +X; positive pitch faces +Y. */
export function yawPitchToDirection(yaw: number, pitch: number): Vector3D {
  const yawRadians = yaw * DEG_TO_RAD;
  const pitchRadians = pitch * DEG_TO_RAD;
  const cosPitch = Math.cos(pitchRadians);
  return {
    x: Math.sin(yawRadians) * cosPitch,
    y: Math.sin(pitchRadians),
    z: Math.cos(yawRadians) * cosPitch,
  };
}

export function directionToYawPitch(direction: Vector3D): { yaw: number; pitch: number } {
  const normalized = normalize(direction);
  return {
    yaw: Math.atan2(normalized.x, normalized.z) * RAD_TO_DEG,
    pitch: Math.asin(clamp(normalized.y, -1, 1)) * RAD_TO_DEG,
  };
}

export function panoramaToWorld(
  point: Vector3D,
  alignment: SpatialAlignment = IDENTITY_ALIGNMENT,
): Vector3D {
  return add(rotateByQuaternion(scale(point, alignment.scale), alignment.rotation), alignment.position);
}

/** Applies only the calibrated rotation to a panorama direction. */
export function panoramaDirectionToWorld(
  direction: Vector3D,
  alignment: SpatialAlignment = IDENTITY_ALIGNMENT,
): Vector3D {
  return normalize(rotateByQuaternion(direction, alignment.rotation));
}

export function worldToPanorama(
  point: Vector3D,
  alignment: SpatialAlignment = IDENTITY_ALIGNMENT,
): Vector3D {
  if (!Number.isFinite(alignment.scale) || Math.abs(alignment.scale) < EPSILON) {
    throw new Error('Spatial alignment scale must be a non-zero finite number');
  }
  return scale(
    rotateByQuaternion(subtract(point, alignment.position), conjugate(normalizeQuaternion(alignment.rotation))),
    1 / alignment.scale,
  );
}

/** Converts a splat-world direction back to a normalized panorama direction. */
export function worldDirectionToPanorama(
  direction: Vector3D,
  alignment: SpatialAlignment = IDENTITY_ALIGNMENT,
): Vector3D {
  return normalize(rotateByQuaternion(direction, conjugate(normalizeQuaternion(alignment.rotation))));
}

export function equirectToCartesian(yaw: number, pitch: number, radius = 1): Vector3D {
  return scale(yawPitchToDirection(yaw, pitch), radius);
}

export function cartesianToEquirect(point: Vector3D): { yaw: number; pitch: number } {
  return directionToYawPitch(point);
}

export function validateAlignment(alignment: SpatialAlignment): boolean {
  if (alignment.scale !== 1 || !Number.isFinite(alignment.scale)) return false;
  if (![alignment.position.x, alignment.position.y, alignment.position.z].every(Number.isFinite)) return false;
  try {
    const q = normalizeQuaternion(alignment.rotation);
    const difference = Math.abs(Math.hypot(q.x, q.y, q.z, q.w) - 1);
    return difference < EPSILON;
  } catch {
    return false;
  }
}

/** Mean angular reprojection error in degrees for panorama-ray / splat-point pairs. */
export function alignmentResidualAngularError(markers: AlignmentMarker[], alignment: SpatialAlignment): number {
  if (markers.length < 4) return Number.POSITIVE_INFINITY;
  let total = 0;
  for (const marker of markers) {
    const expected = panoramaDirectionToWorld(marker.panoramaDirection, alignment);
    const actual = normalize(subtract(marker.worldPoint, alignment.position));
    total += Math.acos(clamp(dot(expected, actual), -1, 1)) * RAD_TO_DEG;
  }
  return total / markers.length;
}

/**
 * Fixed-scale bearing-to-point pose fitting. It intentionally never estimates
 * splat scale: scale belongs to the reconstruction/import pipeline.
 */
export function computePoseFromCorrespondences(markers: AlignmentMarker[]): SpatialAlignment | null {
  if (!hasSufficientMarkerSpread(markers)) return null;
  const center = markers.reduce((sum, marker) => add(sum, marker.worldPoint), { x: 0, y: 0, z: 0 });
  let candidate: SpatialAlignment = {
    version: 1,
    position: scale(center, 1 / markers.length),
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    scale: 1,
  };

  // Finite-difference gradient descent is small, deterministic, dependency-free,
  // and adequate for editor-side refinement after users place well-spread points.
  let step = 0.05;
  let bestError = alignmentResidualAngularError(markers, candidate);
  for (let iteration = 0; iteration < 180; iteration++) {
    const gradient = finiteDifferenceGradient(markers, candidate, bestError);
    const next = applyPoseDelta(candidate, gradient.map((v) => -v * step));
    const nextError = alignmentResidualAngularError(markers, next);
    if (nextError < bestError) {
      candidate = next;
      bestError = nextError;
      step = Math.min(step * 1.08, 0.25);
      if (bestError < 0.05) break;
    } else {
      step *= 0.5;
      if (step < 1e-5) break;
    }
  }
  if (!Number.isFinite(bestError) || bestError > 8) return null;
  return { ...candidate, calibratedAt: new Date().toISOString(), residualAngularErrorDegrees: bestError };
}

export function eulerDegreesToQuaternion(x: number, y: number, z: number): Quaternion {
  const rx = x * DEG_TO_RAD / 2;
  const ry = y * DEG_TO_RAD / 2;
  const rz = z * DEG_TO_RAD / 2;
  return normalizeQuaternion({
    x: Math.sin(rx) * Math.cos(ry) * Math.cos(rz) - Math.cos(rx) * Math.sin(ry) * Math.sin(rz),
    y: Math.cos(rx) * Math.sin(ry) * Math.cos(rz) + Math.sin(rx) * Math.cos(ry) * Math.sin(rz),
    z: Math.cos(rx) * Math.cos(ry) * Math.sin(rz) - Math.sin(rx) * Math.sin(ry) * Math.cos(rz),
    w: Math.cos(rx) * Math.cos(ry) * Math.cos(rz) + Math.sin(rx) * Math.sin(ry) * Math.sin(rz),
  });
}

export function quaternionToEulerDegrees(q: Quaternion): Vector3D {
  const n = normalizeQuaternion(q);
  const sinX = 2 * (n.w * n.x + n.y * n.z);
  const cosX = 1 - 2 * (n.x * n.x + n.y * n.y);
  const sinY = 2 * (n.w * n.y - n.z * n.x);
  const sinZ = 2 * (n.w * n.z + n.x * n.y);
  const cosZ = 1 - 2 * (n.y * n.y + n.z * n.z);
  return { x: Math.atan2(sinX, cosX) * RAD_TO_DEG, y: Math.asin(clamp(sinY, -1, 1)) * RAD_TO_DEG, z: Math.atan2(sinZ, cosZ) * RAD_TO_DEG };
}

export function normalizeQuaternion(quaternion: Quaternion): Quaternion {
  const length = Math.hypot(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  if (!Number.isFinite(length) || length < EPSILON) {
    throw new Error('Spatial alignment rotation must be a valid non-zero quaternion');
  }
  return {
    x: quaternion.x / length,
    y: quaternion.y / length,
    z: quaternion.z / length,
    w: quaternion.w / length,
  };
}

function rotateByQuaternion(point: Vector3D, input: Quaternion): Vector3D {
  const q = normalizeQuaternion(input);
  const tx = 2 * (q.y * point.z - q.z * point.y);
  const ty = 2 * (q.z * point.x - q.x * point.z);
  const tz = 2 * (q.x * point.y - q.y * point.x);
  return {
    x: point.x + q.w * tx + (q.y * tz - q.z * ty),
    y: point.y + q.w * ty + (q.z * tx - q.x * tz),
    z: point.z + q.w * tz + (q.x * ty - q.y * tx),
  };
}

function normalize(vector: Vector3D): Vector3D {
  const length = Math.hypot(vector.x, vector.y, vector.z);
  if (!Number.isFinite(length) || length < EPSILON) throw new Error('Direction must be non-zero');
  return scale(vector, 1 / length);
}

function conjugate(quaternion: Quaternion): Quaternion {
  return { x: -quaternion.x, y: -quaternion.y, z: -quaternion.z, w: quaternion.w };
}

function add(a: Vector3D, b: Vector3D): Vector3D {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subtract(a: Vector3D, b: Vector3D): Vector3D {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(vector: Vector3D, factor: number): Vector3D {
  return { x: vector.x * factor, y: vector.y * factor, z: vector.z * factor };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function dot(a: Vector3D, b: Vector3D): number { return a.x * b.x + a.y * b.y + a.z * b.z; }

function hasSufficientMarkerSpread(markers: AlignmentMarker[]): boolean {
  if (markers.length < 4) return false;
  const uniqueDirections = new Set(markers.map((m) => `${m.yaw.toFixed(2)}:${m.pitch.toFixed(2)}`));
  const uniquePoints = new Set(markers.map((m) => `${m.worldPoint.x.toFixed(4)}:${m.worldPoint.y.toFixed(4)}:${m.worldPoint.z.toFixed(4)}`));
  return uniqueDirections.size >= 4 && uniquePoints.size >= 4;
}

function finiteDifferenceGradient(markers: AlignmentMarker[], pose: SpatialAlignment, baseError: number): number[] {
  const deltas = [0.01, 0.01, 0.01, 0.25, 0.25, 0.25];
  return deltas.map((delta, index) => {
    const vector = [0, 0, 0, 0, 0, 0];
    vector[index] = delta;
    return (alignmentResidualAngularError(markers, applyPoseDelta(pose, vector)) - baseError) / delta;
  });
}

function applyPoseDelta(pose: SpatialAlignment, delta: number[]): SpatialAlignment {
  const current = quaternionToEulerDegrees(pose.rotation);
  return {
    ...pose,
    position: { x: pose.position.x + delta[0], y: pose.position.y + delta[1], z: pose.position.z + delta[2] },
    rotation: eulerDegreesToQuaternion(current.x + delta[3], current.y + delta[4], current.z + delta[5]),
    scale: 1,
  };
}
