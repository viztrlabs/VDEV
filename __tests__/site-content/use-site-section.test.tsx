import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import { SectionInstanceProvider } from '@/components/site/SectionInstanceContext';
import { useSiteSection } from '@/lib/use-site-section';
import {
  useSiteContentStore,
  useSiteContentDraftStore,
} from '@/lib/site-content-store';
import { buildDefaultSiteContent, getDefaultSection } from '@/lib/site-content';

function resetStores() {
  useSiteContentStore.setState({ content: buildDefaultSiteContent() });
  useSiteContentDraftStore.setState({ content: buildDefaultSiteContent() });
}

function Probe({ type }: { type: 'hero' | 'showreel' }) {
  const section = useSiteSection(type);
  if (!section) return <span data-testid="probe">NULL</span>;
  return <span data-testid="probe">{section.id}</span>;
}

describe('useSiteSection', () => {
  beforeEach(resetStores);

  it('returns the published section matching the type by default', () => {
    render(<Probe type="hero" />);
    expect(screen.getByTestId('probe')).toHaveTextContent('hero');
  });

  it('never returns null for a valid type when the stored section is hidden', () => {
    useSiteContentStore.getState().toggleSection('home', 'hero');
    render(<Probe type="hero" />);
    expect(screen.getByTestId('probe')).toHaveTextContent('hero');
  });

  it('prefers the instance supplied by the provider', () => {
    const content = buildDefaultSiteContent();
    const draftHero = content.pages[0].sections.find((s) => s.id === 'hero')!;
    draftHero.id = 'hero-draft';
    draftHero.fields = draftHero.fields.map((f) =>
      f.kind === 'text' && f.id === 'headline' ? { ...f, value: 'DRAFT ONLY' } : f,
    );

    const { result } = renderHook(() => useSiteSection('hero'), {
      wrapper: ({ children }) => (
        <SectionInstanceProvider pageId="home" section={draftHero}>
          {children}
        </SectionInstanceProvider>
      ),
    });
    const section = result.current!;
    const headline = section.fields.find((f) => f.id === 'headline') as { value: string };
    expect(section.id).toBe('hero-draft');
    expect(headline.value).toBe('DRAFT ONLY');
  });

  it('falls back to the default section when the store has no section of that type', () => {
    useSiteContentStore.setState({ content: { version: 2, pages: [] } });
    const { result } = renderHook(() => useSiteSection('hero'));
    expect(result.current).toEqual(getDefaultSection('hero'));
  });
});
