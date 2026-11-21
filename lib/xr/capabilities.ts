/**
 * Device capability detection for device-aware experience delivery.
 *
 * Every client must get a working way to view their project even when
 * immersive features are unavailable — fallback chains depend on this.
 */

export interface DeviceCapabilities {
  /** WebXR immersive-vr session supported (headsets + Android Chrome). */
  webxrVR: boolean;
  /** WebXR immersive-ar session supported (Android Chrome; not iOS Safari). */
  webxrAR: boolean;
  /** WebGPU available (needed by some next-gen renderers). */
  webgpu: boolean;
  /** Apple AR Quick Look / USDZ support (iOS 12+, Safari). */
  quickLook: boolean;
  ios: boolean;
  android: boolean;
  mobile: boolean;
  touch: boolean;
  /** WebGL2 context available (baseline for all 3D runtimes). */
  webgl2: boolean;
}

export type ExperienceFallbackMode = 'immersive' | 'quicklook' | 'viewer' | 'gallery';

const EMPTY: DeviceCapabilities = {
  webxrVR: false,
  webxrAR: false,
  webgpu: false,
  quickLook: false,
  ios: false,
  android: false,
  mobile: false,
  touch: false,
  webgl2: false,
};

export async function detectCapabilities(): Promise<DeviceCapabilities> {
  if (typeof window === 'undefined') return EMPTY;

  const caps: DeviceCapabilities = { ...EMPTY };
  const ua = navigator.userAgent || '';
  caps.ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
  caps.android = /Android/.test(ua);
  caps.mobile = caps.ios || caps.android || window.innerWidth < 768;
  caps.touch = 'ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0;

  try {
    caps.webgl2 = !!document.createElement('canvas').getContext('webgl2');
  } catch {
    caps.webgl2 = false;
  }

  try {
    caps.webgpu = 'gpu' in navigator;
  } catch {
    caps.webgpu = false;
  }

  const xr = (navigator as any).xr;
  if (xr?.isSessionSupported) {
    try {
      caps.webxrVR = await xr.isSessionSupported('immersive-vr');
    } catch {
      caps.webxrVR = false;
    }
    try {
      caps.webxrAR = await xr.isSessionSupported('immersive-ar');
    } catch {
      caps.webxrAR = false;
    }
  }

  // AR Quick Look heuristic: iOS Safari anchors + <a rel="ar"> support.
  try {
    const a = document.createElement('a');
    caps.quickLook = caps.ios && !!(a as any).relList?.supports?.('ar');
  } catch {
    caps.quickLook = false;
  }

  return caps;
}

/**
 * Fallback chain for a service on this device.
 * Order: immersive → quicklook → viewer → gallery.
 */
export function arFallbackMode(caps: DeviceCapabilities): ExperienceFallbackMode {
  if (caps.webxrAR) return 'immersive';
  if (caps.quickLook) return 'quicklook';
  if (caps.webgl2) return 'viewer';
  return 'gallery';
}

export function vrFallbackMode(caps: DeviceCapabilities): ExperienceFallbackMode {
  if (caps.webxrVR) return 'immersive';
  if (caps.webgl2) return 'viewer';
  return 'gallery';
}
