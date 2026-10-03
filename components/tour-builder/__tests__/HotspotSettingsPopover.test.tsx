import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { HotspotSettingsPopover } from '@/components/tour-builder/HotspotSettingsPopover';
import { useTourStore } from '@/lib/tourClientStore';
import type { TourScene, TourHotspot } from '@/lib/tourClientStore';

const scene: TourScene = {
  id: 'r1', name: 'Lobby', type: '360', url: 'https://x/pano.jpg', thumbnailUrl: '',
  initialYaw: 0, initialPitch: 0, initialFov: 75,
  hotspots: [{ id: 'h1', yaw: 0, pitch: 0, type: 'info', title: 'Sign', description: '' }],
  viewConstraints: {
    top: -90, bottom: 90, left: -180, right: 180,
    zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false,
  },
  autorotateEnabled: false, autorotateSpeed: 1,
};

const hotspot = (): TourHotspot => useTourStore.getState().scenes[0].hotspots[0];

const setup = (over: Partial<Parameters<typeof HotspotSettingsPopover>[0]> = {}) => {
  useTourStore.setState({ scenes: [JSON.parse(JSON.stringify(scene))] } as any);
  const onClose = jest.fn();
  const base = {
    x: 200, y: 150, badge: '03', roomId: 'r1',
    hotspot: hotspot(),
    viewport: { width: 1200, height: 800 },
    onUpdate: (patch: Partial<TourHotspot>) =>
      useTourStore.getState().updateHotspot('r1', 'h1', patch),
    onClose,
  };
  render(<HotspotSettingsPopover {...base} {...over} />);
  return onClose;
};

describe('HotspotSettingsPopover', () => {
  it('renders the extracted hotspot form with the badge number', () => {
    setup();
    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText('Reset Position')).toBeInTheDocument();
    expect(screen.getByText('Sign')).toBeInTheDocument();
  });

  it('edits flow into the store through onUpdate', () => {
    setup();
    const yawInput = screen.getAllByRole('spinbutton')
      .find((el) => (el as HTMLInputElement).value === '0');
    fireEvent.change(yawInput!, { target: { value: '45' } });
    expect(useTourStore.getState().scenes[0].hotspots[0].yaw).toBeCloseTo(Math.PI / 4, 5);
  });

  it('closes on Escape and on backdrop click', () => {
    const onClose = setup();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId('hotspot-popover-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('flips to the left of the marker near the right viewport edge', () => {
    setup({ x: 1150, viewport: { width: 1200, height: 800 } });
    const card = screen.getByText('Reset Position').closest('div[class*="rounded-lg"]') as HTMLElement;
    expect(card.style.left).toBe(`${1150 - 16 - 320}px`);
  });

  it('hides title chip overflow by clamping below the top edge', () => {
    setup({ y: 5 });
    const card = screen.getByText('Reset Position').closest('div[class*="rounded-lg"]') as HTMLElement;
    expect(parseInt(card.style.top, 10)).toBeGreaterThanOrEqual(8);
  });
});
