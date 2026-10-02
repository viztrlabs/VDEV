/**
 * tour-schema compat layer tests.
 * readHotspots prefers the canonical hotspots array, falls back to
 * defaultHotspots (Imported tours) with legacy type coercion.
 * toManifestHotspot emits BOTH coordinate systems (radians + percents).
 */
import { kindForType } from '@/lib/tour-schema';
import { readHotspots, normalizeLegacyHotspot, toManifestHotspot } from '@/lib/tour-schema/compat';
import type { TourHotspot } from '@/lib/tourClientStore';

const hs = (over: Partial<TourHotspot> = {}): TourHotspot => ({
  id: 'h1', yaw: 0, pitch: 0, type: 'navigation', title: 'Door', description: '', ...over,
});

describe('kindForType', () => {
  it('maps navigation and floor to nav', () => {
    expect(kindForType('navigation')).toBe('nav');
    expect(kindForType('floor')).toBe('nav');
  });

  it('maps info to info and metadata to metadata', () => {
    expect(kindForType('info')).toBe('info');
    expect(kindForType('metadata')).toBe('metadata');
  });

  it('maps link to link', () => {
    expect(kindForType('link')).toBe('link');
  });

  it('maps all media types to media', () => {
    for (const t of ['image', 'gallery', 'video', 'audio', 'model3d', 'splat']) {
      expect(kindForType(t)).toBe('media');
    }
  });

  it('maps unknown types to other', () => {
    expect(kindForType('something-else')).toBe('other');
  });
});

describe('readHotspots', () => {
  it('merges legacy defaultHotspots after canonical hotspots (no id collisions)', () => {
    const canonical = [hs({ id: 'c1' })];
    const legacy = [
      { id: 'l1', type: 'room_link', title: 'Lobby link', targetSceneId: 'r2' },
      { id: 'c1', type: 'room_link', title: 'collides' },
      { id: '', type: 'room_link', title: 'dropped' },
    ];
    const out = readHotspots({ hotspots: canonical, defaultHotspots: legacy });
    expect(out.map((h) => h.id)).toEqual(['c1', 'l1']);
    expect(out[1]).toMatchObject({ type: 'navigation', targetSceneId: 'r2' });
  });

  it('falls back to defaultHotspots with legacy normalization', () => {
    const out = readHotspots({
      hotspots: [],
      defaultHotspots: [
        { id: 'l1', type: 'room_link', title: 'Lobby link', targetSceneId: 'r2' },
        { id: '', type: 'room_link', title: 'dropped' },
      ],
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ id: 'l1', type: 'navigation', targetSceneId: 'r2' });
  });

  it('returns an empty array when both are empty or missing', () => {
    expect(readHotspots({})).toEqual([]);
    expect(readHotspots({ hotspots: [], defaultHotspots: [] })).toEqual([]);
  });
});

describe('normalizeLegacyHotspot', () => {
  it('maps room_link and teleport to navigation', () => {
    expect(normalizeLegacyHotspot({ id: 'a', type: 'room_link' }).type).toBe('navigation');
    expect(normalizeLegacyHotspot({ id: 'b', type: 'teleport' }).type).toBe('navigation');
  });

  it('maps info_popup and metadata to info; image_overlay to image', () => {
    expect(normalizeLegacyHotspot({ id: 'a', type: 'info_popup' }).type).toBe('info');
    expect(normalizeLegacyHotspot({ id: 'b', type: 'metadata' }).type).toBe('info');
    expect(normalizeLegacyHotspot({ id: 'c', type: 'image_overlay' }).type).toBe('image');
  });

  it('maps external to link and product to model3d', () => {
    expect(normalizeLegacyHotspot({ id: 'a', type: 'external' }).type).toBe('link');
    expect(normalizeLegacyHotspot({ id: 'b', type: 'product' }).type).toBe('model3d');
  });

  it('maps legacy link to navigation unless it has an externalUrl', () => {
    expect(normalizeLegacyHotspot({ id: 'a', type: 'link' }).type).toBe('navigation');
    expect(normalizeLegacyHotspot({ id: 'b', type: 'link', externalUrl: 'https://x' }).type).toBe('link');
  });

  it('defaults missing title and description', () => {
    const out = normalizeLegacyHotspot({ id: 'a', type: 'info' });
    expect(out.title).toBe('Hotspot');
    expect(out.description).toBe('');
  });
});

describe('toManifestHotspot', () => {
  it('emits both coordinate systems (radians + derived percents)', () => {
    const out = toManifestHotspot(hs({ yaw: Math.PI / 2, pitch: 0 })) as any;
    expect(out.yaw).toBe(Math.PI / 2);
    expect(out.pitch).toBe(0);
    expect(out.xPercent).toBe(75);
    expect(out.yPercent).toBe(50);
  });

  it('derives kind from type and maps targetSceneId to targetRoomId', () => {
    const out = toManifestHotspot(hs({ type: 'navigation', targetSceneId: 'r2' })) as any;
    expect(out.kind).toBe('nav');
    expect(out.targetRoomId).toBe('r2');
  });

  it('spreads unknown fields through (appearance, direction, behavior)', () => {
    const out = toManifestHotspot(hs({ color: '#fff', icon: 'pin', directionMode: 'manual' })) as any;
    expect(out.color).toBe('#fff');
    expect(out.icon).toBe('pin');
    expect(out.directionMode).toBe('manual');
  });
});
