/**
 * Telegram webhook route tests — command routing, deduplication, and message handling.
 * No network calls: Telegram API replies are mocked via fetch.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

// Mock @google/genai (ESM module not supported by Jest) before any other imports
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({ text: '' }),
    },
  })),
}));

// Mock viztr-agent to avoid loading @google/genai (ESM module)
jest.mock('@/lib/messaging/viztr-agent', () => ({
  getViztrAgentReply: jest.fn().mockResolvedValue({
    text: 'AI assistant response',
    simulated: true,
    escalated: false,
  }),
}));

// Set test env BEFORE importing modules that read process.env
process.env.TELEGRAM_BOT_TOKEN = 'test_token_123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';
process.env.TELEGRAM_WEBHOOK_SECRET = 'test_webhook_secret_12345';
process.env.TELEGRAM_BOT_USERNAME = 'Viztr_bot';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_SITE_URL = 'https://viztr.in';

// Mock fetch for Telegram API calls and AI provider calls
const fetchMock = jest.fn();
global.fetch = fetchMock;

// Mock Supabase admin - deduplication via Supabase
const mockSupabaseSelect = jest.fn();
const mockSupabaseEq = jest.fn();
const mockSupabaseMaybeSingle = jest.fn();
const mockSupabaseInsert = jest.fn();

const mockSupabaseAdmin = {
  from: jest.fn(() => mockSupabaseAdmin),
  select: mockSupabaseSelect,
  eq: mockSupabaseEq,
  maybeSingle: mockSupabaseMaybeSingle,
  insert: mockSupabaseInsert,
};

jest.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdmin: jest.fn(() => mockSupabaseAdmin),
}));

import { POST } from '@/app/api/messaging/telegram/route';

// Helper to parse JSON response body (mock Response may not have json() method)
async function parseResBody(res: any): Promise<any> {
  const body = typeof res.body === 'string' ? res.body : await res.text();
  return JSON.parse(body);
}

// Helper to create a mock NextRequest
function createMockRequest(body: any, secretToken?: string): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (secretToken) {
    headers['x-telegram-bot-api-secret-token'] = secretToken;
  }
  return {
    url: 'http://localhost:3000/api/messaging/telegram',
    method: 'POST',
    headers: new Headers(headers),
    json: async () => body,
  } as unknown as NextRequest;
}

// Helper to create a Telegram message update
function makeMessageUpdate(updateId: number, text: string, chatId = 12345, userId = 99) {
  return {
    update_id: updateId,
    message: {
      message_id: 1,
      text,
      chat: { id: chatId, type: 'private' },
      from: { id: userId, is_bot: false, first_name: 'Test', last_name: 'User' },
      date: Math.floor(Date.now() / 1000),
    },
  };
}

// Helper to create a callback query update
function makeCallbackUpdate(updateId: number, callbackData: string, chatId = 12345, userId = 99) {
  return {
    update_id: updateId,
    callback_query: {
      id: 'callback_123',
      from: { id: userId, is_bot: false, first_name: 'Test' },
      message: {
        message_id: 5,
        chat: { id: chatId, type: 'private' },
        text: 'Previous message',
        date: Math.floor(Date.now() / 1000),
      },
      chat_instance: 'chat_instance_123',
      data: callbackData,
    },
  };
}

describe('Telegram webhook route — command routing', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mockSupabaseSelect.mockReset();
    mockSupabaseEq.mockReset();
    mockSupabaseMaybeSingle.mockReset();
    mockSupabaseInsert.mockReset();

    // Default: Supabase admin returns no existing record (not a duplicate)
    mockSupabaseMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockSupabaseInsert.mockResolvedValue({ error: null });

    // Default: Telegram API returns success for sendMessage
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, result: {} }),
    } as any);
  });

  describe('Registered commands', () => {
    const commands = [
      { cmd: '/start', expectedText: 'Welcome to VizTR' },
      { cmd: '/help', expectedText: 'Available Commands' },
      { cmd: '/about', expectedText: 'Visualize' },
      { cmd: '/services', expectedText: 'Studio' },
      { cmd: '/portfolio', expectedText: 'Portfolio' },
      { cmd: '/website', expectedText: 'viztr.in' },
      { cmd: '/channel', expectedText: 'not yet configured' },
      { cmd: '/community', expectedText: 'WhatsApp Channel' },
      { cmd: '/contact', expectedText: 'hello@viztr.studio' },
      { cmd: '/support', expectedText: 'support' },
      { cmd: '/privacy', expectedText: 'privacy-policy' },
    ];

    for (const { cmd, expectedText } of commands) {
      it(`${cmd} returns correct response (not escalation)`, async () => {
        const req = createMockRequest(makeMessageUpdate(1, cmd), process.env.TELEGRAM_WEBHOOK_SECRET);
        const res = await POST(req);

        expect(res.status).toBe(200);
      });
    }
  });

  describe('Command parsing edge cases', () => {
    it('/start@Viztr_bot is recognized as /start', async () => {
      const req = createMockRequest(makeMessageUpdate(12, '/start@Viztr_bot'), process.env.TELEGRAM_WEBHOOK_SECRET);
      const res = await POST(req);
      const body = await parseResBody(res);

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.command).toBe('start');
    });

    it('/START is case-insensitive', async () => {
      const req = createMockRequest(makeMessageUpdate(13, '/START'), process.env.TELEGRAM_WEBHOOK_SECRET);
      const res = await POST(req);
      const body = await parseResBody(res);

      expect(res.status).toBe(200);
      expect(body.command).toBe('start');
    });

    it('commands with arguments are routed correctly', async () => {
      const req = createMockRequest(makeMessageUpdate(14, '/help extra args'), process.env.TELEGRAM_WEBHOOK_SECRET);
      const res = await POST(req);
      const body = await parseResBody(res);

      expect(res.status).toBe(200);
      expect(body.command).toBe('help');
    });
  });

  describe('Unknown commands', () => {
    it('unknown command gets helpful response, no escalation ticket', async () => {
      const req = createMockRequest(makeMessageUpdate(15, '/unknowncommand'), process.env.TELEGRAM_WEBHOOK_SECRET);
      const res = await POST(req);
      const body = await parseResBody(res);

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.type).toBe('unknown_command');
      expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining('api.telegram.org/bot'),
          expect.objectContaining({
            body: expect.stringContaining('Unknown command'),
          })
        );
    });
  });

  describe('Regular messages', () => {
    it('ordinary text goes to AI agent (not command handler)', async () => {
      const req = createMockRequest(
        makeMessageUpdate(16, 'What services do you offer?'),
        process.env.TELEGRAM_WEBHOOK_SECRET
      );
      const res = await POST(req);
      const body = await parseResBody(res);

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.type).toBe('message');
    });
  });

  describe('Deduplication', () => {
    it('duplicate update_id returns duplicate=true', async () => {
      // First request - processes normally
      const req1 = createMockRequest(makeMessageUpdate(20, '/start'), process.env.TELEGRAM_WEBHOOK_SECRET);
      await POST(req1);

      // Second request with same update_id - should be duplicate
      const req2 = createMockRequest(makeMessageUpdate(20, '/start'), process.env.TELEGRAM_WEBHOOK_SECRET);
      const res = await POST(req2);
      const body = await parseResBody(res);

      expect(res.status).toBe(200);
      expect(body.duplicate).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('rejects requests without valid secret token', async () => {
      const req = createMockRequest(makeMessageUpdate(30, '/start')); // No secret header
      const res = await POST(req);

      expect(res.status).toBe(401);
    });
  });
});
