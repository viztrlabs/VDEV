CREATE TABLE IF NOT EXISTS public.revenue_metrics (
  month text PRIMARY KEY,
  mrr numeric NOT NULL DEFAULT 0,
  one_off_commissions numeric NOT NULL DEFAULT 0,
  gpu_streaming_revenue numeric NOT NULL DEFAULT 0,
  vr_licenses numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  expenses numeric NOT NULL DEFAULT 0,
  net_margin numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "revenue_metrics_admin_all" ON public.revenue_metrics;
CREATE POLICY "revenue_metrics_admin_all" ON public.revenue_metrics FOR ALL USING (auth_role() IN ('super_admin', 'admin'));
