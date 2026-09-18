'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useExperienceRealtime } from '@/lib/useRealtime';
import type { TourScene } from '@/lib/tourClientStore';
import type { XRScene } from '@/components/xr/xr.types';
import {
  Box,
  ScanLine,
  Headset,
  Compass,
  Cpu,
  Tv,
  Globe,
  Sparkles,
  Play,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

// Heavy WebGL/WebRTC viewers are client-only (browser APIs) — same
// next/dynamic ssr:false precedent as the xr-world service pages.
const XRViewer = dynamic(() => import('@/components/xr/XRViewer'), { ssr: false });
const TourViewer = dynamic(() => import('@/components/xr/TourViewer'), { ssr: false });
const GaussianSplatViewer = dynamic(() => import('@/components/xr/GaussianSplatViewer'), {
  ssr: false,
});
const PixelStreamingViewer = dynamic(() => import('@/components/xr/PixelStreamingViewer'), {
  ssr: false,
});

interface ServiceConfig {
  id: string;
  name: string;
  slug: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
  viewerComponent: string;
}

const SERVICES: ServiceConfig[] = [
  {
    id: 'webxr',
    name: 'WebXR',
    slug: 'webxr',
    icon: Box,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    description: 'Immersive WebXR experiences in your browser',
    viewerComponent: 'XRViewer',
  },
  {
    id: 'webar',
    name: 'WebAR',
    slug: 'webar',
    icon: ScanLine,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    description: 'Browser-based augmented reality experiences',
    viewerComponent: 'ARViewer',
  },
  {
    id: 'virtual-reality',
    name: 'Virtual Reality',
    slug: 'virtual-reality',
    icon: Headset,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    description: 'Full VR experience with headset support',
    viewerComponent: 'VRViewer',
  },
  {
    id: 'virtual-tour',
    name: 'Virtual Tour',
    slug: 'virtual-tour',
    icon: Compass,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    description: '360° interactive panoramic tours',
    viewerComponent: 'TourViewer',
  },
  {
    id: 'gaussian-splat',
    name: 'Gaussian Splat',
    slug: 'gaussian-splat',
    icon: Cpu,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    description: '3D Gaussian Splatting viewer',
    viewerComponent: 'SplatViewer',
  },
  {
    id: 'pixel-streaming',
    name: 'Pixel Streaming',
    slug: 'pixel-streaming',
    icon: Tv,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    description: 'Unreal Engine pixel streaming at 60fps',
    viewerComponent: 'PixelStreamingPlayer',
  },
];

const STUDIO_SERVICES: ServiceConfig[] = [
  {
    id: 'exterior',
    name: 'Still Renders',
    slug: 'exterior',
    icon: Globe,
    color: 'text-[#3ECF8E]',
    bgColor: 'bg-[#3ECF8E]/10',
    description: 'Exterior architectural renders and imagery',
    viewerComponent: 'ImageViewer',
  },
  {
    id: 'interior',
    name: 'Interior',
    slug: 'interior',
    icon: Sparkles,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    description: 'Interior renders and walkthroughs',
    viewerComponent: 'ImageViewer',
  },
  {
    id: 'animation-walkthrough',
    name: 'Animation',
    slug: 'animation-walkthrough',
    icon: Play,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    description: '3D animation and walkthrough videos',
    viewerComponent: 'VideoViewer',
  },
];

// =====================================================================
// EXPERIENCE PAGE BOUNDARY: RAW ROW -> TYPED VIEWER MODEL
// =====================================================================
//
// Realtime payloads and the experiences API return raw Supabase rows.
// These mappers normalize them into fully-typed shapes at the consumer
// boundary (Task 1/Task 2 precedent) — no `as` casts on render paths,
// defensive defaults throughout. Only `published` rows bind viewers.

interface ExperienceRow {
  id: string;
  projectId: string;
  projectServiceId: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  publishedAt: string | null;
  metadata: Record<string, unknown>;
}

interface ExperienceConfigRow {
  experienceId: string;
  config: Record<string, unknown>;
  assets: Array<Record<string, unknown>>;
  settings: Record<string, unknown>;
}

interface ProjectServiceRef {
  id: string;
  serviceId: string;
  serviceSlug: string;
}

function toSafeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toRecordList(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.map(toRecord) : [];
}

// Idempotent: accepts raw API/realtime rows (snake_case) or
// already-mapped rows (camelCase) with identical results.
function mapRecordToExperience(row: Record<string, unknown>): ExperienceRow {
  return {
    id: toSafeString(row.id),
    projectId: toSafeString(row.projectId ?? row.project_id),
    projectServiceId: toSafeString(row.projectServiceId ?? row.project_service_id),
    title: toSafeString(row.title, 'Untitled experience'),
    slug: toSafeString(row.slug),
    description: toSafeString(row.description),
    status: toSafeString(row.status, 'draft'),
    publishedAt: toSafeString(row.publishedAt ?? row.published_at) || null,
    metadata: toRecord(row.metadata),
  };
}

function mapRecordToExperienceConfig(row: Record<string, unknown>): ExperienceConfigRow {
  return {
    experienceId: toSafeString(row.experience_id ?? row.experienceId),
    config: toRecord(row.config),
    assets: toRecordList(row.assets),
    settings: toRecord(row.settings),
  };
}

function mapRecordToProjectServiceRef(row: Record<string, unknown>): ProjectServiceRef {
  const service = toRecord(row.service);
  return {
    id: toSafeString(row.id),
    serviceId: toSafeString(row.service_id ?? row.serviceId),
    serviceSlug: toSafeString(service.slug),
  };
}

// Tab ids match the Service catalog slugs, so the join key is the catalog
// slug when the project_services -> Service join resolved, else the raw
// service_id (which equals the slug for seeded services).
function resolveServiceKey(ref: ProjectServiceRef): string {
  return ref.serviceSlug || ref.serviceId;
}

function assetUrlFromRecord(asset: Record<string, unknown>): string | null {
  const url = toSafeString(asset.url);
  return url || null;
}

// First renderable asset URL for an experience: config assets win, then
// well-known metadata/config keys. Null means "no bindable content".
const CANDIDATE_URL_KEYS = [
  'asset_url',
  'model_url',
  'panorama_url',
  'tour_url',
  'pano_url',
  'splat_url',
  'image_url',
  'url',
];

function primaryAssetUrl(exp: ExperienceRow, cfg: ExperienceConfigRow | null): string | null {
  if (cfg) {
    for (const asset of cfg.assets) {
      const url = assetUrlFromRecord(asset);
      if (url) return url;
    }
    for (const key of CANDIDATE_URL_KEYS) {
      const fromConfig = toSafeString(cfg.config[key]);
      if (fromConfig) return fromConfig;
    }
  }
  for (const key of CANDIDATE_URL_KEYS) {
    const fromMetadata = toSafeString(exp.metadata[key]);
    if (fromMetadata) return fromMetadata;
  }
  return null;
}

// Builds the single Marzipano scene TourViewer requires. Null when the
// published row carries no bindable panorama URL — the caller renders the
// empty state instead of inventing demo content.
function toTourScene(exp: ExperienceRow, cfg: ExperienceConfigRow | null): TourScene | null {
  const url = primaryAssetUrl(exp, cfg);
  if (!url) return null;
  return {
    id: exp.id,
    name: exp.title,
    type: '360',
    url,
    thumbnailUrl: url,
    initialYaw: 0,
    initialPitch: 0,
    initialFov: 75,
    hotspots: [],
    viewConstraints: {
      top: 85,
      bottom: -85,
      left: -180,
      right: 180,
      zoomMin: 20,
      zoomMax: 120,
      mobileZoomEnabled: true,
    },
    autorotateEnabled: false,
    autorotateSpeed: 1,
  };
}

interface SplatSceneBinding {
  id: string;
  name: string;
  url: string;
}

// Null when no bindable splat/model URL exists — empty state, not the
// viewer's built-in sample asset (that would be invented demo content).
function toSplatScenes(
  exp: ExperienceRow,
  cfg: ExperienceConfigRow | null
): SplatSceneBinding[] | null {
  const urls: string[] = [];
  if (cfg) {
    for (const asset of cfg.assets) {
      const url = assetUrlFromRecord(asset);
      if (url && !urls.includes(url)) urls.push(url);
    }
  }
  const primary = primaryAssetUrl(exp, cfg);
  if (primary && !urls.includes(primary)) urls.push(primary);
  if (urls.length === 0) return null;
  return urls.map((url, i) => ({
    id: i === 0 ? exp.id : `${exp.id}-scene-${i + 1}`,
    name: i === 0 ? exp.title : `${exp.title} — Scene ${i + 1}`,
    url,
  }));
}

// Builds the XRScene[] XRViewer requires from the seeded/published row.
// Same source as the tour/splat tabs (primaryAssetUrl). Null when no
// bindable URL exists — the caller renders the empty state instead of
// falling back to XRViewer's hardcoded DEFAULT_SCENES demo content.
function toXRScenes(exp: ExperienceRow, cfg: ExperienceConfigRow | null): XRScene[] | null {
  const url = primaryAssetUrl(exp, cfg);
  if (!url) return null;
  return [
    {
      id: exp.id,
      name: exp.title,
      type: '360',
      url,
      hotspots: [],
      annotations: [],
      teleportPoints: [],
    },
  ];
}

function EmptyExperience({
  icon: Icon,
  iconClassName,
  title,
  message,
}: {
  icon: React.ElementType;
  iconClassName: string;
  title: string;
  message: string;
}) {
  return (
    <div className="min-h-96 py-16 flex flex-col items-center justify-center gap-4 bg-black/20 rounded-xl border border-white/10 text-center px-6">
      <Icon className={`w-16 h-16 ${iconClassName} opacity-60`} />
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm text-gray-400 max-w-md">{message}</p>
    </div>
  );
}

const noop = () => {};

export default function ExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params.projectId as string) || 'proj_smart_luxury_villa';
  const { openPixelStream, openPanorama, openModelViewer } = useAppStore();

  const [activeService, setActiveService] = useState<string>('webxr');
  const [loading, setLoading] = useState(false);
  const [isStudio, setIsStudio] = useState(false);

  const allServices = isStudio ? STUDIO_SERVICES : SERVICES;
  const activeConfig = allServices.find((s) => s.id === activeService);

  // --- Phase 2 Task 3: live experiences wiring ---
  // Subscribe to the experiences table (scoped to this project) and hydrate
  // the canonical store slice on mount. The hook writes realtime rows into
  // the store first; rendering below always reads the store selector, so
  // live updates appear without refresh. Hook stays unconditional.
  useExperienceRealtime(projectId, noop);

  const storeExperiences = useAppStore((s) => s.experiences);
  const [projectServiceRefs, setProjectServiceRefs] = useState<ProjectServiceRef[]>([]);
  const [configRows, setConfigRows] = useState<ExperienceConfigRow[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const { setExperiences } = useAppStore.getState();
    setExperiences([]);
    setProjectServiceRefs([]);
    setConfigRows([]);
    if (!projectId) {
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    (async () => {
      try {
        // Exact query param is `projectId` (camelCase) per
        // app/api/experiences/route.ts, app/api/experience-configs/route.ts
        // and app/api/project-services/route.ts.
        const [expRes, psRes, cfgRes] = await Promise.all([
          fetch(`/api/experiences?projectId=${encodeURIComponent(projectId)}`, {
            cache: 'no-store',
          }),
          fetch(`/api/project-services?projectId=${encodeURIComponent(projectId)}`, {
            cache: 'no-store',
          }),
          fetch(`/api/experience-configs?projectId=${encodeURIComponent(projectId)}`, {
            cache: 'no-store',
          }),
        ]);
        const [expData, psData, cfgData] = await Promise.all([
          expRes.json().catch(() => null),
          psRes.json().catch(() => null),
          cfgRes.json().catch(() => null),
        ]);
        if (cancelled) return;
        if (expData?.success && Array.isArray(expData.experiences)) {
          setExperiences(expData.experiences.map(mapRecordToExperience));
        }
        if (psData?.success && Array.isArray(psData.projectServices)) {
          setProjectServiceRefs(psData.projectServices.map(mapRecordToProjectServiceRef));
        }
        if (cfgData?.success && Array.isArray(cfgData.configs)) {
          setConfigRows(cfgData.configs.map(mapRecordToExperienceConfig));
        }
      } catch {
        // Store/slices stay as-is; realtime updates still flow when connected.
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Typed render models derived from the store (realtime-first) plus the
  // project_services join. Only `published` rows bind a viewer.
  const experienceRows: ExperienceRow[] = useMemo(
    () => storeExperiences.map(mapRecordToExperience),
    [storeExperiences]
  );

  const serviceKeyByProjectServiceId: Record<string, string> = useMemo(() => {
    const lookup: Record<string, string> = {};
    for (const ref of projectServiceRefs) {
      if (ref.id) lookup[ref.id] = resolveServiceKey(ref);
    }
    return lookup;
  }, [projectServiceRefs]);

  const experienceByServiceKey: Record<string, ExperienceRow> = useMemo(() => {
    const lookup: Record<string, ExperienceRow> = {};
    for (const exp of experienceRows) {
      if (exp.status !== 'published') continue;
      const key = serviceKeyByProjectServiceId[exp.projectServiceId] || '';
      if (key && !lookup[key]) lookup[key] = exp;
    }
    return lookup;
  }, [experienceRows, serviceKeyByProjectServiceId]);

  const configByExperienceId: Record<string, ExperienceConfigRow> = useMemo(() => {
    const lookup: Record<string, ExperienceConfigRow> = {};
    for (const cfg of configRows) {
      if (cfg.experienceId && !lookup[cfg.experienceId]) lookup[cfg.experienceId] = cfg;
    }
    return lookup;
  }, [configRows]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const serviceId = hash.slice(1);
      if (allServices.find((s) => s.id === serviceId)) {
        setActiveService(serviceId);
      }
    }
  }, [allServices]);

  const handleServiceSwitch = useCallback((serviceId: string) => {
    setLoading(true);
    setActiveService(serviceId);
    window.location.hash = serviceId;
    setTimeout(() => setLoading(false), 300);
  }, []);

  const renderViewer = () => {
    if (loading || dataLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 text-[#3ECF8E] animate-spin" />
        </div>
      );
    }

    const experience = experienceByServiceKey[activeService] ?? null;
    const config = experience ? (configByExperienceId[experience.id] ?? null) : null;
    const emptyMessage =
      'Nothing is live for this service yet. When the studio publishes an experience for this project, its interactive viewer will appear here.';

    switch (activeService) {
      case 'webxr': {
        const xrScenes = experience ? toXRScenes(experience, config) : null;
        if (!experience || !xrScenes) {
          return (
            <EmptyExperience
              icon={Box}
              iconClassName="text-amber-400"
              title="No published WebXR experience yet"
              message={emptyMessage}
            />
          );
        }
        return (
          <XRViewer
            projectId={projectId}
            mode="tour"
            scenes={xrScenes}
            initialSceneId={experience.id}
          />
        );
      }
      case 'webar': {
        const xrScenes = experience ? toXRScenes(experience, config) : null;
        if (!experience || !xrScenes) {
          return (
            <EmptyExperience
              icon={ScanLine}
              iconClassName="text-cyan-400"
              title="No published WebAR experience yet"
              message={emptyMessage}
            />
          );
        }
        return (
          <XRViewer
            projectId={projectId}
            mode="ar"
            scenes={xrScenes}
            initialSceneId={experience.id}
          />
        );
      }
      case 'virtual-reality': {
        const xrScenes = experience ? toXRScenes(experience, config) : null;
        if (!experience || !xrScenes) {
          return (
            <EmptyExperience
              icon={Headset}
              iconClassName="text-violet-400"
              title="No published VR experience yet"
              message={emptyMessage}
            />
          );
        }
        return (
          <XRViewer
            projectId={projectId}
            mode="vr"
            scenes={xrScenes}
            initialSceneId={experience.id}
          />
        );
      }
      case 'virtual-tour': {
        const scene = experience ? toTourScene(experience, config) : null;
        if (!experience || !scene) {
          return (
            <EmptyExperience
              icon={Compass}
              iconClassName="text-sky-400"
              title="No published virtual tour yet"
              message={emptyMessage}
            />
          );
        }
        return <TourViewer scene={scene} />;
      }
      case 'gaussian-splat': {
        const scenes = experience ? toSplatScenes(experience, config) : null;
        if (!experience || !scenes) {
          return (
            <EmptyExperience
              icon={Cpu}
              iconClassName="text-emerald-400"
              title="No published Gaussian Splat yet"
              message={emptyMessage}
            />
          );
        }
        return <GaussianSplatViewer scenes={scenes} />;
      }
      case 'pixel-streaming':
        if (!experience) {
          return (
            <EmptyExperience
              icon={Tv}
              iconClassName="text-rose-400"
              title="No published pixel stream yet"
              message={emptyMessage}
            />
          );
        }
        return <PixelStreamingViewer streamId={experience.slug} />;
      case 'exterior':
      case 'interior':
        return (
          <div className="h-96 flex items-center justify-center bg-black/20 rounded-xl border border-white/10">
            <Globe className="w-16 h-16 text-[#3ECF8E]" />
            <div className="ml-4">
              <h3 className="text-xl font-bold">Still Renders</h3>
              <p className="text-sm text-gray-400">Loading architectural renders...</p>
            </div>
          </div>
        );
      case 'animation-walkthrough':
        return (
          <div className="h-96 flex items-center justify-center bg-black/20 rounded-xl border border-white/10">
            <Play className="w-16 h-16 text-pink-400" />
            <div className="ml-4">
              <h3 className="text-xl font-bold">Animation Walkthrough</h3>
              <p className="text-sm text-gray-400">Loading video player...</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-96 flex items-center justify-center bg-black/20 rounded-xl border border-white/10">
            <Sparkles className="w-16 h-16 text-white/40" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0A0A0B]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-bold">Experience Viewer</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStudio(!isStudio)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 transition"
            >
              {isStudio ? 'XR World' : 'Studio'}
            </button>
          </div>
        </div>
      </header>

      {/* Service Selector */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 mb-6">
          {allServices.map((service) => {
            const Icon = service.icon;
            const isActive = activeService === service.id;
            return (
              <button
                key={service.id}
                onClick={() => handleServiceSwitch(service.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  isActive
                    ? `${service.bgColor} ${service.color} border-current`
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{service.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Service Info */}
        {activeConfig && (
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{activeConfig.name}</h2>
                <p className="text-sm text-gray-400">{activeConfig.description}</p>
              </div>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${activeConfig.bgColor} ${activeConfig.color}`}
              >
                Active
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Viewer Area */}
      <main className="max-w-7xl mx-auto px-4 pb-12">{renderViewer()}</main>
    </div>
  );
}
