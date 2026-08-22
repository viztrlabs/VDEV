'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
    <section id="portfolio-preview-section" className="py-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#3ECF8E]">
              ARCHIVE & ARTIFACTS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAFAFA]">
            Selected Works
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            Filter between photorealistic still imagery, cinematic films, and WebXR experiences.
          </p>
        </div>

        <Link
          href="/portfolio"
          className="text-xs font-mono font-semibold text-[#3ECF8E] hover:underline inline-flex items-center gap-1.5 shrink-0"
        >
          <span>ALL PROJECTS →</span>
        </Link>
      </div>

      {/* FILTER PILLS */}
      <div className="flex flex-wrap items-center gap-1.5 mb-6">
        {(['all', 'exterior', 'interior', 'walkthrough', 'xr', '360'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer border ${
              activeFilter === cat
                ? 'bg-[#3ECF8E] text-black border-[#3ECF8E]'
                : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:text-white hover:border-[#3f3f46]'
            }`}
          >
            {cat === 'all' ? 'All Works' : cat}
          </button>
        ))}
      </div>

      {/* PROJECT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="group rounded-xl overflow-hidden bg-[#18181B] border border-[#27272A] hover:border-[#3f3f46] transition-all flex flex-col justify-between"
          >
            <div>
              {/* Media Preview Box */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#09090B] border-b border-[#27272A]">
                <img
                  src={project.featuredImage}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-[#09090B]/90 text-[#FAFAFA] border border-[#27272A] text-[9px] font-mono font-bold uppercase tracking-wider">
                    {project.category}
                  </span>
                  {project.panorama && (
                    <span className="px-1.5 py-0.5 rounded bg-[#3ECF8E] text-black text-[9px] font-mono font-extrabold flex items-center gap-1">
                      <Compass className="w-2.5 h-2.5" />
                      <span>360°</span>
                    </span>
                  )}
                  {project.video && (
                    <span className="px-1.5 py-0.5 rounded bg-[#18181B] text-[#3ECF8E] border border-[#3ECF8E]/40 text-[9px] font-mono font-bold flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-[#3ECF8E]" />
                      <span>4K FILM</span>
                    </span>
                  )}
                </div>

                {/* Hover Overlay with Quick Launch Actions */}
                <div className="absolute inset-0 bg-[#09090B]/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {project.panorama ? (
                    <button
                      onClick={() => openPanorama(project.panorama!, project.title)}
                      className="px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>360° Node</span>
                    </button>
                  ) : project.model3d ? (
                    <button
                      onClick={() => openModelViewer('', project.title)}
                      className="px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
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
                      className="px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Gallery</span>
                    </button>
                  )}

                  <Link
                    href={`/portfolio/${project.id}`}
                    className="p-1.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] border border-[#27272A] text-xs"
                    title="Case Study Page"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Title & Info */}
              <div className="p-4 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A]">
                  <span>{project.location}</span>
                  <span>{project.year}</span>
                </div>
                <h3 className="text-sm font-bold text-[#FAFAFA]">
                  <Link href={`/portfolio/${project.id}`} className="hover:text-[#3ECF8E] transition-colors">
                    {project.title}
                  </Link>
                </h3>
                <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                  {project.shortDescription}
                </p>
              </div>
            </div>

            {/* Bottom Tag Bar */}
            <div className="px-4 pb-4 pt-0 flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[9px] font-mono text-[#71717A]"
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
