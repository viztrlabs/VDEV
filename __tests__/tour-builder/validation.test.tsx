import { render, screen } from '@testing-library/react';
import { ValidationPanel } from '@/components/tour-builder/ValidationPanel';
import { useTourStore } from '@/lib/tourClientStore';

describe('ValidationPanel', () => {
  beforeEach(() => {
    useTourStore.getState().setScenes([]);
  });

  it('shows error for empty tour', () => {
    render(<ValidationPanel />);
    expect(screen.getByText('1 errors')).toBeInTheDocument();
  });

  it('shows warning for single room', () => {
    useTourStore.getState().setScenes([
      {
        id: 'room-1',
        name: 'Living Room',
        type: '360',
        url: 'https://example.com/panorama.jpg',
        thumbnailUrl: '',
        initialYaw: 0,
        initialPitch: 0,
        initialFov: 75,
        hotspots: [],
      } as any,
    ]);

    render(<ValidationPanel />);
    expect(screen.getByText('1 warnings')).toBeInTheDocument();
  });

  it('shows error for room without panorama', () => {
    useTourStore.getState().setScenes([
      {
        id: 'room-1',
        name: 'Living Room',
        type: '360',
        url: '',
        thumbnailUrl: '',
        initialYaw: 0,
        initialPitch: 0,
        initialFov: 75,
        hotspots: [],
      } as any,
    ]);

    render(<ValidationPanel />);
    expect(screen.getByText(/has no panorama/)).toBeInTheDocument();
  });

  it('shows error for navigation hotspot without target', () => {
    useTourStore.getState().setScenes([
      {
        id: 'room-1',
        name: 'Living Room',
        type: '360',
        url: 'https://example.com/panorama.jpg',
        thumbnailUrl: '',
        initialYaw: 0,
        initialPitch: 0,
        initialFov: 75,
        hotspots: [
          {
            id: 'hs-1',
            type: 'link',
            title: 'Go to Kitchen',
            yaw: 0,
            pitch: 0,
          },
        ],
      } as any,
    ]);

    render(<ValidationPanel />);
    expect(screen.getByText(/has no destination/)).toBeInTheDocument();
  });

  it('shows success when tour is valid', () => {
    useTourStore.getState().setScenes([
      {
        id: 'room-1',
        name: 'Living Room',
        type: '360',
        url: 'https://example.com/panorama.jpg',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        initialYaw: 0,
        initialPitch: 0,
        initialFov: 75,
        hotspots: [],
      },
      {
        id: 'room-2',
        name: 'Kitchen',
        type: '360',
        url: 'https://example.com/panorama2.jpg',
        thumbnailUrl: 'https://example.com/thumb2.jpg',
        initialYaw: 0,
        initialPitch: 0,
        initialFov: 75,
        hotspots: [
          {
            id: 'hs-1',
            type: 'link',
            title: 'Go to Living Room',
            targetSceneId: 'room-1',
            yaw: 0,
            pitch: 0,
          },
        ],
      },
    ] as any);

    // Add a link from room-1 to room-2
    const scenes = useTourStore.getState().scenes;
    useTourStore.getState().updateScene('room-1', {
      hotspots: [
        {
          id: 'hs-2',
          type: 'link',
          title: 'Go to Kitchen',
          targetSceneId: 'room-2',
          yaw: 0,
          pitch: 0,
        },
      ],
    });

    render(<ValidationPanel />);
    expect(screen.getByText('0 errors')).toBeInTheDocument();
  });
});
