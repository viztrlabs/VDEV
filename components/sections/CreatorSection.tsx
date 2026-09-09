'use client';

import React from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { Box, Sparkles, Layers, PenTool, Zap, ExternalLink, ArrowRight } from 'lucide-react';

export default function CreatorSection() {
  const { creator } = homepageData;

  const getIcon = (name: string) => {
    const icons: Record<string, React.ReactNode> = {
      Box: <Box className="w-5 h-5" />,
      Sparkles: <Sparkles className="w-5 h-5" />,
      Layers: <Layers className="w-5 h-5" />,
      PenTool: <PenTool className="w-5 h-5" />,
      Zap: <Zap className="w-5 h-5" />,
      ExternalLink: <ExternalLink className="w-5 h-5" />,
    };
    return icons[name] || <Box className="w-5 h-5" />;
  };

  return (
    <section id="creator-section" className="py-28 bg-transparent text-white relative">
      <div className="w-full container-ultrawide">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="px-4 py-1.5 rounded-full glass-pill text-[#00F0FF] text-xs font-bold uppercase tracking-widest inline-block mb-4 border border-[#1E293B]">
            Creator
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-display mb-4">
            {creator.title}
          </h2>
          <p className="text-lg text-[#B9CACB] font-medium">{creator.tagline}</p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-12">
          {creator.tools.map((tool) => (
            <div
              key={tool.id}
              className={`group glass-card rounded-[2rem] p-6 transition-all border border-[#1E293B] ${
                tool.comingSoon ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#00F0FF]/60'
              }`}
            >
              <div className="p-3.5 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 w-fit mb-4 backdrop-blur-md shadow-inner text-[#00F0FF]">
                {getIcon(tool.icon)}
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">{tool.name}</h3>
              <p className="text-sm text-[#E5E2E3] leading-relaxed mb-4">{tool.description}</p>
              {tool.comingSoon ? (
                <span className="text-[#00F0FF] text-xs font-bold uppercase tracking-wider block">Coming Soon</span>
              ) : (
                <Link
                  href={tool.href}
                  className="flex items-center gap-2 text-[#00F0FF] text-sm font-semibold border-t border-[#1E293B] pt-4"
                >
                  <span>Open Tool</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href={creator.cta.href}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-sm transition-all shadow-[0_0_24px_rgba(0,240,255,0.4)] hover:scale-105"
          >
            <span>{creator.cta.label}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}