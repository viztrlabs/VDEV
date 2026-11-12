import { act, render, screen, fireEvent, within } from '@testing-library/react';
import { useRef } from 'react';
import SectionOverlayLayer from '@/components/admin/live-editor/in-context/SectionOverlayLayer';
import { EditModeProvider, useEditMode } from '@/components/admin/live-editor/in-context/EditModeContext';
import { buildDefaultSiteContent } from '@/lib/site-content';
import { useSiteContentDraftStore } from '@/lib/site-content-store';

function Harness() {
  const ref = useRef<HTMLDivElement>(null);
  const { selectSection } = useEditMode();
  return (
    <div>
      <button onClick={() => selectSection('hero')}>select-hero</button>
      <div ref={ref}>
        <div data-cms-section-id="hero" data-cms-section-type="hero" style={{ height: 100 }} />
        <div data-cms-section-id="marquee" data-cms-section-type="marquee" style={{ height: 100 }} />
      </div>
      <SectionOverlayLayer containerRef={ref} />
    </div>
  );
}

function OutsideOnlyHarness() {
  const ref = useRef<HTMLDivElement>(null);
  const { selectSection } = useEditMode();
  return (
    <div>
      <button onClick={() => selectSection('ghost')}>select-ghost</button>
      <div data-cms-section-id="ghost" data-cms-section-type="hero" style={{ height: 100 }} />
      <div ref={ref}>
        <div data-cms-section-id="hero" data-cms-section-type="hero" style={{ height: 100 }} />
      </div>
      <SectionOverlayLayer containerRef={ref} />
    </div>
  );
}

beforeEach(() => {
  useSiteContentDraftStore.setState({ content: buildDefaultSiteContent() });
});

it('shows an action bar for the selected section', () => {
  render(<EditModeProvider><Harness /></EditModeProvider>);
  fireEvent.click(screen.getByText('select-hero'));
  expect(screen.getByTestId('section-action-bar')).toBeInTheDocument();
});

it('duplicates the selected section', () => {
  render(<EditModeProvider><Harness /></EditModeProvider>);
  fireEvent.click(screen.getByText('select-hero'));
  fireEvent.click(screen.getByText('Duplicate'));
  expect(useSiteContentDraftStore.getState().content.pages[0].sections.filter((s) => s.type === 'hero')).toHaveLength(2);
});

it('deletes after confirm', () => {
  render(<EditModeProvider><Harness /></EditModeProvider>);
  fireEvent.click(screen.getByText('select-hero'));
  fireEvent.click(screen.getByText('Delete'));
  fireEvent.click(screen.getByText('Confirm delete'));
  expect(useSiteContentDraftStore.getState().content.pages[0].sections.some((s) => s.id === 'hero')).toBe(false);
});

it('moves and hides the selected section', () => {
  render(<EditModeProvider><Harness /></EditModeProvider>);
  fireEvent.click(screen.getByText('select-hero'));
  fireEvent.click(screen.getByText('Move Down'));
  expect(useSiteContentDraftStore.getState().content.pages[0].sections[1].id).toBe('hero');
  fireEvent.click(screen.getByText('Hide'));
  expect(useSiteContentDraftStore.getState().content.pages[0].sections[1].isVisible).toBe(false);
});

it('renders nothing outside edit mode', () => {
  render(<EditModeProvider initial={{ editMode: false }}><Harness /></EditModeProvider>);
  fireEvent.click(screen.getByText('select-hero'));
  expect(screen.queryByTestId('section-action-bar')).toBeNull();
  expect(screen.queryByTestId('section-outline')).toBeNull();
});

it('outlines the hovered section', () => {
  render(<EditModeProvider><Harness /></EditModeProvider>);
  const hero = document.querySelector('[data-cms-section-id="hero"]') as HTMLElement;
  fireEvent.pointerOver(hero);
  expect(screen.getByTestId('section-outline')).toHaveAttribute('data-cms-outline-section-id', 'hero');
});

it('disables the action bar actions without a selection', () => {
  render(<EditModeProvider><Harness /></EditModeProvider>);
  fireEvent.pointerOver(document.querySelector('[data-cms-section-id="hero"]') as HTMLElement);
  const bar = screen.getByTestId('section-action-bar');
  within(bar).getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
});

it('cancels the delete confirm after three seconds', () => {
  jest.useFakeTimers();
  try {
    render(<EditModeProvider><Harness /></EditModeProvider>);
    fireEvent.click(screen.getByText('select-hero'));
    fireEvent.click(screen.getByText('Delete'));
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(useSiteContentDraftStore.getState().content.pages[0].sections.some((s) => s.id === 'hero')).toBe(true);
  } finally {
    jest.useRealTimers();
  }
});

it('ignores sections rendered outside the container', () => {
  render(<EditModeProvider><OutsideOnlyHarness /></EditModeProvider>);
  fireEvent.click(screen.getByText('select-ghost'));
  expect(screen.queryByTestId('section-action-bar')).toBeNull();
  expect(screen.queryByTestId('section-outline')).toBeNull();
});

it('cancels the delete confirm on escape', () => {
  render(<EditModeProvider><Harness /></EditModeProvider>);
  fireEvent.click(screen.getByText('select-hero'));
  fireEvent.click(screen.getByText('Delete'));
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.getByText('Delete')).toBeInTheDocument();
  expect(useSiteContentDraftStore.getState().content.pages[0].sections.some((s) => s.id === 'hero')).toBe(true);
});
