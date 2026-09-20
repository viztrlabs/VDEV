import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/components/xr/SharedExperienceContext', () => ({
  useSharedExperience: () => ({
    setOrientation: jest.fn(),
  }),
}));

const { PlayCanvasPublicViewer } = require('@/components/xr/PlayCanvasPublicViewer');

describe('PlayCanvasPublicViewer', () => {
  it('renders container div', () => {
    render(
      <PlayCanvasPublicViewer
        scene={{ entities: {} }}
        camera={{ position: [0, 0, 5], target: [0, 0, 0], fov: 60 }}
      />
    );
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(
      <PlayCanvasPublicViewer
        scene={{ entities: {} }}
        camera={{ position: [0, 0, 5], target: [0, 0, 0], fov: 60 }}
      />
    );
    expect(screen.getByText(/Loading 3D/)).toBeInTheDocument();
  });
});
