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
CREATE POLICY "activity_logs_auth_read" ON public.activity_logs FOR SELECT USING (auth_role() IS NOT NULL);
CREATE POLICY "activity_logs_admin_all" ON public.activity_logs FOR ALL USING (auth_role() IN ('super_admin', 'admin'));
