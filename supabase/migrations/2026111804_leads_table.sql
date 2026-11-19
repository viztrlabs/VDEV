-- VizTR — Leads table for form submissions
-- Used by /api/forms/[type] route for contact, booking, inquiry, newsletter, portfolio-enquiry forms

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  source text not null default 'web',
  service text not null default 'contact',
  stage text not null default 'new' check (stage in ('new', 'contacted', 'qualified', 'converted', 'lost')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_source_idx on public.leads (source);
create index if not exists leads_service_idx on public.leads (service);
create index if not exists leads_stage_idx on public.leads (stage);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Row Level Security
alter table public.leads enable row level security;

-- Anyone can insert leads (public form submissions)
drop policy if exists "leads insert public" on public.leads;
create policy "leads insert public"
  on public.leads for insert
  with check (true);

-- Authenticated users can read all leads
drop policy if exists "leads read authenticated" on public.leads;
create policy "leads read authenticated"
  on public.leads for select
  using (auth.uid() is not null);

-- Admins can update lead stage
drop policy if exists "leads update admin" on public.leads;
create policy "leads update admin"
  on public.leads for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  );
