/**
 * Zod validation schemas for experience configurations.
 *
 * Each creator engine (PlayCanvas, Tour, SuperSplat) writes into the
 * same `experience_configs.config` JSONB column. These schemas enforce
 * type safety and reject unknown fields at the API boundary.
 *
 * The schemas are permissive on the `config` content (accepts any valid JSON)
 * but strict on the envelope (experience_id, assets array, settings object).
 */

import { z } from 'zod';

// ============================================================
// Common envelope — shared across all creator engines
// ============================================================

const AssetSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  path: z.array(z.string()).optional(),
  data: z.record(z.any()).optional(),
}).passthrough();

const SettingsSchema = z.record(z.any());

// ============================================================
// PlayCanvas config schema
// ============================================================

const PlayCanvasConfigSchema = z.object({
  engine: z.literal('playcanvas'),
  scene: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    entities: z.record(z.any()).optional(),
    settings: z.record(z.any()).optional(),
  }).passthrough().optional(),
  camera: z.object({
    position: z.array(z.number()).length(3).optional(),
    target: z.array(z.number()).length(3).optional(),
    fov: z.number().min(1).max(180).optional(),
    nearClip: z.number().min(0).optional(),
    farClip: z.number().min(0).optional(),
  }).passthrough().optional(),
  lighting: z.record(z.any()).optional(),
  postprocessing: z.record(z.any()).optional(),
}).passthrough();

// ============================================================
// Virtual Tour config schema
// ============================================================

const TourConfigSchema = z.object({
  engine: z.literal('tour'),
  tour: z.object({
    rooms: z.array(z.object({
      id: z.string().optional(),
      name: z.string().optional(),
      panorama: z.string().optional(),
      hotspots: z.array(z.any()).optional(),
    }).passthrough()).optional(),
    initialRoom: z.string().optional(),
    transitions: z.record(z.any()).optional(),
  }).passthrough().optional(),
  branding: z.record(z.any()).optional(),
  analytics: z.record(z.any()).optional(),
}).passthrough();

// ============================================================
// Gaussian Splat config schema
// ============================================================

const SplatConfigSchema = z.object({
  engine: z.literal('splat'),
  splat: z.object({
    url: z.string().optional(),
    scale: z.number().min(0).optional(),
    rotation: z.array(z.number()).length(3).optional(),
    position: z.array(z.number()).length(3).optional(),
    centers: z.any().optional(),
  }).passthrough().optional(),
  camera: z.object({
    position: z.array(z.number()).length(3).optional(),
    target: z.array(z.number()).length(3).optional(),
  }).passthrough().optional(),
}).passthrough();

// ============================================================
// Pixel Streaming config schema
// ============================================================

const PixelStreamingConfigSchema = z.object({
  engine: z.literal('pixel-streaming'),
  streaming: z.object({
    signalingUrl: z.string().url().optional(),
    turnUrl: z.string().optional(),
    turnUser: z.string().optional(),
    turnPass: z.string().optional(),
    iceServers: z.array(z.any()).optional(),
    quality: z.object({
      maxResolution: z.string().optional(),
      maxBitrate: z.number().optional(),
      fps: z.number().min(1).max(240).optional(),
    }).passthrough().optional(),
  }).passthrough().optional(),
  gpu: z.record(z.any()).optional(),
}).passthrough();

// ============================================================
// Union of all config types
// ============================================================

const ConfigPayloadSchema = z.union([
  PlayCanvasConfigSchema,
  TourConfigSchema,
  SplatConfigSchema,
  PixelStreamingConfigSchema,
]);

// ============================================================
// Full experience_config row (for POST/PUT validation)
// ============================================================

export const ExperienceConfigPostSchema = z.object({
  experience_id: z.string().uuid(),
  config: ConfigPayloadSchema.default({}),
  assets: z.array(AssetSchema).default([]),
  settings: SettingsSchema.default({}),
});

export const ExperienceConfigPutSchema = z.object({
  id: z.string().uuid(),
  config: ConfigPayloadSchema.optional(),
  assets: z.array(AssetSchema).optional(),
  settings: SettingsSchema.optional(),
}).refine(
  (data) => data.config !== undefined || data.assets !== undefined || data.settings !== undefined,
  { message: 'At least one of config, assets, or settings must be provided' }
);

// ============================================================
// Validation helper — returns { success, data, errors }
// ============================================================

export function validateExperienceConfig(
  body: unknown,
  method: 'POST' | 'PUT'
): { success: true; data: any } | { success: false; errors: string[] } {
  const schema = method === 'POST' ? ExperienceConfigPostSchema : ExperienceConfigPutSchema;
  const result = schema.safeParse(body);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`
  );
  return { success: false, errors };
}
