'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { portfolioProjects } from '@/data/portfolio';
import { useAppStore } from '@/lib/store';
import { ArrowRight, Compass, Box, Play, Eye } from 'lucide-react';
import { useSiteSection } from '@/lib/use-site-section';
import { getDefaultSection, getListItems, getTextField } from '@/lib/site-content';
import { sanitizeRichText } from '@/lib/sanitize-rich-text';
import EditableText from '@/components/admin/live-editor/in-context/EditableText';
import { useEditMode } from '@/components/admin/live-editor/in-context/EditModeContext';

function CmsText({
  fieldId,
  listFieldId,
  itemId,
  value,
  as: Tag = 'span',
  className,
  rich,
}: {
  fieldId: string;
  listFieldId?: string;
  itemId?: string;
  value: string;
  as?: React.ElementType;
  className?: string;
  rich?: boolean;
}) {
  const { editMode } = useEditMode();
  if (editMode) {
    return <EditableText fieldId={fieldId} listFieldId={listFieldId} itemId={itemId} as={Tag} className={className}/>;
  }
  if (rich) return <Tag className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }}/>;
  return <Tag className={className}>{value}</Tag>;
}

export default function PortfolioPreview() {
  const [activeFilter, setActiveFilter] = useState('all');
  const section = useSiteSection('portfolio-preview') ?? getDefaultSection('portfolio-preview');
  const eyebrow = getTextField(section, 'eyebrow', 'ARCHIVE & ARTIFACTS');
  const heading = getTextField(section, 'heading', 'Selected Works');
  const description = getTextField(section, 'description', 'Filter between photorealistic still imagery, cinematic films, and WebXR experiences.');
  const allProjectsLabel = getTextField(section, 'allProjectsLabel', 'ALL PROJECTS →');
  const allProjectsHref = getTextField(section, 'allProjectsHref', '/portfolio');
  const ctaPanoramaLabel = getTextField(section, 'ctaPanoramaLabel', '360° Node');
  const ctaModelLabel = getTextField(section, 'ctaModelLabel', 'WebXR 3D');
  const ctaGalleryLabel = getTextField(section, 'ctaGalleryLabel', 'Gallery');
  const caseStudyTitle = getTextField(section, 'caseStudyTitle', 'Case Study Page');
  const filterLabels = getListItems(section, 'filterLabels').map((filter) => ({
    id: filter.id,
    label: filter.values.label ?? '',
    category: filter.meta?.category ?? filter.id,
  }));

  const filteredProjects = activeFilter === 'all'
    ? portfolioProjects
    : portfolioProjects.filter((p) => p.category === activeFilter);

  const handlePanorama = (url: string, title: string) => {
    useAppStore.getState().openPanorama(url, title);
  };

  const handleModel = (title: string) => {
    useAppStore.getState().openModelViewer('', title);
  };

  const handleGallery = (project: (typeof portfolioProjects)[number]) => {
    useAppStore.getState().openLightbox(
      project.galleryImages.map((g) => ({
        url: g,
        title: project.title,
        type: project.video ? 'video' : 'image',
        caption: project.shortDescription,
      })),
    );
  };

  return (
    <section id="portfolio-preview" className="py-24 w-full container-ultrawide border-t border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#42CF8B] animate-pulse"/>
            <CmsText fieldId="eyebrow" value={eyebrow} className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#42CF8B]"/>
          </div>
          <CmsText fieldId="heading" value={heading} as="h2" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAFAFA] font-display"/>
          <CmsText fieldId="description" value={description} as="p" rich className="text-xs sm:text-sm text-[#B9CACB] mt-1 prose-readable"/>
        </div>

        <Link
          href={allProjectsHref}
          className="text-xs font-mono font-semibold text-[#00F0FF] hover:underline inline-flex items-center gap-1.5 shrink-0"
        >
          <CmsText fieldId="allProjectsLabel" value={allProjectsLabel}/>
        </Link>
      </div>

      {/* FILTER PILLS */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {filterLabels.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.category)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer border ${
              activeFilter === filter.category
                ? 'bg-[#00F0FF] text-black border-[#00F0FF] '
                : 'glass-pill text-[var(--text-secondary)] hover:text-white border-[#1E293B]'
            }`}
          >
            <CmsText fieldId="label" listFieldId="filterLabels" itemId={filter.id} value={filter.label}/>
          </button>
        ))}
      </div>

      {/* PROJECT GRID - Ultra-wide expanded columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 grid-ultrawide-4 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="group rounded-[2rem] overflow-hidden bg-[#131314] border border-[#1E293B] hover:border-[#00F0FF]/40 transition-all duration-300 flex flex-col justify-between shadow-sm"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-[2]"/>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0A0A0B] text-[#FAFAFA] text-[9px] font-mono font-bold uppercase tracking-wider border border-[#1E293B]">
                    {project.category}
                  </span>
                  {project.panorama && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#00F0FF] text-black text-[9px] font-mono font-extrabold flex items-center gap-1 shadow-sm">
                      <Compass className="w-2.5 h-2.5"/>
                      <span>360°</span>
                    </span>
                  )}
                  {project.video && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0A0A0B] text-[#00F0FF] border border-[#00F0FF]/40 text-[9px] font-mono font-bold flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-[#00F0FF]"/>
                      <span>4K FILM</span>
                    </span>
                  )}
                </div>

                {/* Hover Overlay with Quick Launch Actions */}
                <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {project.panorama ? (
                    <button
                      onClick={() => handlePanorama(project.panorama!, project.title)}
                      className="px-4 py-2 rounded-full bg-[#42CF8B] hover:bg-[#58dc9b] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Compass className="w-3.5 h-3.5"/>
                      <CmsText fieldId="ctaPanoramaLabel" value={ctaPanoramaLabel}/>
                    </button>
                  ) : project.model3d ? (
                    <button
                      onClick={() => handleModel(project.title)}
                      className="px-4 py-2 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Box className="w-3.5 h-3.5"/>
                      <CmsText fieldId="ctaModelLabel" value={ctaModelLabel}/>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleGallery(project)}
                      className="px-4 py-2 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Eye className="w-3.5 h-3.5"/>
                      <CmsText fieldId="ctaGalleryLabel" value={ctaGalleryLabel}/>
                    </button>
                  )}

                  <Link
                    href={`/portfolio/${project.id}`}
                    className="p-2 rounded-full bg-[#0A0A0B] hover:border-[#00F0FF]/50 text-[#FAFAFA] text-xs transition-colors border border-[#1E293B]"
                    title={caseStudyTitle}
                    aria-label={caseStudyTitle}
                  >
                    <ArrowRight className="w-3.5 h-3.5"/>
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
                  className="px-2 py-0.5 rounded-full bg-[#0A0A0B] text-[9px] font-mono text-[#a1abc4] border border-[#1E293B]"
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
