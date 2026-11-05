'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Check, ArrowRight, ChevronDown, Compass } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for individual creators and small projects',
    price: '29',
    features: ['5 GB cloud storage', '100 renders per month', 'Basic materials', 'Community support'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'For teams and studios producing high-volume content',
    price: '99',
    features: ['50 GB cloud storage', '500 renders per month', 'Premium materials', 'Priority support', 'XR exports'],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: 'Custom',
    features: ['Unlimited storage', 'Unlimited renders', 'Custom branding', 'Dedicated account manager', 'API access'],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <main className="flex-1 w-full pb-24 bg-zinc-950 text-white">
      {/* 1. HERO PRESENTATION AREA (Full Landing Page Presentation Aspect Ratio) */}
      <section
        id="hero-section"
        className="relative w-full h-screen min-h-[680px] flex flex-col justify-between items-center overflow-hidden text-white select-none transition-colors duration-300"
      >
        {/* MEDIA LAYER: Full Bleed High-Res Architectural Render */}
        <div className="hero-media-layer absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/assets/hero/hero-02.jpg"
              alt="Pricing & Studio Plans"
              fill
              priority
              quality={90}
              sizes="100vw"
              className="hero-bg-image object-cover object-center render-lighting-enhanced"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-[#0A0A0B]/65 pointer-events-none z-20" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#0A0A0B]/25 to-[#0A0A0B]/80 pointer-events-none z-20" />
        </div>

        {/* TOP AREA: Clears floating header & hosts Eyebrow Badge (No directory breadcrumbs) */}
        <div className="relative z-20 w-full pt-16 sm:pt-20 shrink-0 flex justify-center px-2 sm:px-4">
          <div className="hero-eyebrow inline-flex items-center gap-1.5 sm:gap-2.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#0A0A0B] shadow-2xl transition-all border border-[#1E293B] text-[10px] sm:text-xs max-w-[95vw] sm:max-w-none">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#42CF8B] animate-pulse shrink-0" />
            <span className="font-bold text-[#42CF8B] tracking-wider uppercase shrink-0">TRANSPARENT TIERS</span>
            <span className="opacity-40 shrink-0">|</span>
            <span className="opacity-80 shrink-0">Studio & Spatial Cloud Plans</span>
          </div>
        </div>

        {/* BOTTOM HERO CONTENT: Fluid typography, original content & pill CTAs */}
        <div className="relative z-20 w-full container-ultrawide text-center flex flex-col items-center justify-end mt-auto px-4 sm:px-6 pb-6 sm:pb-8">
          <h1 className="hero-headline text-fluid-hero font-extrabold tracking-tight mb-2 sm:mb-3 font-sans">
            Transparent Studio Pricing
          </h1>

          <p className="hero-subheadline text-fluid-sub font-medium tracking-wide mb-3 max-w-3xl">
            Choose the plan that fits your workflow. No hidden fees.
          </p>

          <p className="hero-desc text-fluid-desc max-w-2xl 2xl:max-w-3xl text-center prose-readable font-normal leading-relaxed mb-6 text-[#E5E2E3]">
            Scale your architectural CGI, WebXR spatial models, and real-time visualization pipelines with transparent monthly or custom enterprise commitments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-6">
            <a
              href="#pricing-plans"
              id="hero-primary-cta"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Explore Plan Options</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>

            <Link
              href="/book-consultation"
              id="hero-secondary-cta"
              className="hero-secondary-btn w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#131314] hover:bg-[#1E293B] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-[#1E293B]"
            >
              <Compass className="w-4 h-4 text-[#42CF8B]" />
              <span>Book Consultation</span>
            </Link>
          </div>

          {/* Bottom Bar: Scroll Indicator */}
          <div className="relative w-full flex items-center justify-center pt-2">
            <div className="sm:block">
                <a
                  href="#pricing-plans"
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById('pricing-plans');
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                    else window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                  }}
                  className="hero-scroll-btn group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0A0B] text-[#FAFAFA] text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:bg-[#131314] border border-[#1E293B]"
                  aria-label="Scroll down to explore"
                >
                  <span>Scroll to explore</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#00F0FF] animate-bounce" />
                </a>
            </div>
          </div>
        </div>
      </section>

      {/* PLANS SECTION */}
      <section id="pricing-plans" className="container mx-auto py-20 px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-3.5 py-1 rounded-full bg-[#0A0A0B] border border-[#1E293B] text-emerald-400 text-xs font-bold uppercase tracking-widest inline-block mb-4">
            Production Tiers
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold font-display mb-4 text-[#FAFAFA]">
            Predictable Scaling for Every Scale
          </h2>
          <p className="text-base sm:text-lg text-[#B9CACB]">
            From single architectural visualization commissions to continuous enterprise pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 bg-[#131314] border rounded-[2rem] transition-all shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] ${
                plan.popular
                  ? 'border-emerald-500/50'
                  : 'border-[#1E293B] hover:border-[#27272A]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-black rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2 text-[#FAFAFA]">{plan.name}</h3>
              <p className="text-sm text-[#B9CACB] mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#FAFAFA]">${plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-zinc-500">/month</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.price === 'Custom' ? '/contact' : `/app/register?plan=${plan.name.toLowerCase()}`}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black font-bold'
                    : 'bg-[#0A0A0B] hover:bg-[#1E293B] text-white border border-[#1E293B]'
                }`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
