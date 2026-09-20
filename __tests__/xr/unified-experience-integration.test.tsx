import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExperienceViewer } from '@/components/xr/ExperienceViewer';

jest.mock('@/components/xr/TourViewer', () => ({
  __esModule: true,
  default: () => <div data-testid="tour-viewer">TourViewer</div>,
}));

jest.mock('@/components/xr/GaussianSplatViewer', () => ({
  __esModule: true,
  default: () => <div data-testid="splat-viewer">SplatViewer</div>,
}));

jest.mock('@/components/xr/PlayCanvasPublicViewer', () => ({
  PlayCanvasPublicViewer: () => <div data-testid="playcanvas-viewer">PlayCanvas</div>,
}));

describe('Unified Experience Integration', () => {
  it('tour-only experience renders single viewer', () => {
    render(
      <ExperienceViewer
        experience={{ id: '1', title: 'Tour Only' }}
        config={{ config: { engine: 'tour', tour: { rooms: [{ id: 'r1', name: 'Room', panorama: 'p.jpg', initialViewParameters: { yaw: 0, pitch: 0 } }] } } }}
      />
    );
    expect(screen.getByTestId('tour-viewer')).toBeInTheDocument();
    expect(screen.queryByTestId('splat-viewer')).not.toBeInTheDocument();
  });

  it('tour+splat experience renders both viewers in layout', () => {
    render(
      <ExperienceViewer
        experience={{ id: '1', title: 'Tour + Splat' }}
        config={{
          config: {
            engine: 'tour',
            tour: { rooms: [{ id: 'r1', name: 'Room', panorama: 'p.jpg', initialViewParameters: { yaw: 0, pitch: 0 } }] },
            splat: { url: 'test.splat' },
          },
        }}
      />
    );
    expect(screen.getByTestId('tour-viewer')).toBeInTheDocument();
    expect(screen.getByTestId('splat-viewer')).toBeInTheDocument();
  });

  it('splat-only experience renders single viewer', () => {
    render(
      <ExperienceViewer
        experience={{ id: '1', title: 'Splat Only' }}
        config={{ config: { engine: 'splat', splat: { url: 'test.splat' } } }}
      />
    );
    expect(screen.queryByTestId('tour-viewer')).not.toBeInTheDocument();
    expect(screen.getByTestId('splat-viewer')).toBeInTheDocument();
  });
});
