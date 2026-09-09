'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { portfolioProjects } from '@/data/portfolio';
import { useAppStore } from '@/lib/store';
import { ArrowRight, Compass, Box, Play, Eye } from 'lucide-react';

export default function PortfolioPreview() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'exterior' | 'interior' | 'walkthrough' | 'xr' | '360'>('all');
  const { openLightbox, openPanorama, openModelViewer } = useAppStore();

  const filteredProjects = activeFilter === 'all'
    ? portfolioProjects
    : portfolioProjects.filter((p) => p.category === activeFilter);

  return (
    <section id="portfolio-preview" className="py-24 w-full container-ultrawide border-t border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#42CF8B] animate-pulse shadow-[0_0_8px_#42CF8B]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#42CF8B]">
              ARCHIVE & ARTIFACTS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAFAFA] font-display">
            Selected Works
          </h2>
          <p className="text-xs sm:text-sm text-[#B9CACB] mt-1 prose-readable">
            Filter between photorealistic still imagery, cinematic films, and WebXR experiences.
          </p>
        </div>

        <Link
          href="/portfolio"
          className="text-xs font-mono font-semibold text-[#00F0FF] hover:underline inline-flex items-center gap-1.5 shrink-0"
        >
          <span>ALL PROJECTS →</span>
        </Link>
      </div>

      {/* FILTER PILLS */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {(['all', 'exterior', 'interior', 'walkthrough', 'xr', '360'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer border ${
              activeFilter === cat
                ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_16px_rgba(0,240,255,0.4)]'
                : 'glass-pill text-[var(--text-secondary)] hover:text-white border-[#1E293B]'
            }`}
          >
            {cat === 'all' ? 'All Works' : cat}
          </button>
        ))}
      </div>

      {/* PROJECT GRID - Ultra-wide expanded columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 grid-ultrawide-4 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="group rounded-[2rem] overflow-hidden glass-card flex flex-col justify-between border border-[#1E293B]"
          >
            <div>
              {/* Media Preview Box */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40 border-b border-[#1E293B]">
                <Image
                  src={project.featuredImage}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, (max-width: 1920px) 33vw, 25vw"
                  quality={85}
                  className="object-cover render-lighting-enhanced group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-[2]" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full glass text-[#FAFAFA] text-[9px] font-mono font-bold uppercase tracking-wider border border-[#1E293B]">
                    {project.category}
                  </span>
                  {project.panorama && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#00F0FF] text-black text-[9px] font-mono font-extrabold flex items-center gap-1 shadow-sm">
                      <Compass className="w-2.5 h-2.5" />
                      <span>360°</span>
                    </span>
                  )}
                  {project.video && (
                    <span className="px-2.5 py-0.5 rounded-full glass text-[#00F0FF] border border-[#00F0FF]/40 text-[9px] font-mono font-bold flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-[#00F0FF]" />
                      <span>4K FILM</span>
                    </span>
                  )}
                </div>

                {/* Hover Overlay with Quick Launch Actions */}
                <div className="absolute inset-0 bg-black/65 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {project.panorama ? (
                    <button
                      onClick={() => openPanorama(project.panorama!, project.title)}
                      className="px-4 py-2 rounded-full bg-[#42CF8B] hover:bg-[#58dc9b] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>360° Node</span>
                    </button>
                  ) : project.model3d ? (
                    <button
                      onClick={() => openModelViewer('', project.title)}
                      className="px-4 py-2 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>WebXR 3D</span>
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        openLightbox(
                          project.galleryImages.map((g) => ({
                            url: g,
                            title: project.title,
                            type: project.video ? 'video' : 'image',
                            caption: project.shortDescription
                          }))
                        )
                      }
                      className="px-4 py-2 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Gallery</span>
                    </button>
                  )}

                  <Link
                    href={`/portfolio/${project.id}`}
                    className="p-2 rounded-full glass hover:border-[#00F0FF]/50 text-[#FAFAFA] text-xs transition-colors border border-[#1E293B]"
                    title="Case Study Page"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Title & Info */}
              <div className="p-4 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#a1abc4]">
                  <span>{project.location}</span>
                  <span>{project.year}</span>
                </div>
                <h3 className="text-sm font-bold text-[#FAFAFA]">
                  <Link href={`/portfolio/${project.id}`} className="hover:text-[#00F0FF] transition-colors">
                    {project.title}
                  </Link>
                </h3>
                <p className="text-xs text-[#a1abc4] line-clamp-2 leading-relaxed">
                  {project.shortDescription}
                </p>
              </div>
            </div>

              {/* Bottom Tag Bar */}
              <div className="px-4 pb-4 pt-0 flex flex-wrap gap-1">
                {project.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full glass text-[9px] font-mono text-[#a1abc4]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
        ))}
      </div>
    </section>
  );
}
