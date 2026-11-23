/**
 * Shared session helpers for the public AI-first live chat.
 *
 * A visitor is identified by a random `sessionId` token generated in the
 * browser and kept in localStorage. Possession of the token is the credential
 * (same trust model as the previous localStorage conversation id), so all
 * lookups are scoped by it and never by a trusted client-supplied user id.
 */

export const HUMAN_INACTIVITY_TIMEOUT_MS = 4 * 60 * 60 * 1000;

const HUMAN_KEYWORDS = [
  'human',
  'agent',
  'specialist',
  'person',
  'talk to someone',
  'real person',
  'speak to someone',
];

const QUOTE_PATTERNS = [
  /\b(quote|quotation|estimate|proposal)\b/i,
  /\bhow much (does|will|would|is|are|for)\b/i,
  /\b(pricing|price|cost|budget)\b.{0,40}\b(project|tour|render|visualization|service|work)\b/i,
  /\b(project|commission)\b.{0,40}\b(discuss|quote|estimate|budget|start|kick.?off)\b/i,
];

/** Session tokens are URL-safe and short enough to log without noise. */
export function isValidSessionId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{8,128}$/.test(value);
}

/** `Visitor #VTR-4821` — short, stable forum-topic label. */
export function visitorTopicLabel(sessionId: string, clientName?: string | null): string {
  const prefix = sessionId.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || 'ANON';
  const name = clientName?.trim().slice(0, 40);
  return name ? `Visitor #VTR-${prefix} — ${name}` : `Visitor #VTR-${prefix}`;
}

/**
 * Whether a message (or the AI's escalation flag) should open a human session.
 * Pure function — the webhook and the chat route share the same rule.
 */
export function shouldHandoff(text: string, aiEscalated = false): boolean {
  if (aiEscalated) return true;
  const lower = text.toLowerCase();
  if (HUMAN_KEYWORDS.some((k) => lower.includes(k))) return true;
  return QUOTE_PATTERNS.some((p) => p.test(text));
}

export type ChatConversation = {
  id: string;
  session_id: string | null;
  mode: 'ai' | 'human';
  telegram_thread_id: number | null;
  client_name: string | null;
  client_email: string | null;
  handoff_at: string | null;
  closed_at: string | null;
  last_message_at: string | null;
  [key: string]: unknown;
};

export async function getConversationBySessionId(
  supabase: any,
  sessionId: string,
): Promise<ChatConversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();
  if (error || !data) return null;
  return data as ChatConversation;
}

export async function getConversationByThreadId(
  supabase: any,
  threadId: number,
): Promise<ChatConversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('telegram_thread_id', threadId)
    .eq('mode', 'human')
    .maybeSingle();
  if (error || !data) return null;
  return data as ChatConversation;
}

export async function ensureConversation(
  supabase: any,
  input: { sessionId: string; clientName?: string | null; clientEmail?: string | null },
): Promise<ChatConversation | null> {
  const existing = await getConversationBySessionId(supabase, input.sessionId);
  const patch: Record<string, unknown> = {};
  if (input.clientName?.trim()) patch.client_name = input.clientName.trim().slice(0, 255);
  if (input.clientEmail?.trim()) patch.client_email = input.clientEmail.trim().slice(0, 255);

  if (existing) {
    if (Object.keys(patch).length > 0) {
      const { data, error } = await supabase
        .from('conversations')
        .update(patch)
        .eq('id', existing.id)
        .select('*')
        .single();
      if (!error && data) return data as ChatConversation;
    }
    return existing;
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      session_id: input.sessionId,
      provider: 'web',
      status: 'open',
      mode: 'ai',
      ...patch,
    })
    .select('*')
    .single();
  if (error || !data) return null;
  return data as ChatConversation;
}

export async function insertMessage(
  supabase: any,
  conversationId: string,
  input: { sender: 'user' | 'agent' | 'bot' | 'system'; text: string; metadata?: Record<string, unknown> },
): Promise<any | null> {
  // The legacy DB constraint allows only user|agent|bot. System notices are
  // stored as agent messages with a marker in metadata.
  const sender = input.sender === 'system' ? 'agent' : input.sender;
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender,
      text: input.text.slice(0, 4000),
      message_type: 'text',
      status: 'sent',
      metadata: { ...(input.metadata ?? {}), ...(input.sender === 'system' ? { system: true } : {}) },
    })
    .select('*')
    .single();
  if (error || !data) return null;
  return data;
}

/**
 * After 4 hours with no new message, an abandoned human session returns to
 * the AI automatically so visitors are never left with a dead chat forever.
 */
export async function resumeStaleHumanSession(
  supabase: any,
  conversation: ChatConversation,
  now = Date.now(),
): Promise<ChatConversation> {
  if (conversation.mode !== 'human' || !conversation.handoff_at) return conversation;
  const lastActivity = Date.parse(conversation.last_message_at || conversation.handoff_at);
  if (!Number.isFinite(lastActivity) || now - lastActivity < HUMAN_INACTIVITY_TIMEOUT_MS) {
    return conversation;
  }

  const { data, error } = await supabase
    .from('conversations')
    .update({ mode: 'ai', closed_at: new Date(now).toISOString() })
    .eq('id', conversation.id)
    .eq('mode', 'human')
    .select('*')
    .single();
  if (error || !data) return conversation;

  const notice = await insertMessage(supabase, conversation.id, {
    sender: 'system',
    text: 'The live session ended after a period of inactivity. Our AI assistant is helping you again.',
  });
  if (notice) {
    // Avoid a static import cycle (realtime.ts is server-only and light).
    const { publishChatMessage } = await import('./realtime');
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
  return data as ChatConversation;
}
