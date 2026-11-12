import React from 'react';
import { render, screen } from '@testing-library/react';
import HeroSection from '@/components/sections/HeroSection';
import { useSiteContentStore } from '@/lib/site-content-store';
import { buildDefaultSiteContent } from '@/lib/site-content';

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
});
