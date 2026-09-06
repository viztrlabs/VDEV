# VizTR Editor Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a PlayCanvas-style project dashboard page in the Next.js workspace that proxies to the editor backend at port 3487.

**Architecture:** New `/editor-projects` page with React components, API routes that proxy `fetch()` calls to `http://localhost:3487/api/*`, and a "New Project" modal dialog. All styling uses existing VizTR theme (Tailwind CSS).

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS, TypeScript

## Global Constraints

- Node >=22.x
- Editor backend must be running on port 3487 (`npm run start:local` in `forks/editor/`)
- No authentication required (local dev only)
- All styling via Tailwind CSS classes, using VizTR theme colors
- Follow existing file patterns in `app/` and `components/`

---

## File Map

| File | Responsibility |
|------|---------------|
| `app/editor-projects/page.tsx` | Main dashboard page — state, data fetching, layout |
| `components/editor-projects/ProjectCard.tsx` | Single project card component |
| `components/editor-projects/NewProjectModal.tsx` | Create project modal dialog |
| `app/api/editor-projects/route.ts` | GET (list) + POST (create) proxy |
| `app/api/editor-projects/[id]/route.ts` | GET/PUT/DELETE single project proxy |
| `app/api/editor-projects/[id]/scenes/route.ts` | GET scenes for a project proxy |

---

### Task 1: API Proxy Routes

**Files:**
- Create: `app/api/editor-projects/route.ts`
- Create: `app/api/editor-projects/[id]/route.ts`
- Create: `app/api/editor-projects/[id]/scenes/route.ts`

**Interfaces:**
- Consumes: Editor backend at `http://localhost:3487/api/*`
- Produces: `GET/POST /api/editor-projects`, `GET/PUT/DELETE /api/editor-projects/:id`, `GET /api/editor-projects/:id/scenes`

- [ ] **Step 1: Create the list/create route**

```typescript
// app/api/editor-projects/route.ts
import { NextRequest, NextResponse } from 'next/server';

const EDITOR_API = process.env.EDITOR_API_URL || 'http://localhost:3487';

export async function GET() {
    try {
        const res = await fetch(`${EDITOR_API}/api/projects`, { cache: 'no-store' });
        if (!res.ok) return NextResponse.json({ error: 'Editor backend error' }, { status: res.status });
        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json(
            { error: 'Editor server not running on port 3487. Start it with: cd forks/editor && npm run start:local' },
            { status: 503 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const res = await fetch(`${EDITOR_API}/api/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) return NextResponse.json({ error: 'Editor backend error' }, { status: res.status });
        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: 'Editor server not running on port 3487' },
            { status: 503 }
        );
    }
}
```

- [ ] **Step 2: Create the single project route**

```typescript
// app/api/editor-projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const EDITOR_API = process.env.EDITOR_API_URL || 'http://localhost:3487';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const res = await fetch(`${EDITOR_API}/api/projects/${id}`, { cache: 'no-store' });
        if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: res.status });
        return NextResponse.json(await res.json());
    } catch {
        return NextResponse.json({ error: 'Editor server not running' }, { status: 503 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const res = await fetch(`${EDITOR_API}/api/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: res.status });
        return NextResponse.json(await res.json());
    } catch {
        return NextResponse.json({ error: 'Editor server not running' }, { status: 503 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const res = await fetch(`${EDITOR_API}/api/projects/${id}`, { method: 'DELETE' });
        if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: res.status });
        return NextResponse.json(await res.json());
    } catch {
        return NextResponse.json({ error: 'Editor server not running' }, { status: 503 });
    }
}
```

- [ ] **Step 3: Create the scenes route**

```typescript
// app/api/editor-projects/[id]/scenes/route.ts
import { NextRequest, NextResponse } from 'next/server';

const EDITOR_API = process.env.EDITOR_API_URL || 'http://localhost:3487';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const res = await fetch(`${EDITOR_API}/api/projects/${id}/scenes`, { cache: 'no-store' });
        if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: res.status });
        return NextResponse.json(await res.json());
    } catch {
        return NextResponse.json({ error: 'Editor server not running' }, { status: 503 });
    }
}
```

- [ ] **Step 4: Test API routes manually**

Start editor backend, then test:
```bash
curl http://localhost:3000/api/editor-projects
curl -X POST http://localhost:3000/api/editor-projects -H "Content-Type: application/json" -d '{"name":"Test"}'
```
Expected: Returns project list / created project JSON

- [ ] **Step 5: Commit**

```bash
git add app/api/editor-projects/
git commit -m "feat: add editor project API proxy routes"
```

---

### Task 2: ProjectCard Component

**Files:**
- Create: `components/editor-projects/ProjectCard.tsx`

**Interfaces:**
- Consumes: `Project` type (id, name, description, createdAt, updatedAt, thumbnails)
- Produces: `<ProjectCard project={...} onOpen={fn} onDelete={fn} />`

- [ ] **Step 1: Create the ProjectCard component**

```tsx
// components/editor-projects/ProjectCard.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

export interface Project {
    id: number | string;
    name: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    thumbnails?: Record<string, string>;
    settings?: Record<string, unknown>;
}

interface ProjectCardProps {
    project: Project;
    onOpen: (id: number | string) => void;
    onDelete: (id: number | string) => void;
}

function timeAgo(dateStr?: string): string {
    if (!dateStr) return 'Unknown';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

export default function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    const initial = (project.name || '?')[0].toUpperCase();
    const colors = ['#D4A843', '#4A90D9', '#E85D75', '#50C878', '#9B59B6', '#FF8C42'];
    const bgColor = colors[project.name.length % colors.length];

    return (
        <div className="group relative rounded-xl border border-white/[0.08] bg-[#111638] hover:border-[#D4A843]/40 transition-all duration-200 overflow-hidden">
            {/* Thumbnail */}
            <div
                className="h-32 flex items-center justify-center text-4xl font-bold text-white/20"
                style={{ background: `linear-gradient(135deg, ${bgColor}22, ${bgColor}44)` }}
            >
                {initial}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-white font-semibold text-sm truncate mb-1">{project.name}</h3>
                <p className="text-white/40 text-xs mb-3">
                    Updated {timeAgo(project.updatedAt || project.createdAt)}
                </p>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onOpen(project.id)}
                        className="flex-1 bg-[#D4A843] hover:bg-[#e0b855] text-black text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                    >
                        Open
                    </button>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="text-white/40 hover:text-white/80 p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-[#1a1f3d] border border-white/10 rounded-lg shadow-xl z-10 py-1">
                                <button
                                    onClick={() => { onDelete(project.id); setMenuOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/editor-projects/ProjectCard.tsx
git commit -m "feat: add ProjectCard component"
```

---

### Task 3: NewProjectModal Component

**Files:**
- Create: `components/editor-projects/NewProjectModal.tsx`

**Interfaces:**
- Consumes: nothing (self-contained)
- Produces: `<NewProjectModal open={bool} onClose={fn} onCreate={fn} />`

- [ ] **Step 1: Create the NewProjectModal component**

```tsx
// components/editor-projects/NewProjectModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

interface NewProjectModalProps {
    open: boolean;
    onClose: () => void;
    onCreate: (name: string, description: string) => void;
}

export default function NewProjectModal({ open, onClose, onCreate }: NewProjectModalProps) {
    const [name, setName] = useState('Untitled Project');
    const [description, setDescription] = useState('');
    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setName('Untitled Project');
            setDescription('');
            setTimeout(() => nameRef.current?.select(), 100);
        }
    }, [open]);

    useEffect(() => {
        function handleEsc(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        if (open) document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-[#111638] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <h2 className="text-xl font-bold text-white">New Project</h2>
                    <p className="text-white/40 text-sm mt-1">Create a new 3D editor project</p>
                </div>

                {/* Form */}
                <div className="px-6 pb-6 space-y-4">
                    <div>
                        <label className="block text-white/60 text-xs font-medium mb-1.5">Name</label>
                        <input
                            ref={nameRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#0a0e27] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4A843] transition-colors"
                            placeholder="My 3D Project"
                        />
                    </div>

                    <div>
                        <label className="block text-white/60 text-xs font-medium mb-1.5">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-[#0a0e27] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4A843] transition-colors resize-none"
                            placeholder="Optional description..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (name.trim()) {
                                onCreate(name.trim(), description.trim());
                                onClose();
                            }
                        }}
                        disabled={!name.trim()}
                        className="px-6 py-2 text-sm font-semibold bg-[#D4A843] hover:bg-[#e0b855] disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-lg transition-colors"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/editor-projects/NewProjectModal.tsx
git commit -m "feat: add NewProjectModal component"
```

---

### Task 4: Dashboard Page

**Files:**
- Create: `app/editor-projects/page.tsx`

**Interfaces:**
- Consumes: `ProjectCard` from Task 2, `NewProjectModal` from Task 3, API routes from Task 1
- Produces: Full page at `/editor-projects`

- [ ] **Step 1: Create the dashboard page**

```tsx
// app/editor-projects/page.tsx
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

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/editor-projects');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to load projects');
            }
            setProjects(await res.json());
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    const handleCreate = async (name: string, description: string) => {
        try {
            const res = await fetch('/api/editor-projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description }),
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
            {/* Header */}
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

            {/* Toolbar */}
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

                {/* Error state */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center mb-6">
                        <p className="text-red-400 text-sm mb-3">{error}</p>
                        <button
                            onClick={fetchProjects}
                            className="text-sm text-white/60 hover:text-white underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading */}
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

                {/* Empty state */}
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

                {/* Project grid */}
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
```

- [ ] **Step 2: Test the full flow**

1. Start editor backend: `cd forks/editor && npm run start:local`
2. Start Next.js: `npm run dev`
3. Open `http://localhost:3000/editor-projects`
4. Verify: Empty state shows "No projects yet"
5. Click "New Project" → modal opens → type name → click Create → project appears in grid
6. Click "Open" → editor opens in new tab with project loaded
7. Click "..." → Delete → confirm → project removed
8. Test search filtering

- [ ] **Step 3: Commit**

```bash
git add app/editor-projects/page.tsx components/editor-projects/
git commit -m "feat: add editor projects dashboard page"
```

---

### Task 5: Integration Test & Polish

**Files:**
- Modify: `app/editor-projects/page.tsx` (if needed)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Verified working dashboard

- [ ] **Step 1: Start both servers and test end-to-end**

```bash
# Terminal 1: Editor backend
cd forks/editor && npm run start:local

# Terminal 2: Next.js
npm run dev
```

Open `http://localhost:3000/editor-projects` and verify:
- [ ] Page loads without errors
- [ ] Empty state shows when no projects exist
- [ ] "New Project" button opens modal
- [ ] Creating a project adds it to the grid
- [ ] Project card shows name and relative date
- [ ] "Open" button opens editor in new tab
- [ ] Delete removes project from grid
- [ ] Search filters projects by name
- [ ] Sort works (Last Edited, Name, Created)
- [ ] Error message shows when editor backend is stopped

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: complete editor projects dashboard"
```
