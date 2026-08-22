'use client';

import React from 'react';
import HeroSection from '@/components/sections/HeroSection';
import MarqueeSection from '@/components/sections/MarqueeSection';
import ServiceCategories from '@/components/sections/ServiceCategories';
import StudioPreview from '@/components/sections/StudioPreview';
import XRPreview from '@/components/sections/XRPreview';
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
      {/* SECTION 1: HERO */}
      <HeroSection />

      {/* SECTION 2: MARQUEE */}
      <MarqueeSection />

      {/* SECTION 3: SERVICE CATEGORIES (STUDIO & XR WORLD) */}
      <ServiceCategories />

      {/* SECTION 4: STUDIO SERVICES PREVIEW */}
      <StudioPreview />

      {/* SECTION 5: XR WORLD SERVICES PREVIEW */}
      <XRPreview />

      {/* SECTION 6: SHOWREEL CINEMATIC VIDEO */}
      <ShowreelSection />

      {/* SECTION 7: PORTFOLIO PREVIEW */}
      <PortfolioPreview />

      {/* SECTION 8: XR WORLD INTERACTIVE EXPERIENCE */}
      <XRExperienceSection />

      {/* SECTION 9: TRACK YOUR PROJECT */}
      <TrackProjectSection />

      {/* SECTION 10: BENEFITS */}
      <BenefitsSection />

      {/* SECTION 11: HOW IT WORKS */}
      <HowItWorksSection />

      {/* SECTION 12: USE CASES */}
      <UseCasesSection />

      {/* SECTION 13: TESTIMONIALS & STATS */}
      <TestimonialsSection />

      {/* SECTION 14: FAQ */}
      <FAQSection />

      {/* SECTION 15: FINAL CTA */}
      <FinalCTASection />
    </main>
  );
}
