/**
 * PanoramaPreview hotspot anchoring tests.
 *
 * Hotspots are stored in equirect IMAGE coordinates (xPercent/yPercent of the
 * flat 360 image — see lib/marzipano/coords.ts) and must be PROJECTED to
 * screen pixels for display, so they stay glued to the scene as the camera
 * rotates. Placement clicks must be UNPROJECTED the same way so the stored
 * coordinates match the world position the artist clicked.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PanoramaPreview from '@/components/editor/PanoramaPreview';
import { yawPitchToXYPercents } from '@/lib/marzipano/coords';

jest.mock('marzipano', () => {
  const listeners: Array<() => void> = [];
  const view = {
    yaw: jest.fn(),
    pitch: jest.fn(),
    fov: jest.fn(() => Math.PI / 2),
    addEventListener: jest.fn((ev: string, cb: () => void) => {
      if (ev === 'change') listeners.push(cb);
    }),
    screenToCoordinates: jest.fn(() => [Math.PI, 0]),
    coordinatesToScreen: jest.fn(() => [123, 45]),
  };
  class Viewer {
    destroy = jest.fn();
    createScene = jest.fn(() => ({ switchTo: jest.fn() }));
    constructor() {}
  }
  class RectilinearView {
    constructor() {
      return view as unknown as RectilinearView;
    }
    static limit = { traditional: jest.fn(() => ({})) };
  }
  return {
    __view: view,
    __listeners: listeners,
    Viewer,
    RectilinearView,
    EquirectGeometry: class {},
    ImageUrlSource: { fromString: jest.fn(() => ({})) },
  };
});

const mockedMarzipano: any = jest.requireMock('marzipano');

const baseRect = {
  left: 0,
  top: 0,
  width: 800,
  height: 400,
  right: 800,
  bottom: 400,
  x: 0,
  y: 0,
  toJSON: () => ({}),
};

let origGetBCR: typeof Element.prototype.getBoundingClientRect;
beforeAll(() => {
  origGetBCR = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = () => baseRect as DOMRect;
});
afterAll(() => {
  Element.prototype.getBoundingClientRect = origGetBCR;
});

const hotspot = {
  id: 'h1',
  xPercent: 100,
  yPercent: 50,
  title: 'Door',
  type: 'room_link' as const,
};

const waitForReady = async () => {
  await waitFor(() => {
    expect(screen.getByTitle('Door')).toBeInTheDocument();
  });
};

describe('PanoramaPreview hotspot anchoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedMarzipano.__listeners.length = 0;
    mockedMarzipano.__view.coordinatesToScreen.mockReturnValue([123, 45]);
    mockedMarzipano.__view.screenToCoordinates.mockReturnValue([Math.PI, 0]);
  });

  it('positions markers from sphere projection (pixels), not screen percents', async () => {
    render(<PanoramaPreview panoramaUrl="https://x/pano.jpg" hotspots={[hotspot]} />);
    const marker = await screen.findByTitle('Door');
    expect(marker.style.left).toBe('123px');
    expect(marker.style.top).toBe('45px');
  });

  it('repositions markers when the camera view changes', async () => {
    render(<PanoramaPreview panoramaUrl="https://x/pano.jpg" hotspots={[hotspot]} />);
    await waitForReady();

    mockedMarzipano.__view.coordinatesToScreen.mockReturnValue([77, 33]);
    actListeners(mockedMarzipano.__listeners);

    await waitFor(() => {
      expect(screen.getByTitle('Door').style.left).toBe('77px');
      expect(screen.getByTitle('Door').style.top).toBe('33px');
    });
  });

  it('hides markers that are behind the camera', async () => {
    mockedMarzipano.__view.coordinatesToScreen.mockReturnValue(null);
    render(<PanoramaPreview panoramaUrl="https://x/pano.jpg" hotspots={[hotspot]} />);
    // No marker should ever appear — coordinatesToScreen is always null.
    await waitFor(() => {
      expect(mockedMarzipano.__view.coordinatesToScreen).toHaveBeenCalled();
    });
    expect(screen.queryByTitle('Door')).not.toBeInTheDocument();
  });

  it('places new hotspots at the clicked WORLD position (unprojected), not screen percent', async () => {
    const onRequestAddHotspot = jest.fn();
    const { container } = render(
      <PanoramaPreview
        panoramaUrl="https://x/pano.jpg"
        hotspots={[]}
        addMode
        onRequestAddHotspot={onRequestAddHotspot}
      />,
    );
    const marzipanoContainer = container.querySelector('div.bg-black')!;
    expect(marzipanoContainer).toBeTruthy();

    // Wait for the async Marzipano init to finish (loading overlay gone).
    await waitFor(() => {
      expect(screen.queryByText('Initializing 360° viewer…')).not.toBeInTheDocument();
    });

    // Click at screen (400, 200) — screenToCoordinates mock says that is
    // yaw = π, pitch = 0 → equirect image (100, 50). Screen-percent storage
    // (the old bug) would store (50, 50) instead.
    fireEvent.click(marzipanoContainer, { clientX: 400, clientY: 200 });
    expect(onRequestAddHotspot).toHaveBeenCalledWith(100, 50);
  });

  it('persists equirect coords while dragging a marker', async () => {
    mockedMarzipano.__view.screenToCoordinates.mockReturnValue([0.5, -0.1]);
    const onHotspotPositionChange = jest.fn();
    render(
      <PanoramaPreview
        panoramaUrl="https://x/pano.jpg"
        hotspots={[hotspot]}
        onHotspotPositionChange={onHotspotPositionChange}
      />,
    );
    const marker = await screen.findByTitle('Door');

    fireEvent.pointerDown(marker, { pointerId: 1, clientX: 123, clientY: 45 });
    fireEvent.pointerMove(marker, { pointerId: 1, clientX: 600, clientY: 300 });

    const expected = yawPitchToXYPercents(0.5, -0.1);
    expect(onHotspotPositionChange).toHaveBeenCalledWith(
      'h1',
      Math.round(expected.x * 10) / 10,
      Math.round(expected.y * 10) / 10,
    );
  });
});

function actListeners(listeners: Array<() => void>) {
  for (const cb of listeners) cb();
}