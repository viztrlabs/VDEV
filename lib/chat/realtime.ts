/**
 * Server-side Realtime Broadcast publisher.
 *
 * Anonymous visitors' browser clients cannot receive `postgres_changes` on
 * `messages` because RLS denies them row reads. Realtime Broadcast channels
 * are not table-scoped, so they deliver instantly without exposing the table.
 * This complements (not replaces) the `useRealtime` postgres_changes
 * subscription and the API polling fallback in the widget.
 */

import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type ChatBroadcastMessage = {
  id: string;
  conversationId: string;
  sender: 'user' | 'agent' | 'bot';
  text: string;
  status?: string;
  createdAt?: string;
  metadata?: Record<string, unknown> | null;
};

export async function publishChatMessage(message: ChatBroadcastMessage): Promise<void> {
  const client = getSupabaseAdmin();
  if (!client) return;

  let channel: any = null;
  try {
    channel = client.channel(`chat:${message.conversationId}`);
    // Subscribe with a short ceiling — a broadcast must never hold up an API
    // response or a Telegram webhook acknowledgement.
    await Promise.race([
      new Promise<void>((resolve) => {
        channel.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') resolve();
        });
      }),
      new Promise<void>((resolve) => setTimeout(resolve, 800)),
    ]);
    await channel.send({ type: 'broadcast', event: 'message', payload: message });
  } catch {
    // Non-fatal: the widget's 4-second API polling fallback will deliver it.
  } finally {
    if (channel) {
      try { await client.removeChannel(channel); } catch { /* ignore */ }
    }
  }
}
