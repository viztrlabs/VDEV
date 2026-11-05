import React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionTabs } from '@/components/editor/shell/SectionTabs';

describe('SectionTabs', () => {
  it('renders the tab list', () => {
    render(<SectionTabs active="editor" onChange={jest.fn()} />);
    expect(screen.getAllByRole('tab').length).toBeGreaterThanOrEqual(12);
    expect(screen.getByRole('tab', { name: 'Tour Editor' })).toBeInTheDocument();
  });

  it('does not expose a collapse indicator', () => {
    render(<SectionTabs active="editor" onChange={jest.fn()} />);
    expect(screen.queryByLabelText('SectionTabs collapse indicator')).not.toBeInTheDocument();
  });
});