-- VizTR XR Links — spatial-link publish persistence
-- Safe to re-run (idempotent).

CREATE TABLE IF NOT EXISTS public.xr_links (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  project_id text,
  scene_id text,
  model_url text NOT NULL,
  thumbnail_url text,
  share_url text NOT NULL,
  qr_code_url text NOT NULL DEFAULT '',
  environment text NOT NULL DEFAULT 'studio'
    CHECK (environment IN ('studio','sunset','urban','interior')),
  ar_placement text NOT NULL DEFAULT 'floor'
    CHECK (ar_placement IN ('floor','tabletop','wall','image')),
  password_protected boolean NOT NULL DEFAULT false,
  access_password text,
  views_count integer NOT NULL DEFAULT 0,
  unique_visitors integer NOT NULL DEFAULT 0,
  avg_engagement_secs double precision NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','active','expired','revoked','processing')),
  expires_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS xr_links_slug_idx ON public.xr_links (slug);
CREATE INDEX IF NOT EXISTS xr_links_created_at_idx ON public.xr_links (created_at DESC);

ALTER TABLE public.xr_links ENABLE ROW LEVEL SECURITY;
-- Intentionally NO policies. Service role bypasses RLS; anon/authenticated are
-- granted nothing, so the table is NOT reachable through the Data API and
-- access_password stays private. Do not add anon_all policies like the editor tables.

-- =====================================================================
-- SEED — mirrors the in-memory XR_LINKS_DB records exactly.
-- Timestamps for the 4 generator rows (xr_link_gp/ts/bg/secure) are pinned
-- (in-memory computes now + 90 days at module load); the 2 legacy rows keep
-- their original fixed dates.
-- =====================================================================
INSERT INTO public.xr_links
  (id, name, slug, project_id, scene_id, model_url, thumbnail_url, share_url,
   qr_code_url, environment, ar_placement, password_protected, access_password,
   views_count, unique_visitors, avg_engagement_secs, status, expires_at, metadata,
   created_at, updated_at)
VALUES
  (
    'xr_link_01', 'Lumina Sky Atrium — WebXR Spatial Tour', 'lumina-sky-atrium',
    'PRJ-VTR-8821', 'scene_lumina_01',
    'https://cdn.viztr.studio/models/lumina-sky-atrium.glb',
    'https://cdn.viztr.studio/thumbs/lumina-sky-atrium.jpg',
    'https://viztr.studio/xr/lumina-sky-atrium',
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://viztr.studio/xr/lumina-sky-atrium',
    'interior', 'floor', true, 'LUMINA-2025-XR',
    428, 312, 184, 'active', '2025-12-31T23:59:59Z',
    '{"engineType":"three","entitiesCount":142,"fileSizeMB":24.5,"formats":["glb","usdz","gltf"],"arConfig":{"placement":"floor","environment":"interior","passwordProtected":true},"delivery":{"webAR":true,"webXR":true,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2025-06-10T11:00:00Z', '2025-06-10T11:00:00Z'
  ),
  (
    'xr_link_02', 'Aura Waterfront Organic Pavilion — AR QuickLook', 'aura-waterfront-pavilion',
    'PRJ-VTR-9042', 'scene_aura_01',
    'https://cdn.viztr.studio/models/aura-pavilion.glb',
    'https://cdn.viztr.studio/thumbs/aura-pavilion.jpg',
    'https://viztr.studio/xr/aura-pavilion',
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://viztr.studio/xr/aura-pavilion',
    'sunset', 'tabletop', false, NULL,
    684, 540, 215, 'active', '2025-11-30T23:59:59Z',
    '{"engineType":"playcanvas","entitiesCount":89,"fileSizeMB":18.2,"formats":["glb","usdz"],"arConfig":{"placement":"tabletop","environment":"sunset","passwordProtected":false},"delivery":{"webAR":true,"webXR":false,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2025-06-25T14:30:00Z', '2025-06-25T14:30:00Z'
  ),
  (
    'xr_link_gp', 'Glass Pavilion — Ultra-Res Interior', 'glass-pavilion-v1',
    'glass-pavilion', NULL,
    'https://cdn.viztr.studio/models/glass-pavilion.glb', NULL,
    '/xr-world/view/glass-pavilion-v1', '',
    'interior', 'tabletop', false, NULL,
    0, 0, 0, 'active', '2026-12-08T00:00:00Z',
    '{"engineType":"three","entitiesCount":142,"fileSizeMB":24.5,"formats":["glb","usdz"],"arConfig":{"placement":"tabletop","environment":"interior","passwordProtected":false},"delivery":{"webAR":true,"webXR":true,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2026-09-09T00:00:00Z', '2026-09-09T00:00:00Z'
  ),
  (
    'xr_link_ts', 'Tokyo Skyloft XR', 'tokyo-skyloft-xr',
    'tokyo-skyloft', NULL,
    'https://cdn.viztr.studio/models/tokyo-skyloft.glb', NULL,
    '/xr-world/view/tokyo-skyloft-xr', '',
    'urban', 'floor', false, NULL,
    0, 0, 0, 'active', '2026-12-08T00:00:00Z',
    '{"engineType":"playcanvas","entitiesCount":142,"fileSizeMB":24.5,"formats":["glb","usdz"],"arConfig":{"placement":"floor","environment":"urban","passwordProtected":false},"delivery":{"webAR":true,"webXR":true,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2026-09-09T00:00:00Z', '2026-09-09T00:00:00Z'
  ),
  (
    'xr_link_bg', 'Brutalist Garden AR', 'brutalist-garden-ar',
    'brutalist-garden', NULL,
    'https://cdn.viztr.studio/models/brutalist-garden.glb', NULL,
    '/xr-world/view/brutalist-garden-ar', '',
    'studio', 'image', false, NULL,
    0, 0, 0, 'active', '2026-12-08T00:00:00Z',
    '{"engineType":"three","entitiesCount":142,"fileSizeMB":24.5,"formats":["glb","usdz"],"arConfig":{"placement":"image","environment":"studio","passwordProtected":false},"delivery":{"webAR":true,"webXR":true,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2026-09-09T00:00:00Z', '2026-09-09T00:00:00Z'
  ),
  (
    'xr_link_secure', 'Client Secure Haven — Gated XR', 'client-secure-haven',
    'client-secure-haven', NULL,
    'https://cdn.viztr.studio/models/client-secure-haven.glb', NULL,
    '/xr-world/view/client-secure-haven', '',
    'interior', 'floor', true, 'VIZTR-2026',
    0, 0, 0, 'active', '2026-12-08T00:00:00Z',
    '{"engineType":"three","entitiesCount":142,"fileSizeMB":24.5,"formats":["glb","usdz"],"arConfig":{"placement":"floor","environment":"interior","passwordProtected":true},"delivery":{"webAR":true,"webXR":true,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2026-09-09T00:00:00Z', '2026-09-09T00:00:00Z'
  )
ON CONFLICT (id) DO NOTHING;