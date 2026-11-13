import React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionInstanceProvider } from '@/components/site/SectionInstanceContext';
import HeroSection from '@/components/sections/HeroSection';
import ShowreelSection from '@/components/sections/ShowreelSection';
import FinalCTASection from '@/components/sections/FinalCTASection';
import { getDefaultSection } from '@/lib/site-content';
import { EditModeProvider } from '@/components/admin/live-editor/in-context/EditModeContext';

jest.mock('next/image', () => {
  return function MockImage({ alt }: { alt: string }) {
    return <img alt={alt} data-testid="hero-img" />;
  };
});

function withSection(type: any, ui: React.ReactNode) {
  const section = getDefaultSection(type);
  return render(<SectionInstanceProvider pageId="home" section={section}>{ui}</SectionInstanceProvider>);
}

it('hero renders all seeded copy and editable eyebrows', () => {
  withSection('hero', <HeroSection />);
  expect(screen.getByText('NEXT-GEN SPATIAL ARCHITECTURE')).toBeInTheDocument();
  expect(screen.getByText('Scroll to explore')).toBeInTheDocument();
  expect(screen.getByText('VIZTR')).toBeInTheDocument();
});

it('binds inline editors for hero copy in edit mode', () => {
  const section = getDefaultSection('hero');
  render(
    <EditModeProvider>
      <SectionInstanceProvider pageId="home" section={section}>
        <HeroSection />
      </SectionInstanceProvider>
    </EditModeProvider>,
  );
  expect(document.querySelector('[data-cms-field="headline"]')).not.toBeNull();
  expect(document.querySelector('[data-cms-field="eyebrowPrimary"]')).not.toBeNull();
  expect(document.querySelector('[data-cms-field="scrollLabel"]')).not.toBeNull();
  expect(document.querySelector('[data-cms-field="heroImages"]')).not.toBeNull();
});

it('showreel renders badge and CTA copy from fields', () => {
  withSection('showreel', <ShowreelSection />);
  expect(screen.getByText(/CINEMATIC REEL/)).toBeInTheDocument();
  expect(screen.getByText('View Portfolio')).toBeInTheDocument();
});

it('final CTA renders rich description', () => {
  withSection('final-cta', <FinalCTASection />);
  expect(screen.getByText(/photorealistic 8K imagery/)).toBeInTheDocument();
});
