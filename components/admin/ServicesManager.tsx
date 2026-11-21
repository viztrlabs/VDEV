'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Power, Send, Undo2, Loader2, RefreshCw, ChevronDown } from 'lucide-react';

interface ServiceCatalogRow {
  id: string;
  slug: string;
  name: string;
  category: string;
}

interface ProjectServiceRow {
  id: string;
  project_id: string;
  service_id: string;
  status: string;
  enabled_at: string | null;
  disabled_at: string | null;
  service?: ServiceCatalogRow | null;
}

interface ExperienceRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  project_service_id: string;
  published_at: string | null;
}

interface ProjectRow {
  id: string;
  name?: string;
  title?: string;
}

/**
 * Services & Publishing — Project Management control surface.
 *
 * Phase 03 gate: the PM can enable/disable purchased services per project and
 * control which experiences are visible to the client (publishing lifecycle).
 */
export default function ServicesManager() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [services, setServices] = useState<ProjectServiceRow[]>([]);
  const [experiences, setExperiences] = useState<ExperienceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/projects?pageSize=100', { credentials: 'include' });
        const json = await res.json();
        const rows = json?.projects || json?.data || [];
        setProjects(rows);
        if (rows.length > 0) setProjectId((prev) => prev || rows[0].id);
      } catch (e: any) {
        setError(e?.message || 'Failed to load projects');
      }
    })();
  }, []);

  const load = useCallback(async (pid: string) => {
    if (!pid) return;
    setLoading(true);
    setError(null);
    try {
      const [psRes, exRes] = await Promise.all([
        fetch(`/api/project-services?projectId=${encodeURIComponent(pid)}`, { credentials: 'include' }),
        fetch(`/api/experiences?projectId=${encodeURIComponent(pid)}`, { credentials: 'include' }),
      ]);
      const psJson = await psRes.json();
      const exJson = await exRes.json();
      setServices(psJson?.projectServices || []);
      setExperiences(exJson?.experiences || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load project services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(projectId);
  }, [projectId, load]);

  const toggleService = async (row: ProjectServiceRow) => {
    setBusyId(row.id);
    setError(null);
    try {
      const next = row.status === 'active' ? 'paused' : 'active';
      const res = await fetch(`/api/project-services/${row.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Update failed');
      setServices((prev) => prev.map((s) => (s.id === row.id ? { ...s, status: json.projectService.status, enabled_at: json.projectService.enabled_at, disabled_at: json.projectService.disabled_at } : s)));
    } catch (e: any) {
      setError(e?.message || 'Failed to update service');
    } finally {
      setBusyId(null);
    }
  };

  const setStatus = async (exp: ExperienceRow, status: string) => {
    setBusyId(exp.id);
    setError(null);
    try {
      const res = await fetch(`/api/experiences/${exp.id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Update failed');
      setExperiences((prev) => prev.map((e) => (e.id === exp.id ? { ...e, status: json.experience.status, published_at: json.experience.published_at } : e)));
    } catch (e: any) {
      setError(e?.message || 'Failed to update experience');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Project selector */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full appearance-none bg-[#18181B] border border-[#27272A] rounded-lg px-4 py-2.5 text-sm text-white pr-9"
          >
            {projects.length === 0 && <option value="">No projects available</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || p.title || p.id}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        </div>
        <button
          onClick={() => load(projectId)}
          className="p-2.5 rounded-lg border border-[#27272A] hover:bg-[#27272A] transition-colors"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">{error}</div>
      )}

      {loading && <div className="text-xs text-zinc-500 font-mono animate-pulse">Loading…</div>}

      {/* Services entitlements */}
      <section>
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#3ECF8E] font-bold mb-3">Project Services</h3>
        <div className="space-y-2">
          {services.length === 0 && !loading && (
            <p className="text-xs text-zinc-500">No services enabled on this project yet.</p>
          )}
          {services.map((row) => {
            const active = row.status === 'active';
            return (
              <div key={row.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#111113] border border-[#27272A]">
                <div className="min-w-0">
                  <div className="text-sm text-white font-medium">{row.service?.name || row.service_id}</div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    {row.service?.slug || ''} · {active ? `enabled ${row.enabled_at ? new Date(row.enabled_at).toLocaleDateString() : ''}` : `paused ${row.disabled_at ? new Date(row.disabled_at).toLocaleDateString() : ''}`}
                  </div>
                </div>
                <button
                  onClick={() => toggleService(row)}
                  disabled={busyId === row.id}
                  className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono uppercase border transition-colors ${
                    active
                      ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/40 hover:bg-[#3ECF8E]/20'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  {busyId === row.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                  {active ? 'Active' : 'Paused'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Experience publishing */}
      <section>
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#3ECF8E] font-bold mb-3">Experience Publishing</h3>
        <div className="space-y-2">
          {experiences.length === 0 && !loading && (
            <p className="text-xs text-zinc-500">No experiences created for this project yet.</p>
          )}
          {experiences.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#111113] border border-[#27272A]">
              <div className="min-w-0">
                <div className="text-sm text-white font-medium truncate">{exp.title}</div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  {exp.slug} · {exp.status}
                  {exp.published_at ? ` · published ${new Date(exp.published_at).toLocaleDateString()}` : ''}
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {exp.status !== 'published' ? (
                  <button
                    onClick={() => setStatus(exp, 'published')}
                    disabled={busyId === exp.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/40 hover:bg-[#00F0FF]/20 transition-colors"
                  >
                    {busyId === exp.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Publish
                  </button>
                ) : (
                  <button
                    onClick={() => setStatus(exp, 'draft')}
                    disabled={busyId === exp.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase bg-zinc-800/60 text-zinc-300 border border-zinc-700 hover:bg-zinc-800 transition-colors"
                  >
                    {busyId === exp.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Undo2 className="w-3.5 h-3.5" />}
                    Unpublish
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
