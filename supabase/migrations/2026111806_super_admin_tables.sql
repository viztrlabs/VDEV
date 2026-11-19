-- VizTR — Super Admin database tables
-- Migrates mock/localStorage repositories to Supabase

-- =====================================================================
-- SUPER ADMIN USERS
-- =====================================================================
create table if not exists public.super_admin_users (
  id text primary key,
  name text not null,
  email text unique not null,
  role text not null default 'user' check (role in ('super_admin', 'admin', 'user', 'client')),
  status text not null default 'active' check (status in ('active', 'invited', 'suspended', 'inactive')),
  avatar text,
  department text,
  assigned_projects_count int not null default 0,
  last_login text,
  two_factor_enabled boolean not null default false,
  phone text,
  company text,
  permissions_override text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists super_admin_users_email_idx on public.super_admin_users (email);
create index if not exists super_admin_users_role_idx on public.super_admin_users (role);
create index if not exists super_admin_users_status_idx on public.super_admin_users (status);

-- =====================================================================
-- GPU NODES
-- =====================================================================
create table if not exists public.gpu_nodes (
  id text primary key,
  region_code text not null,
  region_name text not null,
  flag_emoji text,
  gpu_model text not null,
  instance_type text not null,
  total_nodes int not null default 0,
  active_nodes int not null default 0,
  active_sessions int not null default 0,
  max_sessions int not null default 0,
  load_percentage double precision not null default 0,
  vram_used_gb double precision not null default 0,
  vram_total_gb double precision not null default 0,
  avg_latency_ms double precision not null default 0,
  avg_fps double precision not null default 0,
  temperature_c double precision not null default 0,
  status text not null default 'healthy' check (status in ('healthy', 'warning', 'degraded', 'maintenance')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gpu_nodes_region_code_idx on public.gpu_nodes (region_code);
create index if not exists gpu_nodes_status_idx on public.gpu_nodes (status);

-- =====================================================================
-- FEATURE TOGGLES
-- =====================================================================
create table if not exists public.feature_toggles (
  id text primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  description text,
  category text not null default 'core' check (category in ('core', 'rendering', 'xr', 'ai', 'security', 'storage')),
  enabled boolean not null default false,
  requires_restart boolean not null default false,
  environment text not null default 'all' check (environment in ('all', 'production', 'staging')),
  last_modified_by text,
  last_modified_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists feature_toggles_key_idx on public.feature_toggles (key);
create index if not exists feature_toggles_category_idx on public.feature_toggles (category);

-- =====================================================================
-- SYSTEM LOGS
-- =====================================================================
create table if not exists public.system_logs (
  id text primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),
  level text not null default 'info' check (level in ('info', 'warn', 'error', 'critical')),
  service text not null,
  message text not null,
  details text,
  region text,
  ip text
);

create index if not exists system_logs_timestamp_idx on public.system_logs (timestamp desc);
create index if not exists system_logs_level_idx on public.system_logs (level);
create index if not exists system_logs_service_idx on public.system_logs (service);

-- =====================================================================
-- REVENUE METRICS
-- =====================================================================
create table if not exists public.revenue_metrics (
  id text primary key default gen_random_uuid(),
  month text not null,
  mrr double precision not null default 0,
  one_off_commissions double precision not null default 0,
  vr_licenses double precision not null default 0,
  total double precision not null default 0,
  expenses double precision not null default 0,
  net_margin double precision not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists revenue_metrics_month_idx on public.revenue_metrics (month);
create unique index if not exists revenue_metrics_month_unique_idx on public.revenue_metrics (month);

-- =====================================================================
-- BOOKINGS
-- =====================================================================
create table if not exists public.bookings (
  id text primary key,
  service_type text not null,
  client_name text not null,
  client_email text not null,
  client_phone text,
  company text,
  project_description text,
  preferred_date date not null,
  preferred_time text not null,
  timezone text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  admin_notes text,
  approved_by text,
  approved_at timestamptz,
  rejected_by text,
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_service_type_idx on public.bookings (service_type);
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_client_email_idx on public.bookings (client_email);

-- =====================================================================
-- CONTACT SUBMISSIONS
-- =====================================================================
create table if not exists public.contact_submissions (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  company text,
  service_interest text,
  message text,
  status text not null default 'new' check (status in ('new', 'read', 'responded', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_submissions_status_idx on public.contact_submissions (status);
create index if not exists contact_submissions_service_interest_idx on public.contact_submissions (service_interest);
create index if not exists contact_submissions_created_at_idx on public.contact_submissions (created_at desc);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.super_admin_users enable row level security;
alter table public.gpu_nodes enable row level security;
alter table public.feature_toggles enable row level security;
alter table public.system_logs enable row level security;
alter table public.revenue_metrics enable row level security;
alter table public.bookings enable row level security;
alter table public.contact_submissions enable row level security;

-- Users: admins can read all; users can read their own profile
drop policy if exists "super_admin_users read" on public.super_admin_users;
create policy "super_admin_users read"
  on public.super_admin_users for select
  using (
    auth.uid()::text = id
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  );

drop policy if exists "super_admin_users admin write" on public.super_admin_users;
create policy "super_admin_users admin write"
  on public.super_admin_users for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  );

-- GPU nodes: read by all authenticated, write by admins
drop policy if exists "gpu_nodes read" on public.gpu_nodes;
create policy "gpu_nodes read"
  on public.gpu_nodes for select
  using (auth.uid() is not null);

drop policy if exists "gpu_nodes admin write" on public.gpu_nodes;
create policy "gpu_nodes admin write"
  on public.gpu_nodes for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  );

-- Feature toggles: read by all authenticated, write by admins
drop policy if exists "feature_toggles read" on public.feature_toggles;
create policy "feature_toggles read"
  on public.feature_toggles for select
  using (auth.uid() is not null);

drop policy if exists "feature_toggles admin write" on public.feature_toggles;
create policy "feature_toggles admin write"
  on public.feature_toggles for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  );

-- System logs: read by admins, insert by system
drop policy if exists "system_logs read" on public.system_logs;
create policy "system_logs read"
  on public.system_logs for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  );

drop policy if exists "system_logs insert" on public.system_logs;
create policy "system_logs insert"
  on public.system_logs for insert
  with check (true);

-- Revenue metrics: read by all authenticated
drop policy if exists "revenue_metrics read" on public.revenue_metrics;
create policy "revenue_metrics read"
  on public.revenue_metrics for select
  using (auth.uid() is not null);

-- Bookings: clients can read their own, admins can read all
drop policy if exists "bookings read" on public.bookings;
create policy "bookings read"
  on public.bookings for select
  using (
    client_email = (select email from auth.users where id = auth.uid() limit 1)
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  );

drop policy if exists "bookings insert" on public.bookings;
create policy "bookings insert"
  on public.bookings for insert
  with check (true);

drop policy if exists "bookings admin write" on public.bookings;
create policy "bookings admin write"
  on public.bookings for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  );

-- Contact submissions: public can insert, admins can read/write
drop policy if exists "contact_submissions insert" on public.contact_submissions;
create policy "contact_submissions insert"
  on public.contact_submissions for insert
  with check (true);

drop policy if exists "contact_submissions read" on public.contact_submissions;
create policy "contact_submissions read"
  on public.contact_submissions for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  );

drop policy if exists "contact_submissions admin write" on public.contact_submissions;
create policy "contact_submissions admin write"
  on public.contact_submissions for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  );
