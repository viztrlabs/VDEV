import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { HotspotSettingsForm } from '@/components/tour-builder/HotspotSettingsForm';
import { useTourStore } from '@/lib/tourClientStore';
import type { TourScene } from '@/lib/tourClientStore';

const makeScene = (): TourScene => ({
  id: 'r1', name: 'Lobby', type: '360', url: 'https://x/pano.jpg', thumbnailUrl: '',
  initialYaw: 10, initialPitch: 5, initialFov: 75,
  hotspots: [{ id: 'h1', yaw: Math.PI / 4, pitch: 0, type: 'info', title: 'Sign', description: '' }],
  viewConstraints: {
    top: -90, bottom: 90, left: -180, right: 180,
    zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false,
  },
  autorotateEnabled: false, autorotateSpeed: 1,
});

const renderForm = () => {
  useTourStore.setState({ scenes: [makeScene()] } as any);
  const hs = useTourStore.getState().scenes[0].hotspots[0];
  render(
    <HotspotSettingsForm
      roomId="r1"
      hotspot={hs}
      onUpdate={(patch) => useTourStore.getState().updateHotspot('r1', hs.id, patch)}
    />
  );
};

const storeHotspot = () => useTourStore.getState().scenes[0].hotspots[0];

const fieldInput = (label: string) =>
  screen.getByText(label).parentElement!.querySelector('input, textarea, select')!;

describe('HotspotSettingsForm', () => {
  it('shows the stored radian yaw as degrees', () => {
    renderForm();
    const yawInput = screen.getAllByRole('spinbutton')
      .find((el) => (el as HTMLInputElement).value === '45');
    expect(yawInput).toBeTruthy();
  });

  it('writes radians back to the store when editing in degrees', () => {
    renderForm();
    const yawInput = screen.getAllByRole('spinbutton')
      .find((el) => (el as HTMLInputElement).value === '45');
    fireEvent.change(yawInput!, { target: { value: '90' } });
    expect(storeHotspot().yaw).toBeCloseTo(Math.PI / 2, 5);
  });

  it('Reset Position sets yaw and pitch to 0', () => {
    renderForm();
    fireEvent.click(screen.getByText('Reset Position'));
    expect(storeHotspot().yaw).toBe(0);
    expect(storeHotspot().pitch).toBe(0);
  });

  it('edits rotation in degrees through the Appearance section', () => {
    renderForm();
    fireEvent.change(fieldInput('Rotation'), { target: { value: '45' } });
    expect(storeHotspot().rotation).toBe(45);
  });

  it('changes the hotspot type through the type grid', () => {
    renderForm();
    fireEvent.click(screen.getByTitle('Link to another room'));
    expect(storeHotspot().type).toBe('navigation');
  });

  it('keeps the Direction section (default collapsed)', () => {
    renderForm();
    expect(screen.getByText('Direction')).toBeInTheDocument();
    expect(screen.queryByText('Direction Yaw')).not.toBeInTheDocument();
  });
});
