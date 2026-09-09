'use client';

import React from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { Building2, Home, Building, Palette, Briefcase, ArrowRight } from 'lucide-react';

export default function SolutionsSection() {
  const { solutions } = homepageData;

  const getIcon = (name: string) => {
    const icons: Record<string, React.ReactNode> = {
      Building2: <Building2 className="w-5 h-5" />,
      Home: <Home className="w-5 h-5" />,
      Building: <Building className="w-5 h-5" />,
      Palette: <Palette className="w-5 h-5" />,
      Briefcase: <Briefcase className="w-5 h-5" />,
    };
    return icons[name] || <Building2 className="w-5 h-5" />;
  };

  return (
    <section id="solutions-section" className="py-28 bg-transparent border-y border-[var(--glass-border)] relative">
      <div className="w-full container-ultrawide">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="px-4 py-1.5 rounded-full glass-pill text-[#42CF8B] text-xs font-bold uppercase tracking-widest inline-block mb-4 border border-[#1E293B]">
            Solutions
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-display mb-4">
            {solutions.title}
          </h2>
          <p className="text-lg text-[#B9CACB] font-medium">{solutions.subtitle}</p>
        </div>

        {/* Solution Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {solutions.audiences.map((audience) => (
            <Link
              key={audience.id}
              href={audience.href}
              className="group glass-card rounded-[2rem] p-6 hover:border-[#42CF8B]/60 transition-all space-y-4 border border-[#1E293B]"
            >
              <div className="p-3.5 rounded-full bg-[#42CF8B]/10 border border-[#42CF8B]/30 w-fit backdrop-blur-md shadow-inner text-[#42CF8B]">
                {getIcon(audience.icon)}
              </div>
              <h3 className="text-xl font-bold font-display text-white">{audience.title}</h3>
              <p className="text-sm text-[#E5E2E3] leading-relaxed">{audience.description}</p>
              <div className="flex items-center gap-2 text-[#00F0FF] text-sm font-semibold border-t border-[#1E293B] pt-4">
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}