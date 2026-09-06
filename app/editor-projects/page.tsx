'use client';

import { useState, useEffect, useCallback } from 'react';
import ProjectCard, { Project } from '@/components/editor-projects/ProjectCard';
import NewProjectModal from '@/components/editor-projects/NewProjectModal';

type SortKey = 'updatedAt' | 'name' | 'createdAt';

export default function EditorProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<SortKey>('updatedAt');
    const [modalOpen, setModalOpen] = useState(false);
    const [needsSetup, setNeedsSetup] = useState(false);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/editor-projects');
            if (!res.ok) {
                const data = await res.json();
                if (data.error?.includes('table') || data.error?.includes('Could not find')) {
                    setNeedsSetup(true);
                    return;
                }
                throw new Error(data.error || 'Failed to load projects');
            }
            setProjects(await res.json());
            setNeedsSetup(false);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to load projects';
            if (msg.includes('table') || msg.includes('Could not find') || msg.includes('not configured')) {
                setNeedsSetup(true);
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    const handleCreate = async (name: string, description: string, fork_from: number | null) => {
        try {
            const res = await fetch('/api/editor-projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, fork_from }),
            });
            if (!res.ok) throw new Error('Failed to create project');
            await fetchProjects();
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : 'Failed to create project');
        }
    };

    const handleDelete = async (id: number | string) => {
        if (!confirm('Delete this project? This cannot be undone.')) return;
        try {
            const res = await fetch(`/api/editor-projects/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete project');
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : 'Failed to delete project');
        }
    };

    const handleOpen = (id: number | string) => {
        window.open(`http://localhost:3487/editor/project/${id}`, '_blank');
    };

    const filtered = projects
        .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sort === 'name') return (a.name || '').localeCompare(b.name || '');
            const dateA = new Date(a[sort] || 0).getTime();
            const dateB = new Date(b[sort] || 0).getTime();
            return dateB - dateA;
        });

    return (
        <div className="min-h-screen bg-[#0a0e27]">
            <header className="border-b border-white/[0.08] bg-[#0a0e27]/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4A843] to-[#b8922e] flex items-center justify-center text-black font-bold text-sm">
                            V
                        </div>
                        <h1 className="text-white font-semibold text-lg">Editor Projects</h1>
                    </div>
                    <div className="text-white/30 text-sm">viztr-user</div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#111638] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4A843]/50 transition-colors placeholder:text-white/30"
                        />
                    </div>

                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortKey)}
                        className="bg-[#111638] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white/60 text-sm focus:outline-none focus:border-[#D4A843]/50 appearance-none cursor-pointer"
                    >
                        <option value="updatedAt">Last Edited</option>
                        <option value="name">Name</option>
                        <option value="createdAt">Created</option>
                    </select>

                    <button
                        onClick={() => setModalOpen(true)}
                        className="bg-[#D4A843] hover:bg-[#e0b855] text-black font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                        + New Project
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center mb-6">
                        <p className="text-red-400 text-sm mb-3">{error}</p>
                        <button onClick={fetchProjects} className="text-sm text-white/60 hover:text-white underline">
                            Retry
                        </button>
                    </div>
                )}

                {needsSetup && (
                    <div className="bg-[#111638] border border-[#D4A843]/30 rounded-xl p-8 mb-6">
                        <h3 className="text-[#D4A843] font-bold text-lg mb-4">Supabase Setup Required</h3>
                        <p className="text-white/60 text-sm mb-4">
                            The editor tables need to be created in your Supabase project. Run this SQL in the Supabase SQL Editor:
                        </p>
                        <a
                            href="https://supabase.com/dashboard/project/naludjmicbqcagrlsrba/sql"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-[#D4A843] hover:bg-[#e0b855] text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors mb-4"
                        >
                            Open Supabase SQL Editor
                        </a>
                        <details className="mt-4">
                            <summary className="text-white/40 text-xs cursor-pointer hover:text-white/60">
                                Show SQL to copy
                            </summary>
                            <pre className="mt-2 bg-[#0a0e27] rounded-lg p-4 text-xs text-white/60 overflow-x-auto">
{`-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/naludjmicbqcagrlsrba/sql

CREATE TABLE IF NOT EXISTS public.editor_projects (
  id bigserial PRIMARY KEY,
  name text NOT NULL DEFAULT 'Untitled',
  description text NOT NULL DEFAULT '',
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  fork_from integer,
  permissions jsonb NOT NULL DEFAULT '{"admin":[1],"read":[1],"write":[1]}'::jsonb,
  private boolean NOT NULL DEFAULT true,
  primary_app text,
  play_url text NOT NULL DEFAULT '',
  private_assets boolean NOT NULL DEFAULT false,
  has_private_settings boolean NOT NULL DEFAULT false,
  thumbnails jsonb NOT NULL DEFAULT '{}'::jsonb,
  master_branch text NOT NULL DEFAULT 'main',
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.editor_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Root',
  project_id bigint NOT NULL REFERENCES public.editor_projects(id) ON DELETE CASCADE,
  branch_id text NOT NULL DEFAULT 'main',
  entities jsonb NOT NULL DEFAULT '{}'::jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.editor_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id bigint NOT NULL REFERENCES public.editor_projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  filename text,
  size bigint DEFAULT 0,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  url text,
  storage_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.editor_branches (
  id text NOT NULL DEFAULT 'main',
  name text NOT NULL DEFAULT 'main',
  project_id bigint NOT NULL REFERENCES public.editor_projects(id) ON DELETE CASCADE,
  latest_checkpoint_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, id)
);

CREATE TABLE IF NOT EXISTS public.editor_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id bigint NOT NULL REFERENCES public.editor_projects(id) ON DELETE CASCADE,
  branch_id text NOT NULL DEFAULT 'main',
  description text NOT NULL DEFAULT '',
  scene_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  asset_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.editor_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_checkpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY editor_projects_anon_all ON public.editor_projects FOR ALL USING (true);
CREATE POLICY editor_scenes_anon_all ON public.editor_scenes FOR ALL USING (true);
CREATE POLICY editor_assets_anon_all ON public.editor_assets FOR ALL USING (true);
CREATE POLICY editor_branches_anon_all ON public.editor_branches FOR ALL USING (true);
CREATE POLICY editor_checkpoints_anon_all ON public.editor_checkpoints FOR ALL USING (true);`}
                            </pre>
                        </details>
                        <button
                            onClick={() => {
                                setNeedsSetup(false);
                                fetchProjects();
                            }}
                            className="mt-4 text-sm text-white/40 hover:text-white underline"
                        >
                            I've run the SQL — refresh
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="rounded-xl border border-white/[0.08] bg-[#111638] overflow-hidden animate-pulse">
                                <div className="h-32 bg-white/5" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-white/5 rounded w-2/3" />
                                    <div className="h-3 bg-white/5 rounded w-1/3" />
                                    <div className="h-8 bg-white/5 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center text-3xl text-white/20">
                            {search ? '🔍' : '📁'}
                        </div>
                        <p className="text-white/40 text-sm mb-4">
                            {search ? 'No projects match your search' : 'No projects yet'}
                        </p>
                        {!search && (
                            <button
                                onClick={() => setModalOpen(true)}
                                className="bg-[#D4A843] hover:bg-[#e0b855] text-black font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
                            >
                                Create your first project
                            </button>
                        )}
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onOpen={handleOpen}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            <NewProjectModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreate={handleCreate}
            />
        </div>
    );
}
