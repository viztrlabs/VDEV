'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  CaptureSource,
  detectPreset,
  estimateBudget,
  planReconstruction,
  QUALITY_PRESETS,
  ReconstructionJob,
  SplatQualityPreset,
} from './splatProcessing';

/**
 * Hook orchestrating the Gaussian Splat processing pipeline: capture planning,
 * budget estimation, and quality-preset selection. Designed to feed
 * GaussianSplatViewer (see components/xr/GaussianSplatViewer.tsx).
 */
export function useSplatProcessing(opts?: {
  isMobile?: boolean;
  hasDiscreteGPU?: boolean;
}) {
  const [preset, setPreset] = useState<SplatQualityPreset>(() => detectPreset(opts));
  const [job, setJob] = useState<ReconstructionJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plan = useCallback((source: CaptureSource, format: 'splat' | 'ply' | 'ksplat' | 'npy' = 'splat') => {
    const result = planReconstruction(source, format);
    if ('error' in result) {
      setError(result.error);
      setJob(null);
      return null;
    }
    setError(null);
    setJob(result);
    return result;
  }, []);

  const budget = useMemo(() => (job ? estimateBudget(job.source) : null), [job]);

  return {
    presets: QUALITY_PRESETS,
    preset,
    setPreset,
    plan,
    job,
    budget,
    error,
    clearError: () => setError(null),
  };
}

export default useSplatProcessing;
