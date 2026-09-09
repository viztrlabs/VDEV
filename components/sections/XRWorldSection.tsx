'use client';

import React from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { ArrowRight, Box, ScanLine, Headset, Compass, Sparkles, Cpu } from 'lucide-react';

export default function XRWorldSection() {
  const { xrWorld } = homepageData;

  const getIcon = (name: string) => {
    const icons: Record<string, React.ReactNode> = {
      Box: <Box className="w-5 h-5" />,
      ScanLine: <ScanLine className="w-5 h-5" />,
      Headset: <Headset className="w-5 h-5" />,
      Compass: <Compass className="w-5 h-5" />,
      Sparkles: <Sparkles className="w-5 h-5" />,
      Cpu: <Cpu className="w-5 h-5" />,
    };
    return icons[name] || <Box className="w-5 h-5" />;
  };

  return (
    <section id="xr-world-section" className="py-28 px-6 bg-transparent border-y border-[var(--glass-border)] relative">
      <div className="container-ultrawide">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="px-4 py-1.5 rounded-full glass-pill text-[#42CF8B] text-xs font-bold uppercase tracking-widest inline-block mb-4 border border-[#1E293B]">
            Section 02
          </span>
          <h2 className="text-fluid-h2 font-bold tracking-tight text-white font-display mb-4">
            {xrWorld.title}
          </h2>
          <p className="text-lg text-[#B9CACB] font-medium prose-readable mx-auto">{xrWorld.tagline}</p>
        </div>

        {/* Experience Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 grid-ultrawide-3 gap-6 w-full">
          {xrWorld.experiences.map((exp) => (
            <Link
              key={exp.id}
              href={exp.href}
              className="group glass-card rounded-[2rem] p-6 hover:border-[#42CF8B]/60 transition-all space-y-4 border border-[#1E293B]"
            >
              <div className="p-3.5 rounded-full bg-[#42CF8B]/10 border border-[#42CF8B]/30 w-fit backdrop-blur-md shadow-inner text-[#42CF8B]">
                {getIcon(exp.icon)}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold font-display text-white">{exp.name}</h3>
                  {exp.badge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#42CF8B]/20 border border-[#42CF8B]/35 text-[#42CF8B] text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-sm">
                      {exp.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#E5E2E3] leading-relaxed">{exp.purpose}</p>
              </div>
              <div className="flex items-center gap-2 text-[#00F0FF] text-sm font-semibold border-t border-[#1E293B] pt-4">
                <span>Explore</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href={xrWorld.cta.href}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#42CF8B] hover:bg-[#58dc9b] text-black font-bold text-sm transition-all shadow-[0_0_24px_rgba(66,207,139,0.3)] hover:scale-105"
          >
            <span>{xrWorld.cta.label}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}