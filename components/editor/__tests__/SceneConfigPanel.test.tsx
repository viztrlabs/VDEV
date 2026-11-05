import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SceneConfigPanel from '@/components/editor/SceneConfigPanel';
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

function renderPanel() {
  return render(
    <SceneConfigPanel
      room={room}
      onUpdate={jest.fn()}
      onReplacePanorama={jest.fn()}
      onUploadAudio={jest.fn()}
      onSetFeatured={jest.fn()}
      isFeatured={false}
      uploading={false}
    />,
  );
}

describe('SceneConfigPanel collapsible card', () => {
  it('renders the header and tabs when expanded', () => {
    renderPanel();
    expect(screen.getByRole('button', { name: /Scene Configuration/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Scene' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Nadir' })).toBeInTheDocument();
  });

  it('collapses the card body on header double-click, keeping the header', () => {
    renderPanel();
    fireEvent.doubleClick(screen.getByRole('button', { name: /Scene Configuration/ }));
    expect(screen.queryByRole('tab', { name: 'Scene' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Scene Configuration/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Scene Configuration/ })).toHaveAttribute('aria-expanded', 'false');
  });

  it('re-expands on a second double-click', () => {
    renderPanel();
    const header = screen.getByRole('button', { name: /Scene Configuration/ });
    fireEvent.doubleClick(header);
    fireEvent.doubleClick(header);
    expect(screen.getByRole('tab', { name: 'Scene' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Scene Configuration/ })).toHaveAttribute('aria-expanded', 'true');
  });
});