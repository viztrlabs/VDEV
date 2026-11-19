import { openEditorProject } from '../launch';

const fetchMock = jest.fn();
const replaceMock = jest.fn();
const closeMock = jest.fn();
const editorWindow = {
  opener: window,
  location: { replace: replaceMock },
  close: closeMock,
} as unknown as Window;

beforeEach(() => {
  fetchMock.mockReset();
  replaceMock.mockReset();
  closeMock.mockReset();
  jest.spyOn(window, 'open').mockReturnValue(editorWindow);
  global.fetch = fetchMock;
});

afterEach(() => {
  jest.restoreAllMocks();
});

it('opens a project with an editor launch token', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ token: 'signed-launch-token' }),
  });

  await openEditorProject(42);

  expect(fetchMock).toHaveBeenCalledWith('/api/editor/launch-token', expect.objectContaining({
    method: 'POST',
    body: JSON.stringify({ projectId: '42' }),
  }));
  const editorUrl = new URL(replaceMock.mock.calls[0][0]);
  expect(editorUrl.pathname).toBe('/editor/project/42');
  expect(editorUrl.searchParams.get('token')).toBe('signed-launch-token');
});

it('does not open a URL when the project ID is missing', async () => {
  await expect(openEditorProject('undefined')).rejects.toThrow('A valid project ID is required');

  expect(window.open).not.toHaveBeenCalled();
  expect(fetchMock).not.toHaveBeenCalled();
});

it('closes the placeholder tab when launch-token creation fails', async () => {
  fetchMock.mockResolvedValue({
    ok: false,
    json: async () => ({ error: 'Unauthorized' }),
  });

  await expect(openEditorProject('project-1')).rejects.toThrow('Unauthorized');

  expect(closeMock).toHaveBeenCalled();
  expect(replaceMock).not.toHaveBeenCalled();
});
