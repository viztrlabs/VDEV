-- VizTR — Phase 02: Client Enquiries Table
-- Client project enquiry submissions from Telegram bot and website

create table if not exists public.client_enquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  name text not null,
  email text not null,
  company text,
  service_type text not null check (service_type in ('architectural', 'virtual_reality', 'webxr', 'webar', 'virtual_tour_360', 'animation', 'still_renders', 'other')),
  project_type text,
  budget_range text,
  timeline text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_enquiries_status_idx on public.client_enquiries (status);
create index if not exists client_enquiries_user_id_idx on public.client_enquiries (user_id);
create index if not exists client_enquiries_service_type_idx on public.client_enquiries (service_type);
create index if not exists client_enquiries_created_at_idx on public.client_enquiries (created_at desc);

-- Row Level Security
alter table public.client_enquiries enable row level security;

-- Users can read/write their own enquiries
drop policy if exists "client_enquiries owner full" on public.client_enquiries;
create policy "client_enquiries owner full"
  on public.client_enquiries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admins can manage all enquiries
drop policy if exists "client_enquiries admin full" on public.client_enquiries;
create policy "client_enquiries admin full"
  on public.client_enquiries for all
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

-- Public can insert new enquiries (for website contact forms and Telegram bot)
drop policy if exists "client_enquiries public insert" on public.client_enquiries;
create policy "client_enquiries public insert"
  on public.client_enquiries for insert
  with check (true);
