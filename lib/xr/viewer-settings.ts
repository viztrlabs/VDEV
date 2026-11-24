/**
 * Shared viewer manipulation settings used by both the Experience dashboard
 * (IWSDKViewer) and the public showcase (ModelViewer).
 */
export interface ViewerSettings {
  /** Lock the model in place (no accidental drag/scale/rotate). */
  modelLocked: boolean;
  /** Uniform model scale, 0.1 – 3.0. */
  scale: number;
  /** Model Y rotation in degrees, 0 – 360. */
  rotationY: number;
  /** Vertical elevation offset in meters. */
  elevation: number;
  /** Slow camera auto-orbit. */
  autoRotate: boolean;
  /** Orbit / zoom sensitivity multiplier, 0.2 – 2.0. */
  sensitivity: number;
}

export const DEFAULT_VIEWER_SETTINGS: ViewerSettings = {
  modelLocked: true,
  scale: 1,
  rotationY: 0,
  elevation: 0,
  autoRotate: false,
  sensitivity: 1,
};

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));