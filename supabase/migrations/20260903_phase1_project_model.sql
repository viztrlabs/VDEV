-- VizTR Phase 1 — Project-first data model
-- Additive migration: extends existing `public."Project"` and `public."Service"`,
-- and adds 7 new tables.
-- Safe to re-run. Does not modify/remove existing `tours`, `tour_*`, `clients`,
-- `public.User`, or Prisma-managed tables.

-- =====================================================================
-- EXTEND EXISTING PROJECT TABLE
-- =====================================================================

ALTER TABLE public."Project" ADD COLUMN IF NOT EXISTS owner_id text REFERENCES public."User"(id) ON DELETE SET NULL;
ALTER TABLE public."Project" ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS project_owner_id_idx ON public."Project"(owner_id);

-- =====================================================================
-- EXTEND EXISTING SERVICE TABLE
-- =====================================================================

ALTER TABLE public."Service" ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- =====================================================================
-- PROJECT SERVICES (entitlement)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.project_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL REFERENCES public."Project"(id) ON DELETE CASCADE,
  service_id text NOT NULL REFERENCES public."Service"(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed','archived')),
  enabled_at timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, service_id)
);

CREATE INDEX IF NOT EXISTS project_services_project_id_idx ON public.project_services(project_id);
CREATE INDEX IF NOT EXISTS project_services_service_id_idx ON public.project_services(service_id);

-- =====================================================================
-- EXPERIENCES
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL REFERENCES public."Project"(id) ON DELETE CASCADE,
  project_service_id uuid NOT NULL REFERENCES public.project_services(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published','archived')),
  version int NOT NULL DEFAULT 1,
  published_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, project_service_id, slug)
);

CREATE INDEX IF NOT EXISTS experiences_project_id_idx ON public.experiences(project_id);
CREATE INDEX IF NOT EXISTS experiences_project_service_id_idx ON public.experiences(project_service_id);
CREATE INDEX IF NOT EXISTS experiences_status_idx ON public.experiences(status);

-- =====================================================================
-- EXPERIENCE CONFIGS
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.experience_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  assets jsonb NOT NULL DEFAULT '[]'::jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS experience_configs_experience_id_idx ON public.experience_configs(experience_id);

-- =====================================================================
-- DELIVERABLES
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL REFERENCES public."Project"(id) ON DELETE CASCADE,
  experience_id uuid REFERENCES public.experiences(id) ON DELETE SET NULL,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  url text,
  file_size bigint,
  mime_type text,
  status text NOT NULL DEFAULT 'ready' CHECK (status IN ('processing','ready','delivered','archived')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS deliverables_project_id_idx ON public.deliverables(project_id);
CREATE INDEX IF NOT EXISTS deliverables_experience_id_idx ON public.deliverables(experience_id);
CREATE INDEX IF NOT EXISTS deliverables_status_idx ON public.deliverables(status);

-- =====================================================================
-- ASSETS (project-first)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL REFERENCES public."Project"(id) ON DELETE CASCADE,
  service_id text REFERENCES public."Service"(id) ON DELETE SET NULL,
  experience_id uuid REFERENCES public.experiences(id) ON DELETE SET NULL,
  deliverable_id uuid REFERENCES public.deliverables(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('image','video','audio','model','document','archive','other')),
  url text NOT NULL,
  storage_path text,
  mime_type text,
  size bigint,
  width int,
  height int,
  duration_seconds int,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS assets_project_id_idx ON public.assets(project_id);
CREATE INDEX IF NOT EXISTS assets_service_id_idx ON public.assets(service_id);
CREATE INDEX IF NOT EXISTS assets_experience_id_idx ON public.assets(experience_id);
CREATE INDEX IF NOT EXISTS assets_deliverable_id_idx ON public.assets(deliverable_id);

-- =====================================================================
-- PROJECT MEMBERS
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL REFERENCES public."Project"(id) ON DELETE CASCADE,
  user_id text REFERENCES public."User"(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner','admin','editor','staff','client','viewer')),
  email text,
  invited_by text REFERENCES public."User"(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','removed')),
  joined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id),
  UNIQUE(project_id, email)
);

CREATE INDEX IF NOT EXISTS project_members_project_id_idx ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS project_members_user_id_idx ON public.project_members(user_id);

-- =====================================================================
-- AUTO-UPDATE TRIGGERS
-- =====================================================================

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS project_services_set_updated_at ON public.project_services;
CREATE TRIGGER project_services_set_updated_at
  BEFORE UPDATE ON public.project_services
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS experiences_set_updated_at ON public.experiences;
CREATE TRIGGER experiences_set_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS experience_configs_set_updated_at ON public.experience_configs;
CREATE TRIGGER experience_configs_set_updated_at
  BEFORE UPDATE ON public.experience_configs
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS deliverables_set_updated_at ON public.deliverables;
CREATE TRIGGER deliverables_set_updated_at
  BEFORE UPDATE ON public.deliverables
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS assets_set_updated_at ON public.assets;
CREATE TRIGGER assets_set_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS project_members_set_updated_at ON public.project_members;
CREATE TRIGGER project_members_set_updated_at
  BEFORE UPDATE ON public.project_members
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
