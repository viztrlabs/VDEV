'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Filter
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
      {/* HERO */}
      <section className="relative py-24 px-6 bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-rose-600/30 border border-rose-500/40 text-rose-400 text-xs font-bold uppercase tracking-widest inline-block">
            Architectural Archive
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-display">
            Selected Portfolio & Case Studies
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
            Explore our curated body of work across supertall towers, luxury residences, WebXR platforms, and 360° virtual tours.
          </p>
        </div>
      </section>

      {/* FILTER & SEARCH BAR */}
      <section className="sticky top-20 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 py-4 px-6">
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
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search project, city, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </section>

      {/* PROJECT GRID */}
      <section className="py-12 px-6 max-w-[1280px] mx-auto">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-base text-zinc-500 dark:text-zinc-400">
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
                className="group rounded-3xl overflow-hidden bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-2xl transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Media Thumbnail */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
                    <img
                      src={project.featuredImage}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>{project.location}</span>
                      <span className="font-mono">{project.year}</span>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-display">
                      <Link href={`/portfolio/${project.id}`} className="hover:text-rose-600 transition-colors">
                        {project.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
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
                        className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/portfolio/${project.id}`}
                    className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
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
