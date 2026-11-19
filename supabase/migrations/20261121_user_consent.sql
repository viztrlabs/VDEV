-- VizTR — Phase 02: User Consent Table
-- Privacy and consent tracking for registered users

create table if not exists public.user_consent (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  terms_accepted boolean not null default false,
  terms_version text not null default '1.0',
  marketing_consent boolean not null default false,
  data_processing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_consent_user_id_idx on public.user_consent (user_id);

-- Row Level Security
alter table public.user_consent enable row level security;

-- Users can read/write their own consent
drop policy if exists "user_consent owner full" on public.user_consent;
create policy "user_consent owner full"
  on public.user_consent for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admins can read all consent records
drop policy if exists "user_consent admin read" on public.user_consent;
create policy "user_consent admin read"
  on public.user_consent for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  );
