import React from 'react';
import { render, screen } from '@testing-library/react';
import ShowreelSection from '@/components/sections/ShowreelSection';
import { SectionInstanceProvider } from '@/components/site/SectionInstanceContext';
import { useSiteContentStore } from '@/lib/site-content-store';
import { buildDefaultSiteContent, getDefaultSection } from '@/lib/site-content';

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe('ShowreelSection CMS wiring', () => {
  it('renders edited title and video src from the published store', () => {
    const content = buildDefaultSiteContent();
    const showreel = content.pages[0].sections.find((s) => s.id === 'showreel')!;
    showreel.fields = showreel.fields.map((f) => {
      if (f.kind === 'text' && f.id === 'title') return { ...f, value: 'CUSTOM SHOWREEL' };
      if (f.kind === 'media' && f.id === 'videoUrl') return { ...f, urls: ['https://cdn.example.com/reel.mp4'] };
      return f;
    });
    useSiteContentStore.setState({ content });
    const { container } = render(<ShowreelSection />);
    expect(screen.getByText('CUSTOM SHOWREEL')).toBeInTheDocument();
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', 'https://cdn.example.com/reel.mp4');
  });

  it('renders the instance supplied by the provider', () => {
    const showreel = getDefaultSection('showreel');
    showreel.fields = showreel.fields.map((f) =>
      f.kind === 'text' && f.id === 'title' ? { ...f, value: 'INSTANCE SHOWREEL' } : f,
    );
    render(
      <SectionInstanceProvider pageId="home" section={showreel}>
        <ShowreelSection />
      </SectionInstanceProvider>,
    );
    expect(screen.getByText('INSTANCE SHOWREEL')).toBeInTheDocument();
  });
});
