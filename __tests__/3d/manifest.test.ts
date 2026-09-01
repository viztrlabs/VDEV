/**
 * Asset manifest unit tests
 *
 * Verifies validateManifest(), groupManifestAssets(), and
 * criticalAssets() behave correctly on representative inputs.
 */

import type { AssetManifest, ManifestAsset } from '../../lib/3d/manifest';
import {
  validateManifest,
  groupManifestAssets,
  criticalAssets,
} from '../../lib/3d/manifest';

function makeAsset(overrides: Partial<ManifestAsset> = {}): ManifestAsset {
  return {
    url: '/models/foo.glb',
    name: 'foo.glb',
    kind: 'glb',
    size: 1234,
    sha256: 'a'.repeat(64),
    compression: { draco: false, meshopt: false, ktx2: false },
    group: 'scene',
    critical: true,
    ...overrides,
  };
}

function makeManifest(overrides: Partial<AssetManifest> = {}): AssetManifest {
  return {
    version: 1,
    generatedAt: '2026-01-01T00:00:00.000Z',
    projectId: 'proj-1',
    experienceId: 'exp-1',
    assets: [makeAsset()],
    ...overrides,
  };
}

describe('manifest validation', () => {
  it('returns no errors for a well-formed manifest', () => {
    expect(validateManifest(makeManifest())).toEqual([]);
  });

  it('flags a missing version', () => {
    const m = makeManifest({ version: 2 as unknown as 1 });
    expect(validateManifest(m)).toContain('unsupported manifest version: 2');
  });

  it('flags a non-hex sha256', () => {
    const m = makeManifest({ assets: [makeAsset({ sha256: 'not-hex' })] });
    const errors = validateManifest(m);
    expect(errors.some((e) => e.includes('sha256 invalid'))).toBe(true);
  });

  it('flags a non-numeric size', () => {
    const m = makeManifest({ assets: [makeAsset({ size: -1 })] });
    const errors = validateManifest(m);
    expect(errors.some((e) => e.includes('size invalid'))).toBe(true);
  });

  it('flags a missing assets array', () => {
    const m = { ...makeManifest() } as Partial<AssetManifest>;
    delete (m as { assets?: unknown }).assets;
    const errors = validateManifest(m);
    expect(errors).toContain('assets must be an array');
  });

  it('flags non-object input', () => {
    expect(validateManifest(null)).toContain('manifest is not an object');
    expect(validateManifest('hello')).toContain('manifest is not an object');
  });
});

describe('groupManifestAssets()', () => {
  it('groups assets by their group field', () => {
    const m = makeManifest({
      assets: [
        makeAsset({ name: 'a.glb', group: 'scene' }),
        makeAsset({ name: 'b.glb', group: 'scene' }),
        makeAsset({ name: 'pano.jpg', group: 'tour' }),
      ],
    });
    const grouped = groupManifestAssets(m);
    expect(grouped.scene).toHaveLength(2);
    expect(grouped.tour).toHaveLength(1);
    expect(grouped.misc).toBeUndefined();
  });
});

describe('criticalAssets()', () => {
  it('returns only assets marked critical', () => {
    const m = makeManifest({
      assets: [
        makeAsset({ name: 'a.glb', critical: true }),
        makeAsset({ name: 'pano.jpg', critical: false }),
      ],
    });
    const out = criticalAssets(m);
    expect(out).toHaveLength(1);
    expect(out[0]?.name).toBe('a.glb');
  });
});
