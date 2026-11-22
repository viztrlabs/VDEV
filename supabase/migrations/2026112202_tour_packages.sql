-- VizTR Phase 04 — Pano2VR tour packages
-- A Pano2VR Web Output is exported as a folder of HTML/JS/tiles. The artist
-- uploads the package (client-side unzip + direct-to-storage batch upload) and
-- VizTR registers the manifest here. Playback is a cross-origin sandboxed
-- iframe pointing at the storage-hosted entry file, so package scripts are
-- isolated from the app by construction.

CREATE TABLE IF NOT EXISTS public.tour_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  version int NOT NULL DEFAULT 1,
  storage_prefix text NOT NULL,
  entry_file text NOT NULL,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','ready','failed')),
  file_count int NOT NULL DEFAULT 0,
  total_bytes bigint NOT NULL DEFAULT 0,
  checksum_sha256 text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tour_packages_version_unique UNIQUE (experience_id, version)
);

CREATE INDEX IF NOT EXISTS tour_packages_experience_id_idx ON public.tour_packages(experience_id);

-- updated_at maintenance
CREATE OR REPLACE FUNCTION public.tour_packages_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tour_packages_updated_at ON public.tour_packages;
CREATE TRIGGER tour_packages_updated_at
  BEFORE UPDATE ON public.tour_packages
  FOR EACH ROW EXECUTE FUNCTION public.tour_packages_touch_updated_at();

-- =====================================================================
-- RLS — mirrors experiences (project-scoped)
-- =====================================================================

ALTER TABLE public.tour_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tour_packages_anon_read ON public.tour_packages;
DROP POLICY IF EXISTS tour_packages_auth_read ON public.tour_packages;
DROP POLICY IF EXISTS tour_packages_owner_write ON public.tour_packages;
DROP POLICY IF EXISTS tour_packages_admin_all ON public.tour_packages;

CREATE POLICY tour_packages_anon_read ON public.tour_packages
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM public.experiences e
      JOIN public."Project" p ON p.id = e.project_id
      WHERE e.id = experience_id
        AND e.status = 'published'
        AND p.visibility = 'PUBLIC'
    )
  );

CREATE POLICY tour_packages_auth_read ON public.tour_packages
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

CREATE POLICY tour_packages_owner_write ON public.tour_packages
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.experiences e
      JOIN public."Project" p ON p.id = e.project_id
      WHERE e.id = experience_id AND p.owner_id = auth_uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.experiences e
      JOIN public."Project" p ON p.id = e.project_id
      WHERE e.id = experience_id AND p.owner_id = auth_uid()
    )
  );

CREATE POLICY tour_packages_admin_all ON public.tour_packages
  FOR ALL TO authenticated USING (
    auth_role() IN ('SUPER_ADMIN','ADMIN')
  );
