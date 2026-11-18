/**
 * Messaging layer tests — provider adapters, webhook parsing, and the shared
 * agent entry point. No network calls: Telegram replies are mocked via fetch.
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Set test env BEFORE importing modules that read process.env
process.env.TELEGRAM_BOT_TOKEN = 'test_token_123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';

// Mock the Telegram fetch so sendTextReply never hits the network.
const fetchMock = jest.fn();
global.fetch = fetchMock;

// ============================================================
// Provider registry
// ============================================================
describe('getMessagingProvider', () => {
  it('returns the Telegram adapter', async () => {
    const { getMessagingProvider } = await import('@/lib/messaging/providers');
    const adapter = getMessagingProvider('telegram');
    expect(adapter).not.toBeNull();
    expect(typeof adapter!.parseWebhook).toBe('function');
    expect(typeof adapter!.sendTextReply).toBe('function');
  });

  it('returns null for the not-yet-active WhatsApp provider', async () => {
    const { getMessagingProvider } = await import('@/lib/messaging/providers');
    expect(getMessagingProvider('whatsapp')).toBeNull();
  });

  it('returns null for unknown providers', async () => {
    const { getMessagingProvider } = await import('@/lib/messaging/providers');
    expect(getMessagingProvider('xmpp')).toBeNull();
  });
});

// ============================================================
// Telegram adapter parsing
// ============================================================
describe('parseTelegramUpdate', () => {
  const validUpdate = {
    message: {
      message_id: 42,
      text: 'Hello VizTR',
      chat: { id: 12345 },
      from: { id: 99, first_name: 'Jane', last_name: 'Doe' },
    },
  };

  it('parses a valid text message', async () => {
    const { parseTelegramUpdate } = await import('@/lib/messaging/providers');
    const msg = parseTelegramUpdate(validUpdate);
    expect(msg).not.toBeNull();
    expect(msg!.provider).toBe('telegram');
    expect(msg!.conversationId).toBe('12345');
    expect(msg!.messageId).toBe('42');
    expect(msg!.text).toBe('Hello VizTR');
    expect(msg!.sender.id).toBe('99');
    expect(msg!.sender.name).toBe('Jane Doe');
  });

  it('truncates oversized text to 4000 chars', async () => {
    const { parseTelegramUpdate } = await import('@/lib/messaging/providers');
    const update = {
      ...validUpdate,
      message: { ...validUpdate.message, text: 'x'.repeat(5000) },
    };
    const msg = parseTelegramUpdate(update);
    expect(msg!.text.length).toBe(4000);
  });

  it('returns null when there is no message', async () => {
    const { parseTelegramUpdate } = await import('@/lib/messaging/providers');
    expect(parseTelegramUpdate({})).toBeNull();
  });

  it('returns null when text is missing', async () => {
    const { parseTelegramUpdate } = await import('@/lib/messaging/providers');
    const update = { message: { message_id: 1, chat: { id: 1 }, from: { id: 1 } } };
    expect(parseTelegramUpdate(update)).toBeNull();
  });

  it('returns null when chat id is missing', async () => {
    const { parseTelegramUpdate } = await import('@/lib/messaging/providers');
    const update = { message: { message_id: 1, text: 'hi', from: { id: 1 } } };
    expect(parseTelegramUpdate(update)).toBeNull();
  });

  it('returns null when sender id is missing', async () => {
    const { parseTelegramUpdate } = await import('@/lib/messaging/providers');
    const update = { message: { message_id: 1, text: 'hi', chat: { id: 1 } } };
    expect(parseTelegramUpdate(update)).toBeNull();
  });

  it('returns null for malformed payloads', async () => {
    const { parseTelegramUpdate } = await import('@/lib/messaging/providers');
    expect(parseTelegramUpdate(null)).toBeNull();
    expect(parseTelegramUpdate(undefined)).toBeNull();
    expect(parseTelegramUpdate('not an object')).toBeNull();
  });
});

// ============================================================
// Telegram sendTextReply
// ============================================================
describe('Telegram sendTextReply', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('sends a reply to the conversation id', async () => {
    const { getMessagingProvider } = await import('@/lib/messaging/providers');
    const adapter = getMessagingProvider('telegram')!;
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200 } as Response);

    await adapter.sendTextReply('12345', 'Hi back');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('api.telegram.org/bot');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body);
    expect(body.chat_id).toBe('12345');
    expect(body.text).toBe('Hi back');
  });

  it('truncates replies to 4096 chars', async () => {
    const { getMessagingProvider } = await import('@/lib/messaging/providers');
    const adapter = getMessagingProvider('telegram')!;
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200 } as Response);

    await adapter.sendTextReply('1', 'x'.repeat(5000));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.text.length).toBe(4096);
  });

  it('throws when TELEGRAM_BOT_TOKEN is not configured', async () => {
    const { getMessagingProvider } = await import('@/lib/messaging/providers');
    const original = process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_BOT_TOKEN;
    try {
      const adapter = getMessagingProvider('telegram')!;
      await expect(adapter.sendTextReply('1', 'hi')).rejects.toThrow(/TELEGRAM_BOT_TOKEN/);
    } finally {
      if (original !== undefined) process.env.TELEGRAM_BOT_TOKEN = original;
    }
  });

  it('throws when Telegram rejects the reply', async () => {
    const { getMessagingProvider } = await import('@/lib/messaging/providers');
    const adapter = getMessagingProvider('telegram')!;
    fetchMock.mockResolvedValueOnce({ ok: false, status: 403 } as Response);

    await expect(adapter.sendTextReply('1', 'hi')).rejects.toThrow(/403/);
  });
});

// ============================================================
// Shared agent entry point
// ============================================================
describe('getViztrAgentReply', () => {
  it('returns a simulated reply when no API key is configured', async () => {
    const { getViztrAgentReply } = await import('@/lib/messaging/viztr-agent');
    const original = process.env.GEMINI_API_KEY;
    const originalGoogle = process.env.GOOGLE_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    try {
      const reply = await getViztrAgentReply('hello');
      expect(reply.simulated).toBe(true);
      expect(reply.text).toBeTruthy();
    } finally {
      if (original !== undefined) process.env.GEMINI_API_KEY = original;
      if (originalGoogle !== undefined) process.env.GOOGLE_API_KEY = originalGoogle;
    }
  });

  it('handles empty input without throwing', async () => {
    const { getViztrAgentReply } = await import('@/lib/messaging/viztr-agent');
    const reply = await getViztrAgentReply('');
    expect(reply.text).toBeTruthy();
  });
});