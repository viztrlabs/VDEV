-- VizTR Phase 1 — RLS policies
-- Additive only. Uses unique policy names and `drop policy if exists`.
-- Targets the actual live DB tables: `User`, `Project`, `Service`, plus new tables.

-- =====================================================================
-- HELPERS
-- =====================================================================

CREATE OR REPLACE FUNCTION public.auth_uid() RETURNS text AS $$
BEGIN
  RETURN auth.uid()::text;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.auth_role() RETURNS text AS $$
DECLARE
  role text;
BEGIN
  BEGIN
    role := auth.jwt() ->> 'role';
  EXCEPTION
    WHEN OTHERS THEN
      role := NULL;
  END;
  RETURN COALESCE(role, '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================================
-- PROJECTS (extends existing `public."Project"`)
-- =====================================================================

DROP POLICY IF EXISTS project_anon_read ON public."Project";
DROP POLICY IF EXISTS project_anon_write ON public."Project";

CREATE POLICY project_anon_read ON public."Project"
  FOR SELECT TO anon USING (true);

CREATE POLICY project_auth_read ON public."Project"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY project_owner_update ON public."Project"
  FOR UPDATE TO authenticated USING (owner_id = auth_uid());

CREATE POLICY project_owner_delete ON public."Project"
  FOR DELETE TO authenticated USING (owner_id = auth_uid());

CREATE POLICY project_admin_all ON public."Project"
  FOR ALL TO authenticated USING (
    auth_role() IN ('SUPER_ADMIN','ADMIN')
  );

-- =====================================================================
-- PROJECT SERVICES
-- =====================================================================

DROP POLICY IF EXISTS project_services_anon_read ON public.project_services;
DROP POLICY IF EXISTS project_services_auth_read ON public.project_services;
DROP POLICY IF EXISTS project_services_owner_write ON public.project_services;
DROP POLICY IF EXISTS project_services_admin_all ON public.project_services;

CREATE POLICY project_services_anon_read ON public.project_services
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM public."Project" p
      WHERE p.id = project_id
        AND p.visibility IN ('PUBLIC','CLIENT_ONLY')
    )
  );

CREATE POLICY project_services_auth_read ON public.project_services
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public."Project" p
      LEFT JOIN public.project_members pm ON pm.project_id = p.id AND pm.user_id = auth_uid() AND pm.status = 'active'
      WHERE p.id = project_id
        AND (
          p.owner_id = auth_uid()
          OR pm.user_id IS NOT NULL
          OR auth_role() IN ('SUPER_ADMIN','ADMIN')
        )
    )
  );

CREATE POLICY project_services_owner_write ON public.project_services
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Project" p
      WHERE p.id = project_id AND p.owner_id = auth_uid()
    )
  );

CREATE POLICY project_services_admin_all ON public.project_services
  FOR ALL TO authenticated USING (
    auth_role() IN ('SUPER_ADMIN','ADMIN')
  );

-- =====================================================================
-- EXPERIENCES
-- =====================================================================

DROP POLICY IF EXISTS experiences_anon_read ON public.experiences;
DROP POLICY IF EXISTS experiences_auth_read ON public.experiences;
DROP POLICY IF EXISTS experiences_owner_write ON public.experiences;
DROP POLICY IF EXISTS experiences_admin_all ON public.experiences;

CREATE POLICY experiences_anon_read ON public.experiences
  FOR SELECT TO anon USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM public."Project" p
      WHERE p.id = project_id AND p.visibility = 'PUBLIC'
    )
  );

CREATE POLICY experiences_auth_read ON public.experiences
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public."Project" p
      LEFT JOIN public.project_members pm ON pm.project_id = p.id AND pm.user_id = auth_uid() AND pm.status = 'active'
      WHERE p.id = project_id
        AND (
          p.owner_id = auth_uid()
          OR pm.user_id IS NOT NULL
          OR auth_role() IN ('SUPER_ADMIN','ADMIN')
        )
    )
  );

CREATE POLICY experiences_owner_write ON public.experiences
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public."Project" p
      WHERE p.id = project_id AND p.owner_id = auth_uid()
    )
  );

CREATE POLICY experiences_admin_all ON public.experiences
  FOR ALL TO authenticated USING (
    auth_role() IN ('SUPER_ADMIN','ADMIN')
  );

-- =====================================================================
-- EXPERIENCE CONFIGS
-- =====================================================================

DROP POLICY IF EXISTS experience_configs_anon_read ON public.experience_configs;
DROP POLICY IF EXISTS experience_configs_auth_read ON public.experience_configs;
DROP POLICY IF EXISTS experience_configs_owner_write ON public.experience_configs;
DROP POLICY IF EXISTS experience_configs_admin_all ON public.experience_configs;

CREATE POLICY experience_configs_anon_read ON public.experience_configs
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM public.experiences e
      JOIN public."Project" p ON p.id = e.project_id
      WHERE e.id = experience_id
        AND e.status = 'published'
        AND p.visibility = 'PUBLIC'
    )
  );

CREATE POLICY experience_configs_auth_read ON public.experience_configs
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.experiences e
      JOIN public."Project" p ON p.id = e.project_id
      LEFT JOIN public.project_members pm ON pm.project_id = p.id AND pm.user_id = auth_uid() AND pm.status = 'active'
      WHERE e.id = experience_id
        AND (
          p.owner_id = auth_uid()
          OR pm.user_id IS NOT NULL
          OR auth_role() IN ('SUPER_ADMIN','ADMIN')
        )
    )
  );

CREATE POLICY experience_configs_owner_write ON public.experience_configs
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.experiences e
      JOIN public."Project" p ON p.id = e.project_id
      WHERE e.id = experience_id AND p.owner_id = auth_uid()
    )
  );

CREATE POLICY experience_configs_admin_all ON public.experience_configs
  FOR ALL TO authenticated USING (
    auth_role() IN ('SUPER_ADMIN','ADMIN')
  );

-- =====================================================================
-- DELIVERABLES
-- =====================================================================

DROP POLICY IF EXISTS deliverables_anon_read ON public.deliverables;
DROP POLICY IF EXISTS deliverables_auth_read ON public.deliverables;
DROP POLICY IF EXISTS deliverables_owner_write ON public.deliverables;
DROP POLICY IF EXISTS deliverables_admin_all ON public.deliverables;

CREATE POLICY deliverables_anon_read ON public.deliverables
  FOR SELECT TO anon USING (
    status IN ('ready','delivered')
    AND EXISTS (
      SELECT 1 FROM public."Project" p
      WHERE p.id = project_id AND p.visibility IN ('PUBLIC','CLIENT_ONLY')
    )
  );

CREATE POLICY deliverables_auth_read ON public.deliverables
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public."Project" p
      LEFT JOIN public.project_members pm ON pm.project_id = p.id AND pm.user_id = auth_uid() AND pm.status = 'active'
      WHERE p.id = project_id
        AND (
          p.owner_id = auth_uid()
          OR pm.user_id IS NOT NULL
          OR auth_role() IN ('SUPER_ADMIN','ADMIN')
        )
    )
  );

CREATE POLICY deliverables_owner_write ON public.deliverables
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public."Project" p
      WHERE p.id = project_id AND p.owner_id = auth_uid()
    )
  );

CREATE POLICY deliverables_admin_all ON public.deliverables
  FOR ALL TO authenticated USING (
    auth_role() IN ('SUPER_ADMIN','ADMIN')
  );

-- =====================================================================
-- ASSETS
-- =====================================================================

DROP POLICY IF EXISTS assets_anon_read ON public.assets;
DROP POLICY IF EXISTS assets_auth_read ON public.assets;
DROP POLICY IF EXISTS assets_owner_write ON public.assets;
DROP POLICY IF EXISTS assets_admin_all ON public.assets;

CREATE POLICY assets_anon_read ON public.assets
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM public."Project" p
      WHERE p.id = project_id AND p.visibility IN ('PUBLIC','CLIENT_ONLY')
    )
  );

CREATE POLICY assets_auth_read ON public.assets
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public."Project" p
      LEFT JOIN public.project_members pm ON pm.project_id = p.id AND pm.user_id = auth_uid() AND pm.status = 'active'
      WHERE p.id = project_id
        AND (
          p.owner_id = auth_uid()
          OR pm.user_id IS NOT NULL
          OR auth_role() IN ('SUPER_ADMIN','ADMIN')
        )
    )
  );

CREATE POLICY assets_owner_write ON public.assets
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public."Project" p
      WHERE p.id = project_id AND p.owner_id = auth_uid()
    )
  );

CREATE POLICY assets_admin_all ON public.assets
  FOR ALL TO authenticated USING (
    auth_role() IN ('SUPER_ADMIN','ADMIN')
  );

-- =====================================================================
-- PROJECT MEMBERS
-- =====================================================================

DROP POLICY IF EXISTS project_members_anon_read ON public.project_members;
DROP POLICY IF EXISTS project_members_auth_read ON public.project_members;
DROP POLICY IF EXISTS project_members_owner_write ON public.project_members;
DROP POLICY IF EXISTS project_members_admin_all ON public.project_members;

CREATE POLICY project_members_anon_read ON public.project_members
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM public."Project" p
      WHERE p.id = project_id AND p.visibility IN ('PUBLIC','CLIENT_ONLY')
    )
  );

CREATE POLICY project_members_auth_read ON public.project_members
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public."Project" p
      LEFT JOIN public.project_members pm ON pm.project_id = p.id AND pm.user_id = auth_uid() AND pm.status = 'active'
      WHERE p.id = project_id
        AND (
          p.owner_id = auth_uid()
          OR pm.user_id IS NOT NULL
          OR auth_role() IN ('SUPER_ADMIN','ADMIN')
        )
    )
  );

CREATE POLICY project_members_owner_write ON public.project_members
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public."Project" p
      WHERE p.id = project_id AND p.owner_id = auth_uid()
    )
  );

CREATE POLICY project_members_admin_all ON public.project_members
  FOR ALL TO authenticated USING (
    auth_role() IN ('SUPER_ADMIN','ADMIN')
  );
