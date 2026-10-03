import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { InspectorPanel } from '@/components/tour-builder/InspectorPanel';
import { useTourStore } from '@/lib/tourClientStore';
import type { TourScene } from '@/lib/tourClientStore';

const scene: TourScene = {
  id: 'r1', name: 'Lobby', type: '360', url: 'https://x/pano.jpg', thumbnailUrl: '',
  initialYaw: 10, initialPitch: 5, initialFov: 75,
  hotspots: [{ id: 'h1', yaw: 0, pitch: 0, type: 'info', title: 'Sign', description: '' }],
  viewConstraints: {
    top: -90, bottom: 90, left: -180, right: 180,
    zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false,
  },
  autorotateEnabled: false, autorotateSpeed: 1,
};

describe('InspectorPanel room-only (hotspot settings moved to viewport popover)', () => {
  beforeEach(() => {
    useTourStore.setState({ scenes: [scene] } as any);
  });

  it('renders the ROOM panel even when the store has hotspots', () => {
    render(<InspectorPanel roomId="r1" />);
    expect(screen.getByText('ROOM')).toBeInTheDocument();
    expect(screen.queryByText('HOTSPOT')).not.toBeInTheDocument();
    expect(screen.queryByText('Reset Position')).not.toBeInTheDocument();
    expect(screen.queryByText('Direction')).not.toBeInTheDocument();
  });

  it('still exposes room hotspot count in the Hotspots section', () => {
    render(<InspectorPanel roomId="r1" />);
    fireEvent.click(screen.getByText('Hotspots'));
    expect(screen.getByText('1 hotspots')).toBeInTheDocument();
  });
});
