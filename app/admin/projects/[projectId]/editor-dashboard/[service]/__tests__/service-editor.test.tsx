import { render, screen, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import ServiceEditorPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useParams: () => ({ projectId: 'proj_test', service: 'webxr' }),
  notFound: jest.fn(),
}));

jest.mock('@/components/editor/service-editor-panels', () => ({
  ServiceEditorPanels: ({ tabs, loading }: any) => (
    <div data-testid="panels">{loading ? 'loading' : tabs.map((t: any) => t.label).join(',')}</div>
  ),
}));
jest.mock('@/components/editor/device-compatibility', () => ({
  DeviceCompatibility: () => <div data-testid="device" />,
}));
jest.mock('@/components/editor/permissions', () => ({
  PermissionProvider: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('@/components/editor/editor-error-boundary', () => ({
  EditorErrorBoundary: ({ children }: any) => <div>{children}</div>,
}));

const fetchMock = jest.fn();
(global as any).fetch = fetchMock;

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation((url: string) => {
    if (url.startsWith('/api/experiences')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ experiences: [] }) });
    if (url.startsWith('/api/experience-configs')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ configs: [] }) });
    if (url.startsWith('/api/deliverables')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ deliverables: [] }) });
    if (url.startsWith('/api/assets')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ assets: [] }) });
    if (url.startsWith('/api/project-members')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ members: [] }) });
    return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'fail' }) });
  });
});

it('renders the 5 CRUD tabs and a device-compatibility widget for webxr', async () => {
  render(<ServiceEditorPage />);
  expect(await screen.findByTestId('panels')).toBeInTheDocument();
  await waitFor(() => expect(screen.getByTestId('panels').textContent).toContain('Experiences'));
  expect(screen.getByTestId('device')).toBeInTheDocument();
});