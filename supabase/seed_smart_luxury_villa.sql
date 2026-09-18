-- Task 4 seed: Smart Luxury Villa pilot experiences + configs + assets.
--
-- Every asset URL below is a Supabase Storage public URL built from a
-- VERIFIED storage.objects row in the public `viztr-assets` bucket
-- (base https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/
--  + the exact object key; bucket `public = true`). No invented URLs.
--
-- Verified objects (name = key inside bucket, from storage.objects):
--   viztr-assets/a0000000-0000-0000-0000-000000000002/00.jpg        image/jpeg            5701656 bytes
--   viztr-assets/a0000000-0000-0000-0000-000000000002/scene.glb     model/gltf-binary    13960096 bytes
--   viztr-assets/a0000000-0000-0000-0000-000000000002/new+kitchen.ply  application/octet-stream 12011208 bytes
--
-- Asset-key contract (app/experience/[projectId]/page.tsx):
-- the page binds viewers ONLY from experience_configs.assets[].url, falling
-- back to metadata/config keys
-- asset_url|model_url|panorama_url|tour_url|pano_url|splat_url|image_url|url.
-- Each experience below carries its URL in BOTH places.
--
-- Idempotency: fixed UUIDs + ON CONFLICT DO NOTHING, so re-runs insert nothing.
-- NOTE: experiences has no slug-only unique constraint; the real unique key is
-- (project_id, project_service_id, slug), so the conflict target uses that.

-- ---------------------------------------------------------------------------
-- Step 1: experiences (one per viewer-capable service, all published)
-- ---------------------------------------------------------------------------
INSERT INTO public.experiences
  (id, project_id, project_service_id, title, slug, description, status, version, published_at, metadata)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'proj_smart_luxury_villa',
   'a0000000-0000-0000-0000-000000000004',
   'Smart Luxury Villa — Virtual Tour', 'smart-luxury-villa-virtual-tour',
   '360° interactive panoramic tour of the Smart Luxury Villa pilot.',
   'published', 1, now(),
   '{"panorama_url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/00.jpg", "asset_url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/00.jpg"}'::jsonb),
  ('b0000000-0000-0000-0000-000000000002', 'proj_smart_luxury_villa',
   'a0000000-0000-0000-0000-000000000006',
   'Smart Luxury Villa — WebXR', 'smart-luxury-villa-webxr',
   'Immersive WebXR walkthrough of the Smart Luxury Villa pilot.',
   'published', 1, now(),
   '{"model_url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/scene.glb", "asset_url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/scene.glb"}'::jsonb),
  ('b0000000-0000-0000-0000-000000000003', 'proj_smart_luxury_villa',
   'a0000000-0000-0000-0000-000000000005',
   'Smart Luxury Villa — WebAR', 'smart-luxury-villa-webar',
   'Browser-based augmented reality preview of the Smart Luxury Villa pilot.',
   'published', 1, now(),
   '{"model_url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/scene.glb", "asset_url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/scene.glb"}'::jsonb),
  ('b0000000-0000-0000-0000-000000000004', 'proj_smart_luxury_villa',
   'a0000000-0000-0000-0000-000000000007',
   'Smart Luxury Villa — Virtual Reality', 'smart-luxury-villa-virtual-reality',
   'Full VR walkthrough of the Smart Luxury Villa pilot with headset support.',
   'published', 1, now(),
   '{"model_url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/scene.glb", "asset_url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/scene.glb"}'::jsonb),
  ('b0000000-0000-0000-0000-000000000005', 'proj_smart_luxury_villa',
   'a0000000-0000-0000-0000-000000000008',
   'Smart Luxury Villa — Gaussian Splat', 'smart-luxury-villa-gaussian-splat',
   '3D Gaussian Splatting viewer for the Smart Luxury Villa pilot kitchen.',
   'published', 1, now(),
   '{"splat_url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/new+kitchen.ply", "asset_url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/new+kitchen.ply"}'::jsonb),
  ('b0000000-0000-0000-0000-000000000006', 'proj_smart_luxury_villa',
   'a0000000-0000-0000-0000-000000000009',
   'Smart Luxury Villa — Pixel Streaming', 'smart-luxury-villa-pixel-streaming',
   'Unreal Engine pixel stream of the Smart Luxury Villa pilot (stream binds by slug).',
   'published', 1, now(),
   '{"image_url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/00.jpg", "asset_url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/00.jpg"}'::jsonb)
ON CONFLICT (project_id, project_service_id, slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Step 2: experience_configs (viewer defaults + assets[].url, the page's
-- preferred binding source)
-- ---------------------------------------------------------------------------
INSERT INTO public.experience_configs
  (id, experience_id, config, assets, settings)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
   '{"autoRotate": false, "transitionDuration": 2.5, "initialFov": 75}'::jsonb,
   '[{"url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/00.jpg", "kind": "panorama", "name": "00.jpg"}]'::jsonb,
   '{"quality": "high"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002',
   '{"ar": false, "vr": true, "placement": "floor", "environment": "interior"}'::jsonb,
   '[{"url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/scene.glb", "kind": "model", "name": "scene.glb"}]'::jsonb,
   '{"quality": "high"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003',
   '{"ar": true, "placement": "floor", "environment": "interior"}'::jsonb,
   '[{"url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/scene.glb", "kind": "model", "name": "scene.glb"}]'::jsonb,
   '{"quality": "high"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004',
   '{"vr": true, "placement": "floor", "environment": "interior"}'::jsonb,
   '[{"url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/scene.glb", "kind": "model", "name": "scene.glb"}]'::jsonb,
   '{"quality": "high"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005',
   '{"pointSize": 2, "splat_url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/new+kitchen.ply"}'::jsonb,
   '[{"url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/new+kitchen.ply", "kind": "splat", "name": "new+kitchen.ply"}]'::jsonb,
   '{"quality": "high"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006',
   '{"streamSlug": "smart-luxury-villa-pixel-streaming", "autoplay": true}'::jsonb,
   '[{"url": "https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/00.jpg", "kind": "poster", "name": "00.jpg"}]'::jsonb,
   '{"quality": "high"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Step 3: assets (one per experience; service_id must exist in "Service",
-- type must satisfy the assets_type_check constraint)
-- ---------------------------------------------------------------------------
INSERT INTO public.assets
  (id, project_id, service_id, experience_id, type, url, storage_path, mime_type, size, metadata)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'proj_smart_luxury_villa', 'svc_virtual_tour',
   'b0000000-0000-0000-0000-000000000001', 'image',
   'https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/00.jpg',
   'viztr-assets/a0000000-0000-0000-0000-000000000002/00.jpg',
   'image/jpeg', 5701656,
   '{"bucket": "viztr-assets", "seed": "task-4"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000002', 'proj_smart_luxury_villa', 'svc_webxr',
   'b0000000-0000-0000-0000-000000000002', 'model',
   'https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/scene.glb',
   'viztr-assets/a0000000-0000-0000-0000-000000000002/scene.glb',
   'model/gltf-binary', 13960096,
   '{"bucket": "viztr-assets", "seed": "task-4"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000003', 'proj_smart_luxury_villa', 'svc_webar',
   'b0000000-0000-0000-0000-000000000003', 'model',
   'https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/scene.glb',
   'viztr-assets/a0000000-0000-0000-0000-000000000002/scene.glb',
   'model/gltf-binary', 13960096,
   '{"bucket": "viztr-assets", "seed": "task-4"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000004', 'proj_smart_luxury_villa', 'svc_virtual_reality',
   'b0000000-0000-0000-0000-000000000004', 'model',
   'https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/scene.glb',
   'viztr-assets/a0000000-0000-0000-0000-000000000002/scene.glb',
   'model/gltf-binary', 13960096,
   '{"bucket": "viztr-assets", "seed": "task-4"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000005', 'proj_smart_luxury_villa', 'svc_gaussian_splat',
   'b0000000-0000-0000-0000-000000000005', 'model',
   'https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/new+kitchen.ply',
   'viztr-assets/a0000000-0000-0000-0000-000000000002/new+kitchen.ply',
   'application/octet-stream', 12011208,
   '{"bucket": "viztr-assets", "seed": "task-4"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000006', 'proj_smart_luxury_villa', 'svc_pixel_streaming',
   'b0000000-0000-0000-0000-000000000006', 'image',
   'https://naludjmicbqcagrlsrba.supabase.co/storage/v1/object/public/viztr-assets/viztr-assets/a0000000-0000-0000-0000-000000000002/00.jpg',
   'viztr-assets/a0000000-0000-0000-0000-000000000002/00.jpg',
   'image/jpeg', 5701656,
   '{"bucket": "viztr-assets", "seed": "task-4", "note": "poster; stream binds by experience slug"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
