/**
 * useCompressedAsset — load a 3D asset (GLB / splat / panorama) with
 * transparent support for Draco mesh compression, Meshopt v2 compression,
 * and KTX2 / Basis texture compression.
 *
 * The hook is engine-agnostic: it inspects the URL for the standard
 * extension markers and returns a loader config the engine can consume.
 * Actual byte decoding happens in the engine's loader; this hook just
 * resolves "what compression is in use" so the right decoder is initialized.
 *
 * Usage:
 *   const asset = useCompressedAsset('/models/building.glb');
 *   // asset.compression = { draco: true, meshopt: false, ktx2: true }
 *   // pass asset to <GLBModel src={asset.url} compression={asset.compression} />
 */

import { useMemo } from 'react';
import { engineSupports, type EngineId } from './engine';

export type AssetKind = 'glb' | 'splat' | 'panorama' | 'usdz' | 'unknown';

export interface CompressionHints {
  draco: boolean;
  meshopt: boolean;
  ktx2: boolean;
}

export interface CompressedAsset {
  url: string;
  kind: AssetKind;
  compression: CompressionHints;
  /** Pre-configured loader options the engine should use. */
  loaderOptions: {
    dracoDecoderPath?: string;
    meshoptDecoderPath?: string;
    ktx2TranscoderPath?: string;
  };
}

const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';
const MESHOPT_DECODER_PATH = 'https://unpkg.com/meshoptimizer@0.21.0/meshopt_decoder.js';
const KTX2_TRANSCODER_PATH = 'https://unpkg.com/basis-universal@1.4.0/dist/';

/** Map a URL or content-type to a known asset kind. */
export function detectAssetKind(url: string): AssetKind {
  const lower = url.toLowerCase();
  if (lower.endsWith('.glb') || lower.endsWith('.gltf')) return 'glb';
  if (lower.endsWith('.splat') || lower.endsWith('.ply') || lower.endsWith('.spz')) return 'splat';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.endsWith('.avif'))
    return 'panorama';
  if (lower.endsWith('.usdz')) return 'usdz';
  return 'unknown';
}

/** Inspect a manifest entry (or URL with sidecar) for compression hints. */
export function detectCompression(url: string, manifestHints?: Partial<CompressionHints>): CompressionHints {
  // Convention: filename suffixes indicate compression
  //   foo.draco.glb       -> draco
  //   foo.meshopt.glb     -> meshopt
  //   foo.ktx2.glb        -> ktx2 textures
  const lower = url.toLowerCase();
  return {
    draco: (manifestHints?.draco ?? /\.draco\./.test(lower)) || /\.drc$/.test(lower),
    meshopt: manifestHints?.meshopt ?? /\.meshopt\./.test(lower),
    ktx2: (manifestHints?.ktx2 ?? /\.ktx2\./.test(lower)) || /\.basis$/.test(lower),
  };
}

/**
 * Resolve the asset to load. Pure function: does not fetch the bytes,
 * just inspects the URL and returns loader configuration.
 */
export function resolveCompressedAsset(
  url: string,
  engine: EngineId,
  manifestHints?: Partial<CompressionHints>,
): CompressedAsset {
  const kind = detectAssetKind(url);
  const compression = detectCompression(url, manifestHints);

  // Don't include decoder URLs for compression the engine doesn't support.
  const loaderOptions: CompressedAsset['loaderOptions'] = {};
  if (compression.draco && engineSupports(engine, 'draco')) {
    loaderOptions.dracoDecoderPath = DRACO_DECODER_PATH;
  }
  if (compression.meshopt && engineSupports(engine, 'meshopt')) {
    loaderOptions.meshoptDecoderPath = MESHOPT_DECODER_PATH;
  }
  if (compression.ktx2 && engineSupports(engine, 'ktx2')) {
    loaderOptions.ktx2TranscoderPath = KTX2_TRANSCODER_PATH;
  }

  return { url, kind, compression, loaderOptions };
}

/**
 * React hook wrapper. Memoized so the result is stable across renders
 * unless the URL, engine, or hints change.
 */
export function useCompressedAsset(
  url: string,
  engine: EngineId = 'three',
  manifestHints?: Partial<CompressionHints>,
): CompressedAsset {
  return useMemo(
    () => resolveCompressedAsset(url, engine, manifestHints),
    [url, engine, manifestHints?.draco, manifestHints?.meshopt, manifestHints?.ktx2],
  );
}
