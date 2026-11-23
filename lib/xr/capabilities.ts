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

// ---------------------------------------------------------------------------
// Immersive session launch helpers
//
// `navigator.xr.requestSession()` MUST be invoked synchronously from within a
// user-gesture handler (click/tap) or the browser rejects it. The helpers below
// are intentionally thin so callers can invoke them as the first statement of an
// onClick handler and then `await` the returned promise.
//
// `navigator.xr` is not typed in the default TS DOM lib for this project, so we
// access it through a narrow structural type rather than `any` everywhere.
// ---------------------------------------------------------------------------

// `navigator.xr` is not typed as optional in all TS DOM lib versions, so we
// access it through a narrow structural type and guard for undefined at runtime.
type XRSystemLike = {
  isSessionSupported?: (mode: string) => Promise<boolean>;
  requestSession?: (mode: string, init?: Record<string, unknown>) => Promise<XRSession>;
};

type XRNavigator = Navigator & { xr?: XRSystemLike };

export const AR_REQUIRED_FEATURES = ['hit-test'] as const;
export const AR_OPTIONAL_FEATURES = ['dom-overlay', 'local-floor', 'anchors'] as const;
export const VR_REQUIRED_FEATURES = ['local-floor'] as const;
export const VR_OPTIONAL_FEATURES = ['bounded-floor', 'hand-tracking', 'layers'] as const;

/** True when the browser exposes a WebXR `requestSession` entry point. */
export function canRequestXR(): boolean {
  if (typeof navigator === 'undefined') return false;
  return typeof (navigator as XRNavigator).xr?.requestSession === 'function';
}

/** True when iOS Safari can present a USDZ model via AR Quick Look. */
export function isQuickLookSupported(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const a = document.createElement('a');
    return !!(a as HTMLAnchorElement & { relList?: DOMTokenList }).relList?.supports?.('ar');
  } catch {
    return false;
  }
}

/**
 * Request an immersive AR session.
 *
 * Call this directly inside a click handler. On Android Chrome this prompts for
 * camera access; on unsupported browsers it rejects with a descriptive error so
 * the UI can fall back to Quick Look / 3D preview.
 *
 * @param domOverlayRoot Optional DOM element whose HTML UI stays visible over the
 *   live camera feed (requires the `dom-overlay` feature). Pass the AR control
 *   bar so "Exit AR" remains tappable in immersive mode.
 */
export async function requestARSession(domOverlayRoot?: HTMLElement | null): Promise<XRSession> {
  const xr = (navigator as XRNavigator).xr;
  if (!xr?.requestSession) {
    throw new Error('WebXR is not available in this browser.');
  }
  const init: Record<string, unknown> = {
    requiredFeatures: [...AR_REQUIRED_FEATURES],
    optionalFeatures: [...AR_OPTIONAL_FEATURES],
  };
  if (domOverlayRoot) {
    init.domOverlay = { root: domOverlayRoot };
  }
  return xr.requestSession('immersive-ar', init);
}

/** Request an immersive VR session (headsets / Android Chrome). */
export async function requestVRSession(): Promise<XRSession> {
  const xr = (navigator as XRNavigator).xr;
  if (!xr?.requestSession) {
    throw new Error('WebXR is not available in this browser.');
  }
  return xr.requestSession('immersive-vr', {
    requiredFeatures: [...VR_REQUIRED_FEATURES],
    optionalFeatures: [...VR_OPTIONAL_FEATURES],
  });
}

/**
 * Trigger iOS AR Quick Look for a `.usdz` asset.
 *
 * Quick Look also requires a user gesture, so call this synchronously from the
 * click handler. Returns false when Quick Look is unavailable or no asset exists.
 */
export function launchQuickLook(usdzUrl: string | null | undefined): boolean {
  if (!usdzUrl || !isQuickLookSupported()) return false;
  try {
    // <a rel="ar"> must exist in the DOM for Safari to intercept the tap.
    const a = document.createElement('a');
    a.rel = 'ar';
    a.href = usdzUrl;
    // iOS renders a share/AR affordance; include an <img> poster child when present.
    const img = document.createElement('img');
    img.src = usdzUrl.replace(/\.usdz$/i, '.png');
    img.alt = '';
    a.appendChild(img);
    a.style.position = 'fixed';
    a.style.left = '-9999px';
    document.body.appendChild(a);
    a.click();
    // Remove after the click has been dispatched.
    setTimeout(() => a.remove(), 0);
    return true;
  } catch {
    return false;
  }
}
