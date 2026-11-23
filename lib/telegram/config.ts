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

/**
 * Private forum supergroup used for website-visitor human handoff.
 * Optional so existing bot commands keep working without it; chat routes
 * treat a missing/invalid value as "handoff unavailable" and degrade safely.
 */
export function getSupportGroupId(): number | null {
  const raw = process.env.TELEGRAM_SUPPORT_GROUP_ID?.trim();
  if (!raw) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}

export function validateTelegramConfig(): TelegramConfig {
  return {
    token: getRequiredEnv('TELEGRAM_BOT_TOKEN'),
    secret: getRequiredEnv('TELEGRAM_WEBHOOK_SECRET'),
    username: getRequiredEnv('TELEGRAM_BOT_USERNAME'),
    siteUrl: getRequiredEnv('NEXT_PUBLIC_SITE_URL'),
  };
}