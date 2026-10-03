import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PanoramaViewport } from '@/components/tour-builder/PanoramaViewport';
import { useTourStore } from '@/lib/tourClientStore';

jest.mock('marzipano', () => {
  const makeScene = () => ({
    switchTo: jest.fn((_opts: unknown, done?: () => void) => {
      done?.();
    }),
    lookTo: jest.fn(),
    stopMovement: jest.fn(),
    view: jest.fn(() => ({
      yaw: jest.fn((v?: number) => (v == null ? 0 : v)),
      pitch: jest.fn((v?: number) => (v == null ? 0 : v)),
      fov: jest.fn((v?: number) => (v == null ? Math.PI / 2 : v)),
      setYaw: jest.fn(),
      setPitch: jest.fn(),
      setFov: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      screenToCoordinates: jest.fn(() => ({ yaw: 0.5, pitch: 0.1 })),
      coordinatesToScreen: jest.fn(() => ({ x: 10, y: 10 })),
    })),
    hotspotContainer: jest.fn(() => ({
      createHotspot: jest.fn(() => ({ destroy: jest.fn() })),
      destroyHotspot: jest.fn(),
      listHotspots: jest.fn(() => []),
      domElement: jest.fn(() => document.createElement('div')),
    })),
  });
  const viewers: any[] = [];
  class Viewer {
    __currentScene: any = null;
    constructor(el: HTMLElement) {
      el.appendChild(document.createElement('canvas'));
      viewers.push(this);
    }
    createScene = jest.fn(() => {
      const s = makeScene();
      this.__currentScene = s;
      return s;
    });
    scene = jest.fn(() => this.__currentScene);
    destroy = jest.fn();
    stopMovement = jest.fn();
    addEventListener = jest.fn();
    removeEventListener = jest.fn();
    setIdleMovement = jest.fn();
    startMovement = jest.fn();
    lookTo = jest.fn();
    controls = jest.fn(() => ({ registerMethod: jest.fn(), enableMethod: jest.fn(), disableMethod: jest.fn() }));
  }
  return {
    __viewers: viewers,
    Viewer,
    RectilinearView: class {
      static limit: { traditional: (w: number, f?: number, g?: number) => unknown } =
        { traditional: jest.fn(() => ({})) as any };
    },
    EquirectGeometry: class {},
    ImageUrlSource: { fromString: jest.fn(() => ({})) },
  };
});

const mockedMarzipano: any = jest.requireMock('marzipano');

const room = {
  id: 'r1', name: 'Lobby', url: 'https://x/pano.jpg',
  initialYaw: 0, initialPitch: 0, initialFov: 75,
  hotspots: [
    { id: 'h1', yaw: 0, pitch: 0, type: 'info', title: 'Sign', description: '', rotation: 30 },
    { id: 'h2', yaw: 0, pitch: 0, type: 'navigation', title: 'Door', description: '', targetSceneId: 'r2' },
  ],
};

describe('PanoramaViewport marker badge + rotation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedMarzipano.__viewers.length = 0;
    useTourStore.setState({ scenes: [JSON.parse(JSON.stringify(room))] } as any);
  });

  it('shows zero-padded per-room indices next to each marker', async () => {
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await waitFor(() => expect(mockedMarzipano.__viewers.length).toBeGreaterThan(0));
    expect(await screen.findByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
  });

  it('applies rotation to the marker icon circle', async () => {
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await waitFor(() => expect(mockedMarzipano.__viewers.length).toBeGreaterThan(0));
    const badge = await screen.findByText('01');
    const circle = badge.previousElementSibling as HTMLElement;
    expect(circle.style.transform).toBe('rotate(30deg)');
  });

  it('uses rotate(0deg) when rotation is absent', async () => {
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await waitFor(() => expect(mockedMarzipano.__viewers.length).toBeGreaterThan(0));
    const badge = await screen.findByText('02');
    const circle = badge.previousElementSibling as HTMLElement;
    expect(circle.style.transform).toBe('rotate(0deg)');
  });
});

