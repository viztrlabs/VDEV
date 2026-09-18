CREATE TABLE IF NOT EXISTS public.vted_projects (
  id text PRIMARY KEY,
  name text NOT NULL,
  tour_id text NOT NULL DEFAULT 'default',
  author text,
  scene_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  thumbnail_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vted_projects_tour ON public.vted_projects(tour_id);
ALTER TABLE public.vted_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vted_projects_auth_read" ON public.vted_projects;
CREATE POLICY "vted_projects_auth_read" ON public.vted_projects FOR SELECT USING (auth_role() IS NOT NULL);
DROP POLICY IF EXISTS "vted_projects_auth_write" ON public.vted_projects;
CREATE POLICY "vted_projects_auth_write" ON public.vted_projects FOR INSERT WITH CHECK (auth_role() IS NOT NULL);
DROP POLICY IF EXISTS "vted_projects_admin_all" ON public.vted_projects;
CREATE POLICY "vted_projects_admin_all" ON public.vted_projects FOR ALL USING (auth_role() IN ('super_admin', 'admin'));
