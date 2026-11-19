-- VizTR — Phase 02: Admin Notifications Table
-- Admin notification queue for new registrations, enquiries, and system alerts

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info', 'warning', 'error', 'success', 'warning')),
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists admin_notifications_user_id_idx on public.admin_notifications (user_id);
create index if not exists admin_notifications_read_idx on public.admin_notifications (read);
create index if not exists admin_notifications_created_at_idx on public.admin_notifications (created_at desc);

-- Row Level Security
alter table public.admin_notifications enable row level security;

-- Users can read their own notifications
drop policy if exists "admin_notifications owner read" on public.admin_notifications;
create policy "admin_notifications owner read"
  on public.admin_notifications for select
  using (auth.uid() = user_id);

-- Admins can manage all notifications
drop policy if exists "admin_notifications admin full" on public.admin_notifications;
create policy "admin_notifications admin full"
  on public.admin_notifications for all
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

-- System can insert notifications (server-side only)
drop policy if exists "admin_notifications system insert" on public.admin_notifications;
create policy "admin_notifications system insert"
  on public.admin_notifications for insert
  with check (true);
