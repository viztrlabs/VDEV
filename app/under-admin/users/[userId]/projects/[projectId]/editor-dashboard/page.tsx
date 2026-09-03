'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import {
  Plus,
  Grid3X3,
  List as ListIcon,
  Search,
  Edit3,
  Eye,
  Trash2,
  Share2,
  Calendar,
  Layers,
  Cloud,
  Lock,
  Clock,
  Tag,
  Crown,
  Star,
  MapPin,
  DoorOpen,
  Info,
  Settings,
  Upload,
  Zap,
} from 'lucide-react';

const SERVICE_META: Record<
  string,
  { title: string; category: 'studio' | 'xr'; icon: string; description: string }
> = {
  exterior: { title: 'Exterior', category: 'studio', icon: '🏠', description: 'Exterior renders and imagery' },
  interior: { title: 'Interior', category: 'studio', icon: '🛋️', description: 'Interior renders and walkthroughs' },
  'animation-walkthrough': { title: 'Animation / Walkthrough', category: 'studio', icon: '🎬', description: '3D animation and walkthrough videos' },
  'virtual-tour': { title: 'Virtual Tour', category: 'xr', icon: '🌐', description: '360° interactive panoramic tours' },
  webar: { title: 'WebAR', category: 'xr', icon: '📱', description: 'Browser-based augmented reality' },
  webxr: { title: 'WebXR', category: 'xr', icon: '🥽', description: 'Immersive WebXR experiences' },
  'virtual-reality': { title: 'Virtual Reality', category: 'xr', icon: '🎮', description: 'Full VR experience' },
  'gaussian-splat': { title: 'Gaussian Splat', category: 'xr', icon: '🧊', description: '3D Gaussian Splatting viewer' },
  'pixel-streaming': { title: 'Pixel Streaming', category: 'xr', icon: '📺', description: 'Unreal Engine pixel streaming' },
};

type ServiceSlug = keyof typeof SERVICE_META;

export default function EditorDashboardLauncherPage() {
  const params = useParams<{ userId: string; projectId: string }>();
  const userId = params?.userId;
  const projectId = params?.projectId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<{ id: string; name: string; status?: string } | null>(null);
  const [services, setServices] = useState<ServiceSlug[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!userId || !projectId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const [projectRes, servicesRes] = await Promise.all([
          fetch(`/api/projects?id=${encodeURIComponent(projectId)}`),
          fetch(`/api/project-services?projectId=${encodeURIComponent(projectId)}&includeService=true`),
        ]);

        if (!projectRes.ok) {
          const data = await projectRes.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load project');
        }
        if (!servicesRes.ok) {
          const data = await servicesRes.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load project services');
        }

        if (cancelled) return;

        const projectData = await projectRes.json();
        const servicesData = await servicesRes.json();

        setProject({
          id: projectData.id ?? projectId,
          name: projectData.name ?? 'Untitled Project',
          status: projectData.status,
        });

        const available = (servicesData.projectServices ?? [])
          .filter((ps: any) => ps.service && (ps.service.enabled !== false && ps.service.visible !== false))
          .map((ps: any) => ps.service.slug)
          .filter((slug: string): slug is ServiceSlug => slug in SERVICE_META);

        setServices(available.length ? available : (Object.keys(SERVICE_META) as ServiceSlug[]));
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, projectId]);

  const filtered = services.filter((slug) => {
    if (!search) return true;
    const meta = SERVICE_META[slug];
    return (
      meta.title.toLowerCase().includes(search.toLowerCase()) ||
      meta.description.toLowerCase().includes(search.toLowerCase()) ||
      slug.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (!userId || !projectId) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-base font-mono font-bold text-[#3ECF8E]">Project Editor Dashboard</h1>
            <p className="text-[10px] font-mono text-[#71717A]">
              {project ? `${project.name} • ${project.id.slice(-8)}` : 'Loading project…'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`p-1.5 rounded ${view === 'grid' ? 'bg-[#3ECF8E] text-black' : 'text-[#71717A] hover:text-white'}`}
              title="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`p-1.5 rounded ${view === 'list' ? 'bg-[#3ECF8E] text-black' : 'text-[#71717A] hover:text-white'}`}
              title="List view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <div className="relative ml-2">
              <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services…"
                className="pl-7 pr-2 py-1.5 rounded bg-[#18181B] border border-[#27272A] text-xs font-mono text-white w-48"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="px-3 py-2 bg-rose-950/40 border border-rose-900 text-rose-300 text-xs font-mono rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-xs font-mono text-[#71717A] py-12">Loading editor services…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-xs font-mono text-[#71717A] py-12 border border-dashed border-[#27272A] rounded-lg">
            No editor services available for this project yet.
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((slug) => {
              const meta = SERVICE_META[slug];
              return (
                <Link
                  key={slug}
                  href={`/under-admin/users/${userId}/projects/${projectId}/editor-dashboard/${slug}`}
                  className="rounded-lg border border-[#27272A] bg-[#0c0c0f] p-4 hover:border-[#3ECF8E] transition-colors"
                >
                  <div className="text-xl mb-2">{meta.icon}</div>
                  <div className="text-xs font-mono font-bold text-white">{meta.title}</div>
                  <div className="text-[10px] font-mono text-[#A1A1AA] mt-1">{meta.description}</div>
                  <div className="mt-3 flex items-center gap-1 text-[10px] font-mono text-[#3ECF8E]">
                    <Edit3 className="w-3 h-3" />
                    Open editor
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-[#71717A] border-b border-[#27272A]">
                <th className="text-left p-2">Service</th>
                <th className="text-left p-2">Category</th>
                <th className="text-left p-2">Description</th>
                <th className="text-right p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((slug) => {
                const meta = SERVICE_META[slug];
                return (
                  <tr key={slug} className="border-b border-[#18181B] hover:bg-[#0c0c0f]">
                    <td className="p-2 flex items-center gap-2">
                      <span className="text-base">{meta.icon}</span>
                      <span className="text-white">{meta.title}</span>
                    </td>
                    <td className="p-2 text-[#A1A1AA]">
                      <span className="px-1.5 py-0.5 rounded bg-[#3ECF8E]/15 text-[#3ECF8E]">{meta.category}</span>
                    </td>
                    <td className="p-2 text-[#A1A1AA]">{meta.description}</td>
                    <td className="p-2 text-right">
                      <Link
                        href={`/under-admin/users/${userId}/projects/${projectId}/editor-dashboard/${slug}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-[#3ECF8E]"
                      >
                        <Edit3 className="w-3 h-3" />
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
