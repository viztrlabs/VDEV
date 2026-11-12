import React from 'react';
import { render, screen } from '@testing-library/react';
import HomeSectionRenderer from '@/components/site/HomeSectionRenderer';
import {
  useSiteContentStore,
  useSiteContentDraftStore,
} from '@/lib/site-content-store';
import { buildDefaultSiteContent } from '@/lib/site-content';
import { SiteContentModeContext } from '@/components/site/SiteContentProvider';

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/components/sections/HeroSection', () => {
  return function Mock() {
    return <div data-testid="section-hero">HERO</div>;
  };
});
jest.mock('@/components/sections/MarqueeSection', () => {
  return function Mock() {
    return <div data-testid="section-marquee">MARQUEE</div>;
  };
});
jest.mock('@/components/sections/FourPillarsSection', () => {
  return function Mock() {
    return <div data-testid="section-four-pillars">FOUR_PILLARS</div>;
  };
});
jest.mock('@/components/sections/StudioSection', () => {
  return function Mock() {
    return <div data-testid="section-studio">STUDIO</div>;
  };
});
jest.mock('@/components/sections/XRWorldSection', () => {
  return function Mock() {
    return <div data-testid="section-xr-world">XR_WORLD</div>;
  };
});
jest.mock('@/components/sections/CreatorSection', () => {
  return function Mock() {
    return <div data-testid="section-creator">CREATOR</div>;
  };
});
jest.mock('@/components/sections/SolutionsSection', () => {
  return function Mock() {
    return <div data-testid="section-solutions">SOLUTIONS</div>;
  };
});
jest.mock('@/components/sections/ShowreelSection', () => {
  return function Mock() {
    return <div data-testid="section-showreel">SHOWREEL</div>;
  };
});
jest.mock('@/components/sections/PortfolioPreview', () => {
  return function Mock() {
    return <div data-testid="section-portfolio-preview">PORTFOLIO_PREVIEW</div>;
  };
});
jest.mock('@/components/sections/XRExperienceSection', () => {
  return function Mock() {
    return <div data-testid="section-xr-experience">XR_EXPERIENCE</div>;
  };
});
jest.mock('@/components/sections/TrackProjectSection', () => {
  return function Mock() {
    return <div data-testid="section-track-project">TRACK_PROJECT</div>;
  };
});
jest.mock('@/components/sections/BenefitsSection', () => {
  return function Mock() {
    return <div data-testid="section-benefits">BENEFITS</div>;
  };
});
jest.mock('@/components/sections/HowItWorksSection', () => {
  return function Mock() {
    return <div data-testid="section-how-it-works">HOW_IT_WORKS</div>;
  };
});
jest.mock('@/components/sections/UseCasesSection', () => {
  return function Mock() {
    return <div data-testid="section-use-cases">USE_CASES</div>;
  };
});
jest.mock('@/components/sections/TestimonialsSection', () => {
  return function Mock() {
    return <div data-testid="section-testimonials">TESTIMONIALS</div>;
  };
});
jest.mock('@/components/sections/FAQSection', () => {
  return function Mock() {
    return <div data-testid="section-faq">FAQ</div>;
  };
});
jest.mock('@/components/sections/FinalCTASection', () => {
  return function Mock() {
    return <div data-testid="section-final-cta">FINAL_CTA</div>;
  };
});

describe('HomeSectionRenderer', () => {
  it('renders all visible sections in default order', () => {
    render(<HomeSectionRenderer />);
    const ids = screen.getAllByTestId(/^section-/).map((el) => el.getAttribute('data-testid'));
    expect(ids[0]).toBe('section-hero');
    expect(ids).toContain('section-marquee');
    expect(ids[ids.length - 1]).toBe('section-final-cta');
  });

  it('skips a section toggled off', () => {
    useSiteContentStore.setState({ content: buildDefaultSiteContent() });
    useSiteContentStore.getState().toggleSection('home', 'hero');
    render(<HomeSectionRenderer />);
    expect(screen.queryByTestId('section-hero')).toBeNull();
    expect(screen.getByTestId('section-marquee')).toBeInTheDocument();
  });

  it('reorders sections when the store order changes', () => {
    const content = buildDefaultSiteContent();
    const home = content.pages[0];
    const hero = home.sections.find((s) => s.id === 'hero')!;
    const marquee = home.sections.find((s) => s.id === 'marquee')!;
    home.sections = [marquee, hero];
    useSiteContentStore.setState({ content });
    render(<HomeSectionRenderer />);
    const ids = screen.getAllByTestId(/^section-/).map((el) => el.getAttribute('data-testid'));
    expect(ids[0]).toBe('section-marquee');
    expect(ids[1]).toBe('section-hero');
  });

  it('renders the draft in draft mode so preview reflects unpublished toggles', () => {
    // Draft mode: toggling hero off in the draft store hides it.
    useSiteContentDraftStore.setState({ content: buildDefaultSiteContent() });
    useSiteContentDraftStore.getState().toggleSection('home', 'hero');
    const { unmount: unmountDraft } = render(
      <SiteContentModeContext.Provider value="draft">
        <HomeSectionRenderer />
      </SiteContentModeContext.Provider>,
    );
    expect(screen.queryByTestId('section-hero')).toBeNull();
    expect(screen.getByTestId('section-marquee')).toBeInTheDocument();
    unmountDraft();

    // Published mode (default): hero remains visible from the published store.
    useSiteContentStore.setState({ content: buildDefaultSiteContent() });
    render(<HomeSectionRenderer />);
    expect(screen.getByTestId('section-hero')).toBeInTheDocument();
  });
});
