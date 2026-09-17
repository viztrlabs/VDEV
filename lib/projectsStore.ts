import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { VtedProject } from '@/lib/vted-types';

// Virtual-tour editor projects backed by Supabase (`public.vted_projects`).
// When the service-role key is unavailable (tests, offline dev), an in-memory
// Map preserves the same interface — never the local filesystem.

interface VtedProjectRow {
  id: string;
  name: string;
  tour_id: string;
  author: string | null;
  scene_count: number;
  status: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

function toProject(row: VtedProjectRow): VtedProject {
  return {
    id: row.id,
    name: row.name,
    tourId: row.tour_id,
    author: row.author ?? undefined,
    sceneCount: row.scene_count,
    status: row.status === 'published' ? 'published' : 'draft',
    thumbnailUrl: row.thumbnail_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const memoryFallback = new Map<string, VtedProject>();

function useMemory(): boolean {
  return getSupabaseAdmin() === null;
}

export async function getProjects(): Promise<VtedProject[]> {
  const db = getSupabaseAdmin();
  if (!db) return [...memoryFallback.values()];
  const { data, error } = await db
    .from('vted_projects')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw new Error(`Failed to list projects: ${error.message}`);
  return ((data ?? []) as VtedProjectRow[]).map(toProject);
}

export async function getProject(id: string): Promise<VtedProject | null> {
  const db = getSupabaseAdmin();
  if (!db) return memoryFallback.get(id) ?? null;
  const { data, error } = await db.from('vted_projects').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to fetch project: ${error.message}`);
  return data ? toProject(data as VtedProjectRow) : null;
}

export async function createProject(
  input: Omit<VtedProject, 'id' | 'createdAt' | 'updatedAt'>
): Promise<VtedProject> {
  const now = new Date().toISOString();
  const project: VtedProject = {
    ...input,
    id: `proj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: now,
    updatedAt: now,
  };
  const db = getSupabaseAdmin();
  if (!db) {
    memoryFallback.set(project.id, project);
    return project;
  }
  const { data, error } = await db
    .from('vted_projects')
    .insert({
      id: project.id,
      name: project.name,
      tour_id: project.tourId,
      author: project.author ?? null,
      scene_count: project.sceneCount,
      status: project.status,
      thumbnail_url: project.thumbnailUrl ?? null,
    })
    .select('*')
    .single();
  if (error) throw new Error(`Failed to create project: ${error.message}`);
  return toProject(data as VtedProjectRow);
}

export async function updateProject(
  id: string,
  patch: Partial<VtedProject>
): Promise<VtedProject | null> {
  const db = getSupabaseAdmin();
  if (!db) {
    const existing = memoryFallback.get(id);
    if (!existing) return null;
    const next = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    memoryFallback.set(id, next);
    return next;
  }
  const rowPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) rowPatch.name = patch.name;
  if (patch.tourId !== undefined) rowPatch.tour_id = patch.tourId;
  if (patch.author !== undefined) rowPatch.author = patch.author;
  if (patch.sceneCount !== undefined) rowPatch.scene_count = patch.sceneCount;
  if (patch.status !== undefined) rowPatch.status = patch.status;
  if (patch.thumbnailUrl !== undefined) rowPatch.thumbnail_url = patch.thumbnailUrl;
  const { data, error } = await db
    .from('vted_projects')
    .update(rowPatch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw new Error(`Failed to update project: ${error.message}`);
  return data ? toProject(data as VtedProjectRow) : null;
}

export async function deleteProject(id: string): Promise<boolean> {
  const db = getSupabaseAdmin();
  if (!db) return memoryFallback.delete(id);
  const { error, count } = await db.from('vted_projects').delete({ count: 'exact' }).eq('id', id);
  if (error) throw new Error(`Failed to delete project: ${error.message}`);
  return (count ?? 0) > 0;
}

// Test/dev helper: clear the in-memory fallback (no-op against Supabase).
export function __clearMemoryFallback(): void {
  memoryFallback.clear();
}

export { useMemory };
