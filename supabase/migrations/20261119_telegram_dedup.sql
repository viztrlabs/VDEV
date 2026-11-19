-- VizTR — Telegram webhook update deduplication
-- Prevents duplicate processing of webhook updates across serverless instances
-- update_id is Telegram's unique per-update identifier (idempotency key)

create table if not exists public.processed_updates (
  update_id bigint primary key,
  processed_at timestamptz not null default now()
);

-- Index for cleanup of old entries
create index if not exists processed_updates_processed_at_idx on public.processed_updates (processed_at asc);

-- RLS: service role bypasses RLS. Deny all access to non-service-role users.
alter table public.processed_updates enable row level security;

drop policy if exists "processed_updates deny all" on public.processed_updates;
create policy "processed_updates deny all"
  on public.processed_updates for all
  using (false)
  with check (false);
