-- VizTR Phase 1 — Service catalog seed data
-- Idempotent: uses ON CONFLICT (slug) DO NOTHING.
-- Matches existing `public."Service"` schema.

INSERT INTO public."Service" (slug, name, category, description, icon, image, visible, "order") VALUES
  -- Studio
  ('exterior', 'Exterior', 'studio', 'Exterior renders and imagery', 'fas fa-home', '', true, 1),
  ('interior', 'Interior', 'studio', 'Interior renders and walkthroughs', 'fas fa-couch', '', true, 2),
  ('animation-walkthrough', 'Animation / Walkthrough', 'studio', '3D animation and walkthrough videos', 'fas fa-film', '', true, 3),
  -- XR World
  ('virtual-tour', 'Virtual Tour', 'xr', '360° interactive panoramic tours', 'fas fa-globe', '', true, 10),
  ('webar', 'WebAR', 'xr', 'Browser-based augmented reality', 'fas fa-vr-cardboard', '', true, 11),
  ('webxr', 'WebXR', 'xr', 'Immersive WebXR experiences', 'fas fa-vr-cardboard', '', true, 12),
  ('virtual-reality', 'Virtual Reality', 'xr', 'Full VR experience', 'fas fa-headset', '', true, 13),
  ('gaussian-splat', 'Gaussian Splat', 'xr', '3D Gaussian Splatting viewer', 'fas fa-cube', '', true, 14),
  ('pixel-streaming', 'Pixel Streaming', 'xr', 'Unreal Engine pixel streaming', 'fas fa-tv', '', true, 15)
ON CONFLICT (slug) DO NOTHING;
