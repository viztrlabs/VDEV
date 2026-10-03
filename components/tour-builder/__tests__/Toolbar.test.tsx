import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from '@/components/tour-builder/Toolbar';

describe('Toolbar', () => {
  it('renders primary tools and selects them', () => {
    const onSelectTool = jest.fn();
    render(<Toolbar activeTool="select" onSelectTool={onSelectTool} />);
    fireEvent.click(screen.getByTitle('Select (V)'));
    expect(onSelectTool).toHaveBeenCalledWith('select');
  });

  it('exposes the extra tools (icon, rotate, alignment, startview) in the flyout', () => {
    const onSelectTool = jest.fn();
    render(<Toolbar activeTool="select" onSelectTool={onSelectTool} />);
    fireEvent.click(screen.getByTitle('More tools'));
    fireEvent.click(screen.getByTitle('Icon Hotspot (I)'));
    expect(onSelectTool).toHaveBeenCalledWith('icon');
    fireEvent.click(screen.getByTitle('More tools'));
    fireEvent.click(screen.getByTitle('Alignment (A)'));
    expect(onSelectTool).toHaveBeenCalledWith('alignment');
  });

  it('renders the link tool in the primary row', () => {
    const onSelectTool = jest.fn();
    render(<Toolbar activeTool="select" onSelectTool={onSelectTool} />);
    fireEvent.click(screen.getByTitle('Link Hotspot (L)'));
    expect(onSelectTool).toHaveBeenCalledWith('link');
  });

  it('highlights the active tool', () => {
    render(<Toolbar activeTool="info" onSelectTool={jest.fn()} />);
    expect(screen.getByTitle('Info Hotspot (F)').className).toContain('text-[#3ECF8E]');
  });

  it('closes the flyout on Escape', () => {
    render(<Toolbar activeTool="select" onSelectTool={jest.fn()} />);
    fireEvent.click(screen.getByTitle('More tools'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
