import { render, screen, fireEvent } from '@testing-library/react';
import { ShortcutProvider } from '@/components/tour-builder/ShortcutProvider';

describe('ShortcutProvider', () => {
  it('renders children', () => {
    render(
      <ShortcutProvider activeTool="select" onToolChange={() => {}}>
        <div>Test Content</div>
      </ShortcutProvider>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('calls onToolChange with correct tool for keyboard shortcut', () => {
    const onToolChange = jest.fn();
    render(
      <ShortcutProvider activeTool="select" onToolChange={onToolChange}>
        <div>Test</div>
      </ShortcutProvider>
    );

    fireEvent.keyDown(window, { key: 'n' });
    expect(onToolChange).toHaveBeenCalledWith('hotspot-navigation');
  });

  it('calls onSave when Ctrl+S is pressed', () => {
    const onSave = jest.fn();
    render(
      <ShortcutProvider activeTool="select" onToolChange={() => {}} onSave={onSave}>
        <div>Test</div>
      </ShortcutProvider>
    );

    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    expect(onSave).toHaveBeenCalled();
  });

  it('calls onUndo when Ctrl+Z is pressed', () => {
    const onUndo = jest.fn();
    render(
      <ShortcutProvider activeTool="select" onToolChange={() => {}} onUndo={onUndo}>
        <div>Test</div>
      </ShortcutProvider>
    );

    fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
    expect(onUndo).toHaveBeenCalled();
  });

  it('calls onRedo when Ctrl+Shift+Z is pressed', () => {
    const onRedo = jest.fn();
    render(
      <ShortcutProvider activeTool="select" onToolChange={() => {}} onRedo={onRedo}>
        <div>Test</div>
      </ShortcutProvider>
    );

    fireEvent.keyDown(window, { key: 'z', ctrlKey: true, shiftKey: true });
    expect(onRedo).toHaveBeenCalled();
  });

  it('does not trigger shortcuts when typing in input', () => {
    const onToolChange = jest.fn();
    render(
      <ShortcutProvider activeTool="select" onToolChange={onToolChange}>
        <input data-testid="input" />
      </ShortcutProvider>
    );

    const input = screen.getByTestId('input');
    fireEvent.keyDown(input, { key: 'n' });
    expect(onToolChange).not.toHaveBeenCalled();
  });
});
