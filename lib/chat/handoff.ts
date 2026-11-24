/**
 * Human handoff: creates one isolated Telegram Forum Topic per visitor
 * session, forwards the existing conversation into it, and flips the
 * conversation to `human` mode so the AI stops replying.
 *
 * Telegram is a server-side implementation detail only — never expose any of
 * this (group id, bot username, topic names) to the browser widget.
 */

import { visitorTopicLabel, insertMessage, type ChatConversation } from './session';
import { publishChatMessage } from './realtime';
import { getChatConfig, parseSupportGroupId, createConfiguredTelegramClient } from './config';

export type HandoffTrigger = 'ai_escalation' | 'human_request' | 'quote_request' | 'manual';

export interface HandoffResult {
  ok: boolean;
  threadId?: number;
  topicName?: string;
  error?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatHistoryForTelegram(
  messages: Array<{ sender: string; text: string; created_at?: string }>,
  lead: { name?: string | null; email?: string | null },
  trigger: HandoffTrigger,
): string {
  const lines: string[] = [];
  lines.push('<b>Human handoff requested</b>');
  lines.push(`Reason: ${escapeHtml(trigger)}`);
  if (lead.name || lead.email) {
    lines.push(`Visitor: ${escapeHtml(lead.name || 'Unknown')} ${lead.email ? `&lt;${escapeHtml(lead.email)}&gt;` : ''}`);
  }
  lines.push('');
  lines.push('<b>Conversation history</b>');
  for (const m of messages.slice(-30)) {
    const who = m.sender === 'user' ? 'Visitor' : m.sender === 'bot' ? 'AI' : 'Agent';
    lines.push(`<b>${escapeHtml(who)}:</b> ${escapeHtml(String(m.text || '').slice(0, 1500))}`);
  }
  lines.push('');
  lines.push('<i>Reply in this topic to reach the visitor. Use /done to return the conversation to the AI.</i>');
  return lines.join('\n');
}

export async function performHandoff(params: {
  supabase: any;
  conversation: ChatConversation;
  trigger: HandoffTrigger;
}): Promise<HandoffResult> {
  const { supabase, conversation, trigger } = params;
  const cfg = await getChatConfig();
  const groupId = parseSupportGroupId(cfg.supportGroupId);
  if (groupId === null) {
    return { ok: false, error: 'Telegram support group ID is not configured' };
  }

  // Already bound to a live human topic — verify the thread still exists on Telegram.
  if (conversation.mode === 'human' && conversation.telegram_thread_id) {
    try {
      const client = await createConfiguredTelegramClient();
      await client.getChat(conversation.telegram_thread_id);
      return { ok: true, threadId: conversation.telegram_thread_id };
    } catch {
      // Thread doesn't exist anymore — fall through to create a new one.
    }
  }

  const topicName = visitorTopicLabel(
    conversation.session_id || conversation.id,
    conversation.client_name,
    cfg.topicPrefix,
  );

  try {
    const client = await createConfiguredTelegramClient();
    const topic = await client.createForumTopic(groupId, topicName);

    const { data: history } = await supabase
      .from('messages')
      .select('sender,text,created_at')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(60);

    await client.sendMessage(
      groupId,
      formatHistoryForTelegram((history ?? []) as any[], {
        name: conversation.client_name,
        email: conversation.client_email,
      }, trigger),
      { message_thread_id: topic.message_thread_id, parse_mode: 'HTML', disable_web_page_preview: true },
    );

    const { data, error } = await supabase
      .from('conversations')
      .update({
        mode: 'human',
        telegram_thread_id: topic.message_thread_id,
        handoff_at: new Date().toISOString(),
        closed_at: null,
        handoff_error: null,
        status: 'assigned',
      })
      .eq('id', conversation.id)
      .select('*')
      .single();

    if (error || !data) throw new Error(error?.message || 'Failed to persist handoff state');

    const notice = await insertMessage(supabase, conversation.id, {
      sender: 'system',
      text: 'You are now connected with a VizTR specialist. They will reply here shortly.',
      metadata: { handoff: true, threadId: topic.message_thread_id },
    });
    if (notice) {
      await publishChatMessage({
        id: notice.id,
        conversationId: conversation.id,
        sender: notice.sender,
        text: notice.text,
        status: notice.status,
        createdAt: notice.created_at,
        metadata: notice.metadata,
      });
    }

    return { ok: true, threadId: topic.message_thread_id, topicName };
  } catch (err: any) {
    const message = err?.message || 'Handoff failed';
    // Fail open: AI keeps answering if the human channel is unavailable.
    await supabase
      .from('conversations')
      .update({ handoff_error: String(message).slice(0, 500) })
      .eq('id', conversation.id);
    return { ok: false, error: message };
  }
}
