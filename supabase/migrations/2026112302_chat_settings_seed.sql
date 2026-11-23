-- VizTR — default rows for the Admin CMS "Live Chat & Telegram" panel.
-- Idempotent: existing values are never overwritten.
insert into public.settings (key, value, is_encrypted, description)
values
  ('chat_enabled', 'true', false, 'Enable the public live chat widget'),
  ('chat_ai_enabled', 'true', false, 'Enable AI auto-replies in live chat'),
  ('telegram_support_group_id', '-1004419719289', false, 'Telegram forum supergroup ID for human handoff'),
  ('telegram_bot_username', '@viztr_bot', false, 'Telegram bot username'),
  ('chat_auto_resume_hours', '4', false, 'Hours of inactivity before AI resumes'),
  ('chat_topic_prefix', 'Visitor #VTR-', false, 'Forum topic label prefix'),
  ('chat_handoff_keywords', 'human, agent, specialist, person, quote, pricing', false, 'Comma-separated human handoff keywords')
on conflict (key) do nothing;
