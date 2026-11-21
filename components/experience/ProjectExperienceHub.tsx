'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Share2, Box, Images, Globe, Headset, Camera, Cuboid, MonitorPlay, Info, X } from 'lucide-react';
import { detectCapabilities, type DeviceCapabilities, arFallbackMode, vrFallbackMode } from '@/lib/xr/capabilities';

export interface HubExperience {
  id: string;
  title: string;
  slug: string;
  config: Record<string, any> | null;
}

export interface HubService {
  projectServiceId: string;
  slug: string;
  name: string;
  icon: string;
  experiences: HubExperience[];
}

export interface HubProject {
  id: string;
  name: string;
  description: string;
}

export interface HubGalleryItem {
  id: string;
  url: string;
  type: 'image' | 'video';
}

// Runtime viewers are browser-only; load lazily per active service so
// switching unmounts the previous runtime before the next one mounts.
const ExperienceViewer = dynamic(
  () => import('@/components/xr/ExperienceViewer').then((m) => m.ExperienceViewer),
  { ssr: false, loading: () => <RuntimeLoading /> }
);

function RuntimeLoading() {
  return (
    <div className="flex items-center justify-center h-full bg-[#0A0A0B]">
      <div className="text-zinc-500 font-mono text-xs animate-pulse">Loading runtime…</div>
    </div>
  );
}

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  webxr: Box,
  webar: Camera,
  'virtual-reality': Headset,
  'virtual-tour': Globe,
  'gaussian-splat': Cuboid,
  'pixel-streaming': MonitorPlay,
  'gallery-media': Images,
};

export default function ProjectExperienceHub({
  project,
  services,
  gallery,
}: {
  project: HubProject;
  services: HubService[];
  gallery: HubGalleryItem[];
}) {
  const searchParams = useSearchParams();
  const initial = searchParams.get('service');
  const servicesWithContent = services.filter(
    (s) => s.experiences.length > 0 || s.slug === 'gallery-media'
  );
  const [activeSlug, setActiveSlug] = useState<string>(
    initial && servicesWithContent.some((s) => s.slug === initial)
      ? initial
      : servicesWithContent[0]?.slug || ''
  );
  const [caps, setCaps] = useState<DeviceCapabilities | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    detectCapabilities().then(setCaps).catch(() => setCaps(null));
  }, []);

  const active = useMemo(
    () => servicesWithContent.find((s) => s.slug === activeSlug) || servicesWithContent[0] || null,
    [servicesWithContent, activeSlug]
  );

  const activeExperience = active?.experiences[0] || null;

  const share = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: project.name, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* user cancelled */
    }
  };

  const capabilityNote = useMemo(() => {
    if (!caps) return null;
    if (activeSlug === 'virtual-reality') {
      return caps.webxrVR ? 'Headset detected — Enter VR available.' : 'No headset on this device — desktop preview shown.';
    }
    if (activeSlug === 'webar') {
      const mode = arFallbackMode(caps);
      return mode === 'immersive'
        ? 'AR ready on this device.'
        : mode === 'quicklook'
          ? 'AR Quick Look available (iOS).'
          : 'AR not supported here — interactive 3D preview shown.';
    }
    return null;
  }, [caps, activeSlug]);

  return (
    <main className="min-h-screen flex flex-col bg-[#09090B] text-[#FAFAFA]">
      {/* Header */}
      <header className="shrink-0 border-b border-zinc-800/80 bg-[#0C0C0E]/95 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold truncate">{project.name}</h1>
            <span className="shrink-0 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/30">
              Published
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 truncate">Project Experience · One unified destination</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowInfo((v) => !v)}
            className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
            aria-label="Project information"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={share}
            className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
            aria-label="Share project"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Info drawer */}
      {showInfo && (
        <aside className="shrink-0 border-b border-zinc-800 bg-[#0C0C0E] px-4 sm:px-6 py-4 relative">
          <button
            onClick={() => setShowInfo(false)}
            className="absolute top-3 right-3 text-zinc-500 hover:text-white"
            aria-label="Close project info"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-bold mb-1">{project.name}</h2>
          <p className="text-xs text-zinc-400 max-w-2xl">
            {project.description || 'Immersive project experiences by VizTR.'}
          </p>
          {shared && <p className="text-[11px] text-[#3ECF8E] mt-2">Link copied to clipboard.</p>}
        </aside>
      )}

      {/* Service switcher */}
      <nav className="shrink-0 border-b border-zinc-800/80 px-4 sm:px-6 py-2 flex gap-2 overflow-x-auto" aria-label="Services">
        {servicesWithContent.map((s) => {
          const Icon = SERVICE_ICONS[s.slug] || Box;
          const isActive = s.slug === active?.slug;
          return (
            <button
              key={s.projectServiceId}
              onClick={() => setActiveSlug(s.slug)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors border ${
                isActive
                  ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/40'
                  : 'text-zinc-400 border-zinc-800 hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {s.name}
            </button>
          );
        })}
      </nav>

      {/* Capability banner */}
      {capabilityNote && (
        <div className="shrink-0 px-4 sm:px-6 py-2 bg-zinc-900/60 border-b border-zinc-800 text-[11px] text-zinc-400">
          {capabilityNote}
        </div>
      )}

      {/* Active experience area */}
      <section className="flex-1 min-h-0 relative">
        {active?.slug === 'gallery-media' ? (
          <GalleryGrid items={gallery} />
        ) : activeExperience ? (
          <div className="absolute inset-0">
            <ExperienceViewer
              experience={{ id: activeExperience.id, title: activeExperience.title }}
              config={{ config: activeExperience.config || {} }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-zinc-500 font-mono text-sm mb-1">No published experience for this service yet.</p>
              <p className="text-zinc-600 text-xs">VizTR will notify you when it goes live.</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function GalleryGrid({ items }: { items: HubGalleryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-500 font-mono text-sm">No media published yet.</p>
      </div>
    );
  }
  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {items.map((item) =>
          item.type === 'image' ? (
            <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" loading="lazy" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            </a>
          ) : (
            <video key={item.id} src={item.url} controls preload="metadata" className="rounded-xl border border-zinc-800 bg-black aspect-[4/3] w-full object-cover" />
          )
        )}
      </div>
    </div>
  );
}
