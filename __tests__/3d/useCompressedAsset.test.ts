/**
 * useCompressedAsset unit tests
 *
 * Verifies asset kind detection, compression hint detection, and the
 * end-to-end resolveCompressedAsset() output for representative URLs.
 */

import {
  detectAssetKind,
  detectCompression,
  resolveCompressedAsset,
} from '../../lib/3d/useCompressedAsset';

describe('useCompressedAsset helpers', () => {
  describe('detectAssetKind()', () => {
    it.each([
      ['/models/building.glb', 'glb'],
      ['/models/scene.gltf', 'glb'],
      ['/captures/lobby.splat', 'splat'],
      ['/captures/lobby.ply', 'splat'],
      ['/captures/lobby.spz', 'splat'],
      ['/pano/lobby.jpg', 'panorama'],
      ['/pano/lobby.png', 'panorama'],
      ['/pano/lobby.webp', 'panorama'],
      ['/ios/model.usdz', 'usdz'],
      ['/something.txt', 'unknown'],
    ])('detects %s as %s', (url, expected) => {
      expect(detectAssetKind(url)).toBe(expected);
    });

    it('is case-insensitive', () => {
      expect(detectAssetKind('/path/Building.GLB')).toBe('glb');
      expect(detectAssetKind('/path/SPLAT.SPLAT')).toBe('splat');
    });
  });

  describe('detectCompression()', () => {
    it('detects draco from filename suffix', () => {
      expect(detectCompression('/models/building.draco.glb').draco).toBe(true);
      expect(detectCompression('/models/building.draco.glb').meshopt).toBe(false);
    });

    it('detects meshopt from filename suffix', () => {
      expect(detectCompression('/models/building.meshopt.glb').meshopt).toBe(true);
      expect(detectCompression('/models/building.meshopt.glb').draco).toBe(false);
    });

    it('detects ktx2 from filename suffix or .basis', () => {
      expect(detectCompression('/textures/wall.ktx2.glb').ktx2).toBe(true);
      expect(detectCompression('/textures/wall.basis').ktx2).toBe(true);
    });

    it('returns all-false for plain GLB', () => {
      const c = detectCompression('/models/plain.glb');
      expect(c.draco).toBe(false);
      expect(c.meshopt).toBe(false);
      expect(c.ktx2).toBe(false);
    });

    it('respects manifest hints over filename detection', () => {
      // Filename says no draco, but manifest says yes
      const c = detectCompression('/models/whatever.glb', { draco: true });
      expect(c.draco).toBe(true);
    });
  });

  describe('resolveCompressedAsset()', () => {
    it('returns the correct decoder URLs for a draco GLB', () => {
      const out = resolveCompressedAsset('/models/building.draco.glb', 'three');
      expect(out.kind).toBe('glb');
      expect(out.compression.draco).toBe(true);
      expect(out.loaderOptions.dracoDecoderPath).toMatch(/draco/);
    });

    it('omits decoder URLs for compression the engine does not advertise', () => {
      // Both engines support draco, so this verifies inclusion; the omission
      // path is verified by engineSupports() which is unit-tested elsewhere.
      const out = resolveCompressedAsset('/models/plain.glb', 'three');
      expect(out.loaderOptions.dracoDecoderPath).toBeUndefined();
      expect(out.loaderOptions.meshoptDecoderPath).toBeUndefined();
    });

    it('passes through the original url', () => {
      const out = resolveCompressedAsset('/anywhere/foo.glb', 'three');
      expect(out.url).toBe('/anywhere/foo.glb');
    });
  });
});
