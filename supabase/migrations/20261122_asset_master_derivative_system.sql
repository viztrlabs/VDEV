-- VizTR Phase 02 — Asset master/derivative system
-- Additive migration: extends public.assets with master/derivative semantics,
-- content-hash dedup support, and adds the asset_references usage table
-- used for deletion protection.
-- Safe to re-run.

-- =====================================================================
-- EXTEND ASSETS TABLE
-- =====================================================================

ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS parent_asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS hash_sha256 text;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS asset_role text NOT NULL DEFAULT 'master' CHECK (asset_role IN ('master','derivative'));
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS service_slug text;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS version int NOT NULL DEFAULT 1;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS thumbnail_url text;

CREATE INDEX IF NOT EXISTS assets_hash_sha256_idx ON public.assets(hash_sha256);
CREATE INDEX IF NOT EXISTS assets_parent_asset_id_idx ON public.assets(parent_asset_id);
CREATE INDEX IF NOT EXISTS assets_project_role_idx ON public.assets(project_id, asset_role);
CREATE INDEX IF NOT EXISTS assets_service_slug_idx ON public.assets(service_slug);

-- =====================================================================
-- ASSET REFERENCES (usage tracking / deletion protection)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.asset_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  experience_id uuid REFERENCES public.experiences(id) ON DELETE CASCADE,
  project_service_id uuid REFERENCES public.project_services(id) ON DELETE CASCADE,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT asset_references_target_required CHECK (experience_id IS NOT NULL OR project_service_id IS NOT NULL)
);

-- One reference per (asset, experience, project_service) triple; COALESCE keeps
-- the constraint meaningful when one side is NULL.
CREATE UNIQUE INDEX IF NOT EXISTS asset_references_unique_target_idx
  ON public.asset_references (
    asset_id,
    COALESCE(experience_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(project_service_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

CREATE INDEX IF NOT EXISTS asset_references_asset_id_idx ON public.asset_references(asset_id);
CREATE INDEX IF NOT EXISTS asset_references_experience_id_idx ON public.asset_references(experience_id);

DROP TRIGGER IF EXISTS asset_references_set_updated_at ON public.asset_references;
-- assets-style updated_at trigger (table has created_at only, so none needed)

-- =====================================================================
-- RLS — mirrors the existing assets policies (project-scoped)
-- =====================================================================

ALTER TABLE public.asset_references ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS asset_references_anon_read ON public.asset_references;
DROP POLICY IF EXISTS asset_references_auth_read ON public.asset_references;
DROP POLICY IF EXISTS asset_references_owner_write ON public.asset_references;
DROP POLICY IF EXISTS asset_references_admin_all ON public.asset_references;

CREATE POLICY asset_references_anon_read ON public.asset_references
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM public.assets a
      JOIN public."Project" p ON p.id = a.project_id
      WHERE a.id = asset_id AND p.visibility IN ('PUBLIC','CLIENT_ONLY')
    )
  );

CREATE POLICY asset_references_auth_read ON public.asset_references
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.assets a
      JOIN public."Project" p ON p.id = a.project_id
      LEFT JOIN public.project_members pm ON pm.project_id = p.id AND pm.user_id = auth_uid() AND pm.status = 'active'
      WHERE a.id = asset_id
        AND (
          p.owner_id = auth_uid()
          OR pm.user_id IS NOT NULL
          OR auth_role() IN ('SUPER_ADMIN','ADMIN')
        )
    )
  );

CREATE POLICY asset_references_owner_write ON public.asset_references
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.assets a
      JOIN public."Project" p ON p.id = a.project_id
      WHERE a.id = asset_id AND p.owner_id = auth_uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assets a
      JOIN public."Project" p ON p.id = a.project_id
      WHERE a.id = asset_id AND p.owner_id = auth_uid()
    )
  );

CREATE POLICY asset_references_admin_all ON public.asset_references
  FOR ALL TO authenticated USING (
    auth_role() IN ('SUPER_ADMIN','ADMIN')
  );

-- =====================================================================
-- BACKFILL: mark all existing assets as masters (default already covers it)
-- =====================================================================

UPDATE public.assets SET asset_role = 'master' WHERE asset_role IS NULL;
