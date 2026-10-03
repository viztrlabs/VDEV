/**
 * InspectorPanel hotspot position fields must convert deg (display) <-> rad
 * (store). TourHotspot.yaw/pitch are stored in radians.
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { InspectorPanel } from '@/components/tour-builder/InspectorPanel';
import { useTourStore } from '@/lib/tourClientStore';
import type { TourScene } from '@/lib/tourClientStore';

const scene: TourScene = {
  id: 'r1', name: 'Lobby', type: '360', url: 'https://x/pano.jpg', thumbnailUrl: '',
  initialYaw: 10, initialPitch: 5, initialFov: 75,
  hotspots: [{ id: 'h1', yaw: Math.PI / 4, pitch: 0, type: 'info', title: 'Sign', description: '' }],
  viewConstraints: {
    top: -90, bottom: 90, left: -180, right: 180,
    zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false,
  },
  autorotateEnabled: false, autorotateSpeed: 1,
};

describe('InspectorPanel hotspot position', () => {
  beforeEach(() => {
    useTourStore.setState({ scenes: [scene] } as any);
  });

  it('shows the stored radian yaw as degrees', () => {
    render(<InspectorPanel roomId="r1" hotspotId="h1" />);
    const yawInput = screen.getAllByRole('spinbutton')
      .find((el) => (el as HTMLInputElement).value === '45');
    expect(yawInput).toBeTruthy();
  });

  it('writes radians back to the store when editing in degrees', () => {
    render(<InspectorPanel roomId="r1" hotspotId="h1" />);
    const yawInput = screen.getAllByRole('spinbutton')
      .find((el) => (el as HTMLInputElement).value === '45');
    fireEvent.change(yawInput!, { target: { value: '90' } });
    const hs = useTourStore.getState().scenes.find((s) => s.id === 'r1')!.hotspots[0];
    expect(hs.yaw).toBeCloseTo(Math.PI / 2, 5);
  });

  it('Reset Position sets yaw and pitch to 0', () => {
    render(<InspectorPanel roomId="r1" hotspotId="h1" />);
    fireEvent.click(screen.getByText('Reset Position'));
    const hs = useTourStore.getState().scenes.find((s) => s.id === 'r1')!.hotspots[0];
    expect(hs.yaw).toBe(0);
    expect(hs.pitch).toBe(0);
  });
});
