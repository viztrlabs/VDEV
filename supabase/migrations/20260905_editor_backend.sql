-- VizTR Editor Backend — PlayCanvas-style 3D editor tables
-- Adds editor_projects, editor_scenes, editor_assets, editor_branches, editor_checkpoints
-- Safe to re-run (idempotent).

-- =====================================================================
-- EDITOR PROJECTS
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.editor_projects (
  id bigserial PRIMARY KEY,
  name text NOT NULL DEFAULT 'Untitled',
  description text NOT NULL DEFAULT '',
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  fork_from integer,
  permissions jsonb NOT NULL DEFAULT '{"admin":[1],"read":[1],"write":[1]}'::jsonb,
  private boolean NOT NULL DEFAULT true,
  primary_app text,
  play_url text NOT NULL DEFAULT '',
  private_assets boolean NOT NULL DEFAULT false,
  has_private_settings boolean NOT NULL DEFAULT false,
  thumbnails jsonb NOT NULL DEFAULT '{}'::jsonb,
  master_branch text NOT NULL DEFAULT 'main',
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS editor_projects_owner_id_idx ON public.editor_projects(owner_id);
CREATE INDEX IF NOT EXISTS editor_projects_created_at_idx ON public.editor_projects(created_at DESC);

-- =====================================================================
-- EDITOR SCENES
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.editor_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Root',
  project_id bigint NOT NULL REFERENCES public.editor_projects(id) ON DELETE CASCADE,
  branch_id text NOT NULL DEFAULT 'main',
  entities jsonb NOT NULL DEFAULT '{}'::jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS editor_scenes_project_id_idx ON public.editor_scenes(project_id);
CREATE INDEX IF NOT EXISTS editor_scenes_project_branch_idx ON public.editor_scenes(project_id, branch_id);

-- =====================================================================
-- EDITOR ASSETS
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.editor_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id bigint NOT NULL REFERENCES public.editor_projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  filename text,
  size bigint DEFAULT 0,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  url text,
  storage_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS editor_assets_project_id_idx ON public.editor_assets(project_id);

-- =====================================================================
-- EDITOR BRANCHES
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.editor_branches (
  id text NOT NULL DEFAULT 'main',
  name text NOT NULL DEFAULT 'main',
  project_id bigint NOT NULL REFERENCES public.editor_projects(id) ON DELETE CASCADE,
  latest_checkpoint_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, id)
);

CREATE INDEX IF NOT EXISTS editor_branches_project_id_idx ON public.editor_branches(project_id);

-- =====================================================================
-- EDITOR CHECKPOINTS
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.editor_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id bigint NOT NULL REFERENCES public.editor_projects(id) ON DELETE CASCADE,
  branch_id text NOT NULL DEFAULT 'main',
  description text NOT NULL DEFAULT '',
  scene_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  asset_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS editor_checkpoints_project_id_idx ON public.editor_checkpoints(project_id);

-- =====================================================================
-- AUTO-UPDATE TRIGGERS
-- =====================================================================

DROP TRIGGER IF EXISTS editor_projects_set_updated_at ON public.editor_projects;
CREATE TRIGGER editor_projects_set_updated_at
  BEFORE UPDATE ON public.editor_projects
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS editor_scenes_set_updated_at ON public.editor_scenes;
CREATE TRIGGER editor_scenes_set_updated_at
  BEFORE UPDATE ON public.editor_scenes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS editor_assets_set_updated_at ON public.editor_assets;
CREATE TRIGGER editor_assets_set_updated_at
  BEFORE UPDATE ON public.editor_assets
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

ALTER TABLE public.editor_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_checkpoints ENABLE ROW LEVEL SECURITY;

-- Allow anon read (for local dev without auth)
DROP POLICY IF EXISTS editor_projects_anon_read ON public.editor_projects;
CREATE POLICY editor_projects_anon_read ON public.editor_projects
  FOR SELECT USING (true);

DROP POLICY IF EXISTS editor_projects_anon_insert ON public.editor_projects;
CREATE POLICY editor_projects_anon_insert ON public.editor_projects
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS editor_projects_anon_update ON public.editor_projects;
CREATE POLICY editor_projects_anon_update ON public.editor_projects
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS editor_projects_anon_delete ON public.editor_projects;
CREATE POLICY editor_projects_anon_delete ON public.editor_projects
  FOR DELETE USING (true);

DROP POLICY IF EXISTS editor_scenes_anon_all ON public.editor_scenes;
CREATE POLICY editor_scenes_anon_all ON public.editor_scenes
  FOR ALL USING (true);

DROP POLICY IF EXISTS editor_assets_anon_all ON public.editor_assets;
CREATE POLICY editor_assets_anon_all ON public.editor_assets
  FOR ALL USING (true);

DROP POLICY IF EXISTS editor_branches_anon_all ON public.editor_branches;
CREATE POLICY editor_branches_anon_all ON public.editor_branches
  FOR ALL USING (true);

DROP POLICY IF EXISTS editor_checkpoints_anon_all ON public.editor_checkpoints;
CREATE POLICY editor_checkpoints_anon_all ON public.editor_checkpoints
  FOR ALL USING (true);
