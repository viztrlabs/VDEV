import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { HotspotPopup } from '@/components/xr/HotspotPopup';
import type { ManifestHotspot } from '@/lib/tourManifest';

const hs = {
  id: 'h1', type: 'info', kind: 'info', title: 'Fireplace',
  description: 'Restored 1920s fireplace.', images: ['https://x/a.jpg'],
  externalUrl: 'https://x/more', yaw: 0, pitch: 0,
} as unknown as ManifestHotspot;

describe('HotspotPopup', () => {
  it('renders title, description, images and external link', () => {
    render(<HotspotPopup hotspot={hs} onClose={jest.fn()} />);
    expect(screen.getByText('Fireplace')).toBeInTheDocument();
    expect(screen.getByText('Restored 1920s fireplace.')).toBeInTheDocument();
    expect(screen.getByAltText('Fireplace photo 1')).toBeInTheDocument();
    expect(screen.getByText('Learn more')).toBeInTheDocument();
  });

  it('closes via the close button', () => {
    const onClose = jest.fn();
    render(<HotspotPopup hotspot={hs} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close popup'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
