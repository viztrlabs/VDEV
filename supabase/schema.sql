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
  data jsonb not null default '{"rooms":[],"settings":{}}'::jsonb,
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
