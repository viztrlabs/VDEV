import { render, screen } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import EditorDashboardLauncherPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useParams: () => ({ projectId: 'proj_test' }),
  notFound: jest.fn(),
}));

const fetchMock = jest.fn();
(global as any).fetch = fetchMock;

beforeEach(() => {
  fetchMock.mockReset();
});

it('renders a service tile for every available project service', async () => {
  fetchMock.mockImplementation((url: string) => {
    if (url.startsWith('/api/projects')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'proj_test', name: 'Test Villa', status: 'active' }),
      });
    }
    if (url.startsWith('/api/project-services')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          projectServices: [
            { service: { slug: 'virtual-tour', enabled: true, visible: true } },
            { service: { slug: 'webxr', enabled: true, visible: true } },
          ],
        }),
      });
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'fail' }) });
  });

  render(<EditorDashboardLauncherPage />);

  expect(await screen.findByText('Virtual Tour')).toBeInTheDocument();
  expect(screen.getByText('WebXR')).toBeInTheDocument();
  const link = screen.getByText('Virtual Tour').closest('a');
  expect(link).toHaveAttribute(
    'href',
    '/admin/projects/proj_test/editor-dashboard/virtual-tour',
  );
});