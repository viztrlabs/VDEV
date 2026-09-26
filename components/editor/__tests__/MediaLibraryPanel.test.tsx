import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MediaLibraryPanel } from '@/components/editor/shell/NodeListSidebar';

const assets = [
  { name: 'room-a.jpg', url: 'https://x/room-a.jpg' },
  { name: 'room-b.jpg', url: 'https://x/room-b.jpg' },
];

describe('MediaLibraryPanel', () => {
  it('renders the library title with the unique asset count', () => {
    render(<MediaLibraryPanel assets={assets} onAdd={jest.fn()} />);
    expect(screen.getByText('Media Library (2)')).toBeInTheDocument();
  });

  it('is open by default — no extra click needed', () => {
    render(<MediaLibraryPanel assets={assets} onAdd={jest.fn()} />);
    expect(screen.getByText('room-a.jpg')).toBeInTheDocument();
    expect(screen.getByText('room-b.jpg')).toBeInTheDocument();
  });

  it('toggles open/closed with the header button', () => {
    render(<MediaLibraryPanel assets={assets} onAdd={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Media Library/ }));
    expect(screen.queryByText('room-a.jpg')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Media Library/ }));
    expect(screen.getByText('room-a.jpg')).toBeInTheDocument();
  });

  it('reopens reliably on repeated toggles (no flaky native details)', () => {
    render(<MediaLibraryPanel assets={assets} onAdd={jest.fn()} />);
    const toggle = screen.getByRole('button', { name: /Media Library/ });
    for (let i = 0; i < 3; i++) {
      fireEvent.click(toggle);
      fireEvent.click(toggle);
    }
    expect(screen.getByText('room-a.jpg')).toBeInTheDocument();
  });

  it('calls onAdd with the asset url on Add', () => {
    const onAdd = jest.fn();
    render(<MediaLibraryPanel assets={assets} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add room-a.jpg' }));
    expect(onAdd).toHaveBeenCalledWith('https://x/room-a.jpg');
  });

  it('calls onDeleteAsset with the asset name', () => {
    const onDeleteAsset = jest.fn();
    render(<MediaLibraryPanel assets={assets} onAdd={jest.fn()} onDeleteAsset={onDeleteAsset} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete room-a.jpg' }));
    expect(onDeleteAsset).toHaveBeenCalledWith('room-a.jpg');
  });

  it('omits delete buttons when onDeleteAsset is not provided', () => {
    render(<MediaLibraryPanel assets={assets} onAdd={jest.fn()} />);
    expect(screen.queryByRole('button', { name: 'Delete room-a.jpg' })).not.toBeInTheDocument();
  });

  it('calls onUploadFiles with the selected files', () => {
    const onUploadFiles = jest.fn();
    render(<MediaLibraryPanel assets={assets} onAdd={jest.fn()} onUploadFiles={onUploadFiles} />);
    const input = screen.getByLabelText('Upload');
    const file = new File(['x'], 'room-c.jpg', { type: 'image/jpeg' });
    const files = { length: 1, 0: file } as unknown as FileList;
    fireEvent.change(input, { target: { files } });
    expect(onUploadFiles).toHaveBeenCalledWith(files);
  });

  it('calls onRefreshMedia on refresh click', () => {
    const onRefreshMedia = jest.fn();
    render(<MediaLibraryPanel assets={assets} onAdd={jest.fn()} onRefreshMedia={onRefreshMedia} />);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh media library' }));
    expect(onRefreshMedia).toHaveBeenCalled();
  });

  it('collapses duplicate assets and reports them hidden', () => {
    const dupes = [
      { name: 'room-a.jpg', url: 'https://x/room-a.jpg' },
      { name: 'room-a-copy.jpg', url: 'https://x/room-a.jpg' },
      { name: 'room-b.jpg', url: 'https://x/room-b.jpg' },
    ];
    render(<MediaLibraryPanel assets={dupes} onAdd={jest.fn()} />);
    expect(screen.getByText('Media Library (2)')).toBeInTheDocument();
    expect(screen.queryByText('room-a-copy.jpg')).not.toBeInTheDocument();
    expect(screen.getByText('1 duplicate hidden')).toBeInTheDocument();
  });
});