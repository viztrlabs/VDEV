import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShareControl } from '@/components/tour-viewer/ShareControl';

jest.mock('qrcode', () => ({
  toCanvas: jest.fn(() => Promise.resolve()),
}));

const mockedQrcode: any = jest.requireMock('qrcode');

describe('ShareControl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn(() => Promise.resolve()) },
      configurable: true,
    });
  });

  it('opens the dialog and renders a QR code with the tour URL', async () => {
    render(<ShareControl tourId="tour-123" tourName="Showroom" />);
    fireEvent.click(screen.getByLabelText('Share tour'));
    await waitFor(() => expect(mockedQrcode.toCanvas).toHaveBeenCalled());
    expect(screen.getByRole('dialog', { name: 'Share Showroom' })).toBeInTheDocument();
    expect(screen.getByText(/\/virtual-tour\/tour-123/)).toBeInTheDocument();
  });

  it('copies the share link and shows inline Copied feedback', async () => {
    render(<ShareControl tourId="tour-123" />);
    fireEvent.click(screen.getByLabelText('Share tour'));
    await waitFor(() => expect(screen.getByText('Copy link')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Copy link'));
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('/virtual-tour/tour-123'))
    );
    expect(await screen.findByText('Copied')).toBeInTheDocument();
  });

  it('closes the dialog via the close button', async () => {
    render(<ShareControl tourId="tour-123" />);
    fireEvent.click(screen.getByLabelText('Share tour'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Close share dialog'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
