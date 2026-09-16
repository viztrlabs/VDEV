ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;
