-- Enable RLS on Phase-1 tables
-- The policies already exist in 20260903_phase1_rls_policies.sql but were inert
-- because ENABLE ROW LEVEL SECURITY was never run on these tables.

ALTER TABLE public.project_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
