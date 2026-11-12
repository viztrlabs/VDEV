import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import { SiteContentProvider, SiteContentModeContext } from '@/components/site/SiteContentProvider';
import { useSiteSection } from '@/lib/use-site-section';
import {
  useSiteContentStore,
  useSiteContentDraftStore,
} from '@/lib/site-content-store';
import { buildDefaultSiteContent } from '@/lib/site-content';

function resetStores() {
  useSiteContentStore.setState({ content: buildDefaultSiteContent() });
  useSiteContentDraftStore.setState({ content: buildDefaultSiteContent() });
}

function Probe({ pageId, sectionId }: { pageId: string; sectionId: string }) {
  const section = useSiteSection(pageId, sectionId);
  if (!section) return <span data-testid="probe">NULL</span>;
  return <span data-testid="probe">{section.id}</span>;
}

describe('useSiteSection', () => {
  beforeEach(resetStores);

  it('returns the published section by default', () => {
    render(
      <SiteContentProvider>
        <Probe pageId="home" sectionId="hero" />
      </SiteContentProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('hero');
  });

  it('returns null for a hidden section', () => {
    useSiteContentStore.getState().toggleSection('home', 'hero');
    render(
      <SiteContentProvider>
        <Probe pageId="home" sectionId="hero" />
      </SiteContentProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('NULL');
  });

  it('reads the draft store when cms-preview=1 is set', () => {
    useSiteContentDraftStore.getState().updateTextField('home', 'hero', 'headline', 'DRAFT ONLY');
    const { result } = renderHook(() => useSiteSection('home', 'hero'), {
      wrapper: ({ children }) => (
        <SiteContentModeContext.Provider value="draft">
          {children}
        </SiteContentModeContext.Provider>
      ),
    });
    const section = result.current!;
    const headline = section.fields.find((f) => f.id === 'headline') as { value: string };
    expect(headline.value).toBe('DRAFT ONLY');
  });
});
