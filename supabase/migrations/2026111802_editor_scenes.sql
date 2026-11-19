-- VizTR — Editor scenes table
-- Persists 3D editor snapshots to the database instead of filesystem/localStorage

create table if not exists public.editor_scenes (
  id uuid primary key default gen_random_uuid(),
  project_id text,
  name text not null default 'Untitled Scene',
  engine text not null default 'three',
  version int not null default 1,
  snapshot jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add missing columns if table already exists from partial application
alter table public.editor_scenes add column if not exists user_id uuid references public.profiles (id) on delete set null;
alter table public.editor_scenes add column if not exists project_id text;
alter table public.editor_scenes add column if not exists name text not null default 'Untitled Scene';
alter table public.editor_scenes add column if not exists engine text not null default 'three';
alter table public.editor_scenes add column if not exists version int not null default 1;
alter table public.editor_scenes add column if not exists snapshot jsonb not null default '{}'::jsonb;
alter table public.editor_scenes add column if not exists is_published boolean not null default false;
alter table public.editor_scenes add column if not exists published_at timestamptz;
alter table public.editor_scenes add column if not exists created_at timestamptz not null default now();
alter table public.editor_scenes add column if not exists updated_at timestamptz not null default now();

create index if not exists editor_scenes_user_id_idx on public.editor_scenes (user_id);
create index if not exists editor_scenes_project_id_idx on public.editor_scenes (project_id);
create index if not exists editor_scenes_updated_at_idx on public.editor_scenes (updated_at desc);
create index if not exists editor_scenes_is_published_idx on public.editor_scenes (is_published);

-- Row Level Security
alter table public.editor_scenes enable row level security;

-- Users can read/write their own scenes
drop policy if exists "editor_scenes owner full" on public.editor_scenes;
create policy "editor_scenes owner full"
  on public.editor_scenes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Published scenes are readable by all authenticated users
drop policy if exists "editor_scenes published read" on public.editor_scenes;
create policy "editor_scenes published read"
  on public.editor_scenes for select
  using (is_published = true);

-- Admins can manage all scenes
drop policy if exists "editor_scenes admin full" on public.editor_scenes;
create policy "editor_scenes admin full"
  on public.editor_scenes for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  );
