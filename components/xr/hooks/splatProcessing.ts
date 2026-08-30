// Gaussian Splat Processing — 3D reconstruction + optimization pipeline.
// Covers capture-to-splat conversion helpers, quality presets, and runtime
// optimization controls consumed by GaussianSplatViewer.

export type SplatFormat = 'splat' | 'ply' | 'ksplat' | 'npy';

export interface SplatQualityPreset {
  id: string;
  label: string;
  maxSplats: number; // cap for memory-bound devices
  enableShs: boolean; // spherical harmonics (color view dependency)
  enableSpherical: boolean;
  workerCount: number;
  dynamicRes: boolean;
}

export const QUALITY_PRESETS: SplatQualityPreset[] = [
  {
    id: 'low',
    label: 'Low (mobile)',
    maxSplats: 500_000,
    enableShs: false,
    enableSpherical: false,
    workerCount: 2,
    dynamicRes: true,
  },
  {
    id: 'medium',
    label: 'Medium',
    maxSplats: 1_500_000,
    enableShs: true,
    enableSpherical: false,
    workerCount: 4,
    dynamicRes: true,
  },
  {
    id: 'high',
    label: 'High (desktop GPU)',
    maxSplats: 6_000_000,
    enableShs: true,
    enableSpherical: true,
    workerCount: 8,
    dynamicRes: false,
  },
];

/** Detect a sensible default preset from device hints. */
export function detectPreset(opts?: {
  isMobile?: boolean;
  maxMemoryMB?: number;
  hasDiscreteGPU?: boolean;
}): SplatQualityPreset {
  if (opts?.isMobile) return QUALITY_PRESETS[0];
  if (opts?.hasDiscreteGPU) return QUALITY_PRESETS[2];
  return QUALITY_PRESETS[1];
}

export interface CaptureSource {
  id: string;
  kind: 'images' | 'video' | 'lidar';
  count?: number;
  resolution?: string;
  fps?: number;
  sizeBytes: number;
}

export interface ReconstructionJob {
  id: string;
  source: CaptureSource;
  status: 'queued' | 'colmap' | 'train' | 'optimizing' | 'done' | 'failed';
  progress: number; // 0..1
  outputFormat: SplatFormat;
  startedAt: number;
}

/**
 * Plan a reconstruction job. In a full build this would call a training service;
 * here it validates inputs and returns a structured job the viewer can consume.
 */
export function planReconstruction(
  source: CaptureSource,
  outputFormat: SplatFormat = 'splat'
): ReconstructionJob | { error: string } {
  if (source.kind === 'images' && (!source.count || source.count < 20)) {
    return { error: `Image-based reconstruction needs >=20 frames (got ${source.count ?? 0})` };
  }
  if (source.sizeBytes < 1024 * 1024) {
    return { error: 'Capture too small to reconstruct a usable scene' };
  }
  return {
    id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    source,
    status: 'queued',
    progress: 0,
    outputFormat,
    startedAt: Date.now(),
  };
}

/**
 * Estimate device upload/processing budget for a capture before upload.
 * Returns a recommendation the UI can surface to avoid OOM.
 */
export function estimateBudget(source: CaptureSource): {
  estSplats: number;
  estMinutes: number;
  warning?: string;
} {
  const perFrame =
    source.kind === 'images'
      ? (source.sizeBytes / Math.max(1, source.count ?? 1)) * 6
      : source.sizeBytes * 0.4;
  const estSplats = Math.min(6_000_000, Math.round(perFrame / 64));
  const estMinutes = Math.max(1, Math.round(estSplats / 250_000));
  const warning =
    estSplats > 3_000_000 ? 'Large scene: use High preset on a discrete GPU' : undefined;
  return { estSplats, estMinutes, warning };
}

/** Map a ReconstructionJob to DropInViewer addSplatScene options. */
export function toViewerOptions(job: ReconstructionJob) {
  return {
    format: job.outputFormat,
    splatAlphaRemovalThreshold: 5,
    showLoadingUI: true,
    progressiveLoad: true,
  };
}
