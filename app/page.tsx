'use client';

import React from 'react';
import HeroSection from '@/components/sections/HeroSection';
import MarqueeSection from '@/components/sections/MarqueeSection';
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

export default function HomePage() {
  return (
    <main id="viztr-homepage" className="flex-1 w-full overflow-hidden">
      {/* SECTION 1: HERO - Master entry point to VizTR ecosystem */}
      <HeroSection />

      {/* SECTION 2: MARQUEE - Animated ticker */}
      <MarqueeSection />

      {/* SECTION 3: STUDIO - Section 01 */}
      <StudioSection />

      {/* SECTION 4: XR WORLD - Section 02 */}
      <XRWorldSection />

      {/* SECTION 5: CREATOR - The bridge between SaaS and XR World */}
      <CreatorSection />

      {/* SECTION 6: SOLUTIONS - Industry-specific solutions */}
      <SolutionsSection />

      {/* SECTION 7: SHOWREEL CINEMATIC VIDEO */}
      <ShowreelSection />

      {/* SECTION 8: PORTFOLIO PREVIEW */}
      <PortfolioPreview />

      {/* SECTION 9: XR WORLD INTERACTIVE EXPERIENCE */}
      <XRExperienceSection />

      {/* SECTION 10: TRACK YOUR PROJECT */}
      <TrackProjectSection />

      {/* SECTION 11: BENEFITS */}
      <BenefitsSection />

      {/* SECTION 12: HOW IT WORKS */}
      <HowItWorksSection />

      {/* SECTION 13: USE CASES */}
      <UseCasesSection />

      {/* SECTION 14: TESTIMONIALS & STATS */}
      <TestimonialsSection />

      {/* SECTION 15: FAQ */}
      <FAQSection />

      {/* SECTION 16: FINAL CTA */}
      <FinalCTASection />
    </main>
  );
}