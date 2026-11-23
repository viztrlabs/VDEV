-- VizTR — Phase 02 Sprint 1: Telegram Identity Mapping
-- Adds telegram_chat_id to user_profiles for Telegram-first registration support

alter table public.user_profiles add column if not exists telegram_chat_id text;

comment on column public.user_profiles.telegram_chat_id is
  'Telegram chat ID for identity mapping. Links Telegram user to VizTR profile. NULL when unlinked.';