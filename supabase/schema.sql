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

-- =====================================================================
-- XR LINKS (spatial-link publish persistence)
-- Used by public resolver/verify + auth-gated store via a server-only
-- service-role client. RLS enabled with zero policies (service role
-- bypasses RLS; Data API gets nothing, so access_password stays private).
-- =====================================================================
create table if not exists public.xr_links (
  id text primary key,
  name text not null,
  slug text unique not null,
  project_id text,
  scene_id text,
  model_url text not null,
  thumbnail_url text,
  share_url text not null,
  qr_code_url text not null default '',
  environment text not null default 'studio'
    check (environment in ('studio','sunset','urban','interior')),
  ar_placement text not null default 'floor'
    check (ar_placement in ('floor','tabletop','wall','image')),
  password_protected boolean not null default false,
  access_password text,
  views_count integer not null default 0,
  unique_visitors integer not null default 0,
  avg_engagement_secs double precision not null default 0,
  status text not null default 'draft'
    check (status in ('draft','active','expired','revoked','processing')),
  expires_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists xr_links_slug_idx on public.xr_links (slug);
create index if not exists xr_links_created_at_idx on public.xr_links (created_at desc);

alter table public.xr_links enable row level security;
-- Intentionally NO policies. Service role bypasses RLS; anon/authenticated are
-- granted nothing, so the table is NOT reachable through the Data API and
-- access_password stays private. Do not add anon_all policies like the editor tables.

-- =====================================================================
-- SEED — mirrors the in-memory XR_LINKS_DB records exactly.
-- Timestamps for the 4 generator rows (xr_link_gp/ts/bg/secure) are pinned
-- (in-memory computes now + 90 days at module load); the 2 legacy rows keep
-- their original fixed dates.
-- =====================================================================
insert into public.xr_links
  (id, name, slug, project_id, scene_id, model_url, thumbnail_url, share_url,
   qr_code_url, environment, ar_placement, password_protected, access_password,
   views_count, unique_visitors, avg_engagement_secs, status, expires_at, metadata,
   created_at, updated_at)
values
  (
    'xr_link_01', 'Lumina Sky Atrium — WebXR Spatial Tour', 'lumina-sky-atrium',
    'PRJ-VTR-8821', 'scene_lumina_01',
    'https://cdn.viztr.studio/models/lumina-sky-atrium.glb',
    'https://cdn.viztr.studio/thumbs/lumina-sky-atrium.jpg',
    'https://viztr.studio/xr/lumina-sky-atrium',
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://viztr.studio/xr/lumina-sky-atrium',
    'interior', 'floor', true, 'LUMINA-2025-XR',
    428, 312, 184, 'active', '2025-12-31T23:59:59Z',
    '{"engineType":"three","entitiesCount":142,"fileSizeMB":24.5,"formats":["glb","usdz","gltf"],"arConfig":{"placement":"floor","environment":"interior","passwordProtected":true},"delivery":{"webAR":true,"webXR":true,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2025-06-10T11:00:00Z', '2025-06-10T11:00:00Z'
  ),
  (
    'xr_link_02', 'Aura Waterfront Organic Pavilion — AR QuickLook', 'aura-waterfront-pavilion',
    'PRJ-VTR-9042', 'scene_aura_01',
    'https://cdn.viztr.studio/models/aura-pavilion.glb',
    'https://cdn.viztr.studio/thumbs/aura-pavilion.jpg',
    'https://viztr.studio/xr/aura-pavilion',
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://viztr.studio/xr/aura-pavilion',
    'sunset', 'tabletop', false, NULL,
    684, 540, 215, 'active', '2025-11-30T23:59:59Z',
    '{"engineType":"playcanvas","entitiesCount":89,"fileSizeMB":18.2,"formats":["glb","usdz"],"arConfig":{"placement":"tabletop","environment":"sunset","passwordProtected":false},"delivery":{"webAR":true,"webXR":false,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2025-06-25T14:30:00Z', '2025-06-25T14:30:00Z'
  ),
  (
    'xr_link_gp', 'Glass Pavilion — Ultra-Res Interior', 'glass-pavilion-v1',
    'glass-pavilion', NULL,
    'https://cdn.viztr.studio/models/glass-pavilion.glb', NULL,
    '/xr-world/view/glass-pavilion-v1', '',
    'interior', 'tabletop', false, NULL,
    0, 0, 0, 'active', '2026-12-08T00:00:00Z',
    '{"engineType":"three","entitiesCount":142,"fileSizeMB":24.5,"formats":["glb","usdz"],"arConfig":{"placement":"tabletop","environment":"interior","passwordProtected":false},"delivery":{"webAR":true,"webXR":true,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2026-09-09T00:00:00Z', '2026-09-09T00:00:00Z'
  ),
  (
    'xr_link_ts', 'Tokyo Skyloft XR', 'tokyo-skyloft-xr',
    'tokyo-skyloft', NULL,
    'https://cdn.viztr.studio/models/tokyo-skyloft.glb', NULL,
    '/xr-world/view/tokyo-skyloft-xr', '',
    'urban', 'floor', false, NULL,
    0, 0, 0, 'active', '2026-12-08T00:00:00Z',
    '{"engineType":"playcanvas","entitiesCount":142,"fileSizeMB":24.5,"formats":["glb","usdz"],"arConfig":{"placement":"floor","environment":"urban","passwordProtected":false},"delivery":{"webAR":true,"webXR":true,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2026-09-09T00:00:00Z', '2026-09-09T00:00:00Z'
  ),
  (
    'xr_link_bg', 'Brutalist Garden AR', 'brutalist-garden-ar',
    'brutalist-garden', NULL,
    'https://cdn.viztr.studio/models/brutalist-garden.glb', NULL,
    '/xr-world/view/brutalist-garden-ar', '',
    'studio', 'image', false, NULL,
    0, 0, 0, 'active', '2026-12-08T00:00:00Z',
    '{"engineType":"three","entitiesCount":142,"fileSizeMB":24.5,"formats":["glb","usdz"],"arConfig":{"placement":"image","environment":"studio","passwordProtected":false},"delivery":{"webAR":true,"webXR":true,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2026-09-09T00:00:00Z', '2026-09-09T00:00:00Z'
  ),
  (
    'xr_link_secure', 'Client Secure Haven — Gated XR', 'client-secure-haven',
    'client-secure-haven', NULL,
    'https://cdn.viztr.studio/models/client-secure-haven.glb', NULL,
    '/xr-world/view/client-secure-haven', '',
    'interior', 'floor', true, 'VIZTR-2026',
    0, 0, 0, 'active', '2026-12-08T00:00:00Z',
    '{"engineType":"three","entitiesCount":142,"fileSizeMB":24.5,"formats":["glb","usdz"],"arConfig":{"placement":"floor","environment":"interior","passwordProtected":true},"delivery":{"webAR":true,"webXR":true,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2026-09-09T00:00:00Z', '2026-09-09T00:00:00Z'
  )
on conflict (id) do nothing;

