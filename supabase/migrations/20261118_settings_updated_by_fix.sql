-- VizTR — Fix settings table updated_by column type
-- Changed from uuid to text to accommodate text-based user IDs (e.g. "usr_admin_01")

alter table public.settings 
  drop constraint if exists settings_updated_by_fkey,
  alter column updated_by type text using updated_by::text;

-- Recreate index if needed (already exists from original migration)
create index if not exists settings_updated_by_idx on public.settings (updated_by);
