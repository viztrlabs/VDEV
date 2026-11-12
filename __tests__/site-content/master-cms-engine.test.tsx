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
  it('shows the live site editor by default', () => {
    render(<MasterCMSEngine />);
    expect(screen.getByTestId('live-site-editor')).toBeInTheDocument();
    expect(screen.queryByTestId('legacy-cms-manager')).toBeNull();
  });

  it('switches to the content manager and back', () => {
    render(<MasterCMSEngine />);
    fireEvent.click(screen.getByRole('button', { name: /content manager/i }));
    expect(screen.getByTestId('legacy-cms-manager')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /live site editor/i }));
    expect(screen.getByTestId('live-site-editor')).toBeInTheDocument();
  });
});
