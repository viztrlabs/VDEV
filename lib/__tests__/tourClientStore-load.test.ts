/**
 * tourClientStore load normalization tests: setScenes is the single
 * normalization choke point for rooms loaded from the API.
 */
import { useTourStore, normalizeLoadedRoom } from '@/lib/tourClientStore';

describe('tourClientStore load normalization', () => {
  beforeEach(() => {
    useTourStore.setState({ scenes: [], currentSceneId: '' } as any);
  });

  it('maps panoramaUrl to url for legacy saved rooms', () => {
    useTourStore.getState().setScenes([
      { id: 'r1', name: 'Lobby', panoramaUrl: 'https://x/p.jpg' } as any,
    ]);
    const sc = useTourStore.getState().scenes[0] as any;
    expect(sc.url).toBe('https://x/p.jpg');
    expect(sc.panoramaUrl).toBe('https://x/p.jpg');
  });

  it('keeps unknown API fields on loaded rooms (spreads them through)', () => {
    useTourStore.getState().setScenes([
      {
        id: 'r1', name: 'Lobby', url: 'https://x/p.jpg',
        tileUrl: 'https://x/tiles', autorotateEnabled: false, autorotateSpeed: 1,
      } as any,
    ]);
    const sc = useTourStore.getState().scenes[0] as any;
    expect(sc.tileUrl).toBe('https://x/tiles');
    expect(sc.autorotateEnabled).toBe(false);
    expect(sc.autorotateSpeed).toBe(1);
  });

  it('keeps legacy defaultHotspots when canonical hotspots is empty', () => {
    useTourStore.getState().setScenes([
      {
        id: 'r1', name: 'Lobby', url: 'https://x/p.jpg',
        defaultHotspots: [{ id: 'h1', type: 'room_link', title: 'L' }],
      } as any,
    ]);
    const sc = useTourStore.getState().scenes[0] as any;
    expect(sc.hotspots).toHaveLength(1);
    expect(sc.hotspots[0].id).toBe('h1');
  });

  it('sets currentSceneId to the first loaded room', () => {
    useTourStore.getState().setScenes([
      { id: 'r1', name: 'A' } as any,
      { id: 'r2', name: 'B' } as any,
    ]);
    expect(useTourStore.getState().currentSceneId).toBe('r1');
  });

  it('normalizeLoadedRoom handles null/undefined rooms defensively', () => {
    expect(normalizeLoadedRoom(null).url).toBe('');
    expect(normalizeLoadedRoom(undefined).hotspots).toEqual([]);
  });
});
