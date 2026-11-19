import { validateTelegramConfig } from '@/lib/telegram/config';

describe('validateTelegramConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('throws when TELEGRAM_BOT_TOKEN missing', () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    process.env.TELEGRAM_WEBHOOK_SECRET = 'test_secret';
    process.env.TELEGRAM_BOT_USERNAME = 'Viztr_bot';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://viztr.in';
    expect(() => validateTelegramConfig()).toThrow('TELEGRAM_BOT_TOKEN');
  });

  test('throws when TELEGRAM_WEBHOOK_SECRET missing', () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test_token';
    delete process.env.TELEGRAM_WEBHOOK_SECRET;
    process.env.TELEGRAM_BOT_USERNAME = 'Viztr_bot';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://viztr.in';
    expect(() => validateTelegramConfig()).toThrow('TELEGRAM_WEBHOOK_SECRET');
  });

  test('throws when TELEGRAM_BOT_USERNAME missing', () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test_token';
    process.env.TELEGRAM_WEBHOOK_SECRET = 'test_secret';
    delete process.env.TELEGRAM_BOT_USERNAME;
    process.env.NEXT_PUBLIC_SITE_URL = 'https://viztr.in';
    expect(() => validateTelegramConfig()).toThrow('TELEGRAM_BOT_USERNAME');
  });

  test('throws when NEXT_PUBLIC_SITE_URL missing', () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test_token';
    process.env.TELEGRAM_WEBHOOK_SECRET = 'test_secret';
    process.env.TELEGRAM_BOT_USERNAME = 'Viztr_bot';
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(() => validateTelegramConfig()).toThrow('NEXT_PUBLIC_SITE_URL');
  });

  test('returns config when all vars present', () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test_token';
    process.env.TELEGRAM_WEBHOOK_SECRET = 'test_secret';
    process.env.TELEGRAM_BOT_USERNAME = 'Viztr_bot';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://viztr.in';
    const config = validateTelegramConfig();
    expect(config.token).toBe('test_token');
    expect(config.secret).toBe('test_secret');
    expect(config.username).toBe('Viztr_bot');
    expect(config.siteUrl).toBe('https://viztr.in');
  });

  test('trims whitespace from values', () => {
    process.env.TELEGRAM_BOT_TOKEN = '  test_token  ';
    process.env.TELEGRAM_WEBHOOK_SECRET = '  test_secret  ';
    process.env.TELEGRAM_BOT_USERNAME = '  Viztr_bot  ';
    process.env.NEXT_PUBLIC_SITE_URL = '  https://viztr.in  ';
    const config = validateTelegramConfig();
    expect(config.token).toBe('test_token');
    expect(config.secret).toBe('test_secret');
    expect(config.username).toBe('Viztr_bot');
    expect(config.siteUrl).toBe('https://viztr.in');
  });
});