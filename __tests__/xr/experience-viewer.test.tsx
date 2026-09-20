import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('ExperienceViewer', () => {
  it('renders TourViewer for tour engine config', async () => {
    render(
      <ExperienceViewer
        experience={{ id: '1', title: 'Test' }}
        config={{ config: { engine: 'tour', tour: { rooms: [] } } }}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('tour-viewer')).toBeInTheDocument();
    });
  });

  it('renders GaussianSplatViewer for splat engine config', async () => {
    render(
      <ExperienceViewer
        experience={{ id: '1', title: 'Test' }}
        config={{ config: { engine: 'splat', splat: { url: 'test.splat' } } }}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('splat-viewer')).toBeInTheDocument();
    });
  });

  it('renders both TourViewer and SplatViewer when config has tour + splat', async () => {
    render(
      <ExperienceViewer
        experience={{ id: '1', title: 'Test' }}
        config={{
          config: {
            engine: 'tour',
            tour: { rooms: [] },
            splat: { url: 'test.splat' },
          },
        }}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('tour-viewer')).toBeInTheDocument();
      expect(screen.getByTestId('splat-viewer')).toBeInTheDocument();
    });
  });

  it('renders PlayCanvasPublicViewer for playcanvas engine config', async () => {
    render(
      <ExperienceViewer
        experience={{ id: '1', title: 'Test' }}
        config={{ config: { engine: 'playcanvas', scene: {}, camera: { position: [0,0,5], target: [0,0,0], fov: 60 } } }}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('playcanvas-viewer')).toBeInTheDocument();
    });
  });

  it('shows fallback for unknown engine type', () => {
    render(
      <ExperienceViewer
        experience={{ id: '1', title: 'Test' }}
        config={{ config: { engine: 'unknown' } }}
      />
    );
    expect(screen.getByText(/Unsupported/)).toBeInTheDocument();
  });
});
