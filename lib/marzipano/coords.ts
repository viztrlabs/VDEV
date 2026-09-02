/**
 * Coordinate bridge between Marzipano's yaw/pitch (radians on a sphere) and
 * the equirectangular (xPercent, yPercent) coordinates VizTR uses for hotspots.
 *
 * Convention (matches Marzipano + upstream tool, which uses the same
 * equirectangular projection as the rest of the panorama industry):
 *   yaw = 0      → image center (x = 50%)
 *   yaw = +π/2   → x = 75% (right-of-center, one quarter across)
 *   yaw = -π/2   → x = 25% (left-of-center, one quarter across)
 *   yaw = ±π     → image edges (x = 0 / x = 100, wraps to the back)
 *   pitch = 0    → horizon      (y = 50%)
 *   pitch = +π/2 → zenith       (y = 0%)
 *   pitch = -π/2 → nadir        (y = 100%)
 *
 * The x axis maps linearly across the full yaw range [-π, +π]. The
 * upstream Importer tool stores hotspot yaw in radians and projects to
 * screen pixels the same way: the hotspot is placed by dividing its
 * longitude (-π..+π) across the 0..1 horizontal range of the equirect.
 *
 * Precision: round-trip is exact for non-pole positions. Hotspots at
 * pitch = ±π/2 collapse to a single line in equirect (the pole
 * singularity); the exporter accepts this loss without special handling.
 *
 * Edits inside VizTR move hotspots in equirect (x, y); re-export back to
 * Marzipano yields the correct yaw/pitch.
 */

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function yawPitchToXYPercents(
  yaw: number,
  pitch: number,
): { x: number; y: number } {
  const x = ((yaw + Math.PI) / (2 * Math.PI)) * 100;
  const y = ((Math.PI / 2 - pitch) / Math.PI) * 100;
  return { x: clamp(x, 0, 100), y: clamp(y, 0, 100) };
}

export function xyPercentsToYawPitch(
  x: number,
  y: number,
): { yaw: number; pitch: number } {
  const yaw = (x / 100) * 2 * Math.PI - Math.PI;
  const pitch = Math.PI / 2 - (y / 100) * Math.PI;
  return { yaw, pitch };
}