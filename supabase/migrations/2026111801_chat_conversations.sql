-- VizTR — Chat conversations and messages tables
-- Supports website live chat, WhatsApp, and Telegram unified inbox

-- =====================================================================
-- CONVERSATIONS
-- =====================================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'web' check (provider in ('web', 'telegram', 'whatsapp')),
  user_id uuid references public.profiles (id) on delete set null,
  client_name text,
  client_email text,
  client_phone text,
  external_id text, -- provider-specific conversation ID (e.g. Telegram chat_id, WhatsApp wa_id)
  status text not null default 'open' check (status in ('open', 'assigned', 'resolved', 'closed')),
  assigned_to uuid references public.profiles (id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_provider_idx on public.conversations (provider);
create index if not exists conversations_status_idx on public.conversations (status);
create index if not exists conversations_user_id_idx on public.conversations (user_id);
create index if not exists conversations_external_id_idx on public.conversations (external_id);
create index if not exists conversations_last_message_at_idx on public.conversations (last_message_at desc);

-- =====================================================================
-- MESSAGES
-- =====================================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender text not null check (sender in ('user', 'agent', 'bot')),
  text text not null,
  message_type text not null default 'text' check (message_type in ('text', 'image', 'file', 'system')),
  status text not null default 'sent' check (status in ('sent', 'delivered', 'read', 'failed')),
  external_id text, -- provider-specific message ID
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on public.messages (conversation_id);
create index if not exists messages_created_at_idx on public.messages (created_at desc);
create index if not exists messages_external_id_idx on public.messages (external_id);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Conversations: participants can read their own; admins can read all
drop policy if exists "conversations read participant" on public.conversations;
create policy "conversations read participant"
  on public.conversations for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  );

drop policy if exists "conversations insert" on public.conversations;
create policy "conversations insert"
  on public.conversations for insert
  with check (true); -- Visitors can start conversations

drop policy if exists "conversations update" on public.conversations;
create policy "conversations update"
  on public.conversations for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin')
    )
  );

-- Messages: participants can read their own conversation messages; admins can read all
drop policy if exists "messages read participant" on public.messages;
create policy "messages read participant"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
        and (
          conversations.user_id = auth.uid()
          or exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
              and profiles.role in ('super_admin', 'admin')
          )
        )
    )
  );

drop policy if exists "messages insert" on public.messages;
create policy "messages insert"
  on public.messages for insert
  with check (true); -- Visitors can send messages

drop policy if exists "messages update" on public.messages;
create policy "messages update"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
        and exists (
          select 1 from public.profiles
          where profiles.id = auth.uid()
            and profiles.role in ('super_admin', 'admin')
        )
    )
  );

-- =====================================================================
-- Trigger to update last_message_at on conversation when a new message is inserted
-- =====================================================================
create or replace function public.update_conversation_last_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
  set last_message_at = now(),
      updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  after insert on public.messages
  for each row execute function public.update_conversation_last_message();
