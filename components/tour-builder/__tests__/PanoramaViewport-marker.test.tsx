import React, { useState, useEffect } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

function ViewportHarness({
  roomId = 'r1',
  selectedHotspotId = '',
  onSelectHotspot,
  onNavigateToRoom,
}: {
  roomId?: string;
  selectedHotspotId?: string;
  onSelectHotspot?: (id: string) => void;
  onNavigateToRoom?: (roomId: string) => void;
}) {
  const [sel, setSel] = useState(selectedHotspotId);
  useEffect(() => {
    setSel(selectedHotspotId);
  }, [selectedHotspotId]);
  return (
    <PanoramaViewport
      roomId={roomId}
      activeTool="select"
      selectedHotspotId={sel}
      onSelectHotspot={(id) => {
        onSelectHotspot?.(id);
        setSel(id);
      }}
      onNavigateToRoom={onNavigateToRoom}
    />
  );
}

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

describe('PanoramaViewport radial + popover integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedMarzipano.__viewers.length = 0;
    useTourStore.setState({ scenes: [JSON.parse(JSON.stringify(room))] } as any);
  });

  const ready = async () => {
    await waitFor(() => expect(mockedMarzipano.__viewers.length).toBeGreaterThan(0));
  };

  it('opens the radial menu when a marker is clicked', async () => {
    const onSelect = jest.fn();
    render(<ViewportHarness onSelectHotspot={onSelect} />);
    await ready();
    fireEvent.click(await screen.findByText('01'));
    expect(onSelect).toHaveBeenCalledWith('h1');
    expect(screen.getByLabelText('Edit hotspot')).toBeInTheDocument();
  });

  it('Enter is disabled for h1 (no target) and navigates for h2', async () => {
    const onNav = jest.fn();
    render(
      <ViewportHarness onSelectHotspot={jest.fn()} onNavigateToRoom={onNav} />
    );
    await ready();
    fireEvent.click(await screen.findByText('01'));
    expect(screen.getByLabelText('Enter target room')).toBeDisabled();
    fireEvent.click(screen.getByTestId('hotspot-radial-backdrop'));
    fireEvent.click(screen.getByText('02'));
    const enter = screen.getByLabelText('Enter target room');
    expect(enter).not.toBeDisabled();
    fireEvent.click(enter);
    expect(onNav).toHaveBeenCalledWith('r2');
  });

  it('Edit opens the settings popover with the form', async () => {
    render(<ViewportHarness onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.click(await screen.findByText('01'));
    fireEvent.click(screen.getByLabelText('Edit hotspot'));
    expect(await screen.findByText('Reset Position')).toBeInTheDocument();
    expect(screen.queryByLabelText('Edit hotspot')).not.toBeInTheDocument();
  });

  it('Delete removes the hotspot and clears selection', async () => {
    const onSelect = jest.fn();
    render(<ViewportHarness onSelectHotspot={onSelect} />);
    await ready();
    fireEvent.click(await screen.findByText('01'));
    fireEvent.click(screen.getByLabelText('Delete hotspot'));
    expect(useTourStore.getState().scenes[0].hotspots).toHaveLength(1);
    expect(onSelect).toHaveBeenLastCalledWith('');
  });

  it('backdrop click closes the radial menu', async () => {
    render(<ViewportHarness onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.click(await screen.findByText('01'));
    expect(screen.getByLabelText('Edit hotspot')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('hotspot-radial-backdrop'));
    expect(screen.queryByLabelText('Edit hotspot')).not.toBeInTheDocument();
  });

  it('closes overlays when the room changes', async () => {
    const view = render(<ViewportHarness onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.click(await screen.findByText('01'));
    expect(screen.getByLabelText('Edit hotspot')).toBeInTheDocument();
    useTourStore.setState({
      scenes: [
        JSON.parse(JSON.stringify(room)),
        { ...JSON.parse(JSON.stringify(room)), id: 'r2', name: 'Other', hotspots: [] },
      ],
    } as any);
    view.rerender(<ViewportHarness roomId="r2" onSelectHotspot={jest.fn()} />);
    expect(screen.queryByLabelText('Edit hotspot')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hotspot-popover-backdrop')).not.toBeInTheDocument();
  });

  it('double-clicking a marker opens the popover directly', async () => {
    render(<ViewportHarness onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.doubleClick(await screen.findByText('01'));
    expect(await screen.findByText('Reset Position')).toBeInTheDocument();
  });

  it('closes the popover when selection is cleared (keyboard-D delete path)', async () => {
    const view = render(<ViewportHarness selectedHotspotId="h1" onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.click(await screen.findByText('01'));
    fireEvent.click(screen.getByLabelText('Edit hotspot'));
    expect(await screen.findByText('Reset Position')).toBeInTheDocument();
    view.rerender(<ViewportHarness selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    expect(screen.queryByText('Reset Position')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hotspot-popover-backdrop')).not.toBeInTheDocument();
  });
});

describe('PanoramaViewport rotate mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedMarzipano.__viewers.length = 0;
    useTourStore.setState({ scenes: [JSON.parse(JSON.stringify(room))] } as any);
  });

  const ready = async () => {
    await waitFor(() => expect(mockedMarzipano.__viewers.length).toBeGreaterThan(0));
  };

  const storeHotspot = (id: string) =>
    useTourStore.getState().scenes[0].hotspots.find((h) => h.id === id)!;

  it('arming Rotate shows the degree readout chip', async () => {
    render(<ViewportHarness onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.click(await screen.findByText('01'));
    fireEvent.click(screen.getByLabelText('Rotate hotspot'));
    expect(screen.getByText('30°')).toBeInTheDocument();
    expect(screen.queryByLabelText('Rotate hotspot')).not.toBeInTheDocument();
  });

  it('dragging the marker horizontally updates rotation (start + dx * 0.75)', async () => {
    render(<ViewportHarness onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.click(await screen.findByText('01'));
    fireEvent.click(screen.getByLabelText('Rotate hotspot'));
    fireEvent.mouseDown(screen.getByText('01'), { clientX: 100 });
    fireEvent.mouseMove(window, { clientX: 180 });
    expect(storeHotspot('h1').rotation).toBe(30);
    fireEvent.mouseUp(window);
    expect(storeHotspot('h1').rotation).toBe(90);
  });

  it('normalizes rotation into 0-360', async () => {
    render(<ViewportHarness onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.click(await screen.findByText('01'));
    fireEvent.click(screen.getByLabelText('Rotate hotspot'));
    fireEvent.mouseDown(screen.getByText('01'), { clientX: 100 });
    fireEvent.mouseMove(window, { clientX: -400 });
    expect(storeHotspot('h1').rotation).toBe(30);
    fireEvent.mouseUp(window);
    expect(storeHotspot('h1').rotation).toBeGreaterThanOrEqual(0);
    expect(storeHotspot('h1').rotation).toBeLessThan(360);
  });

  it('Escape exits rotate mode', async () => {
    render(<ViewportHarness onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.click(await screen.findByText('01'));
    fireEvent.click(screen.getByLabelText('Rotate hotspot'));
    expect(screen.getByText('30°')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText('30°')).not.toBeInTheDocument();
  });
});

