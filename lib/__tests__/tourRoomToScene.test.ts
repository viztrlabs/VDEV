import { tourRoomToScene } from '@/lib/tourRoomToScene';

const baseRoom = {
  id: 'room-1',
  name: 'Grand Salon',
  subtitle: 'Penthouse',
  panoramaUrl: '/panoramas/salon.jpg',
  thumbnailUrl: '/panoramas/salon-thumb.jpg',
  initialYaw: 0,
  initialPitch: 0,
  defaultHotspots: [
    {
      id: 'hp-info',
      xPercent: 75,
      yPercent: 50,
      title: 'Marble Details',
      type: 'metadata',
      icon: 'palette',
    },
    {
      id: 'hp-link',
      xPercent: 50,
      yPercent: 50,
      title: 'To Kitchen',
      type: 'room_link',
      targetRoomId: 'room-2',
    },
  ],
};

describe('tourRoomToScene', () => {
  it('maps panoramaUrl to scene url with type 360', () => {
    const scene = tourRoomToScene(baseRoom);
    expect(scene.id).toBe('room-1');
    expect(scene.name).toBe('Grand Salon');
    expect(scene.type).toBe('360');
    expect(scene.url).toBe('/panoramas/salon.jpg');
    expect(scene.thumbnail).toBe('/panoramas/salon-thumb.jpg');
  });

  it('falls back to a plain url field when panoramaUrl is absent', () => {
    const scene = tourRoomToScene({ ...baseRoom, panoramaUrl: undefined, url: '/alt.jpg' } as any);
    expect(scene.url).toBe('/alt.jpg');
  });

  it('converts xPercent/yPercent to yaw/pitch (75,50) -> +PI/2', () => {
    const scene = tourRoomToScene(baseRoom);
    const hp = scene.hotspots.find((h) => h.id === 'hp-info');
    expect(hp).toBeDefined();
    const pos = hp!.position as { yaw: number; pitch: number };
    expect(pos.yaw).toBeCloseTo(Math.PI / 2, 6);
    expect(pos.pitch).toBeCloseTo(0, 6);
  });

  it('maps room_link hotspots to teleport actions targeting the target room', () => {
    const scene = tourRoomToScene(baseRoom);
    const hp = scene.hotspots.find((h) => h.id === 'hp-link');
    expect(hp).toBeDefined();
    expect(hp!.action).toBe('teleport');
    expect(hp!.target).toBe('room-2');
    expect(hp!.title).toBe('To Kitchen');
  });

  it('maps non-navigation hotspots to open_info', () => {
    const scene = tourRoomToScene(baseRoom);
    const hp = scene.hotspots.find((h) => h.id === 'hp-info');
    expect(hp!.action).toBe('open_info');
    expect(hp!.icon).toBe('palette');
  });

  it('carries title, annotations and teleportPoints scaffolding', () => {
    const scene = tourRoomToScene(baseRoom);
    expect(scene.annotations).toEqual([]);
    expect(scene.teleportPoints).toEqual([]);
    const link = scene.hotspots.find((h) => h.id === 'hp-link');
    expect(link!.title).toBe('To Kitchen');
  });

  it('preloads sibling scene urls when given the full room list', () => {
    const scene = tourRoomToScene(baseRoom, {
      rooms: [baseRoom as any, { ...baseRoom, id: 'room-2', name: 'Kitchen', panoramaUrl: '/panoramas/kitchen.jpg' }],
    });
    expect(scene.preload).toEqual(['/panoramas/kitchen.jpg']);
  });
});