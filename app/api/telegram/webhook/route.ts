/**
 * Telegram Bot Webhook Endpoint (LEGACY — DEPRECATED).
 * Kept only for older validation scripts / command handling. The canonical
 * endpoint for all Telegram traffic — including website-visitor Forum Topic
 * handoff — is POST /api/messaging/telegram. Do NOT register this URL with
 * Telegram's setWebhook for the live-chat system.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramConfig } from '@/lib/telegram/config';
import { validateUpdate, extractCommand } from '@/lib/telegram/validation';
import { checkAndMarkProcessed } from '@/lib/telegram/deduplication';
import { createTelegramClient, TelegramApiError } from '@/lib/telegram/client';
import { handleCallbackQuery } from '@/lib/telegram/callbacks';
import { COMMAND_HANDLERS, isKnownCommand } from '@/lib/telegram/commands/registry';
import { applyRateLimit, type RateLimitConfig } from '@/lib/rate-limit';

// Import handlers to register them
import '@/lib/telegram/commands/handlers';

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  limit: 30,
  window: '60 s',
  prefix: 'telegram:webhook',
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Validate configuration at startup
    const config = validateTelegramConfig();

    // Verify secret token.
    // IMPORTANT: read the secret ONLY from the X-Telegram-Bot-Api-Secret-Token
    // header. Telegram sends it there when setWebhook is called with a
    // secret_token. Accepting it as a query parameter would place the secret in
    // request URLs, which are logged by Next.js, Vercel, and proxies.
    const providedSecret = req.headers.get('x-telegram-bot-api-secret-token');

    if (!providedSecret || providedSecret !== config.secret) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized webhook' },
        { status: 401 }
      );
    }

    // Parse JSON body
    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate update structure
    const validation = validateUpdate(payload);
    if (!validation.success) {
      console.warn('[telegram/webhook] Invalid update structure:', validation.error?.message);
      return NextResponse.json(
        { ok: false, error: 'Invalid update structure' },
        { status: 400 }
      );
    }

    const update = validation.data;

    // Deduplication check
    if (!checkAndMarkProcessed(update.update_id)) {
      // Duplicate update - acknowledge but don't process
      return NextResponse.json({ ok: true });
    }

    // Apply rate limiting (reuses the shared Upstash-backed limiter)
    const rateLimitResult = await applyRateLimit(req, RATE_LIMIT_CONFIG);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Route update to appropriate handler
    await processUpdate(update);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[telegram/webhook] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only allow POST method
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { ok: false, error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}

async function processUpdate(
  update: ReturnType<typeof validateUpdate> extends { success: true; data: infer T } ? T : never
): Promise<void> {
  const client = createTelegramClient();

  // Handle message (commands and text)
  if (update.message) {
    const message = update.message;
    const chatId = message.chat.id;
    const from = message.from;

    if (!from) return;

    const text = message.text?.trim();
    if (!text) return;

    // Check if it's a command
    const commandInfo = extractCommand(text);
    if (commandInfo) {
      const { command } = commandInfo;
      
      if (isKnownCommand(command)) {
        const handler = COMMAND_HANDLERS[command];
        if (handler) {
          try {
            await handler({
              client,
              chatId,
              from: {
                id: from.id,
                first_name: from.first_name,
                username: from.username,
              },
              messageId: message.message_id,
            });
          } catch (error) {
            if (error instanceof TelegramApiError && error.errorCode === 400 && error.description?.includes('chat not found')) {
              console.warn(`[telegram/webhook] Chat not found for command ${command}, chatId: ${chatId}`);
            } else {
              throw error;
            }
          }
        }
      } else {
        // Unknown command - send help
        try {
          await client.sendMessage(chatId, `Unknown command: ${command}. Use /help to see available commands.`, {
            parse_mode: 'HTML',
          });
        } catch (error) {
          if (error instanceof TelegramApiError && error.errorCode === 400 && error.description?.includes('chat not found')) {
            console.warn(`[telegram/webhook] Chat not found for unknown command response, chatId: ${chatId}`);
          } else {
            throw error;
          }
        }
      }
      return;
    }

    // Non-command text - could implement AI agent here if needed
    // For Phase 1, just acknowledge
    try {
      await client.sendMessage(chatId, 'I understand you\'re trying to tell me something. Use /help to see available commands.', {
        parse_mode: 'HTML',
      });
    } catch (error) {
      if (error instanceof TelegramApiError && error.errorCode === 400 && error.description?.includes('chat not found')) {
        console.warn(`[telegram/webhook] Chat not found for text response, chatId: ${chatId}`);
      } else {
        throw error;
      }
    }
  }

  // Handle callback query (inline keyboard buttons)
  if (update.callback_query) {
    try {
      await handleCallbackQuery(client, update.callback_query);
    } catch (error) {
      if (error instanceof TelegramApiError && error.errorCode === 400 && error.description?.includes('chat not found')) {
        console.warn(`[telegram/webhook] Chat not found for callback query, chatId: ${update.callback_query.message?.chat?.id}`);
      } else {
        throw error;
      }
    }
  }

  // Other update types (edited_message, channel_post, etc.) - acknowledge but don't process
  // This is intentional for Phase 1
}