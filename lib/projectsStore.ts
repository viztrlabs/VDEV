import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { VtedProject } from '@/lib/vted-types';

const DATA_DIR = path.join(process.cwd(), '.data', 'tour');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

interface ProjectStore {
  version: number;
  projects: VtedProject[];
}

const DEFAULT_STORE: ProjectStore = {
  version: 1,
  projects: [],
};

export async function getProjects(): Promise<VtedProject[]> {
  try {
    const raw = await fs.readFile(PROJECTS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as ProjectStore;
    if (parsed && Array.isArray(parsed.projects)) return parsed.projects;
  } catch {
    // no file
  }
  return DEFAULT_STORE.projects;
}

export async function getProject(id: string): Promise<VtedProject | null> {
  const list = await getProjects();
  return list.find((p) => p.id === id) || null;
}

export async function createProject(input: Omit<VtedProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<VtedProject> {
  const list = await getProjects();
  const now = new Date().toISOString();
  const p: VtedProject = {
    ...input,
    id: `proj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: now,
    updatedAt: now,
  };
  list.unshift(p);
  await save(list);
  return p;
}

export async function updateProject(id: string, patch: Partial<VtedProject>): Promise<VtedProject | null> {
  const list = await getProjects();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
  await save(list);
  return list[idx];
}

export async function deleteProject(id: string): Promise<boolean> {
  const list = await getProjects();
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) return false;
  await save(next);
  return true;
}

async function save(list: VtedProject[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    PROJECTS_FILE,
    JSON.stringify({ version: 1, projects: list } satisfies ProjectStore, null, 2),
    'utf8',
  );
}
