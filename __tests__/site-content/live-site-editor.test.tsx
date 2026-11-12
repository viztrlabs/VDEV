import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import LiveSiteEditor from '@/components/admin/live-editor/LiveSiteEditor';
import {
  useSiteContentDraftStore,
  useSiteContentStore,
} from '@/lib/site-content-store';
import { buildDefaultSiteContent } from '@/lib/site-content';

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/lib/store', () => ({
  useAppStore: () => ({ showToast: jest.fn() }),
}));

const draft = () => useSiteContentDraftStore.getState();

describe('LiveSiteEditor', () => {
  beforeEach(() => {
    resetStores();
  });

  function resetStores() {
    useSiteContentDraftStore.setState({ content: buildDefaultSiteContent() });
    useSiteContentStore.setState({ content: buildDefaultSiteContent() });
  }

  it('renders page tree with homepage sections', () => {
    render(<LiveSiteEditor />);
    expect(screen.getByText('Hero')).toBeInTheDocument();
    expect(screen.getByText('Showreel')).toBeInTheDocument();
    expect(screen.getByText('Final CTA')).toBeInTheDocument();
  });

  it('live preview toggle removes the iframe', () => {
    render(<LiveSiteEditor />);
    expect(screen.getByTitle('live-site-preview')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /live preview/i }));
    expect(screen.queryByTitle('live-site-preview')).toBeNull();
  });

  it('editing a text field updates the draft store', () => {
    render(<LiveSiteEditor />);
    fireEvent.click(screen.getByText('Hero'));
    const input = screen.getByDisplayValue('VIZTR');
    fireEvent.change(input, { target: { value: 'CHANGED VIA EDITOR' } });
    const hero = draft().content.pages[0].sections.find((s) => s.id === 'hero')!;
    const field = hero.fields.find((f) => f.id === 'headline') as { value: string };
    expect(field.value).toBe('CHANGED VIA EDITOR');
  });

  it('section visibility toggle updates draft', () => {
    render(<LiveSiteEditor />);
    const row = screen.getByText('Showreel').closest('[data-testid="section-row"]')!;
    fireEvent.click(within(row as HTMLElement).getByRole('button', { name: /hide/i }));
    expect(draft().content.pages[0].sections.find((s) => s.id === 'showreel')!.isVisible).toBe(false);
  });

  it('publish copies draft to published store', () => {
    draft().updateTextField('home', 'hero', 'headline', 'PUBLISH ME');
    render(<LiveSiteEditor />);
    fireEvent.click(screen.getByRole('button', { name: /publish/i }));
    const hero = useSiteContentStore.getState().content.pages[0].sections.find((s) => s.id === 'hero')!;
    const field = hero.fields.find((f) => f.id === 'headline') as { value: string };
    expect(field.value).toBe('PUBLISH ME');
  });

  it('reset draft restores defaults', () => {
    draft().updateTextField('home', 'hero', 'headline', 'WILL BE RESET');
    render(<LiveSiteEditor />);
    fireEvent.click(screen.getByRole('button', { name: /reset draft/i }));
    const hero = draft().content.pages[0].sections.find((s) => s.id === 'hero')!;
    const field = hero.fields.find((f) => f.id === 'headline') as { value: string };
    expect(field.value).toBe('VIZTR');
  });

  it('reset draft refreshes the preview iframe', () => {
    render(<LiveSiteEditor />);
    const before = screen.getByTitle('live-site-preview');
    fireEvent.click(screen.getByRole('button', { name: /reset draft/i }));
    const after = screen.getByTitle('live-site-preview');
    expect(after).not.toBe(before);
  });

  it('commits media URL to draft only on blur', () => {
    render(<LiveSiteEditor />);
    fireEvent.click(screen.getByText('Hero'));
    const input = screen.getByPlaceholderText('Paste media URL') as HTMLInputElement;
    const heroImages = () =>
      draft()
        .content.pages[0].sections.find((s) => s.id === 'hero')!
        .fields.find((f) => f.id === 'heroImages') as { urls: string[] };
    const original = heroImages().urls[0];

    fireEvent.change(input, { target: { value: '/images/typed.jpg' } });
    expect(heroImages().urls[0]).toBe(original);
    expect(input.value).toBe('/images/typed.jpg');

    fireEvent.blur(input);
    expect(heroImages().urls[0]).toBe('/images/typed.jpg');
  });

  it('move section up reorders draft', () => {
    render(<LiveSiteEditor />);
    const row = screen.getByText('Showreel').closest('[data-testid="section-row"]')!;
    fireEvent.click(within(row as HTMLElement).getByRole('button', { name: /move up/i }));
    const ids = draft().content.pages[0].sections.map((s) => s.id);
    expect(ids.indexOf('showreel')).toBeLessThan(ids.indexOf('solutions'));
  });
});
