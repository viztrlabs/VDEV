import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TourControls } from '@/components/tour-viewer/TourControls';
import type { TourScene } from '@/lib/tourClientStore';

const scenes = [
  { id: 'a', name: 'Lobby', type: '360', url: '', thumbnailUrl: '', initialYaw: 0, initialPitch: 0, initialFov: 75, hotspots: [], viewConstraints: { top: -90, bottom: 90, left: -180, right: 180, zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false }, autorotateEnabled: false, autorotateSpeed: 1 },
  { id: 'b', name: 'Kitchen', type: '360', url: '', thumbnailUrl: '', initialYaw: 0, initialPitch: 0, initialFov: 75, hotspots: [], viewConstraints: { top: -90, bottom: 90, left: -180, right: 180, zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false }, autorotateEnabled: false, autorotateSpeed: 1 },
] as unknown as TourScene[];

const base = {
  onZoomIn: jest.fn(), onZoomOut: jest.fn(), onToggleFullscreen: jest.fn(),
  isFullscreen: false, autorotateEnabled: false,
};

describe('TourControls', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders zoom and fullscreen buttons with aria labels', () => {
    render(<TourControls {...base} />);
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle fullscreen')).toBeInTheDocument();
  });

  it('fires zoom and fullscreen callbacks', () => {
    render(<TourControls {...base} />);
    fireEvent.click(screen.getByLabelText('Zoom in'));
    fireEvent.click(screen.getByLabelText('Zoom out'));
    fireEvent.click(screen.getByLabelText('Toggle fullscreen'));
    expect(base.onZoomIn).toHaveBeenCalledTimes(1);
    expect(base.onZoomOut).toHaveBeenCalledTimes(1);
    expect(base.onToggleFullscreen).toHaveBeenCalledTimes(1);
  });

  it('shows the scene menu only when multiple scenes are given', () => {
    const onSelectScene = jest.fn();
    const { rerender } = render(
      <TourControls {...base} scenes={[scenes[0]]} activeSceneId="a" onSelectScene={onSelectScene} />
    );
    expect(screen.queryByLabelText('Scene menu')).not.toBeInTheDocument();
    rerender(
      <TourControls {...base} scenes={scenes} activeSceneId="a" onSelectScene={onSelectScene} />
    );
    fireEvent.click(screen.getByLabelText('Scene menu'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Kitchen' }));
    expect(onSelectScene).toHaveBeenCalledWith('b');
  });

  it('closes the scene menu on Escape', () => {
    render(<TourControls {...base} scenes={scenes} activeSceneId="a" onSelectScene={jest.fn()} />);
    fireEvent.click(screen.getByLabelText('Scene menu'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('toggles autorotate with aria-pressed state', () => {
    const onToggleAutorotate = jest.fn();
    render(<TourControls {...base} onToggleAutorotate={onToggleAutorotate} />);
    const btn = screen.getByLabelText('Start autorotate');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(btn);
    expect(onToggleAutorotate).toHaveBeenCalledTimes(1);
  });
});
