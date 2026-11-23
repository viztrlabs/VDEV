-- VizTR — Live chat human handoff (additive only; no table rebuilds).
-- Adds session identity, AI/human mode, Telegram Forum Topic binding and
-- lifecycle timestamps to the existing unified-inbox `conversations` table.
-- Safe to re-run: every statement is idempotent.

-- =====================================================================
-- CONVERSATIONS — handoff columns
-- =====================================================================
alter table public.conversations
  add column if not exists session_id text,
  add column if not exists mode text not null default 'ai',
  add column if not exists telegram_thread_id bigint,
  add column if not exists handoff_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists handoff_error text;

-- Backfill legacy rows that predate session_id (keeps them addressable by
-- their existing public UUID rather than leaving a NULL key).
update public.conversations
  set session_id = id::text
  where session_id is null;

alter table public.conversations
  alter column session_id set not null;

-- mode check constraint (guarded so re-running the migration is safe)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'conversations_mode_check'
      and conrelid = 'public.conversations'::regclass
  ) then
    alter table public.conversations
      add constraint conversations_mode_check check (mode in ('ai', 'human'));
  end if;
end $$;

-- One visitor session maps to exactly one conversation.
create unique index if not exists conversations_session_id_key
  on public.conversations (session_id);

-- Telegram webhook resolves a topic reply back to a conversation by thread id.
create index if not exists conversations_telegram_thread_id_idx
  on public.conversations (telegram_thread_id)
  where telegram_thread_id is not null;

-- Stale-human auto-resume scans by last activity + mode.
create index if not exists conversations_mode_handoff_idx
  on public.conversations (mode, handoff_at)
  where mode = 'human';

-- =====================================================================
-- REALTIME — push persisted replies to the visitor's browser widget.
-- (messages was already added in 2026111805_realtime_publication.sql;
--  this guarded block makes the intent explicit and the file self-contained.)
-- =====================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
