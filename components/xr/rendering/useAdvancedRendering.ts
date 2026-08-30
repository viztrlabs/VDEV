'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  applyLightingRig,
  applyPostProcessing,
  createPBRMaterial,
  DEFAULT_LIGHTS,
  DEFAULT_POST,
  LightConfig,
  PBRMaterialConfig,
  PostProcessingConfig,
} from './AdvancedRendering';

/**
 * React hook exposing advanced rendering controls wired to the PlayCanvas
 * runtime. Toggling lighting / post-processing pushes changes straight to the
 * engine instance created by PlayCanvasXRViewer.
 */
export function useAdvancedRendering() {
  const disposers = useRef<Array<() => void>>([]);

  const rebuildLighting = useCallback((configs: LightConfig[]) => {
    // tear down previous rig
    disposers.current.forEach((d) => d());
    disposers.current = [];
    disposers.current.push(applyLightingRig(configs));
  }, []);

  const setPostProcessing = useCallback((cfg: PostProcessingConfig) => {
    applyPostProcessing(cfg);
  }, []);

  const makeMaterial = useCallback((cfg: PBRMaterialConfig) => {
    return createPBRMaterial(cfg);
  }, []);

  // Default rig on mount (after engine boots).
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        rebuildLighting(DEFAULT_LIGHTS);
        setPostProcessing(DEFAULT_POST);
      } catch {
        /* engine not ready yet — safe */
      }
    }, 2500);
    return () => {
      clearTimeout(t);
      disposers.current.forEach((d) => d());
      disposers.current = [];
    };
  }, [rebuildLighting, setPostProcessing]);

  return { rebuildLighting, setPostProcessing, makeMaterial };
}

export default useAdvancedRendering;

export { DEFAULT_LIGHTS, DEFAULT_POST };
