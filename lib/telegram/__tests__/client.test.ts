import { TelegramClient, createTelegramClient } from '@/lib/telegram/client';
import { validateTelegramConfig } from '@/lib/telegram/config';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('TelegramClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.TELEGRAM_BOT_TOKEN = 'test_token';
    process.env.TELEGRAM_WEBHOOK_SECRET = 'test_secret';
    process.env.TELEGRAM_BOT_USERNAME = 'Viztr_bot';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://viztr.in';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const mockBotUser = {
    id: 123456789,
    is_bot: true,
    first_name: 'VizTR Bot',
    username: 'Viztr_bot',
  };

  const mockMessage = {
    message_id: 1,
    date: Math.floor(Date.now() / 1000),
    chat: { id: 123, type: 'private' },
    from: { id: 123, is_bot: false, first_name: 'Test' },
    text: 'Hello',
  };

  test('getMe returns bot info', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, result: mockBotUser }),
    });

    const client = new TelegramClient('test_token');
    const bot = await client.getMe();

    expect(bot.username).toBe('Viztr_bot');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottest_token/getMe',
      expect.objectContaining({ method: 'POST' })
    );
  });

  test('sendMessage posts to Telegram API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, result: { ...mockMessage, text: 'Hello' } }),
    });

    const client = new TelegramClient('test_token');
    const msg = await client.sendMessage(123, 'Hello');

    expect(msg.text).toBe('Hello');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottest_token/sendMessage',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"text":"Hello"'),
      })
    );
  });

  test('sendMessage truncates long messages', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, result: { ...mockMessage, text: 'a'.repeat(4093) + '...' } }),
    });

    const client = new TelegramClient('test_token');
    const longText = 'a'.repeat(5000);
    const msg = await client.sendMessage(123, longText);

    expect(msg.text.length).toBeLessThanOrEqual(4096);
  });

  test('setMyCommands registers commands', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, result: true }),
    });

    const client = new TelegramClient('test_token');
    const ok = await client.setMyCommands([
      { command: 'start', description: 'Start the bot' },
      { command: 'help', description: 'Show help' },
    ]);

    expect(ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottest_token/setMyCommands',
      expect.objectContaining({
        body: expect.stringContaining('"command":"start"'),
      })
    );
  });

  test('setMyCommands validates command length', async () => {
    const client = new TelegramClient('test_token');
    const longCommand = 'a'.repeat(33);

    await expect(
      client.setMyCommands([{ command: longCommand, description: 'Test' }])
    ).rejects.toThrow('exceeds 32 character limit');
  });

  test('setMyCommands validates description length', async () => {
    const client = new TelegramClient('test_token');
    const longDesc = 'a'.repeat(257);

    await expect(
      client.setMyCommands([{ command: 'test', description: longDesc }])
    ).rejects.toThrow('exceeds 256 character limit');
  });

  test('answerCallbackQuery calls API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, result: true }),
    });

    const client = new TelegramClient('test_token');
    const result = await client.answerCallbackQuery('callback_123', 'Done!');

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottest_token/answerCallbackQuery',
      expect.objectContaining({
        body: expect.stringContaining('"callback_query_id":"callback_123"'),
      })
    );
  });

  test('editMessageText calls API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, result: { ...mockMessage, text: 'Edited' } }),
    });

    const client = new TelegramClient('test_token');
    const result = await client.editMessageText(123, 1, 'Edited');

    expect(result).toBeDefined();
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottest_token/editMessageText',
      expect.objectContaining({
        body: expect.stringContaining('"message_id":1'),
      })
    );
  });

  test('createTelegramClient uses env config', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, result: mockBotUser }),
    });

    const client = createTelegramClient();
    const bot = await client.getMe();

    expect(bot.username).toBe('Viztr_bot');
  });

  test('handles Telegram API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        ok: false,
        error_code: 400,
        description: 'Bad Request: chat not found',
      }),
    });

    const client = new TelegramClient('test_token');
    await expect(client.sendMessage(999, 'Test')).rejects.toThrow('Bad Request');
  });

  test('retries on network error', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, result: mockBotUser }),
      });

    const client = new TelegramClient('test_token', { maxRetries: 1, baseDelay: 10 });
    const bot = await client.getMe();

    expect(bot.username).toBe('Viztr_bot');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  test('does not retry on 4xx client errors (except 429)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        ok: false,
        error_code: 403,
        description: 'Forbidden: bot was blocked by the user',
      }),
    });

    const client = new TelegramClient('test_token', { maxRetries: 2, baseDelay: 10 });
    await expect(client.sendMessage(123, 'Test')).rejects.toThrow('Forbidden');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('retries on 429 rate limit', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          ok: false,
          error_code: 429,
          description: 'Too Many Requests',
          parameters: { retry_after: 1 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, result: mockBotUser }),
      });

    const client = new TelegramClient('test_token', { maxRetries: 1, baseDelay: 10 });
    const bot = await client.getMe();

    expect(bot.username).toBe('Viztr_bot');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});