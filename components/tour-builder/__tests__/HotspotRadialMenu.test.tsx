import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { HotspotRadialMenu } from '@/components/tour-builder/HotspotRadialMenu';
import type { TourHotspot } from '@/lib/tourClientStore';

const hotspot = (over: Partial<TourHotspot> = {}): TourHotspot => ({
  id: 'h1', yaw: 0, pitch: 0, type: 'navigation', title: 'Door', description: '', ...over,
});

const setup = (over: Partial<TourHotspot> = {}, props: Partial<Parameters<typeof HotspotRadialMenu>[0]> = {}) => {
  const handlers = {
    onEnter: jest.fn(),
    onRotate: jest.fn(),
    onDelete: jest.fn(),
    onEdit: jest.fn(),
    onClose: jest.fn(),
  };
  render(
    <HotspotRadialMenu x={100} y={100} hotspot={hotspot(over)} {...handlers} {...props} />
  );
  return handlers;
};

describe('HotspotRadialMenu', () => {
  it('renders all four action buttons', () => {
    setup();
    expect(screen.getByLabelText('Enter target room')).toBeInTheDocument();
    expect(screen.getByLabelText('Rotate hotspot')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete hotspot')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit hotspot')).toBeInTheDocument();
  });

  it('disables Enter when the hotspot has no target room', () => {
    setup();
    expect(screen.getByLabelText('Enter target room')).toBeDisabled();
  });

  it('enables Enter when targetSceneId is set and fires onEnter', () => {
    const h = setup({ targetSceneId: 'r2' });
    const btn = screen.getByLabelText('Enter target room');
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(h.onEnter).toHaveBeenCalledTimes(1);
  });

  it('fires the other actions', () => {
    const h = setup();
    fireEvent.click(screen.getByLabelText('Rotate hotspot'));
    fireEvent.click(screen.getByLabelText('Delete hotspot'));
    fireEvent.click(screen.getByLabelText('Edit hotspot'));
    expect(h.onRotate).toHaveBeenCalledTimes(1);
    expect(h.onDelete).toHaveBeenCalledTimes(1);
    expect(h.onEdit).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape and on backdrop click', () => {
    const h = setup();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(h.onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId('hotspot-radial-backdrop'));
    expect(h.onClose).toHaveBeenCalledTimes(2);
  });
});
