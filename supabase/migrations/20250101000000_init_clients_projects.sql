-- VizTR Client Portal — Supabase Postgres schema
-- Run this in the Supabase SQL editor: https://supabase.com/dashboard/project/_/sql
--
-- Safe to re-run (idempotent). Adds tables, indexes, and RLS policies for the
-- client dashboard. The app gracefully falls back to in-memory data when
-- tables are not yet present.

-- ============================================================
-- CLIENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  firm_name         TEXT NOT NULL,
  email             TEXT NOT NULL UNIQUE,
  phone             TEXT,
  tier              TEXT NOT NULL CHECK (tier IN ('Enterprise VIP','Standard Studio','Retainer Partner')),
  active_projects   INTEGER NOT NULL DEFAULT 0,
  total_spend       TEXT NOT NULL DEFAULT '$0',
  status            TEXT NOT NULL CHECK (status IN ('Active','Pending Review','Archived')),
  portal_access_code TEXT NOT NULL UNIQUE,
  assigned_director TEXT,
  joined_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  notes             TEXT DEFAULT '',
  logo_url          TEXT,
  password_hash     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clients_portal_access_code_idx ON public.clients (portal_access_code);
CREATE INDEX IF NOT EXISTS clients_email_idx ON public.clients (email);
CREATE INDEX IF NOT EXISTS clients_status_idx ON public.clients (status);

-- ============================================================
-- PROJECTS TABLE (managed projects for client dashboard)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  client_name           TEXT NOT NULL,
  client_email          TEXT NOT NULL,
  client_company        TEXT,
  category              TEXT,
  project_type          TEXT,
  status                TEXT NOT NULL CHECK (status IN ('Complete','Work in Progress','Client Review','Awaited','Hold')),
  payment_status        TEXT NOT NULL CHECK (payment_status IN ('Paid','Partial 50%','Milestone Pending','Invoiced','Deposit Received')),
  booking_amount        NUMERIC NOT NULL DEFAULT 0,
  progress              INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  lead_architect        TEXT,
  image                 TEXT,
  last_update           TEXT,
  xr_available          BOOLEAN NOT NULL DEFAULT false,
  pixel_streaming_available BOOLEAN NOT NULL DEFAULT false,
  hours_monitoring      JSONB NOT NULL DEFAULT '{}'::jsonb,
  pipeline              JSONB NOT NULL DEFAULT '{}'::jsonb,
  documents             JSONB NOT NULL DEFAULT '[]'::jsonb,
  pending_revisions_count INTEGER NOT NULL DEFAULT 0,
  revisions_summary     TEXT DEFAULT '',
  notes                 TEXT,
  client_id             TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_client_id_idx ON public.projects (client_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects (status);
CREATE INDEX IF NOT EXISTS projects_client_email_idx ON public.projects (client_email);

-- ============================================================
-- TIMESTAMPS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clients_set_updated_at ON public.clients;
CREATE TRIGGER clients_set_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS projects_set_updated_at ON public.projects;
CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow anon + service_role full read/write.
-- Service role bypasses RLS; anon role used by public client-view pages.
DROP POLICY IF EXISTS clients_anon_read ON public.clients;
CREATE POLICY clients_anon_read ON public.clients
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS clients_anon_write ON public.clients;
CREATE POLICY clients_anon_write ON public.clients
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS projects_anon_read ON public.projects;
CREATE POLICY projects_anon_read ON public.projects
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS projects_anon_write ON public.projects;
CREATE POLICY projects_anon_write ON public.projects
  FOR ALL TO anon USING (true) WITH CHECK (true);
