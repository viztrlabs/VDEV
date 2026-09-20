-- Storage RLS policies for viztr-assets bucket
-- These policies enforce project-scoped access control at the storage layer.
-- The bucket remains public for published assets, but working/private assets
-- are protected by these policies.

-- ============================================================
-- INSERT: Users can only upload to their own folder
-- ============================================================
CREATE POLICY "storage_insert_own_folder"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'viztr-assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================
-- SELECT: Users can read their own files + published/tour folders
-- Admins can read all files
-- ============================================================
CREATE POLICY "storage_select_own_and_public"
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'viztr-assets'
  AND (
    -- Own folder
    (storage.foldername(name))[1] = auth.uid()::text
    -- Tour panoramas (public by design)
    OR (storage.foldername(name))[1] = 'tour'
    -- Published assets (under any user's folder, but marked published)
    OR (storage.foldername(name))[2] = 'published'
    -- Admins can read everything
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()::text
      AND profiles.role IN ('super_admin', 'admin')
    )
  )
);

-- ============================================================
-- SELECT: Public read access for published/tour assets
-- (allows unauthenticated access to public URLs)
-- ============================================================
CREATE POLICY "storage_select_public"
ON storage.objects
FOR SELECT TO public
USING (
  bucket_id = 'viztr-assets'
  AND (
    -- Tour folder is public
    (storage.foldername(name))[1] = 'tour'
    -- Published assets
    OR (storage.foldername(name))[2] = 'published'
  )
);

-- ============================================================
-- DELETE: Users can only delete their own files
-- Admins can delete any file
-- ============================================================
CREATE POLICY "storage_delete_own"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'viztr-assets'
  AND (
    -- Own folder
    (storage.foldername(name))[1] = auth.uid()::text
    -- Admins can delete anything
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()::text
      AND profiles.role IN ('super_admin', 'admin')
    )
  )
);

-- ============================================================
-- UPDATE: Users can only update their own files
-- ============================================================
CREATE POLICY "storage_update_own"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'viztr-assets'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()::text
      AND profiles.role IN ('super_admin', 'admin')
    )
  )
);
