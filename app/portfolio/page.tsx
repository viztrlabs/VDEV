'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { portfolioProjects, PortfolioProject } from '@/data/portfolio';
import { useAppStore } from '@/lib/store';
import {
  Search,
  Compass,
  Box,
  Play,
  Eye,
  ArrowRight,
  Sparkles,
  Filter,
  ChevronDown
} from 'lucide-react';

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { openLightbox, openPanorama, openModelViewer } = useAppStore();

  const filteredProjects = portfolioProjects.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.client.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="flex-1 w-full pb-24">
      {/* 1. HERO PRESENTATION AREA (Full Landing Page Presentation Aspect Ratio) */}
      <section
        id="hero-section"
        className="relative w-full h-screen min-h-[680px] flex flex-col justify-between items-center overflow-hidden text-white select-none transition-colors duration-300"
      >
        {/* MEDIA LAYER: Full Bleed High-Res Architectural Render */}
        <div className="hero-media-layer absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={portfolioProjects[0]?.image || '/assets/hero/hero-01.jpg'}
              alt="Selected Portfolio & Case Studies"
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
            <span className="font-bold text-[#42CF8B] tracking-wider uppercase shrink-0">ARCHITECTURAL ARCHIVE</span>
            <span className="opacity-40 shrink-0">|</span>
            <span className="opacity-80 shrink-0">Selected Case Studies</span>
          </div>
        </div>

        {/* BOTTOM HERO CONTENT: Fluid typography, original content & pill CTAs */}
        <div className="relative z-20 w-full container-ultrawide text-center flex flex-col items-center justify-end mt-auto px-4 sm:px-6 pb-6 sm:pb-8">
          <h1 className="hero-headline text-fluid-hero font-extrabold tracking-tight mb-2 sm:mb-3 font-sans">
            Selected Portfolio & Case Studies
          </h1>

          <p className="hero-subheadline text-fluid-sub font-medium tracking-wide mb-3 max-w-3xl">
            Supertall Towers, Luxury Residences, WebXR Platforms & 360° Virtual Tours
          </p>

          <p className="hero-desc text-fluid-desc max-w-2xl 2xl:max-w-3xl text-center prose-readable font-normal leading-relaxed mb-6 text-[#E5E2E3]">
            Explore our curated body of work across supertall towers, luxury residences, WebXR platforms, and 360° virtual tours.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-6">
            <a
              href="#portfolio-archive"
              id="hero-primary-cta"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Explore All Projects</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>

            <Link
              href="/book-consultation"
              id="hero-secondary-cta"
              className="hero-secondary-btn w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#131314] hover:bg-[#1E293B] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-105 active:scale-95 border border-[#1E293B]"
            >
              <Compass className="w-4 h-4 text-[#42CF8B]" />
              <span>Commission A Project</span>
            </Link>
          </div>

          {/* Bottom Bar: Scroll Indicator */}
          <div className="relative w-full flex items-center justify-center pt-2">
            <div className="sm:block">
              <a
                href="#portfolio-archive"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById('portfolio-archive');
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

      {/* FILTER & SEARCH BAR */}
      <section id="portfolio-archive" className="sticky top-20 z-40 bg-[#0A0A0B] border-b border-[#1E293B] py-4 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'exterior', label: 'Exterior CGI' },
              { id: 'interior', label: 'Interior CGI' },
              { id: 'walkthrough', label: 'Animations' },
              { id: 'xr', label: 'WebXR 3D' },
              { id: '360', label: '360° Tours' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#0A0A0B] text-rose-500 border border-[#1E293B]'
                    : 'bg-[#131314] text-[#B9CACB] border border-[#1E293B] hover:bg-[#1E293B]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#B9CACB] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search project, city, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#131314] border border-[#1E293B] text-xs text-[#FAFAFA] placeholder-[#B9CACB] focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </section>

      {/* PROJECT GRID */}
      <section className="py-12 px-6 max-w-[1280px] mx-auto">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-base text-[#B9CACB]">
              No projects match your search criteria.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group rounded-[2rem] overflow-hidden bg-[#131314] border border-[#1E293B] shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Media Thumbnail */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
                    <Image
                      src={project.featuredImage}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      referrerPolicy="no-referrer"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                        {project.category}
                      </span>
                      {project.panorama && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1">
                          <Compass className="w-3 h-3" />
                          <span>360°</span>
                        </span>
                      )}
                      {project.video && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1">
                          <Play className="w-3 h-3 fill-white" />
                          <span>Film</span>
                        </span>
                      )}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      {project.panorama ? (
                        <button
                          onClick={() => openPanorama(project.panorama!, project.title)}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105"
                        >
                          <Compass className="w-4 h-4" />
                          <span>360° Tour</span>
                        </button>
                      ) : project.model3d ? (
                        <button
                          onClick={() => openModelViewer('', project.title)}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105"
                        >
                          <Box className="w-4 h-4" />
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
                          className="px-4 py-2 rounded-xl bg-white text-zinc-950 text-xs font-bold shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Gallery ({project.galleryImages.length})</span>
                        </button>
                      )}

                      <Link
                        href={`/portfolio/${project.id}`}
                        className="p-2.5 rounded-xl bg-white/20 hover:bg-white/40 text-white text-xs backdrop-blur-md"
                        title="Open Case Study"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#B9CACB]">
                      <span>{project.location}</span>
                      <span className="font-mono">{project.year}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#FAFAFA] font-display">
                      <Link href={`/portfolio/${project.id}`} className="hover:text-rose-500 transition-colors">
                        {project.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-[#B9CACB] line-clamp-2 leading-relaxed">
                      {project.shortDescription}
                    </p>
                  </div>
                </div>

                {/* Footer Tags & Link */}
                <div className="px-6 pb-6 pt-0 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#0A0A0B] border border-[#1E293B] text-[10px] text-[#B9CACB] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/portfolio/${project.id}`}
                    className="w-full py-2.5 rounded-xl bg-[#0A0A0B] border border-[#1E293B] hover:bg-rose-600 hover:border-rose-600 hover:text-white text-rose-500 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Read Full Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
