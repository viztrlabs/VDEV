/**
 * TourDashboard Projects tab — now backed by the REAL tours backend
 * (GET /api/tours). Verifies rendering from real tour rows and the
 * create/publish/share/delete actions.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import TourDashboardPage from '@/app/xr-world/virtual-tour/dashboard/page';

const toursFixture = [
  {
    id: 't-live-1',
    title: 'Sunset Villa',
    slug: 'sunset-villa',
    is_live: true,
    access_level: 'public',
    views: 42,
    sceneCount: 3,
    thumbnailUrl: 'https://x/thumb.jpg',
    updated_at: '2026-09-29T10:00:00Z',
  },
  {
    id: 't-draft-1',
    title: 'Draft Loft',
    slug: 'draft-loft',
    is_live: false,
    access_level: 'public',
    views: 0,
    sceneCount: 0,
    thumbnailUrl: null,
    updated_at: '2026-09-28T08:00:00Z',
  },
];

const fetchMock = jest.fn();

beforeAll(() => {
  global.fetch = fetchMock as any;
});
beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ tours: toursFixture }),
  } as any);
  jest.spyOn(window, 'prompt').mockReturnValue('New Tour');
  jest.spyOn(window, 'confirm').mockReturnValue(true);
});
afterEach(() => {
  jest.restoreAllMocks();
});

const renderDashboard = () => render(<TourDashboardPage />);

const waitForTours = async () => {
  await waitFor(() => {
    expect(screen.getByText('Sunset Villa')).toBeInTheDocument();
  });
};

// Scope queries to a single tour card (both cards render Edit/Delete/etc).
const cardOf = (title: string): HTMLElement => {
  const el = screen.getByText(title).closest('.group');
  if (!el) throw new Error(`card for "${title}" not found`);
  return el as HTMLElement;
};

describe('TourDashboard — real tours backend', () => {
  it('lists tours from GET /api/tours (not /api/projects)', async () => {
    renderDashboard();
    await waitForTours();
    expect(fetchMock).toHaveBeenCalledWith('/api/tours');
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.some((u) => u.includes('/api/projects'))).toBe(false);
  });

  it('shows real live/draft badges, scene counts and views', async () => {
    renderDashboard();
    await waitForTours();
    const live = within(cardOf('Sunset Villa'));
    const draft = within(cardOf('Draft Loft'));
    expect(live.getAllByText('Live').length).toBe(2); // corner tag + toggle button
    expect(live.getByText('3 scenes')).toBeInTheDocument();
    expect(live.getByText('42')).toBeInTheDocument();
    expect(draft.getByText('Publish')).toBeInTheDocument();
    expect(draft.getAllByText('Draft').length).toBeGreaterThanOrEqual(1);
  });

  it('opens the editor on the exact tour id', async () => {
    renderDashboard();
    await waitForTours();
    const edit = within(cardOf('Sunset Villa')).getByTitle('Edit');
    expect(edit).toHaveAttribute('href', '/xr-world/virtual-tour/editor?tour=t-live-1');
  });

  it('links View to the public tour only when live', async () => {
    renderDashboard();
    await waitForTours();
    const view = within(cardOf('Sunset Villa')).getByTitle('View public tour');
    expect(view).toHaveAttribute('href', '/virtual-tour/sunset-villa');
    expect(within(cardOf('Draft Loft')).getByTitle('Publish first to view')).toBeInTheDocument();
  });

  it('publishes a draft via PATCH /api/tours with is_live + public access', async () => {
    renderDashboard();
    await waitForTours();
    fireEvent.click(within(cardOf('Draft Loft')).getByText('Publish'));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tours?id=t-draft-1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ is_live: true, access_level: 'public' }),
        }),
      );
    });
  });

  it('unpublishes a live tour without touching access level', async () => {
    renderDashboard();
    await waitForTours();
    fireEvent.click(within(cardOf('Sunset Villa')).getByRole('button', { name: 'Live' }));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tours?id=t-live-1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ is_live: false }),
        }),
      );
    });
  });

  it('duplicates via PATCH action:duplicate', async () => {
    renderDashboard();
    await waitForTours();
    fireEvent.click(within(cardOf('Sunset Villa')).getByTitle('Duplicate'));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tours?id=t-live-1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ action: 'duplicate' }),
        }),
      );
    });
  });

  it('creates a tour via POST /api/tours with the prompted title', async () => {
    renderDashboard();
    await waitForTours();
    fireEvent.click(screen.getByText('New Tour'));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tours',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ title: 'New Tour' }),
        }),
      );
    });
  });

  it('deletes via DELETE /api/tours?id= after confirmation', async () => {
    renderDashboard();
    await waitForTours();
    fireEvent.click(within(cardOf('Draft Loft')).getByTitle('Delete'));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tours?id=t-draft-1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  it('copies the public link on Share', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    renderDashboard();
    await waitForTours();
    fireEvent.click(within(cardOf('Sunset Villa')).getByTitle('Copy public link'));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('http://localhost/virtual-tour/sunset-villa');
    });
  });
});