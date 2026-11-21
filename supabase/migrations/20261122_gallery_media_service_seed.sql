-- VizTR Phase 02 — Gallery/Media as a shared project content service
-- Idempotent seed: adds the gallery-media service to the XR catalog so it can
-- be entitled per project (project_services) and rendered in the Experience
-- Dashboard with native media components (no 3D engine).

INSERT INTO public."Service" (slug, name, category, description, icon, image, visible, "order") VALUES
  ('gallery-media', 'Gallery / Media', 'xr', 'Project images, videos and documents as a shared content module', 'fas fa-images', '', true, 16)
ON CONFLICT (slug) DO NOTHING;
