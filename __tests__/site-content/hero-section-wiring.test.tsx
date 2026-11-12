import React from 'react';
import { render, screen } from '@testing-library/react';
import HeroSection from '@/components/sections/HeroSection';
import { SectionInstanceProvider } from '@/components/site/SectionInstanceContext';
import { useSiteContentStore } from '@/lib/site-content-store';
import { buildDefaultSiteContent, getDefaultSection } from '@/lib/site-content';

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next/image', () => {
  return function MockImage({ alt }: { alt: string }) {
    return <img alt={alt} data-testid="hero-img" />;
  };
});

describe('HeroSection CMS wiring', () => {
  it('renders edited headline from the published store', () => {
    const content = buildDefaultSiteContent();
    const hero = content.pages[0].sections.find((s) => s.id === 'hero')!;
    hero.fields = hero.fields.map((f) =>
      f.kind === 'text' && f.id === 'headline' ? { ...f, value: 'CUSTOM HEADLINE' } : f,
    );
    useSiteContentStore.setState({ content });
    render(<HeroSection />);
    expect(screen.getByText('CUSTOM HEADLINE')).toBeInTheDocument();
    expect(screen.queryByText('VIZTR')).not.toBeInTheDocument();
  });

  it('renders duplicated hero instances independently', () => {
    const first = getDefaultSection('hero');
    const second = getDefaultSection('hero');
    second.id = 'hero-2';
    second.fields = second.fields.map((f) =>
      f.kind === 'text' && f.id === 'headline' ? { ...f, value: 'SECOND HERO' } : f,
    );
    render(
      <>
        <SectionInstanceProvider pageId="home" section={first}>
          <HeroSection />
        </SectionInstanceProvider>
        <SectionInstanceProvider pageId="home" section={second}>
          <HeroSection />
        </SectionInstanceProvider>
      </>,
    );
    expect(screen.getByText('VIZTR')).toBeInTheDocument();
    expect(screen.getByText('SECOND HERO')).toBeInTheDocument();
  });
});
