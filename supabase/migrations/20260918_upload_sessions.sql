CREATE TABLE IF NOT EXISTS public.upload_sessions (
  upload_id text PRIMARY KEY,
  user_id text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL DEFAULT 'application/octet-stream',
  total_chunks integer NOT NULL,
  received_chunks integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '1 hour'
);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_user ON public.upload_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_expires ON public.upload_sessions(expires_at);
ALTER TABLE public.upload_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "upload_sessions_admin_all" ON public.upload_sessions;
CREATE POLICY "upload_sessions_admin_all" ON public.upload_sessions FOR ALL USING (auth_role() IN ('super_admin', 'admin'));
