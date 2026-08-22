'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { portfolioProjects, getProjectById, getRelatedProjects } from '@/data/portfolio';
import { useAppStore } from '@/lib/store';
import ContactForm from '@/components/forms/ContactForm';
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Box,
  Play,
  Eye,
  CheckCircle2,
  Calendar,
  MapPin,
  Building,
  Layers,
  Sparkles
} from 'lucide-react';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const resolvedParams = use(params);
  const project = getProjectById(resolvedParams.id);

  if (!project) {
    notFound();
  }

  const related = getRelatedProjects(project.id, project.category);
  const { openLightbox, openPanorama, openModelViewer } = useAppStore();

  return (
    <main className="flex-1 w-full pb-24">
      {/* HERO SECTION */}
      <section className="relative min-h-[60vh] flex items-end bg-zinc-950 text-white overflow-hidden pb-16 pt-32 px-6">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105"
          style={{ backgroundImage: `url(${project.featuredImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-black/40" />

        <div className="relative z-10 max-w-[1280px] mx-auto w-full space-y-6">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portfolio</span>
          </Link>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-wider">
                {project.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-zinc-300 text-xs font-medium">
                {project.location}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-zinc-300 text-xs font-mono">
                {project.year}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-display">
              {project.title}
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed">
              {project.shortDescription}
            </p>
          </div>
        </div>
      </section>

      {/* PROJECT META HUD BAR */}
      <section className="bg-zinc-900 border-b border-zinc-800 py-6 px-6 text-white">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
          <div>
            <div className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">Client / Developer</div>
            <div className="font-semibold text-zinc-200 mt-0.5">{project.client}</div>
          </div>
          <div>
            <div className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">Architectural Design</div>
            <div className="font-semibold text-zinc-200 mt-0.5">{project.architect}</div>
          </div>
          <div>
            <div className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">Location</div>
            <div className="font-semibold text-zinc-200 mt-0.5">{project.location}</div>
          </div>
          <div>
            <div className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">Scope of Commission</div>
            <div className="font-semibold text-rose-400 mt-0.5 truncate">{project.services.join(', ')}</div>
          </div>
        </div>
      </section>

      {/* CONTENT BODY */}
      <section className="py-16 px-6 max-w-[1280px] mx-auto space-y-16">
        {/* CHALLENGE & SOLUTION SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="p-8 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              The Architectural Challenge
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white font-display">
              Preserving Vision Prior to Construction
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {project.challenge}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              The VizTR Solution
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white font-display">
              Advanced CGI, Dynamic Lighting & Spatial Deployment
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {project.solution}
            </p>
          </div>
        </div>

        {/* INTERACTIVE LAUNCHERS IF XR OR 360 */}
        {(project.panorama || project.model3d || project.video) && (
          <div className="p-8 rounded-3xl bg-zinc-950 text-white border border-rose-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs uppercase font-bold text-rose-400">Interactive Assets Available</span>
              </div>
              <h3 className="text-xl font-bold font-display">Experience {project.title} Directly</h3>
              <p className="text-xs text-zinc-400 max-w-xl">
                This project includes live interactive media. Launch full 360° spherical nodes or WebXR models below.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {project.panorama && (
                <button
                  onClick={() => openPanorama(project.panorama!, project.title)}
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Compass className="w-4 h-4" />
                  <span>Launch 360° Tour Node</span>
                </button>
              )}
              {project.model3d && (
                <button
                  onClick={() => openModelViewer('', project.title)}
                  className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-700 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Box className="w-4 h-4 text-rose-400" />
                  <span>Launch WebXR 3D Model</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* GALLERY IMAGES */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-display">
              Production Gallery
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              {project.galleryImages.length} Master 8K Stills
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.galleryImages.map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() =>
                  openLightbox(
                    project.galleryImages.map((g) => ({
                      url: g,
                      title: `${project.title} - View 0${idx + 1}`,
                      type: 'image'
                    })),
                    idx
                  )
                }
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all"
              >
                <img
                  src={imgUrl}
                  alt={`${project.title} visual ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="px-4 py-2 rounded-xl bg-white/90 text-zinc-900 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <Eye className="w-4 h-4" />
                    <span>Expand 8K Visual</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DELIVERABLES SUMMARY */}
        <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4">
          <h4 className="text-lg font-bold text-zinc-900 dark:text-white font-display">
            Delivered Assets in this Commission
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {project.deliverables.map((del, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-medium">{del}</span>
              </div>
            ))}
          </div>
        </div>

        {/* INQUIRE ABOUT SIMILAR PROJECT */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Start a Dialogue
            </span>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-display">
              Commission Visuals for a Similar Project
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Reference <strong className="text-zinc-800 dark:text-zinc-200">{project.title}</strong> to receive targeted architectural proposals.
            </p>
          </div>

          <ContactForm initialService={project.category === 'xr' ? 'WebXR (Zero-Install 3D)' : project.category === 'walkthrough' ? 'Walkthrough Animation' : 'Exterior Visualization'} />
        </div>

        {/* RELATED PROJECTS */}
        {related.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-display">
              Related Case Studies
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/portfolio/${rel.id}`}
                  className="group p-5 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50 shadow-md hover:shadow-xl transition-all flex items-center gap-4"
                >
                  <img
                    src={rel.featuredImage}
                    alt={rel.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-rose-500">{rel.category}</span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-rose-600 transition-colors">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-zinc-500 line-clamp-1">{rel.location} • {rel.year}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
