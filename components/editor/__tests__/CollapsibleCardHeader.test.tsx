import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CollapsibleCardHeader } from '@/components/editor/shell/CollapsibleCardHeader';

describe('CollapsibleCardHeader', () => {
  it('renders the label and expanded state', () => {
    render(
      <CollapsibleCardHeader collapsed={false} onToggle={jest.fn()}>
        Scene Configuration
      </CollapsibleCardHeader>,
    );
    expect(screen.getByText('Scene Configuration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Scene Configuration/ })).toHaveAttribute('aria-expanded', 'true');
  });

  it('reflects collapsed state in aria-expanded and the indicator', () => {
    render(
      <CollapsibleCardHeader collapsed onToggle={jest.fn()}>
        View Constraints
      </CollapsibleCardHeader>,
    );
    const header = screen.getByRole('button', { name: /View Constraints/ });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByLabelText('Collapse indicator')).toHaveAttribute('data-collapsed', 'true');
  });

  it('calls onToggle on double-click', () => {
    const onToggle = jest.fn();
    render(<CollapsibleCardHeader collapsed={false} onToggle={onToggle}>Scene</CollapsibleCardHeader>);
    fireEvent.doubleClick(screen.getByRole('button', { name: /Scene/ }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onToggle on Enter key', () => {
    const onToggle = jest.fn();
    render(<CollapsibleCardHeader collapsed={false} onToggle={onToggle}>Scene</CollapsibleCardHeader>);
    fireEvent.keyDown(screen.getByRole('button', { name: /Scene/ }), { key: 'Enter' });
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});