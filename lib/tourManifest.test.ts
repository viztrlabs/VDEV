import { buildTourManifest, manifestSceneToTourScene, layoutGalaxyNodes, layoutGalaxyEdges } from './tourManifest';

const baseRoom = {
  id: 'r1',
  name: 'Living Room',
  panoramaUrl: '/pano/living.jpg',
  thumbnailUrl: '/pano/living-thumb.jpg',
  initialYaw: 180,
  initialPitch: -10,
  defaultHotspots: [] as any[],
};

describe('buildTourManifest', () => {
  it('derives links ONLY from authored room_link hotspots', () => {
    const rooms = [
      {
        ...baseRoom,
        defaultHotspots: [
          { id: 'h1', type: 'room_link', xPercent: 50, yPercent: 50, title: 'To Kitchen', targetRoomId: 'r2' },
          { id: 'h2', type: 'info', xPercent: 20, yPercent: 30, title: 'Info', description: 'A thing' },
        ],
      },
      { ...baseRoom, id: 'r2', name: 'Kitchen', panoramaUrl: '/pano/kitchen.jpg' },
      { ...baseRoom, id: 'r3', name: 'Garden', panoramaUrl: '/pano/garden.jpg' },
    ];
    const m = buildTourManifest(rooms as any);
    expect(m.links).toEqual([{ from: 'r1', to: 'r2' }]);
    expect(m.scenes).toHaveLength(3);
    expect(m.scenes[0].hotspots[0].kind).toBe('nav');
    expect(m.scenes[0].hotspots[1].kind).toBe('info');
  });

  it('drops orphan room_link hotspots (target room missing)', () => {
    const m = buildTourManifest([
      {
        ...baseRoom,
        defaultHotspots: [
          { id: 'h1', type: 'room_link', xPercent: 50, yPercent: 50, title: 'Ghost', targetRoomId: 'nope' },
        ],
      },
    ] as any);
    expect(m.links).toEqual([]);
    expect(m.scenes[0].hotspots.filter((h) => h.kind === 'nav')).toHaveLength(0);
  });

  it('picks the featured room as featuredId, else null', () => {
    const m1 = buildTourManifest([{ ...baseRoom, featured: true }, baseRoom] as any);
    expect(m1.featuredId).toBe('r1');
    const m2 = buildTourManifest([baseRoom] as any);
    expect(m2.featuredId).toBeNull();
  });

  it('classifies metadata/media/link kinds', () => {
    const rooms = [
      {
        ...baseRoom,
        defaultHotspots: [
          { id: 'm', type: 'metadata', xPercent: 10, yPercent: 10, title: 'Spec', description: 'x' },
          { id: 'g', type: 'gallery', xPercent: 20, yPercent: 20, title: 'Photos', images: ['/a.jpg', '/b.jpg'] },
          { id: 'e', type: 'link', xPercent: 30, yPercent: 30, title: 'Docs', externalUrl: 'https://x.test' },
        ],
      },
    ] as any;
    const kinds = buildTourManifest(rooms).scenes[0].hotspots.map((h) => h.kind);
    expect(kinds).toEqual(['metadata', 'media', 'link']);
  });

  it('computes yaw/pitch in radians from percents (center = 0/0)', () => {
    const m = buildTourManifest([
      { ...baseRoom, defaultHotspots: [{ id: 'h', type: 'info', xPercent: 50, yPercent: 50, title: 'Center' }] },
    ] as any);
    const hs = m.scenes[0].hotspots[0];
    expect(hs.yaw).toBeCloseTo(0, 5);
    expect(hs.pitch).toBeCloseTo(0, 5);
  });

  it('places positionless legacy hotspots at the scene initial view (deg->rad)', () => {
    const m = buildTourManifest([
      { ...baseRoom, defaultHotspots: [{ id: 'h', type: 'point', title: 'Marker' }] },
    ] as any);
    const hs = m.scenes[0].hotspots[0];
    expect(hs.yaw).toBeCloseTo(Math.PI, 5); // initialYaw 180 deg -> in front of camera
    expect(hs.pitch).toBeCloseTo((-10 * Math.PI) / 180, 5);
  });

  it('excludes rooms without a panorama and keeps valid ones', () => {
    const m = buildTourManifest([
      { ...baseRoom, id: 'no-pano', name: 'Empty', panoramaUrl: undefined, defaultHotspots: [] },
      baseRoom,
    ] as any);
    expect(m.scenes.map((s) => s.id)).toEqual(['r1']);
  });
});

describe('manifestSceneToTourScene', () => {
  it('maps hotspots preserving types and targetSceneId', () => {
    const rooms = [
      {
        ...baseRoom,
        defaultHotspots: [
          { id: 'h1', type: 'room_link', xPercent: 50, yPercent: 50, title: 'To Kitchen', targetRoomId: 'r2', targetYaw: 90 },
          { id: 'h2', type: 'info', xPercent: 20, yPercent: 30, title: 'Bulb', description: 'LED', images: ['/a.jpg'] },
        ],
      },
      { ...baseRoom, id: 'r2', name: 'Kitchen', panoramaUrl: '/pano/kitchen.jpg' },
    ];
    const m = buildTourManifest(rooms as any);
    const s = manifestSceneToTourScene(rooms[0] as any, m);
    expect(s.initialYaw).toBe(180);
    expect(s.initialPitch).toBe(-10);
    expect(s.hotspots).toHaveLength(2);
    expect(s.hotspots[0]).toMatchObject({ type: 'navigation', targetSceneId: 'r2', targetYaw: 90, title: 'To Kitchen' });
    expect(s.hotspots[1]).toMatchObject({ type: 'info', images: ['/a.jpg'], description: 'LED' });
  });
});

describe('layoutGalaxyNodes', () => {
  it('uses floorPlanX/Y when provided, else deterministic circle', () => {
    const scenes = [
      { id: 'a', name: 'A', thumbnailUrl: '', initialYaw: 0, initialPitch: 0, hotspots: [], floorPlanX: 25, floorPlanY: 40 },
      { id: 'b', name: 'B', thumbnailUrl: '', initialYaw: 0, initialPitch: 0, hotspots: [] },
      { id: 'c', name: 'C', thumbnailUrl: '', initialYaw: 0, initialPitch: 0, hotspots: [] },
    ];
    const nodes = layoutGalaxyNodes(scenes as any, 1000, 600);
    expect(nodes.find((n) => n.id === 'a')).toMatchObject({ x: 250, y: 240 });
    const again = layoutGalaxyNodes(scenes as any, 1000, 600);
    expect(again).toEqual(nodes);
    const noFloor = layoutGalaxyNodes(scenes.slice(1, 3) as any, 1000, 600);
    expect(noFloor).toHaveLength(2);
  });

  it('dedupes undirected edges and skips dangling links', () => {
    const nodes = [
      { id: 'a', x: 0, y: 0, name: 'A', thumbnailUrl: '' },
      { id: 'b', x: 100, y: 0, name: 'B', thumbnailUrl: '' },
    ];
    const edges = layoutGalaxyEdges(nodes as any, [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'a' },
      { from: 'a', to: 'ghost' },
    ]);
    expect(edges).toEqual([{ from: 'a', to: 'b' }]);
  });
});