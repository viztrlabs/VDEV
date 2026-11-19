-- VizTR — Phase 02: User Profiles Table
-- Extended user profile data for Telegram bot registration

create table if not exists public.user_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  category text not null check (category in ('client', 'architect', '3d_artist', 'freelancer', 'learner', 'technology_enthusiast')),
  bio text,
  company text,
  location text,
  website text,
  portfolio_url text,
  experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced', 'expert')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  approved_by uuid references public.profiles (id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_status_idx on public.user_profiles (status);
create index if not exists user_profiles_category_idx on public.user_profiles (category);
create index if not exists user_profiles_user_id_idx on public.user_profiles (id);

-- Row Level Security
alter table public.user_profiles enable row level security;

-- Users can read/write their own profile
drop policy if exists "user_profiles owner full" on public.user_profiles;
create policy "user_profiles owner full"
  on public.user_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Published profiles are readable by all authenticated users
drop policy if exists "user_profiles approved read" on public.user_profiles;
create policy "user_profiles approved read"
  on public.user_profiles for select
  using (status = 'approved');

-- Admins can manage all profiles
drop policy if exists "user_profiles admin full" on public.user_profiles;
create policy "user_profiles admin full"
  on public.user_profiles for all
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
