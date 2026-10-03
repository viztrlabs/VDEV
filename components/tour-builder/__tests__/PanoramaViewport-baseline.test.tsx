/**
 * PanoramaViewport Marzipano baseline: scene switch must use Scene#switchTo.
 * The old ms.switch() threw -> "Failed to load panorama".
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PanoramaViewport } from '@/components/tour-builder/PanoramaViewport';
import { useTourStore } from '@/lib/tourClientStore';

jest.mock('marzipano', () => {
  const makeScene = () => ({
    switchTo: jest.fn(),
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
  initialYaw: 0, initialPitch: 0, initialFov: 75, hotspots: [],
};

describe('PanoramaViewport Marzipano baseline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedMarzipano.__viewers.length = 0;
    useTourStore.setState({ scenes: [room] } as any);
  });

  it('initializes Marzipano and switches the scene with Scene#switchTo', async () => {
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await waitFor(() => expect(mockedMarzipano.__viewers.length).toBeGreaterThan(0));
    await waitFor(() => {
      const viewer = mockedMarzipano.__viewers[0];
      expect(viewer.createScene).toHaveBeenCalled();
      const ms = viewer.createScene.mock.results[0].value;
      expect(ms.switchTo.mock.calls[0][0]).toEqual({ transitionDuration: 300 });
    });
  });

  it('renders no error banner for a room with a valid url', async () => {
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await waitFor(() => expect(mockedMarzipano.__viewers.length).toBeGreaterThan(0));
    expect(screen.queryByText('Failed to load panorama')).not.toBeInTheDocument();
  });
});
