import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HotspotInspector } from '@/components/editor/shell/HotspotInspector';
import type { TourRoom } from '@/data/tour-config';

const room: TourRoom = {
  id: 'r1',
  name: 'Room 1',
  subtitle: '',
  panoramaUrl: 'pano.jpg',
  thumbnailUrl: '',
  initialYaw: 0,
  initialPitch: 0,
  defaultHotspots: [],
};

function renderInspector() {
  return render(
    <HotspotInspector
      selected={room}
      allRooms={[room]}
      onUpdateHotspot={jest.fn()}
      onDeleteHotspot={jest.fn()}
      onCopyHotspot={jest.fn()}
      onSetPortalTarget={jest.fn()}
    />,
  );
}

describe('HotspotInspector collapsible card', () => {
  it('renders the header and hotspot list when expanded', () => {
    renderInspector();
    expect(screen.getByRole('button', { name: /Hotspots on/ })).toBeInTheDocument();
    expect(screen.getByText(/No hotspots\./)).toBeInTheDocument();
  });

  it('collapses the card body on header double-click, keeping the header', () => {
    renderInspector();
    fireEvent.doubleClick(screen.getByRole('button', { name: /Hotspots on/ }));
    expect(screen.queryByText(/No hotspots\./)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hotspots on/ })).toHaveAttribute('aria-expanded', 'false');
  });

  it('re-expands on a second double-click', () => {
    renderInspector();
    const header = screen.getByRole('button', { name: /Hotspots on/ });
    fireEvent.doubleClick(header);
    fireEvent.doubleClick(header);
    expect(screen.getByText(/No hotspots\./)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hotspots on/ })).toHaveAttribute('aria-expanded', 'true');
  });
});