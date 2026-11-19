-- VizTR — Phase 02: User Invitations Table
-- Community invitation management for Telegram bot registration

create table if not exists public.user_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invited_by uuid references public.profiles (id) on delete cascade,
  category text check (category in ('client', 'architect', '3d_artist', 'freelancer', 'learner', 'technology_enthusiast')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  token text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists user_invitations_email_idx on public.user_invitations (email);
create index if not exists user_invitations_token_idx on public.user_invitations (token);
create index if not exists user_invitations_status_idx on public.user_invitations (status);

-- Row Level Security
alter table public.user_invitations enable row level security;

-- Anyone can read invitations (for public invitation links)
drop policy if exists "user_invitations read public" on public.user_invitations;
create policy "user_invitations read public"
  on public.user_invitations for select
  using (true);

-- Admins can create/read/update all invitations
drop policy if exists "user_invitations admin full" on public.user_invitations;
create policy "user_invitations admin full"
  on public.user_invitations for all
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

-- Users can read their own invitations
drop policy if exists "user_invitations owner read" on public.user_invitations;
create policy "user_invitations owner read"
  on public.user_invitations for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.email = user_invitations.email
    )
  );
