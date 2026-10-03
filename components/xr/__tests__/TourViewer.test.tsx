/**
 * TourViewer baseline regression tests.
 * Guards the Marzipano 0.10.2 API surface: mouseViewMode 'drag',
 * Scene#switchTo (not #switch), HotspotContainer#createHotspot (not #create).
 * These assertions must survive the Task 13 rewire onto useTourEngine.
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import TourViewer from '@/components/xr/TourViewer';
import type { TourScene } from '@/lib/tourClientStore';

jest.mock('marzipano', () => {
  const makeContainer = () => {
    const hotspots: any[] = [];
    return {
      createHotspot: jest.fn((el: HTMLElement) => {
        const h = { destroy: jest.fn() };
        hotspots.push(h);
        return h;
      }),
      destroyHotspot: jest.fn((h: any) => {
        const i = hotspots.indexOf(h);
        if (i >= 0) hotspots.splice(i, 1);
      }),
      listHotspots: jest.fn(() => [...hotspots]),
      domElement: jest.fn(() => document.createElement('div')),
    };
  };
  const makeScene = () => {
    const container = makeContainer();
    return {
      switchTo: jest.fn((_opts?: unknown, done?: () => void) => { done?.(); }),
      lookTo: jest.fn(),
      stopMovement: jest.fn(),
      hotspotContainer: jest.fn(() => container),
      __container: container,
      view: jest.fn(() => ({
        yaw: jest.fn((v?: number) => (v == null ? 0 : v)),
        pitch: jest.fn((v?: number) => (v == null ? 0 : v)),
        fov: jest.fn((v?: number) => (v == null ? Math.PI / 2 : v)),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
      destroy: jest.fn(),
    };
  };
  const viewers: any[] = [];
  class Viewer {
    opts: any;
    __currentScene: any = null;
    constructor(el: HTMLElement, opts: any) {
      this.opts = opts;
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
    ImageUrlSource: {
      fromString: jest.fn(() => ({})),
    },
  };
});

const mockedMarzipano: any = jest.requireMock('marzipano');

const scene: TourScene = {
  id: 's1',
  name: 'Living Room',
  type: '360',
  url: 'https://x/pano.jpg',
  thumbnailUrl: '',
  initialYaw: 0,
  initialPitch: 0,
  initialFov: 75,
  hotspots: [
    { id: 'h1', yaw: Math.PI / 4, pitch: 0, type: 'navigation', title: 'Door', description: '' },
  ],
  viewConstraints: {
    top: -90, bottom: 90, left: -180, right: 180,
    zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false,
  },
  autorotateEnabled: false,
  autorotateSpeed: 1,
};

const waitForReady = () =>
  waitFor(() => {
    expect(mockedMarzipano.__viewers.length).toBeGreaterThan(0);
    expect(mockedMarzipano.__viewers[0].createScene).toHaveBeenCalled();
  });

describe('TourViewer Marzipano baseline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedMarzipano.__viewers.length = 0;
  });

  it('uses mouseViewMode "drag" (qtilt throws in Marzipano 0.10.2)', async () => {
    render(<TourViewer scene={scene} />);
    await waitForReady();
    expect(mockedMarzipano.__viewers[0].opts.controls.mouseViewMode).toBe('drag');
  });

  it('switches the first scene with Scene#switchTo and transitionDuration', async () => {
    render(<TourViewer scene={scene} />);
    await waitForReady();
    const ms = mockedMarzipano.__viewers[0].createScene.mock.results[0].value;
    expect(ms.switchTo).toHaveBeenCalled();
    expect(ms.switchTo.mock.calls[0][0]).toEqual({ transitionDuration: 500 });
  });

  it('creates hotspots via HotspotContainer#createHotspot with ARIA + radian coords', async () => {
    render(<TourViewer scene={scene} />);
    await waitForReady();
    const ms = mockedMarzipano.__viewers[0].createScene.mock.results[0].value;
    await waitFor(() => expect(ms.__container.createHotspot).toHaveBeenCalledTimes(1));
    const [el, coords] = ms.__container.createHotspot.mock.calls[0];
    expect((el as HTMLElement).getAttribute('role')).toBe('button');
    expect((el as HTMLElement).getAttribute('aria-label')).toContain('Door');
    expect(coords).toEqual({ yaw: Math.PI / 4, pitch: 0 });
  });

  it('destroys hotspots and the viewer on unmount without throwing', async () => {
    const { unmount } = render(<TourViewer scene={scene} />);
    await waitForReady();
    expect(() => unmount()).not.toThrow();
  });
});
