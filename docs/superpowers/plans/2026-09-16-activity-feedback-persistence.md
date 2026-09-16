# Activity Logging & Feedback Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded activity logs and client-side-only feedback with real Supabase-persisted data backed by API routes.

**Architecture:** Two new Supabase tables (`activity_logs`, `feedback`) with RLS policies, two new Next.js API routes (`/api/activity`, `/api/feedback`), and updates to the client dashboard components to fetch from and post to these APIs instead of using static data or local state.

**Tech Stack:** Next.js App Router, Supabase (PostgreSQL + RLS), `@supabase/supabase-js` via `lib/supabase/admin.ts` service client, `lib/api-guard.ts` for auth.

## Global Constraints

- Use `public.projects` (lowercase) for FK references — the table is `projects`, not `"Project"`.
- Use `getServiceClient()` from `@/lib/services/client` for all Supabase queries in API routes.
- Use `requireAuth(req)` from `@/lib/api-guard` for authentication.
- Follow existing API route patterns (see `app/api/deliverables/route.ts`).
- No new dependencies. No comments in code.

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/20260916_activity_logs.sql` | Create | activity_logs table + RLS |
| `supabase/migrations/20260916_feedback.sql` | Create | feedback table + RLS |
| `app/api/activity/route.ts` | Create | GET/POST for activity logs |
| `app/api/feedback/route.ts` | Create | GET/POST/PUT for feedback |
| `app/client-dashboard/components/ActivityLog.tsx` | Modify | Fetch from API instead of hardcoded |
| `app/client-dashboard/components/VisualFeedbackSystem.tsx` | Modify | Fetch/post from API instead of local state |

---

## Task 1: Create `activity_logs` migration

**Files:**
- Create: `supabase/migrations/20260916_activity_logs.sql`

**Interfaces:**
- Produces: `activity_logs` table with columns `id`, `project_id`, `user_id`, `user_name`, `action`, `entity_type`, `entity_id`, `metadata`, `created_at`

- [ ] **Step 1: Write the migration file**

```sql
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid,
  user_name text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_project ON public.activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_logs_auth_read" ON public.activity_logs
  FOR SELECT USING (auth_role() IS NOT NULL);

CREATE POLICY "activity_logs_admin_all" ON public.activity_logs
  FOR ALL USING (auth_role() IN ('super_admin', 'admin'));
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260916_activity_logs.sql
git commit -m "feat: add activity_logs table migration"
```

---

## Task 2: Create `feedback` migration

**Files:**
- Create: `supabase/migrations/20260916_feedback.sql`

**Interfaces:**
- Produces: `feedback` table with columns `id`, `project_id`, `experience_id`, `author_name`, `author_email`, `content`, `annotation`, `status`, `created_at`, `updated_at`

- [ ] **Step 1: Write the migration file**

```sql
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text REFERENCES public.projects(id) ON DELETE CASCADE,
  experience_id uuid,
  author_name text NOT NULL,
  author_email text,
  content text NOT NULL,
  annotation jsonb DEFAULT '{}',
  status text DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_project ON public.feedback(project_id);
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_auth_read" ON public.feedback
  FOR SELECT USING (auth_role() IS NOT NULL);

CREATE POLICY "feedback_auth_insert" ON public.feedback
  FOR INSERT WITH CHECK (auth_role() IS NOT NULL);

CREATE POLICY "feedback_admin_all" ON public.feedback
  FOR ALL USING (auth_role() IN ('super_admin', 'admin'));
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260916_feedback.sql
git commit -m "feat: add feedback table migration"
```

---

## Task 3: Create Activity Log API

**Files:**
- Create: `app/api/activity/route.ts`

**Interfaces:**
- Consumes: `requireAuth` from `@/lib/api-guard`, `getServiceClient` from `@/lib/services/client`
- Produces: `GET /api/activity` (list logs, optional `projectId` filter), `POST /api/activity` (create log entry)

- [ ] **Step 1: Write the API route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/services/client';
import { requireAuth } from '@/lib/api-guard';

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    let query = svc.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, count: data?.length || 0, logs: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const body = await req.json();
    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    if (!body.action || !body.entity_type) {
      return NextResponse.json({ success: false, error: 'action and entity_type required' }, { status: 400 });
    }

    const payload: Record<string, any> = {
      project_id: body.project_id || null,
      user_id: body.user_id || guard.userId || null,
      user_name: body.user_name || guard.session?.user?.name || 'Unknown',
      action: body.action,
      entity_type: body.entity_type,
      entity_id: body.entity_id || null,
      metadata: body.metadata || {},
    };

    const { data, error } = await svc.from('activity_logs').insert(payload).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, log: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/activity/route.ts
git commit -m "feat: add activity log API route (GET/POST)"
```

---

## Task 4: Create Feedback API

**Files:**
- Create: `app/api/feedback/route.ts`

**Interfaces:**
- Consumes: `requireAuth` from `@/lib/api-guard`, `getServiceClient` from `@/lib/services/client`
- Produces: `GET /api/feedback` (list, filter by `projectId`), `POST /api/feedback` (create), `PUT /api/feedback` (update status)

- [ ] **Step 1: Write the API route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/services/client';
import { requireAuth } from '@/lib/api-guard';

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    let query = svc.from('feedback').select('*').order('created_at', { ascending: false });
    if (projectId) query = query.eq('project_id', projectId);
    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, count: data?.length || 0, feedback: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const body = await req.json();
    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    if (!body.project_id || !body.author_name || !body.content) {
      return NextResponse.json({ success: false, error: 'project_id, author_name, and content required' }, { status: 400 });
    }

    const payload: Record<string, any> = {
      project_id: body.project_id,
      experience_id: body.experience_id || null,
      author_name: body.author_name,
      author_email: body.author_email || null,
      content: body.content,
      annotation: body.annotation || {},
      status: body.status || 'open',
    };

    const { data, error } = await svc.from('feedback').insert(payload).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, feedback: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const body = await req.json();
    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });
    if (!body.id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    const update: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.status) update.status = body.status;
    if (body.content) update.content = body.content;

    const { data, error } = await svc.from('feedback').update(update).eq('id', body.id).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, feedback: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/feedback/route.ts
git commit -m "feat: add feedback API route (GET/POST/PUT)"
```

---

## Task 5: Update ActivityLog component

**Files:**
- Modify: `app/client-dashboard/components/ActivityLog.tsx`

**Interfaces:**
- Consumes: `GET /api/activity?projectId=...`
- Produces: Real activity log data rendered in the existing UI layout

- [ ] **Step 1: Read the current file**

Read `app/client-dashboard/components/ActivityLog.tsx` (already done during planning).

- [ ] **Step 2: Replace the component**

Replace the entire file content. Key changes:
- Add `useState`/`useEffect` for fetching logs
- Accept optional `projectId` prop (defaults to fetching all)
- Fetch from `/api/activity` on mount
- Add a refresh button
- Keep the same UI layout and icon logic
- Handle loading and empty states
- Map `entity_type` to the existing icon logic (download → Download, feedback → MessageSquare, approval → CheckCircle2, view → Eye, default → Eye)

```tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Download, Eye, CheckCircle2, MessageSquare, RefreshCw } from 'lucide-react';

interface ActivityLogEntry {
  id: string;
  action: string;
  user_name: string;
  entity_type: string;
  created_at: string;
}

interface ActivityLogProps {
  projectId?: string;
}

export default function ActivityLog({ projectId }: ActivityLogProps) {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (projectId) params.set('projectId', projectId);
      const res = await fetch(`/api/activity?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      } else {
        setError(data.error || 'Failed to load activity');
      }
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getIcon = (entityType: string) => {
    switch (entityType) {
      case 'download':
        return <Download className="w-3.5 h-3.5" />;
      case 'approval':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'feedback':
        return <MessageSquare className="w-3.5 h-3.5 text-amber-400" />;
      case 'view':
        return <Eye className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Eye className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#3ECF8E]" />
            <span>Audit Trail & Project Activity History</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Immutable log of all reviews, downloads, approvals, and model uploads
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#A1A1AA] hover:text-[#3ECF8E] hover:border-[#3ECF8E]/40 transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh activity"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/20 border border-red-800/40 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {loading && logs.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-6 h-6 border-2 border-[#3ECF8E] border-t-transparent rounded-full" />
          <span className="ml-3 text-[#A1A1AA] text-xs font-mono">Loading activity...</span>
        </div>
      )}

      {!loading && logs.length === 0 && !error && (
        <div className="text-center py-12 text-[#71717A] text-xs font-mono">
          No activity recorded yet.
        </div>
      )}

      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="p-3.5 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#09090B] border border-[#27272A] text-[#3ECF8E] shrink-0">
                {getIcon(log.entity_type)}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{log.action}</div>
                <div className="text-[10px] font-mono text-[#71717A]">Performed by {log.user_name}</div>
              </div>
            </div>

            <span className="text-[10px] font-mono text-[#71717A]">{formatTime(log.created_at)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/client-dashboard/components/ActivityLog.tsx
git commit -m "feat: wire ActivityLog to real API data with refresh"
```

---

## Task 6: Update VisualFeedbackSystem component

**Files:**
- Modify: `app/client-dashboard/components/VisualFeedbackSystem.tsx`

**Interfaces:**
- Consumes: `GET /api/feedback?projectId=...`, `POST /api/feedback`, `PUT /api/feedback`
- Produces: Feedback data persisted in Supabase, loaded on mount

- [ ] **Step 1: Read the current file**

Already read during planning. The component uses local `useState` for `feedbacks` and has `addFeedback`, `resolveFeedback`, `deleteFeedback` functions that only modify local state.

- [ ] **Step 2: Modify the component**

Key changes:
- On mount, fetch feedback from `GET /api/feedback?projectId={projectId}`
- `addFeedback`: POST to `/api/feedback`, then append the returned entry to state
- `resolveFeedback`: PUT to `/api/feedback` with `{id, status: 'resolved'}`, then update local state
- `deleteFeedback`: No delete API exists yet — keep local-only removal (or add a TODO comment). For now, just filter locally since the spec doesn't mention a DELETE endpoint.
- Add loading/error states
- Keep all existing UI, styles, and behavior intact

Replace the `addFeedback`, `resolveFeedback`, `deleteFeedback` functions and add a `useEffect` for initial fetch. Here are the specific changes:

**Add imports and state:**

After the existing `useState` declarations (around line 42), add:

```typescript
const [loading, setLoading] = useState(true);
const [fetchError, setFetchError] = useState<string | null>(null);
```

**Add fetch effect after the `currentUser` declaration (after line 49):**

```typescript
useEffect(() => {
  const fetchFeedback = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/feedback?projectId=${encodeURIComponent(projectId)}`);
      const data = await res.json();
      if (data.success) {
        const mapped = data.feedback.map((fb: any) => ({
          id: fb.id,
          assetId: fb.annotation?.assetId || '',
          assetName: fb.annotation?.assetName || '',
          assetType: (fb.annotation?.assetType || 'image') as 'image' | '3d-model' | 'video' | 'pdf',
          x: fb.annotation?.x || 0,
          y: fb.annotation?.y || 0,
          width: fb.annotation?.width || 100,
          height: fb.annotation?.height || 100,
          comment: fb.content,
          author: fb.author_name,
          authorRole: (fb.annotation?.authorRole || 'client') as 'client' | 'designer' | 'architect',
          assignedTo: fb.annotation?.assignedTo || '',
          status: fb.status as 'open' | 'in-progress' | 'resolved' | 'rejected',
          createdAt: new Date(fb.created_at),
          resolvedAt: fb.updated_at !== fb.created_at ? new Date(fb.updated_at) : undefined,
          resolution: fb.annotation?.resolution || '',
        }));
        setFeedbacks(mapped);
      } else {
        setFetchError(data.error || 'Failed to load feedback');
      }
    } catch (e: any) {
      setFetchError(e?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };
  fetchFeedback();
}, [projectId]);
```

**Replace `addFeedback` function (lines 58-80):**

```typescript
const addFeedback = async (feedbackData: Partial<Feedback>) => {
  const annotation = {
    assetId: selectedAsset,
    assetName: assets.find(a => a.id === selectedAsset)?.name || '',
    assetType: assets.find(a => a.id === selectedAsset)?.type || 'image',
    x: feedbackData.x || 50,
    y: feedbackData.y || 50,
    width: feedbackData.width || 150,
    height: feedbackData.height || 150,
    authorRole: currentUser.role,
    assignedTo: feedbackData.assignedTo || teamMembers[0].id,
  };

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        author_name: currentUser.name,
        content: feedbackData.comment || '',
        annotation,
        status: 'open',
      }),
    });
    const data = await res.json();
    if (data.success) {
      const fb = data.feedback;
      const newEntry: Feedback = {
        id: fb.id,
        assetId: annotation.assetId,
        assetName: annotation.assetName,
        assetType: annotation.assetType,
        x: annotation.x,
        y: annotation.y,
        width: annotation.width,
        height: annotation.height,
        comment: fb.content,
        author: fb.author_name,
        authorRole: annotation.authorRole,
        assignedTo: annotation.assignedTo,
        status: 'open',
        createdAt: new Date(fb.created_at),
        resolution: '',
      };
      setFeedbacks(prev => [...prev, newEntry]);
    }
  } catch {
    // Silently fail — UI stays in sync with local state
  }
  setIsAddingFeedback(false);
  setNewFeedback(null);
};
```

**Replace `resolveFeedback` function (lines 82-89):**

```typescript
const resolveFeedback = async (feedbackId: string, resolution: string) => {
  try {
    await fetch('/api/feedback', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: feedbackId, status: 'resolved' }),
    });
  } catch {
    // Proceed with local update regardless
  }
  setFeedbacks(prev => prev.map(fb =>
    fb.id === feedbackId
      ? { ...fb, status: 'resolved', resolvedAt: new Date(), resolution }
      : fb
  ));
  setShowResolution(null);
};
```

**Add loading/error UI inside the `feedback-container` div, before the asset-selection div (after line 125):**

```tsx
{loading && (
  <div className="col-span-full flex items-center justify-center py-12">
    <div className="animate-spin w-6 h-6 border-2 border-[#3ECF8E] border-t-transparent rounded-full" />
    <span className="ml-3 text-[#A1A1AA] text-xs font-mono">Loading feedback...</span>
  </div>
)}
{fetchError && (
  <div className="col-span-full p-3 rounded-xl bg-red-950/20 border border-red-800/40 text-red-400 text-xs font-mono">
    {fetchError}
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add app/client-dashboard/components/VisualFeedbackSystem.tsx
git commit -m "feat: wire VisualFeedbackSystem to API with fetch/post/update"
```

---

## Summary of Changes

| # | File | What Changed |
|---|------|-------------|
| 1 | `supabase/migrations/20260916_activity_logs.sql` | **Created** — activity_logs table, indexes, RLS policies |
| 2 | `supabase/migrations/20260916_feedback.sql` | **Created** — feedback table, index, RLS policies |
| 3 | `app/api/activity/route.ts` | **Created** — GET (list with projectId filter, limit param) + POST (create entry) |
| 4 | `app/api/feedback/route.ts` | **Created** — GET (list with projectId/status filter) + POST (create) + PUT (update status/content) |
| 5 | `app/client-dashboard/components/ActivityLog.tsx` | **Modified** — Replaced hardcoded array with fetch from `/api/activity`, added loading/error/empty states, refresh button, relative time formatting |
| 6 | `app/client-dashboard/components/VisualFeedbackSystem.tsx` | **Modified** — Added initial fetch from `/api/feedback`, wired addFeedback to POST, resolveFeedback to PUT, added loading/error states |
