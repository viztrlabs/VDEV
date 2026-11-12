'use client';

import React, { useMemo } from 'react';
import { useSiteContentStore } from '@/lib/site-content-store';
import { buildDefaultSiteContent, SiteSection } from '@/lib/site-content';
import HeroSection from '@/components/sections/HeroSection';
import MarqueeSection from '@/components/sections/MarqueeSection';
import FourPillarsSection from '@/components/sections/FourPillarsSection';
import StudioSection from '@/components/sections/StudioSection';
import XRWorldSection from '@/components/sections/XRWorldSection';
import CreatorSection from '@/components/sections/CreatorSection';
import SolutionsSection from '@/components/sections/SolutionsSection';
import ShowreelSection from '@/components/sections/ShowreelSection';
import PortfolioPreview from '@/components/sections/PortfolioPreview';
import XRExperienceSection from '@/components/sections/XRExperienceSection';
import TrackProjectSection from '@/components/sections/TrackProjectSection';
import BenefitsSection from '@/components/sections/BenefitsSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import UseCasesSection from '@/components/sections/UseCasesSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import FAQSection from '@/components/sections/FAQSection';
import FinalCTASection from '@/components/sections/FinalCTASection';

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  hero: HeroSection,
  marquee: MarqueeSection,
  'four-pillars': FourPillarsSection,
  studio: StudioSection,
  'xr-world': XRWorldSection,
  creator: CreatorSection,
  solutions: SolutionsSection,
  showreel: ShowreelSection,
  'portfolio-preview': PortfolioPreview,
  'xr-experience': XRExperienceSection,
  'track-project': TrackProjectSection,
  benefits: BenefitsSection,
  'how-it-works': HowItWorksSection,
  'use-cases': UseCasesSection,
  testimonials: TestimonialsSection,
  faq: FAQSection,
  'final-cta': FinalCTASection,
};

export default function HomeSectionRenderer() {
  const publishedContent = useSiteContentStore((s) => s.content);
  const defaults = buildDefaultSiteContent();

  const sections: SiteSection[] = useMemo(() => {
    const storedPage = publishedContent.pages.find((p) => p.id === 'home');
    const sections = storedPage
      ? storedPage.sections
      : defaults.pages.find((p) => p.id === 'home')!.sections;
    return sections.filter((s) => s.isVisible);
  }, [publishedContent]);

  return (
    <>
      {sections.map((section) => {
        const Component = SECTION_COMPONENTS[section.id];
        if (!Component) return null;
        return (
          <div key={section.id} data-section-id={section.id}>
            <Component />
          </div>
        );
      })}
    </>
  );
}
