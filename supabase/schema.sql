-- VizTR — Supabase schema for tenant-scoped virtual tours
-- Apply via the Supabase SQL editor or `supabase db push`.
-- Idempotent-friendly: uses IF NOT EXISTS / CREATE OR REPLACE where possible.

-- =====================================================================
-- PROFILES (tenant root)
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'owner' check (role in ('super_admin', 'owner', 'editor', 'viewer')),
  org_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'role', 'owner')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- TOURS (tenant-scoped virtual tours)
-- Each tenant owns one (or many) tours. The tour payload reuses the
-- existing TourRoom[] shape stored as JSONB so the editor/admin keep
-- working unchanged; this table adds ownership + access control.
-- =====================================================================
create table if not exists public.tours (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'Untitled Tour',
  slug text unique,
  is_live boolean not null default false,
  access_level text not null default 'public' check (access_level in ('public', 'private')),
  version int not null default 1,
  data jsonb not null default '{"version":1,"rooms":[],"settings":{}}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tours_owner_id_idx on public.tours (owner_id);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.tours enable row level security;

-- Profiles: a user can read/update only their own row.
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
  on public.profiles for update
  using (auth.uid() = id);

-- Tours: owners manage their own; published/public tours are readable by anon.
drop policy if exists "tours owner full" on public.tours;
create policy "tours owner full"
  on public.tours for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "tours public read" on public.tours;
create policy "tours public read"
  on public.tours for select
  using (access_level = 'public');

-- =====================================================================
-- MULTI-TOUR + COLLABORATION + GUIDED TOUR EXTENSIONS
-- =====================================================================

-- Allow multiple tours per owner (project grouping).
alter table public.tours add column if not exists parent_project uuid;
alter table public.tours add column if not exists custom_domain text;
alter table public.tours add column if not exists streetview_status text not null default 'unsynced'
  check (streetview_status in ('unsynced','pending','synced','error'));
alter table public.tours add column if not exists streetview_target text;
alter table public.tours add column if not exists max_resolution int not null default 8192
  check (max_resolution in (4096, 8192, 16384, 32768));
alter table public.tours add column if not exists guide_enabled boolean not null default false;
alter table public.tours add column if not exists auto_rotate boolean not null default false;

-- Team & roles: members of a tour with a scoped role.
create table if not exists public.tour_members (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  email text,
  role text not null default 'viewer' check (role in ('owner', 'editor', 'viewer')),
  invited_by uuid references public.profiles (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'active')),
  created_at timestamptz not null default now()
);
create index if not exists tour_members_tour_id_idx on public.tour_members (tour_id);

-- Client collaboration: comments + tasks on a tour.
create table if not exists public.tour_comments (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  author_name text,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists tour_comments_tour_id_idx on public.tour_comments (tour_id);

create table if not exists public.tour_tasks (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists tour_tasks_tour_id_idx on public.tour_tasks (tour_id);

-- Guided-tour auto-play waypoints (ordered scene sequence).
create table if not exists public.tour_waypoints (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  room_id text not null,
  position int not null default 0,
  dwell_seconds int not null default 8,
  created_at timestamptz not null default now()
);
create index if not exists tour_waypoints_tour_id_idx on public.tour_waypoints (tour_id);

alter table public.tour_members enable row level security;
alter table public.tour_comments enable row level security;
alter table public.tour_tasks enable row level security;
alter table public.tour_waypoints enable row level security;

-- Members: owner + joined members can read; owner manages.
drop policy if exists "members owner+manage" on public.tour_members;
create policy "members owner+manage"
  on public.tour_members for all
  using (
    tour_id in (select id from public.tours where owner_id = auth.uid())
    or user_id = auth.uid()
  )
  with check (tour_id in (select id from public.tours where owner_id = auth.uid()));

-- Comments: readable by tour owner/members; writable by authenticated.
drop policy if exists "comments read" on public.tour_comments;
create policy "comments read"
  on public.tour_comments for select
  using (
    tour_id in (select id from public.tours where owner_id = auth.uid())
    or tour_id in (select tour_id from public.tour_members where user_id = auth.uid())
  );
drop policy if exists "comments insert" on public.tour_comments;
create policy "comments insert"
  on public.tour_comments for insert
  with check (
    auth.uid() is not null
    or tour_id in (select id from public.tours where access_level = 'public')
  );

-- Tasks: same scoping as comments.
drop policy if exists "tasks read" on public.tour_tasks;
create policy "tasks read"
  on public.tour_tasks for select
  using (
    tour_id in (select id from public.tours where owner_id = auth.uid())
    or tour_id in (select tour_id from public.tour_members where user_id = auth.uid())
  );
drop policy if exists "tasks write" on public.tour_tasks;
create policy "tasks write"
  on public.tour_tasks for all
  using (tour_id in (select id from public.tours where owner_id = auth.uid()))
  with check (tour_id in (select id from public.tours where owner_id = auth.uid()));

-- Waypoints: owner + members manage.
drop policy if exists "waypoints manage" on public.tour_waypoints;
create policy "waypoints manage"
  on public.tour_waypoints for all
  using (
    tour_id in (select id from public.tours where owner_id = auth.uid())
    or tour_id in (select tour_id from public.tour_members where user_id = auth.uid())
  )
  with check (
    tour_id in (select id from public.tours where owner_id = auth.uid())
    or tour_id in (select tour_id from public.tour_members where user_id = auth.uid())
  );

