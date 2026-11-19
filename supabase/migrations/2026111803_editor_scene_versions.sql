-- VizTR — Editor scene version history
-- Tracks all versions of editor scenes for draft/publish and rollback

create table if not exists public.editor_scene_versions (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.editor_scenes (id) on delete cascade,
  version int not null,
  snapshot jsonb not null default '{}'::jsonb,
  name text not null default 'Untitled Scene',
  engine text not null default 'three',
  is_published boolean not null default false,
  published_at timestamptz,
  change_description text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create index if not exists editor_scene_versions_scene_id_idx on public.editor_scene_versions (scene_id);
create index if not exists editor_scene_versions_version_idx on public.editor_scene_versions (scene_id, version);
create index if not exists editor_scene_versions_is_published_idx on public.editor_scene_versions (is_published);
create index if not exists editor_scene_versions_created_at_idx on public.editor_scene_versions (created_at desc);

-- Row Level Security
alter table public.editor_scene_versions enable row level security;

-- Users can read/write their own scene versions
drop policy if exists "editor_scene_versions owner full" on public.editor_scene_versions;
create policy "editor_scene_versions owner full"
  on public.editor_scene_versions for all
  using (
    exists (
      select 1 from public.editor_scenes
      where editor_scenes.id = editor_scene_versions.scene_id
        and editor_scenes.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.editor_scenes
      where editor_scenes.id = editor_scene_versions.scene_id
        and editor_scenes.user_id = auth.uid()
    )
  );

-- Published versions readable by all authenticated
drop policy if exists "editor_scene_versions published read" on public.editor_scene_versions;
create policy "editor_scene_versions published read"
  on public.editor_scene_versions for select
  using (
    is_published = true
    and exists (
      select 1 from public.editor_scenes
      where editor_scenes.id = editor_scene_versions.scene_id
    )
  );

-- Admins can manage all versions
drop policy if exists "editor_scene_versions admin full" on public.editor_scene_versions;
create policy "editor_scene_versions admin full"
  on public.editor_scene_versions for all
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
