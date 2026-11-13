import { act, render, screen, fireEvent } from '@testing-library/react';
import InContextEditor from '@/components/admin/live-editor/in-context/InContextEditor';
import { buildDefaultSiteContent } from '@/lib/site-content';
import { useSiteContentDraftStore, useSiteContentStore } from '@/lib/site-content-store';

jest.mock('@/components/site/HomeSectionRenderer', () => ({
  __esModule: true,
  default: () => <div data-testid="rendered-home">home</div>,
}));

beforeEach(() => {
  useSiteContentDraftStore.setState({ content: buildDefaultSiteContent() });
  useSiteContentStore.setState({ content: buildDefaultSiteContent() });
});

it('renders the toolbar and the real page', () => {
  render(<InContextEditor onExit={() => {}} />);
  expect(screen.getByTestId('editor-toolbar')).toBeInTheDocument();
  expect(screen.getByTestId('rendered-home')).toBeInTheDocument();
});

it('toggles edit mode', () => {
  render(<InContextEditor onExit={() => {}} />);
  const toggle = screen.getByLabelText('Edit mode');
  expect(toggle).toBeChecked();
  fireEvent.click(toggle);
  expect(toggle).not.toBeChecked();
});

it('shows unsaved changes and publishes', async () => {
  render(<InContextEditor onExit={() => {}} />);
  expect(screen.queryByText('Unsaved changes')).toBeNull();
  act(() => {
    useSiteContentDraftStore.getState().updateTextField('home', 'hero', 'headline', 'NEW');
  });
  expect(await screen.findByText('Unsaved changes')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Publish'));
  expect(useSiteContentStore.getState().content.pages[0].sections[0].fields.find((f) => f.id === 'headline')).toMatchObject({ value: 'NEW' });
});

it('resets the draft', () => {
  render(<InContextEditor onExit={() => {}} />);
  act(() => {
    useSiteContentDraftStore.getState().updateTextField('home', 'hero', 'headline', 'NEW');
  });
  fireEvent.click(screen.getByText('Reset'));
  fireEvent.click(screen.getByText('Confirm reset'));
  expect(useSiteContentDraftStore.getState().content.pages[0].sections[0].fields.find((f) => f.id === 'headline')).toMatchObject({ value: 'VIZTR' });
});
