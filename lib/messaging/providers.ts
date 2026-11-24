export type MessagingProvider = 'telegram' | 'whatsapp';

export interface IncomingMessage {
  provider: MessagingProvider;
  conversationId: string;
  messageId: string;
  text: string;
  sender: { id: string; name?: string };
}

export interface MessagingAdapter {
  parseWebhook(payload: unknown): IncomingMessage | null;
  sendTextReply(conversationId: string, text: string): Promise<void>;
}

type TelegramUpdate = { message?: { message_id?: number; text?: string; chat?: { id?: number | string }; from?: { id?: number | string; first_name?: string; last_name?: string } } };

export function parseTelegramUpdate(payload: unknown): IncomingMessage | null {
  const message = (payload as TelegramUpdate)?.message;
  if (!message) return null;

  const text = message.text?.trim();
  const chatId = message.chat?.id;
  const from = message.from;
  const senderId = from?.id;
  if (!text || chatId === undefined || senderId === undefined || message.message_id === undefined || !from) return null;

  const name = [from.first_name, from.last_name].filter(Boolean).join(' ');
  return {
    provider: 'telegram',
    conversationId: String(chatId),
    messageId: String(message.message_id),
    text: text.slice(0, 4000),
    sender: { id: String(senderId), name: name || undefined },
  };
}

const telegramAdapter: MessagingAdapter = {
  parseWebhook: parseTelegramUpdate,
  async sendTextReply(conversationId, text) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is not configured');
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: conversationId, text: text.slice(0, 4096) }),
    });
    if (!response.ok) throw new Error(`Telegram sendMessage failed (${response.status})`);
  },
};

const providers: Partial<Record<MessagingProvider, MessagingAdapter>> = {
  telegram: telegramAdapter,
};

// 'whatsapp' remains in the type union only for legacy conversation rows;
// no live provider is registered for it.
export function getMessagingProvider(provider: string): MessagingAdapter | null {
  if (provider === 'whatsapp') return null;
  return (providers as Record<string, MessagingAdapter>)[provider] ?? null;
}

export function listMessagingProviders(): MessagingProvider[] {
  return Object.keys(providers) as MessagingProvider[];
}
