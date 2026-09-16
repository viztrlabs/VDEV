-- Fix editor table RLS: drop permissive anon policies, add proper owner/admin checks.
-- Editor tables use owner_id uuid (auth.users), so we cast auth.uid() to compare.
-- Collaborative read remains open to any authenticated user.

-- =====================================================================
-- EDITOR PROJECTS
-- =====================================================================

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

-- =====================================================================
-- EDITOR SCENES
-- =====================================================================

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

-- =====================================================================
-- EDITOR ASSETS
-- =====================================================================

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

-- =====================================================================
-- EDITOR BRANCHES
-- =====================================================================

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

-- =====================================================================
-- EDITOR CHECKPOINTS
-- =====================================================================

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
