/**
 * Engine Abstraction Layer
 *
 * Provides a unified interface over PlayCanvas (PC) and Three.js, allowing
 * the Viewer and Developer Dashboard to switch between engines without
 * changing the call site. Defaults to Three.js + R3F for new code; legacy
 * PlayCanvas scenes opt in via `engine: 'playcanvas'`.
 *
 * Selection is decided at module load by `getEngine()` and consumed via
 * `useEngine()` in React components. Build-time selection is also
 * supported via env var `NEXT_PUBLIC_ENGINE`.
 */

export type EngineId = 'three' | 'playcanvas';

export interface EngineCapabilities {
  /** Whether the engine can render WebXR immersive sessions. */
  xr: boolean;
  /** Whether the engine can run on the public viewer (always true for now). */
  viewer: boolean;
  /** Whether the engine supports Draco mesh decoding out of the box. */
  draco: boolean;
  /** Whether the engine supports Meshopt decoding. */
  meshopt: boolean;
  /** Whether the engine supports KTX2/Basis textures. */
  ktx2: boolean;
  /** Whether the engine supports Gaussian splatting. */
  splat: boolean;
  /** Whether the engine supports 360° panoramic images. */
  panorama: boolean;
}

export interface EngineDescriptor {
  id: EngineId;
  name: string;
  version: string;
  capabilities: EngineCapabilities;
}

const PC_CAPABILITIES: EngineCapabilities = {
  xr: true,
  viewer: true,
  draco: true,
  meshopt: true,
  ktx2: true,
  splat: true, // PlayCanvas has first-class splat support
  panorama: true,
};

const THREE_CAPABILITIES: EngineCapabilities = {
  xr: true, // three.js has WebXR via three/examples/jsm/webxr
  viewer: true,
  draco: true, // via three/examples/jsm/loaders/DRACOLoader
  meshopt: true, // via three/examples/jsm/loaders/MeshoptDecoder
  ktx2: true, // via three/examples/jsm/loaders/KTX2Loader
  splat: true, // via @mkkellogg/gaussian-splats-3d
  panorama: true, // via Marzipano or three.js sphere geometry
};

/**
 * Static engine registry. Adding a new engine means adding a new entry here
 * and updating `useEngine` to provide its React adapter.
 */
export const ENGINES: Record<EngineId, EngineDescriptor> = {
  three: {
    id: 'three',
    name: 'Three.js',
    version: 'r170', // keep in sync with package.json
    capabilities: THREE_CAPABILITIES,
  },
  playcanvas: {
    id: 'playcanvas',
    name: 'PlayCanvas',
    version: '2.21.4', // keep in sync with package.json
    capabilities: PC_CAPABILITIES,
  },
};

/**
 * Returns the engine that should be used by default. Resolution order:
 * 1. `NEXT_PUBLIC_ENGINE` env var (build-time selection)
 * 2. `'three'` (declarative React path is the recommended default)
 *
 * Components that need a specific engine can pass an explicit id to
 * `useEngine(id)`; this function is only for the no-arg default.
 */
export function getDefaultEngine(): EngineId {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ENGINE) {
    const env = process.env.NEXT_PUBLIC_ENGINE as EngineId;
    if (env === 'three' || env === 'playcanvas') return env;
  }
  return 'three';
}

/**
 * Returns a descriptor for the given engine id, or the default if omitted.
 * Throws if the id is not recognized — this is a programmer error, not a
 * runtime condition, so we want a loud failure.
 */
export function getEngine(id?: EngineId): EngineDescriptor {
  const target = id ?? getDefaultEngine();
  const engine = ENGINES[target];
  if (!engine) {
    throw new Error(
      `[engine] Unknown engine id "${target}". Known: ${Object.keys(ENGINES).join(', ')}`,
    );
  }
  return engine;
}

/**
 * Type guard: true if the given engine supports a capability.
 * Used by Viewer to decide which loader to instantiate.
 */
export function engineSupports(
  id: EngineId,
  capability: keyof EngineCapabilities,
): boolean {
  return ENGINES[id]?.capabilities[capability] ?? false;
}
