import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MasterCMSEngine from '@/components/admin/MasterCMSEngine';

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/lib/store', () => ({
  useAppStore: () => ({ showToast: jest.fn() }),
}));

jest.mock('@/components/admin/live-editor/LiveSiteEditor', () => {
  return function Mock() {
    return <div data-testid="live-site-editor">LIVE_EDITOR</div>;
  };
});

jest.mock('@/components/admin/SuperAdminCMSManager', () => {
  return function Mock() {
    return <div data-testid="legacy-cms-manager">LEGACY_MANAGER</div>;
  };
});

describe('MasterCMSEngine', () => {
  it('shows the structured editor by default', () => {
    render(<MasterCMSEngine />);
    expect(screen.getByTestId('live-site-editor')).toBeInTheDocument();
    expect(screen.queryByTestId('legacy-cms-manager')).toBeNull();
  });

  it('switches to the content manager and back', () => {
    render(<MasterCMSEngine />);
    fireEvent.click(screen.getByRole('button', { name: /content manager/i }));
    expect(screen.getByTestId('legacy-cms-manager')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /structured/i }));
    expect(screen.getByTestId('live-site-editor')).toBeInTheDocument();
  });

  it('opens the live editor', () => {
    const onOpenLiveEditor = jest.fn();
    render(<MasterCMSEngine onOpenLiveEditor={onOpenLiveEditor} />);
    fireEvent.click(screen.getByRole('button', { name: /open live editor/i }));
    expect(onOpenLiveEditor).toHaveBeenCalledTimes(1);
  });

  it('renders without an open-live-editor handler', () => {
    render(<MasterCMSEngine />);
    fireEvent.click(screen.getByRole('button', { name: /open live editor/i }));
    expect(screen.getByTestId('live-site-editor')).toBeInTheDocument();
  });
});
