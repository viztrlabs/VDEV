interface LaunchTokenResponse {
  token?: unknown;
  error?: unknown;
}

export async function openEditorProject(
  projectId: string | number | null | undefined,
): Promise<void> {
  const id = String(projectId ?? '').trim();
  if (!id || id === 'undefined' || id === 'null') {
    throw new Error('A valid project ID is required to open the editor.');
  }

  const editorWindow = window.open('about:blank', '_blank');
  if (!editorWindow) {
    throw new Error('The editor window was blocked. Allow pop-ups and try again.');
  }
  editorWindow.opener = null;

  try {
    const response = await fetch('/api/editor/launch-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: id }),
    });
    const data = (await response.json()) as LaunchTokenResponse;
    if (!response.ok || typeof data.token !== 'string' || !data.token) {
      throw new Error(
        typeof data.error === 'string' ? data.error : 'Failed to authenticate with the editor.',
      );
    }

    const editorUrl = new URL(
      `/editor/project/${encodeURIComponent(id)}`,
      'http://localhost:3487',
    );
    editorUrl.searchParams.set('token', data.token);
    editorWindow.location.replace(editorUrl.toString());
  } catch (error) {
    editorWindow.close();
    throw error;
  }
}
