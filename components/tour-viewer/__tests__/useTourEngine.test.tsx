/**
 * useTourEngine lifecycle tests: viewer creation, lazy scene cache,
 * cross-fade switching, destroy cleanup.
 */
import React, { useRef } from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { useTourEngine } from '@/components/tour-viewer/useTourEngine';
import type { EngineApi } from '@/components/tour-viewer/useTourEngine';
import type { TourScene } from '@/lib/tourClientStore';

jest.mock('marzipano', () => {
  const makeScene = () => {
    const container = {
      createHotspot: jest.fn(() => ({ destroy: jest.fn() })),
      destroyHotspot: jest.fn(),
      listHotspots: jest.fn(() => []),
      domElement: jest.fn(() => document.createElement('div')),
    };
    const viewInstance = {
      yaw: jest.fn((v?: number) => (v == null ? 0 : v)),
      pitch: jest.fn((v?: number) => (v == null ? 0 : v)),
      fov: jest.fn((v?: number) => (v == null ? Math.PI / 2 : v)),
      fovRange: jest.fn(() => [Math.PI / 6, Math.PI]),
      setYaw: jest.fn(),
      setPitch: jest.fn(),
      setFov: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      screenToCoordinates: jest.fn(() => ({ yaw: 0.5, pitch: 0.1 })),
    };
    return {
      switchTo: jest.fn(),
      lookTo: jest.fn(),
      startMovement: jest.fn(),
      stopMovement: jest.fn(),
      hotspotContainer: jest.fn(() => container),
      __container: container,
      view: jest.fn(() => viewInstance),
      __view: viewInstance,
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
    destroyScene = jest.fn();
    scene = jest.fn(() => this.__currentScene);
    destroy = jest.fn();
    lookTo = jest.fn();
    startMovement = jest.fn();
    stopMovement = jest.fn();
    setIdleMovement = jest.fn();
    addEventListener = jest.fn();
    removeEventListener = jest.fn();
  }
  return {
    __viewers: viewers,
    Viewer,
    RectilinearView: class {
      static limit = { traditional: jest.fn(() => ({})) };
    },
    EquirectGeometry: class {},
    ImageUrlSource: {
      fromString: jest.fn(() => ({})),
      fromTileUrl: jest.fn(() => ({})),
    },
    autorotate: jest.fn(() => jest.fn()),
  };
});

const mockedMarzipano: any = jest.requireMock('marzipano');

const makeScene = (id: string): TourScene => ({
  id, name: id, type: '360', url: `https://x/${id}.jpg`, thumbnailUrl: '',
  initialYaw: 0, initialPitch: 0, initialFov: 75, hotspots: [],
  viewConstraints: {
    top: -90, bottom: 90, left: -180, right: 180,
    zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false,
  },
  autorotateEnabled: false, autorotateSpeed: 1,
});

let engine: EngineApi | null = null;
function Harness(props: { scenes: TourScene[]; activeSceneId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  engine = useTourEngine(ref, { scenes: props.scenes, activeSceneId: props.activeSceneId });
  return <div ref={ref} />;
}

const lastScene = () => {
  const viewer = mockedMarzipano.__viewers[0];
  const results = viewer.createScene.mock.results;
  return results[results.length - 1].value;
};

describe('useTourEngine lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedMarzipano.__viewers.length = 0;
    engine = null;
  });

  it('creates the Viewer with mouseViewMode "drag"', async () => {
    render(<Harness scenes={[makeScene('a')]} activeSceneId="a" />);
    await waitFor(() => expect(mockedMarzipano.__viewers.length).toBeGreaterThan(0));
    expect(mockedMarzipano.__viewers[0].opts.controls.mouseViewMode).toBe('drag');
  });

  it('switches the initial scene with Scene#switchTo and transitionDuration 500', async () => {
    render(<Harness scenes={[makeScene('a')]} activeSceneId="a" />);
    await waitFor(() => expect(lastScene().switchTo).toHaveBeenCalled());
    expect(lastScene().switchTo.mock.calls[0][0]).toEqual({ transitionDuration: 500 });
  });

  it('lazy-creates and cross-fades to a new active scene', async () => {
    const { rerender } = render(
      <Harness scenes={[makeScene('a'), makeScene('b')]} activeSceneId="a" />
    );
    await waitFor(() => expect(lastScene().switchTo).toHaveBeenCalled());
    rerender(<Harness scenes={[makeScene('a'), makeScene('b')]} activeSceneId="b" />);
    await waitFor(() => {
      expect(mockedMarzipano.__viewers[0].createScene).toHaveBeenCalledTimes(2);
      const sceneB = mockedMarzipano.__viewers[0].createScene.mock.results[1].value;
      expect(sceneB.switchTo).toHaveBeenCalled();
    });
  });

  it('reuses cached scenes when switching back (no scene recreation)', async () => {
    const { rerender } = render(
      <Harness scenes={[makeScene('a'), makeScene('b')]} activeSceneId="a" />
    );
    await waitFor(() => expect(lastScene().switchTo).toHaveBeenCalled());
    rerender(<Harness scenes={[makeScene('a'), makeScene('b')]} activeSceneId="b" />);
    await waitFor(() => expect(lastScene().switchTo).toHaveBeenCalled());
    rerender(<Harness scenes={[makeScene('a'), makeScene('b')]} activeSceneId="a" />);
    await waitFor(() => {
      const viewer = mockedMarzipano.__viewers[0];
      expect(viewer.createScene).toHaveBeenCalledTimes(2);
      const sceneA = viewer.createScene.mock.results[0].value;
      expect(sceneA.switchTo).toHaveBeenCalledTimes(2); // initial + switch-back (cache hit)
    });
  });

  it('zoomBy clamps fov to the view fov range', async () => {
    render(<Harness scenes={[makeScene('a')]} activeSceneId="a" />);
    await waitFor(() => expect(lastScene().switchTo).toHaveBeenCalled());
    const v = mockedMarzipano.__viewers[0].__currentScene.__view;
    act(() => engine!.zoomBy(10));
    expect(v.fov).toHaveBeenCalledWith(Math.PI);
    act(() => engine!.zoomBy(0.01));
    expect(v.fov).toHaveBeenCalledWith(Math.PI / 6);
  });

  it('exposes screenToCoordinates from the current scene view', async () => {
    render(<Harness scenes={[makeScene('a')]} activeSceneId="a" />);
    await waitFor(() => expect(lastScene().switchTo).toHaveBeenCalled());
    let coords: any = null;
    act(() => { coords = engine!.screenToCoordinates(10, 20); });
    expect(coords).toEqual({ yaw: 0.5, pitch: 0.1 });
  });

  it('destroys scenes and the viewer on unmount without throwing', async () => {
    const { unmount } = render(
      <Harness scenes={[makeScene('a'), makeScene('b')]} activeSceneId="a" />
    );
    await waitFor(() => expect(lastScene().switchTo).toHaveBeenCalled());
    expect(() => unmount()).not.toThrow();
    expect(mockedMarzipano.__viewers[0].destroy).toHaveBeenCalled();
  });
});
