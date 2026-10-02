/**
 * Lossless manifest tests: buildTourManifest must preserve unknown scene and
 * hotspot fields, emit BOTH coordinate systems, and keep original hotspot
 * types (the old code collapsed all media types to 'gallery').
 */
import { buildTourManifest, manifestSceneToTourScene } from '@/lib/tourManifest';

const room = {
  id: 'r1',
  name: 'Lobby',
  url: 'https://x/pano.jpg',
  thumbnailUrl: '',
  initialYaw: 10,
  initialPitch: 5,
  // Unknown API fields that must survive the manifest round-trip:
  tileUrl: 'https://x/tiles',
  autorotateEnabled: false,
  autorotateSpeed: 1,
  initialFov: 80,
  viewConstraints: { top: -90, bottom: 90, left: -180, right: 180, zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false },
  // Canonical hotspots (radians) under `hotspots`:
  hotspots: [
    { id: 'h1', yaw: Math.PI / 2, pitch: 0, type: 'video', title: 'Screen', description: '', videoUrl: 'https://x/v.mp4' },
  ],
  // Legacy hotspots (equirect percents) under `defaultHotspots`:
  defaultHotspots: [
    { id: 'h2', xPercent: 75, yPercent: 50, type: 'room_link', title: 'To Kitchen', targetSceneId: 'r2' },
  ],
};

describe('buildTourManifest losslessness', () => {
  it('preserves unknown scene fields (tileUrl, autorotate, initialFov, viewConstraints)', () => {
    const m = buildTourManifest([room] as any);
    const sc = m.scenes[0] as any;
    expect(sc.tileUrl).toBe('https://x/tiles');
    expect(sc.autorotateEnabled).toBe(false);
    expect(sc.autorotateSpeed).toBe(1);
    expect(sc.initialFov).toBe(80);
    expect(sc.viewConstraints.zoomMax).toBe(120);
  });

  it('emits BOTH coordinate systems for canonical (radian) hotspots', () => {
    const m = buildTourManifest([room] as any);
    const h = m.scenes[0].hotspots.find((x) => x.id === 'h1')!;
    expect(h.yaw).toBe(Math.PI / 2);
    expect(h.pitch).toBe(0);
    expect(h.xPercent).toBe(75);
    expect(h.yPercent).toBe(50);
  });

  it('converts legacy xPercent/yPercent hotspots and keeps nav links', () => {
    const m = buildTourManifest([room, { id: 'r2', name: 'Kitchen', url: 'https://x/k.jpg' }] as any);
    const h = m.scenes[0].hotspots.find((x) => x.id === 'h2')!;
    expect(h.yaw).toBeCloseTo(Math.PI / 2, 5);
    expect(h.pitch).toBe(0);
    expect(h.kind).toBe('nav');
    expect(h.targetRoomId).toBe('r2');
    expect(m.links).toContainEqual({ from: 'r1', to: 'r2' });
  });

  it('manifestSceneToTourScene preserves the ORIGINAL hotspot type (video stays video)', () => {
    const m = buildTourManifest([room] as any);
    const ts = manifestSceneToTourScene(room as any, m);
    const h = ts.hotspots.find((x) => x.id === 'h1')!;
    expect(h.type).toBe('video');
    expect(h.videoUrl).toBe('https://x/v.mp4');
  });

  it('manifestSceneToTourScene spreads unknown hotspot fields through', () => {
    const m = buildTourManifest([room] as any);
    const ts = manifestSceneToTourScene(room as any, m);
    const h = ts.hotspots.find((x) => x.id === 'h1')! as any;
    expect(h.kind).toBe('media');
    expect(h.targetRoomId).toBeUndefined();
  });
});
