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
CREATE POLICY "feedback_auth_read" ON public.feedback FOR SELECT USING (auth_role() IS NOT NULL);
CREATE POLICY "feedback_auth_insert" ON public.feedback FOR INSERT WITH CHECK (auth_role() IS NOT NULL);
CREATE POLICY "feedback_admin_all" ON public.feedback FOR ALL USING (auth_role() IN ('super_admin', 'admin'));
