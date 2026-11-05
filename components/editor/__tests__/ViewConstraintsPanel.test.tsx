import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewConstraintsPanel from '@/components/editor/ViewConstraintsPanel';
import type { VtedViewConstraints } from '@/lib/vted-types';

const value: VtedViewConstraints = {
  top: -90,
  bottom: 90,
  left: -180,
  right: 180,
  zoomMin: 60,
  zoomMax: 150,
  mobileZoomEnabled: false,
};

function renderPanel() {
  return render(<ViewConstraintsPanel value={value} onChange={jest.fn()} />);
}

describe('ViewConstraintsPanel collapsible card', () => {
  it('renders the header and rows when expanded', () => {
    renderPanel();
    expect(screen.getByRole('button', { name: /View Constraints/ })).toBeInTheDocument();
    expect(screen.getByText('Limit View')).toBeInTheDocument();
    expect(screen.getByText('Save All')).toBeInTheDocument();
  });

  it('collapses the card body on header double-click, keeping the header', () => {
    renderPanel();
    fireEvent.doubleClick(screen.getByRole('button', { name: /View Constraints/ }));
    expect(screen.queryByText('Limit View')).not.toBeInTheDocument();
    expect(screen.queryByText('Save All')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Constraints/ })).toHaveAttribute('aria-expanded', 'false');
  });

  it('re-expands on a second double-click', () => {
    renderPanel();
    const header = screen.getByRole('button', { name: /View Constraints/ });
    fireEvent.doubleClick(header);
    fireEvent.doubleClick(header);
    expect(screen.getByText('Limit View')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Constraints/ })).toHaveAttribute('aria-expanded', 'true');
  });
});