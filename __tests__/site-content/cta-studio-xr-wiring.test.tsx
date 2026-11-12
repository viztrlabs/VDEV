import React from 'react';
import { render, screen } from '@testing-library/react';
import FinalCTASection from '@/components/sections/FinalCTASection';
import StudioSection from '@/components/sections/StudioSection';
import XRWorldSection from '@/components/sections/XRWorldSection';
import { SectionInstanceProvider } from '@/components/site/SectionInstanceContext';
import { useSiteContentStore } from '@/lib/site-content-store';
import { buildDefaultSiteContent, getDefaultSection } from '@/lib/site-content';

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

function editField(content: ReturnType<typeof buildDefaultSiteContent>, sectionId: string, fieldId: string, value: string) {
  const section = content.pages[0].sections.find((s) => s.id === sectionId)!;
  section.fields = section.fields.map((f) =>
    f.kind === 'text' && f.id === fieldId ? { ...f, value } : f,
  );
  useSiteContentStore.setState({ content });
}

describe('Final CTA / Studio / XR World CMS wiring', () => {
  it('renders edited final CTA heading and button', () => {
    editField(buildDefaultSiteContent(), 'final-cta', 'heading', 'BUILD WITH US NOW');
    editField(useSiteContentStore.getState().content, 'final-cta', 'primaryLabel', 'BEGIN TODAY');
    render(<FinalCTASection />);
    expect(screen.getByText('BUILD WITH US NOW')).toBeInTheDocument();
    expect(screen.getByText('BEGIN TODAY')).toBeInTheDocument();
  });

  it('renders edited studio title', () => {
    editField(buildDefaultSiteContent(), 'studio', 'title', 'THE STUDIO DESK');
    render(<StudioSection />);
    expect(screen.getByText('THE STUDIO DESK')).toBeInTheDocument();
  });

  it('renders edited studio tagline', () => {
    editField(buildDefaultSiteContent(), 'studio', 'tagline', 'NEW TAGLINE TEXT');
    render(<StudioSection />);
    expect(screen.getByText('NEW TAGLINE TEXT')).toBeInTheDocument();
  });

  it('renders edited XR World tagline', () => {
    editField(buildDefaultSiteContent(), 'xr-world', 'tagline', 'STEP INSIDE THE BUILDING');
    render(<XRWorldSection />);
    expect(screen.getByText('STEP INSIDE THE BUILDING')).toBeInTheDocument();
  });

  it('renders instances supplied by the provider', () => {
    const cta = getDefaultSection('final-cta');
    cta.fields = cta.fields.map((f) =>
      f.kind === 'text' && f.id === 'heading' ? { ...f, value: 'INSTANCE CTA' } : f,
    );
    const studio = getDefaultSection('studio');
    studio.fields = studio.fields.map((f) =>
      f.kind === 'text' && f.id === 'title' ? { ...f, value: 'INSTANCE STUDIO' } : f,
    );
    const xrWorld = getDefaultSection('xr-world');
    xrWorld.fields = xrWorld.fields.map((f) =>
      f.kind === 'text' && f.id === 'tagline' ? { ...f, value: 'INSTANCE XR' } : f,
    );
    render(
      <>
        <SectionInstanceProvider pageId="home" section={cta}>
          <FinalCTASection />
        </SectionInstanceProvider>
        <SectionInstanceProvider pageId="home" section={studio}>
          <StudioSection />
        </SectionInstanceProvider>
        <SectionInstanceProvider pageId="home" section={xrWorld}>
          <XRWorldSection />
        </SectionInstanceProvider>
      </>,
    );
    expect(screen.getByText('INSTANCE CTA')).toBeInTheDocument();
    expect(screen.getByText('INSTANCE STUDIO')).toBeInTheDocument();
    expect(screen.getByText('INSTANCE XR')).toBeInTheDocument();
  });
});
