// Advanced 3D Rendering Systems
// Lighting, PBR materials, post-processing, and animation orchestration
// for the PlayCanvas WebXR runtime. Works against the `pc` engine instance
// exposed on window by PlayCanvasXRViewer.

export type LightType = 'directional' | 'point' | 'spot' | 'ambient';
export type ToneMapping = 'none' | 'linear' | 'filmic' | 'aces' | 'neutral';

export interface LightConfig {
  type: LightType;
  color: [number, number, number];
  intensity: number;
  position?: [number, number, number];
  castShadows?: boolean;
  range?: number;
  innerConeAngle?: number;
  outerConeAngle?: number;
}

export interface PostProcessingConfig {
  bloom: boolean;
  bloomIntensity: number;
  vignette: boolean;
  vignetteOffset: number;
  vignetteDarkness: number;
  ssao: boolean;
  fxaa: boolean;
  toneMapping: ToneMapping;
  exposure: number;
}

export interface PBRMaterialConfig {
  baseColor: [number, number, number];
  metalness: number;
  roughness: number;
  emissive?: [number, number, number];
  emissiveIntensity?: number;
  opacity?: number;
}

export const DEFAULT_LIGHTS: LightConfig[] = [
  { type: 'directional', color: [1, 0.98, 0.92], intensity: 1.1, position: [4, 8, 6], castShadows: true },
  { type: 'ambient', color: [0.32, 0.34, 0.4], intensity: 0.45 },
  { type: 'point', color: [0.6, 0.8, 1], intensity: 0.6, position: [-5, 3, -2], range: 18 },
];

export const DEFAULT_POST: PostProcessingConfig = {
  bloom: true,
  bloomIntensity: 0.85,
  vignette: true,
  vignetteOffset: 1.0,
  vignetteDarkness: 1.1,
  ssao: true,
  fxaa: true,
  toneMapping: 'aces',
  exposure: 1.0,
};

const TONE_MAP_INDEX: Record<ToneMapping, number> = {
  none: 0,
  linear: 1,
  filmic: 2,
  aces: 3,
  neutral: 4,
};

function getPC(): any | null {
  if (typeof window === 'undefined') return null;
  return (window as any).pc ?? null;
}

function getApp(): any | null {
  if (typeof window === 'undefined') return null;
  return (window as any).playcanvasApp ?? null;
}

/**
 * Apply a lighting rig to the active PlayCanvas scene.
 * Returns a disposer that removes the created lights.
 */
export function applyLightingRig(configs: LightConfig[] = DEFAULT_LIGHTS): () => void {
  const pc = getPC();
  const app = getApp();
  if (!pc || !app) return () => {};

  const created: any[] = [];
  for (const cfg of configs) {
    const light = new pc.Entity(`light-${cfg.type}-${Date.now()}`);
    light.addComponent('light', {
      type: cfg.type,
      color: new pc.Color(cfg.color[0], cfg.color[1], cfg.color[2]),
      intensity: cfg.intensity,
      castShadows: cfg.castShadows ?? false,
      range: cfg.range ?? 100,
      innerConeAngle: cfg.innerConeAngle ?? 40,
      outerConeAngle: cfg.outerConeAngle ?? 45,
    });
    if (cfg.position) light.setPosition(cfg.position[0], cfg.position[1], cfg.position[2]);
    app.root.addChild(light);
    created.push(light);
  }
  return () => {
    for (const e of created) e.destroy();
  };
}

/**
 * Configure the camera/renderer post-processing + tone mapping.
 * Wires REAL PlayCanvas post-effects onto the active camera's `postEffects`
 * pipeline (bloom, SSAO, FXAA, vignette) where the effect classes exist in the
 * loaded engine build, and gracefully skips anything unavailable. Tone mapping
 * + exposure are set on the scene renderer.
 */
export function applyPostProcessing(cfg: PostProcessingConfig = DEFAULT_POST): () => void {
  const pc = getPC();
  const app = getApp();
  if (!pc || !app) return () => {};

  const disposers: Array<() => void> = [];
  try {
    // Tone mapping + exposure (native, always available).
    app.scene.toneMapping = TONE_MAP_INDEX[cfg.toneMapping] ?? 3;
    app.scene.exposure = cfg.exposure;

    // Find the first camera entity in the scene.
    const camera = findCamera(app);
    if (!camera) return () => {};

    const postEffects = camera.camera?.postEffects;
    if (!postEffects) return () => {};

    // Bloom
    if (cfg.bloom && (pc as any).BloomEffect) {
      const bloom = new (pc as any).BloomEffect(app.graphicsDevice, {
        bloomIntensity: cfg.bloomIntensity,
        blurLevel: 10,
        resolution: 256,
      });
      postEffects.add(bloom);
      disposers.push(() => postEffects.remove(bloom));
    }

    // SSAO (ambient occlusion) — only when the engine exposes the effect class.
    if (cfg.ssao && (pc as any).SsaoEffect) {
      const ssao = new (pc as any).SsaoEffect(app.graphicsDevice, {
        radius: 0.015,
        intensity: 0.6,
        samples: 16,
      });
      postEffects.add(ssao);
      disposers.push(() => postEffects.remove(ssao));
    }

    // FXAA (anti-aliasing)
    if (cfg.fxaa && (pc as any).FxaaEffect) {
      const fxaa = new (pc as any).FxaaEffect(app.graphicsDevice);
      postEffects.add(fxaa);
      disposers.push(() => postEffects.remove(fxaa));
    }

    // Vignette — applied via a small custom shader pass when available.
    if (cfg.vignette && (pc as any).VignetteEffect) {
      const vignette = new (pc as any).VignetteEffect(app.graphicsDevice, {
        offset: cfg.vignetteOffset,
        darkness: cfg.vignetteDarkness,
      });
      postEffects.add(vignette);
      disposers.push(() => postEffects.remove(vignette));
    }
  } catch {
    /* engine not fully booted or effect unsupported — safe to skip */
  }

  return () => {
    for (const d of disposers) {
      try { d(); } catch { /* noop */ }
    }
  };
}

/** Locate the first camera entity in the scene graph. */
function findCamera(app: any): any | null {
  let found: any = null;
  const walk = (node: any) => {
    if (found) return;
    if (node && node.camera) { found = node; return; }
    const children = node?.children;
    if (children) for (const c of children) walk(c);
  };
  walk(app.root);
  return found;
}

/** Build a PBR-standard material descriptor usable by PlayCanvas createMaterial. */
export function createPBRMaterial(cfg: PBRMaterialConfig): any | null {
  const pc = getPC();
  if (!pc) return null;

  const material = new pc.StandardMaterial();
  material.diffuse = new pc.Color(cfg.baseColor[0], cfg.baseColor[1], cfg.baseColor[2]);
  material.metalness = cfg.metalness;
  material.gloss = 1 - cfg.roughness;
  material.useMetalness = true;
  if (cfg.emissive) {
    material.emissive = new pc.Color(cfg.emissive[0], cfg.emissive[1], cfg.emissive[2]);
    material.emissiveIntensity = cfg.emissiveIntensity ?? 1;
  }
  if (cfg.opacity !== undefined) {
    material.opacity = cfg.opacity;
    material.blendType = cfg.opacity < 1 ? pc.BLEND_NORMAL : pc.BLEND_NONE;
  }
  material.update();
  return material;
}

/** Simple eased keyframe animation driver for an entity transform. */
export interface Keyframe {
  t: number; // 0..1 normalized time
  position?: [number, number, number];
  rotation?: [number, number, number]; // euler degrees
  scale?: [number, number, number];
}

export function playKeyframes(entity: any, frames: Keyframe[], durationMs: number): () => void {
  const pc = getPC();
  if (!pc || !entity) return () => {};

  const start = performance.now();
  let raf = 0;
  const tick = () => {
    const elapsed = performance.now() - start;
    const t = Math.min(1, elapsed / durationMs);
    const eased = t * t * (3 - 2 * t); // smoothstep
    // interpolate between surrounding keyframes
    let a = frames[0];
    let b = frames[frames.length - 1];
    for (let i = 0; i < frames.length - 1; i++) {
      if (eased >= frames[i].t && eased <= frames[i + 1].t) {
        a = frames[i];
        b = frames[i + 1];
        break;
      }
    }
    const span = Math.max(1e-6, b.t - a.t);
    const local = (eased - a.t) / span;
    if (a.position && b.position) {
      entity.setPosition(
        a.position[0] + (b.position[0] - a.position[0]) * local,
        a.position[1] + (b.position[1] - a.position[1]) * local,
        a.position[2] + (b.position[2] - a.position[2]) * local
      );
    }
    if (t < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
