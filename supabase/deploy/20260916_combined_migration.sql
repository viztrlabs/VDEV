-- ============================================================================
-- VizTR Production Deployment — Combined Migration Script
-- Generated: 2026-09-16
-- Run AFTER existing migrations (20260901-20260905) are applied.
--
-- Usage (Supabase Dashboard SQL Editor):
--   1. Open Supabase Dashboard → SQL Editor
--   2. Paste this entire script
--   3. Click "Run"
--   4. Verify with: SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 10;
--
-- Usage (Supabase CLI):
--   supabase db push
--   -- or
--   supabase migration up
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ENABLE RLS ON PHASE-1 TABLES
--    Policies already exist in 20260903_phase1_rls_policies.sql but were inert.
-- ============================================================================

ALTER TABLE public.project_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. FIX EDITOR TABLE RLS
--    Drop permissive anon policies, add owner/admin checks.
-- =====================================================================

-- Editor Projects
DROP POLICY IF EXISTS editor_projects_anon_read ON public.editor_projects;
DROP POLICY IF EXISTS editor_projects_anon_insert ON public.editor_projects;
DROP POLICY IF EXISTS editor_projects_anon_update ON public.editor_projects;
DROP POLICY IF EXISTS editor_projects_anon_delete ON public.editor_projects;

CREATE POLICY editor_projects_admin_all ON public.editor_projects
  FOR ALL TO authenticated USING (
    auth_role() IN ('super_admin', 'admin')
  );

CREATE POLICY editor_projects_owner_all ON public.editor_projects
  FOR ALL TO authenticated USING (
    owner_id = auth.uid()::uuid
  );

CREATE POLICY editor_projects_auth_read ON public.editor_projects
  FOR SELECT TO authenticated USING (true);

-- Editor Scenes
DROP POLICY IF EXISTS editor_scenes_anon_all ON public.editor_scenes;

CREATE POLICY editor_scenes_parent_owner_all ON public.editor_scenes
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.editor_projects ep
      WHERE ep.id = project_id
        AND (ep.owner_id = auth.uid()::uuid OR auth_role() IN ('super_admin', 'admin'))
    )
  );

CREATE POLICY editor_scenes_auth_read ON public.editor_scenes
  FOR SELECT TO authenticated USING (true);

-- Editor Assets
DROP POLICY IF EXISTS editor_assets_anon_all ON public.editor_assets;

CREATE POLICY editor_assets_parent_owner_all ON public.editor_assets
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.editor_projects ep
      WHERE ep.id = project_id
        AND (ep.owner_id = auth.uid()::uuid OR auth_role() IN ('super_admin', 'admin'))
    )
  );

CREATE POLICY editor_assets_auth_read ON public.editor_assets
  FOR SELECT TO authenticated USING (true);

-- Editor Branches
DROP POLICY IF EXISTS editor_branches_anon_all ON public.editor_branches;

CREATE POLICY editor_branches_parent_owner_all ON public.editor_branches
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.editor_projects ep
      WHERE ep.id = project_id
        AND (ep.owner_id = auth.uid()::uuid OR auth_role() IN ('super_admin', 'admin'))
    )
  );

CREATE POLICY editor_branches_auth_read ON public.editor_branches
  FOR SELECT TO authenticated USING (true);

-- Editor Checkpoints
DROP POLICY IF EXISTS editor_checkpoints_anon_all ON public.editor_checkpoints;

CREATE POLICY editor_checkpoints_parent_owner_all ON public.editor_checkpoints
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.editor_projects ep
      WHERE ep.id = project_id
        AND (ep.owner_id = auth.uid()::uuid OR auth_role() IN ('super_admin', 'admin'))
    )
  );

CREATE POLICY editor_checkpoints_auth_read ON public.editor_checkpoints
  FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- 3. FIX CLIENTS/PROJECTS RLS
--    Remove anon full read/write.
-- ============================================================================

-- Clients
DROP POLICY IF EXISTS clients_anon_read ON public.clients;
DROP POLICY IF EXISTS clients_anon_write ON public.clients;

CREATE POLICY clients_admin_all ON public.clients
  FOR ALL TO authenticated USING (
    auth_role() IN ('super_admin', 'admin')
  );

CREATE POLICY clients_auth_read ON public.clients
  FOR SELECT TO authenticated USING (
    auth_role() IS NOT NULL
  );

CREATE POLICY clients_owner_read ON public.clients
  FOR SELECT TO authenticated USING (
    email = auth.uid()::text
  );

-- Projects (lowercase, client-portal table)
DROP POLICY IF EXISTS projects_anon_read ON public.projects;
DROP POLICY IF EXISTS projects_anon_write ON public.projects;

CREATE POLICY projects_admin_all ON public.projects
  FOR ALL TO authenticated USING (
    auth_role() IN ('super_admin', 'admin')
  );

CREATE POLICY projects_auth_read ON public.projects
  FOR SELECT TO authenticated USING (
    auth_role() IS NOT NULL
  );

CREATE POLICY projects_client_read ON public.projects
  FOR SELECT TO authenticated USING (
    client_email = (auth.jwt() ->> 'email')
  );

-- ============================================================================
-- 4. ENSURE VIZTR-ASSETS STORAGE BUCKET
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'viztr-assets',
  'viztr-assets',
  true,
  524288000,
  ARRAY['image/*', 'video/*', 'model/*', 'application/octet-stream', 'application/json']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['image/*', 'video/*', 'model/*', 'application/octet-stream', 'application/json'];

-- ============================================================================
-- 5. ADD COLUMNS TO EXISTING TABLES
-- ============================================================================

ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- ============================================================================
-- 6. CREATE ACTIVITY_LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid,
  user_name text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_project ON public.activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_logs_auth_read" ON public.activity_logs
  FOR SELECT USING (auth_role() IS NOT NULL);

CREATE POLICY "activity_logs_admin_all" ON public.activity_logs
  FOR ALL USING (auth_role() IN ('super_admin', 'admin'));

-- ============================================================================
-- 7. CREATE FEEDBACK TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text REFERENCES public.projects(id) ON DELETE CASCADE,
  experience_id uuid,
  author_name text NOT NULL,
  author_email text,
  content text NOT NULL,
  annotation jsonb DEFAULT '{}',
  status text DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_project ON public.feedback(project_id);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_auth_read" ON public.feedback
  FOR SELECT USING (auth_role() IS NOT NULL);

CREATE POLICY "feedback_auth_insert" ON public.feedback
  FOR INSERT WITH CHECK (auth_role() IS NOT NULL);

CREATE POLICY "feedback_admin_all" ON public.feedback
  FOR ALL USING (auth_role() IN ('super_admin', 'admin'));

-- ============================================================================
-- DONE
-- ============================================================================

COMMIT;
