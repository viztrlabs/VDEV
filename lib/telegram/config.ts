/**
 * Telegram Bot Configuration Validation
 * Validates required environment variables at startup
 */

declare const process: {
  env: Record<string, string | undefined>;
};

export interface TelegramConfig {
  token: string;
  secret: string;
  username: string;
  siteUrl: string;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export function validateTelegramConfig(): TelegramConfig {
  return {
    token: getRequiredEnv('TELEGRAM_BOT_TOKEN'),
    secret: getRequiredEnv('TELEGRAM_WEBHOOK_SECRET'),
    username: getRequiredEnv('TELEGRAM_BOT_USERNAME'),
    siteUrl: getRequiredEnv('NEXT_PUBLIC_SITE_URL'),
  };
}