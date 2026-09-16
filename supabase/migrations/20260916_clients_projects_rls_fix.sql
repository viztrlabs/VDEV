-- Fix clients/projects RLS: drop permissive anon policies, add admin/owner/authenticated.
-- Note: password_hash and portal_access_code are sensitive columns. RLS is row-level
-- so they cannot be hidden via policy alone — the API layer must exclude them for
-- non-admin callers.

-- =====================================================================
-- CLIENTS
-- =====================================================================

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

-- =====================================================================
-- PROJECTS (lowercase, client-portal table)
-- =====================================================================

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
