-- VizTR — Settings table for server-side API credentials
-- Stores sensitive configuration in Supabase instead of Vercel env vars

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null,
  is_encrypted boolean not null default false,
  description text,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists settings_key_idx on public.settings (key);
create index if not exists settings_updated_at_idx on public.settings (updated_at desc);

-- Row Level Security
alter table public.settings enable row level security;

-- Only admins can read settings
drop policy if exists "settings admin read" on public.settings;
create policy "settings admin read"
  on public.settings for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  );

-- Only admins can insert/update settings
drop policy if exists "settings admin write" on public.settings;
create policy "settings admin write"
  on public.settings for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  );

-- Initial seed: mark which keys should be stored here vs env vars
insert into public.settings (key, value, description, is_encrypted)
values
  ('RESEND_API_KEY', '', 'Email delivery provider API key (stored in Supabase to bypass Vercel env var limit)', true),
  ('WHATSAPP_ACCESS_TOKEN', '', 'WhatsApp Business Platform access token', true),
  ('WHATSAPP_PHONE_NUMBER_ID', '', 'WhatsApp Business phone number ID', true),
  ('TELEGRAM_BOT_TOKEN', '', 'Telegram bot token from @BotFather', true),
  ('TELEGRAM_WEBHOOK_SECRET', '', 'Telegram webhook verification secret', true),
  ('GEMINI_API_KEY', '', 'Google Gemini AI API key', true)
on conflict (key) do nothing;
