import React from 'react';
import { render, screen } from '@testing-library/react';
import CanvasTab from '../CanvasTab';

const mockRooms = [
  {
    id: 'room-1',
    name: 'Living Room',
    subtitle: 'Main area',
    panoramaUrl: 'https://example.com/pano1.jpg',
    thumbnailUrl: 'https://example.com/thumb1.jpg',
    initialYaw: 180,
    initialPitch: 0,
    defaultHotspots: [],
  },
];

describe('CanvasTab', () => {
  it('renders without crashing', () => {
    const noop = jest.fn();
    render(
      <CanvasTab
        rooms={mockRooms}
        onUpdateRoom={noop}
        onAutoLink={noop}
        onSave={noop}
        saved={false}
      />,
    );
    expect(screen.getByText(/Canvas/)).toBeInTheDocument();
  });

  it('displays scene cards with room names', () => {
    const noop = jest.fn();
    render(
      <CanvasTab
        rooms={mockRooms}
        onUpdateRoom={noop}
        onAutoLink={noop}
        onSave={noop}
        saved={false}
      />,
    );
    expect(screen.getByText('Living Room')).toBeInTheDocument();
  });

  it('renders auto-arrange and save buttons', () => {
    const noop = jest.fn();
    render(
      <CanvasTab
        rooms={mockRooms}
        onUpdateRoom={noop}
        onAutoLink={noop}
        onSave={noop}
        saved={false}
      />,
    );
    expect(screen.getByText('Auto Arrange')).toBeInTheDocument();
    expect(screen.getByText('Auto-link by GPS')).toBeInTheDocument();
    expect(screen.getByText('Save Layout')).toBeInTheDocument();
  });
});
