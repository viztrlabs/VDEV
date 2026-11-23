/**
 * Single source of truth: XR World service -> runtime viewer.
 *
 * The Experience dashboard must pick a viewer deterministically from the
 * selected service, not only from each experience's `config` (which may be
 * incomplete). `ExperienceViewer` consults this map first and falls back to
 * `resolveEngine(config)` for unknown/legacy slugs.
 */

export type XRServiceSlug =
  | 'webxr'
  | 'webar'
  | 'virtual-reality'
  | 'virtual-tour'
  | 'gaussian-splat';

export type ServiceEngine = 'iwSDK' | 'tour' | 'splat';

export type ImmersiveMode = 'immersive-ar' | 'immersive-vr';

export interface ServiceViewer {
  engine: ServiceEngine;
  /** Present only for services that launch an immersive WebXR session. */
  mode?: ImmersiveMode;
}

export const SERVICE_VIEWER: Record<string, ServiceViewer> = {
  // WebXR / WebAR / Virtual Reality all render through the IWSDK (three.js) engine.
  webxr: { engine: 'iwSDK', mode: 'immersive-vr' },
  webar: { engine: 'iwSDK', mode: 'immersive-ar' },
  'virtual-reality': { engine: 'iwSDK', mode: 'immersive-vr' },
  // 360° tours and splats are non-immersive.
  'virtual-tour': { engine: 'tour' },
  'gaussian-splat': { engine: 'splat' },
};

/** Resolve the viewer for a service slug, or null when the slug is unknown. */
export function getServiceViewer(slug: string | null | undefined): ServiceViewer | null {
  if (!slug) return null;
  return SERVICE_VIEWER[slug] ?? null;
}

/** The immersive launch mode for a service, or null if it has no XR launch. */
export function serviceLaunchMode(slug: string | null | undefined): ImmersiveMode | null {
  return getServiceViewer(slug)?.mode ?? null;
}

/** True when the service should render through the IWSDK runtime. */
export function isIWSDKService(slug: string | null | undefined): boolean {
  return getServiceViewer(slug)?.engine === 'iwSDK';
}