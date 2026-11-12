import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MediaPickerModal from '@/components/admin/live-editor/MediaPickerModal';
import { useCMSStore } from '@/lib/cms-store';

jest.mock('@/lib/cms-store', () => ({
  useCMSStore: jest.fn(),
}));

const mockedStore = useCMSStore as unknown as jest.Mock;

describe('MediaPickerModal', () => {
  it('renders nothing when closed', () => {
    mockedStore.mockReturnValue({ mediaLibrary: [] });
    render(<MediaPickerModal open={false} onClose={() => {}} filter="image" onPick={() => {}} />);
    expect(screen.queryByTestId('media-picker-modal')).toBeNull();
  });

  it('lists image library items and picks on click', () => {
    mockedStore.mockReturnValue({
      mediaLibrary: [
        { id: '1', name: 'Render A', url: '/images/a.jpg', type: 'image', isPlaceholder: false },
        { id: '2', name: 'Clip B', url: '/videos/b.mp4', type: 'video', isPlaceholder: false },
      ],
    });
    const onPick = jest.fn();
    render(<MediaPickerModal open onClose={() => {}} filter="image" onPick={onPick} />);
    expect(screen.getByText('Render A')).toBeInTheDocument();
    expect(screen.queryByText('Clip B')).toBeNull();
    fireEvent.click(screen.getByText('Render A'));
    expect(onPick).toHaveBeenCalledWith('/images/a.jpg');
  });

  it('picks a pasted URL', () => {
    mockedStore.mockReturnValue({ mediaLibrary: [] });
    const onPick = jest.fn();
    render(<MediaPickerModal open onClose={() => {}} filter="video" onPick={onPick} />);
    fireEvent.change(screen.getByPlaceholderText(/paste.*url/i), { target: { value: 'https://cdn.x/v.mp4' } });
    fireEvent.click(screen.getByRole('button', { name: /use url/i }));
    expect(onPick).toHaveBeenCalledWith('https://cdn.x/v.mp4');
  });

  it('closes on Escape key', () => {
    mockedStore.mockReturnValue({ mediaLibrary: [] });
    const onClose = jest.fn();
    render(<MediaPickerModal open onClose={onClose} filter="image" onPick={() => {}} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the backdrop is clicked', () => {
    mockedStore.mockReturnValue({ mediaLibrary: [] });
    const onClose = jest.fn();
    render(<MediaPickerModal open onClose={onClose} filter="image" onPick={() => {}} />);
    fireEvent.click(screen.getByTestId('media-picker-modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the close button is clicked', () => {
    mockedStore.mockReturnValue({ mediaLibrary: [] });
    const onClose = jest.fn();
    render(<MediaPickerModal open onClose={onClose} filter="image" onPick={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('rejects an empty or whitespace-only pasted URL', () => {
    mockedStore.mockReturnValue({ mediaLibrary: [] });
    const onPick = jest.fn();
    render(<MediaPickerModal open onClose={() => {}} filter="image" onPick={onPick} />);
    const input = screen.getByPlaceholderText(/paste.*url/i);
    fireEvent.click(screen.getByRole('button', { name: /use url/i }));
    expect(onPick).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /use url/i }));
    expect(onPick).not.toHaveBeenCalled();
  });
});
