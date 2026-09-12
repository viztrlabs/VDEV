-- Phase 2: RBAC Normalization & RLS Migration
-- Add 'admin' to profiles.role enum, ensure lowercase consistency
-- Fix DocStudio CRM RLS policies to use lowercase roles

-- =====================================================================
-- 1. EXTEND PROFILES ROLE ENUM
-- =====================================================================
-- Current enum: ('super_admin', 'owner', 'editor', 'viewer')
-- Need to add 'admin' for Studio Admin role

ALTER TYPE public.profile_role DROP VALUE IF EXISTS 'admin';

-- Recreate enum with all needed values (PostgreSQL doesn't support ADD VALUE before 12)
-- Workaround: create new enum, update column, drop old
CREATE TYPE public.profile_role_new AS ENUM ('super_admin', 'admin', 'owner', 'editor', 'viewer');

ALTER TABLE public.profiles 
  ALTER COLUMN role TYPE public.profile_role_new 
  USING role::text::public.profile_role_new;

DROP TYPE public.profile_role;
ALTER TYPE public.profile_role_new RENAME TO profile_role;

-- =====================================================================
-- 2. ADD ADMIN-SPECIFIC COLUMNS TO PROFILES
-- =====================================================================
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS two_factor_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS assigned_projects_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login timestamptz,
  ADD COLUMN IF NOT EXISTS permissions_override text[];

-- Index for admin queries
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);
CREATE INDEX IF NOT EXISTS profiles_company_idx ON public.profiles (company);

-- =====================================================================
-- 3. FIX DOCSTUDIO CRM RLS POLICIES (lowercase roles)
-- =====================================================================
-- Documents table
DROP POLICY IF EXISTS "Admins full access documents" ON public.documents;
CREATE POLICY "Admins full access documents"
  ON public.documents FOR ALL
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Clients read own documents" ON public.documents;
CREATE POLICY "Clients read own documents"
  ON public.documents FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'client' AND
    client_name = auth.jwt() ->> 'client_firm'
  );

-- Leads table
DROP POLICY IF EXISTS "Admins full access leads" ON public.leads;
CREATE POLICY "Admins full access leads"
  ON public.leads FOR ALL
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Clients read assigned leads" ON public.leads;
CREATE POLICY "Clients read assigned leads"
  ON public.leads FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'client' AND
    assigned_to = auth.uid()
  );

-- Studio Profile table
DROP POLICY IF EXISTS "Admins full access studio_profile" ON public.studio_profile;
CREATE POLICY "Admins full access studio_profile"
  ON public.studio_profile FOR ALL
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

-- =====================================================================
-- 4. CREATE NEW TABLES FOR SUPER ADMIN DATA
-- =====================================================================

-- GPU Nodes
CREATE TABLE IF NOT EXISTS public.gpu_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_code text NOT NULL,
  region_name text NOT NULL,
  flag_emoji text,
  gpu_model text NOT NULL,
  instance_type text NOT NULL,
  total_nodes int NOT NULL DEFAULT 0,
  active_nodes int NOT NULL DEFAULT 0,
  active_sessions int NOT NULL DEFAULT 0,
  max_sessions int NOT NULL DEFAULT 0,
  load_percentage int NOT NULL DEFAULT 0,
  vram_used_gb numeric(10,2) NOT NULL DEFAULT 0,
  vram_total_gb numeric(10,2) NOT NULL DEFAULT 0,
  avg_latency_ms numeric(10,2) NOT NULL DEFAULT 0,
  avg_fps numeric(5,2) NOT NULL DEFAULT 0,
  temperature_c int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'degraded', 'maintenance')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gpu_nodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access gpu_nodes" ON public.gpu_nodes;
CREATE POLICY "Admins full access gpu_nodes"
  ON public.gpu_nodes FOR ALL
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

-- Feature Toggles
CREATE TABLE IF NOT EXISTS public.feature_toggles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'core' CHECK (category IN ('core', 'rendering', 'xr', 'ai', 'security', 'storage')),
  enabled boolean NOT NULL DEFAULT false,
  requires_restart boolean NOT NULL DEFAULT false,
  environment text NOT NULL DEFAULT 'all' CHECK (environment IN ('all', 'production', 'staging')),
  last_modified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_modified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access feature_toggles" ON public.feature_toggles;
CREATE POLICY "Admins full access feature_toggles"
  ON public.feature_toggles FOR ALL
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Anon read feature_toggles" ON public.feature_toggles;
CREATE POLICY "Anon read feature_toggles"
  ON public.feature_toggles FOR SELECT TO anon
  USING (true);

-- System Logs
CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL CHECK (level IN ('info', 'warn', 'error', 'critical')),
  service text NOT NULL,
  message text NOT NULL,
  details text,
  region text,
  ip inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS system_logs_created_at_idx ON public.system_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS system_logs_level_idx ON public.system_logs (level);
CREATE INDEX IF NOT EXISTS system_logs_service_idx ON public.system_logs (service);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access system_logs" ON public.system_logs;
CREATE POLICY "Admins full access system_logs"
  ON public.system_logs FOR ALL
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

-- Revenue Metrics (Materialized View)
-- Based on projects, payments, commissions
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_revenue_monthly AS
SELECT 
  date_trunc('month', created_at)::date AS month,
  COALESCE(SUM(booking_amount) FILTER (WHERE payment_status = 'Paid'), 0) AS mrr,
  COALESCE(SUM(booking_amount) FILTER (WHERE payment_status = 'Partial 50%'), 0) AS one_off_commissions,
  COALESCE(SUM(booking_amount) FILTER (WHERE project_type = 'Pixel Streaming'), 0) AS gpu_streaming_revenue,
  COALESCE(SUM(booking_amount) FILTER (WHERE project_type = 'Virtual Reality'), 0) AS vr_licenses,
  COALESCE(SUM(booking_amount), 0) AS total,
  0 AS expenses, -- Placeholder, extend with actual expense tracking
  0 AS net_margin -- Placeholder
FROM public."Project"
GROUP BY date_trunc('month', created_at)
ORDER BY month DESC;

CREATE UNIQUE INDEX IF NOT EXISTS mv_revenue_monthly_month_idx ON public.mv_revenue_monthly (month);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION public.refresh_revenue_mv()
RETURNS void LANGUAGE sql AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_revenue_monthly;
$$;

-- =====================================================================
-- 5. UPDATE EXISTING RLS POLICIES FOR CONSISTENCY
-- =====================================================================
-- Ensure all admin policies use lowercase roles consistently
-- (Already done in Phase 1 migrations, but verify)

-- Project RLS already uses auth_role() helper which returns lowercase
-- Tour RLS already uses auth_role() helper which returns lowercase
-- XR Links has no policies (service-role only) - OK

-- =====================================================================
-- 6. SEED INITIAL DATA FOR NEW TABLES
-- =====================================================================

-- Initial GPU Nodes (matching super-admin-store.ts INITIAL_GPU_NODES)
INSERT INTO public.gpu_nodes (id, region_code, region_name, flag_emoji, gpu_model, instance_type, total_nodes, active_nodes, active_sessions, max_sessions, load_percentage, vram_used_gb, vram_total_gb, avg_latency_ms, avg_fps, temperature_c, status)
VALUES
  ('gpu-us-east', 'us-east-1', 'US East (N. Virginia)', '🇺🇸', 'NVIDIA A10G Tensor Core (24GB VRAM)', 'AWS g5.4xlarge Dedicated Fleet', 8, 7, 19, 28, 68, 114.2, 168.0, 18.4, 60.0, 62, 'healthy'),
  ('gpu-eu-west', 'eu-central-1', 'EU Central (Frankfurt)', '🇩🇪', 'NVIDIA RTX 6000 Ada (48GB VRAM)', 'Hetzner Dedicated RTX Bare-Metal', 6, 6, 22, 24, 89, 256.8, 288.0, 24.1, 59.8, 68, 'warning'),
  ('gpu-me-south', 'me-central-1', 'Middle East (Dubai Cluster)', '🇦🇪', 'NVIDIA L40S Ultra Cluster (48GB VRAM)', 'CoreWeave Spatial Cluster', 4, 4, 9, 16, 56, 107.5, 192.0, 21.6, 60.0, 59, 'healthy'),
  ('gpu-ap-east', 'ap-northeast-1', 'Asia Pacific (Tokyo)', '🇯🇵', 'NVIDIA RTX 4090 Enterprise (24GB VRAM)', 'Sakura Cloud GPU Farm', 4, 3, 6, 12, 42, 40.3, 96.0, 34.8, 59.5, 54, 'healthy'),
  ('gpu-us-west', 'us-west-2', 'US West (Oregon)', '🇺🇸', 'NVIDIA A100 SXM4 (80GB VRAM)', 'Lambda Labs Hyperplane', 3, 2, 5, 12, 35, 84.0, 240.0, 29.2, 60.0, 51, 'healthy')
ON CONFLICT (id) DO NOTHING;

-- Initial Feature Toggles (matching super-admin-store.ts INITIAL_FEATURE_TOGGLES)
INSERT INTO public.feature_toggles (id, key, name, description, category, enabled, requires_restart, environment, last_modified_by, last_modified_at)
VALUES
  ('ft-webxr', 'ENABLE_WEBXR_VIEWER', 'WebXR Spatial VR/AR Engine', 'Enables WebXR device API, Meta Quest 3 & Apple Vision Pro native immersive headset passthrough.', 'xr', true, false, 'all', NULL, now()),
  ('ft-pixel-streaming', 'ENABLE_PIXEL_STREAMING', 'Unreal Engine 5.4 Pixel Streaming', 'Routes WebRTC video/audio streams directly from global cloud GPU clusters to client web browsers.', 'rendering', true, false, 'all', NULL, now()),
  ('ft-gaussian-splat', 'ENABLE_GAUSSIAN_SPLAT', 'Gaussian Splatting Engine', 'Real-time 3D Gaussian splat rendering with progressive loading.', 'rendering', true, false, 'all', NULL, now()),
  ('ft-ai-suggestions', 'ENABLE_AI_SUGGESTIONS', 'AI-Powered Design Suggestions', 'Generative AI recommendations for materials, lighting, and composition.', 'ai', false, false, 'all', NULL, now()),
  ('ft-advanced-security', 'ENABLE_ADVANCED_SECURITY', 'Advanced Security Features', 'Enhanced audit logging, IP allowlisting, and session management.', 'security', true, true, 'production', NULL, now()),
  ('ft-multi-cloud-storage', 'ENABLE_MULTI_CLOUD_STORAGE', 'Multi-Cloud File Storage', 'Unified interface for AWS S3, Cloudflare R2, Google Drive, and local storage.', 'storage', true, false, 'all', NULL, now())
ON CONFLICT (key) DO NOTHING;

-- =====================================================================
-- 7. AUTO-UPDATE TRIGGERS FOR NEW TABLES
-- =====================================================================
DROP TRIGGER IF EXISTS gpu_nodes_set_updated_at ON public.gpu_nodes;
CREATE TRIGGER gpu_nodes_set_updated_at
  BEFORE UPDATE ON public.gpu_nodes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS feature_toggles_set_updated_at ON public.feature_toggles;
CREATE TRIGGER feature_toggles_set_updated_at
  BEFORE UPDATE ON public.feature_toggles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();