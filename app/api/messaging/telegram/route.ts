export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateTelegramConfig } from '@/lib/telegram/config';
import { createTelegramClient } from '@/lib/telegram/client';
import { UpdateSchema, extractCommand, isCommand, validateUpdate } from '@/lib/telegram/validation';
import { checkAndMarkProcessed } from '@/lib/telegram/deduplication';
import { COMMAND_HANDLERS, isKnownCommand, getCommandHandler } from '@/lib/telegram/commands/registry';
import { registerAllHandlers } from '@/lib/telegram/commands/handlers';
import { handleCallbackQuery } from '@/lib/telegram/callbacks';
import { getViztrAgentReply } from '@/lib/messaging/viztr-agent';

// Register all command handlers on module load
registerAllHandlers();

async function isDuplicateUpdate(supabaseAdmin: any, updateId: number): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('processed_updates')
    .select('update_id')
    .eq('update_id', updateId)
    .maybeSingle();
  return !!data;
}

async function markUpdateProcessed(supabaseAdmin: any, updateId: number): Promise<void> {
  await supabaseAdmin
    .from('processed_updates')
    .insert({ update_id: updateId, processed_at: new Date().toISOString() });
}

export async function POST(req: NextRequest) {
  let config;
  try {
    config = validateTelegramConfig();
  } catch {
    return NextResponse.json({ ok: false, error: 'Telegram bot not configured' }, { status: 503 });
  }

  // Validate secret token via header (never in query params per security requirements)
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const provided = req.headers.get('x-telegram-bot-api-secret-token');
    if (provided !== expectedSecret) {
      return NextResponse.json({ ok: false, error: 'Unauthorized webhook' }, { status: 401 });
    }
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate update structure
  const validation = validateUpdate(payload);
  if (!validation.success) {
    return NextResponse.json({ ok: true }); // Ack invalid updates to prevent Telegram retries
  }

  const update = validation.data;
  const { update_id, message, callback_query } = update;

  // Deduplication using Supabase (falls back to in-memory if unavailable)
  const supabaseAdmin = getSupabaseAdmin();
  let isDuplicate = false;
  if (supabaseAdmin) {
    isDuplicate = await isDuplicateUpdate(supabaseAdmin, update_id);
    if (!isDuplicate) {
      await markUpdateProcessed(supabaseAdmin, update_id);
    }
  } else {
    // Fallback to in-memory dedup (local dev only)
    isDuplicate = !checkAndMarkProcessed(update_id);
  }

  if (isDuplicate) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const client = createTelegramClient();

  // Handle callback queries (inline keyboard buttons)
  if (callback_query) {
    try {
      await handleCallbackQuery(client, callback_query);
      return NextResponse.json({ ok: true, type: 'callback_query' });
    } catch (error) {
      console.error('[telegram] callback query error:', (error as Error).message);
      return NextResponse.json({ ok: false, error: 'Callback processing failed' }, { status: 500 });
    }
  }

  // Handle messages
  if (message && message.text && message.from && message.chat) {
    const text = message.text.trim();

    if (isCommand(text)) {
      const parsed = extractCommand(text);
      if (!parsed) {
        return NextResponse.json({ ok: true });
      }

      // Strip leading / and @botname suffix, e.g. "/start@Viztr_bot" -> "start"
      const commandName = parsed.command.replace(/^\//, '').split('@')[0].toLowerCase();

      // Route to registered command handler
      if (isKnownCommand(commandName)) {
        const handler = getCommandHandler(commandName);
        if (handler) {
          try {
            await handler({
              client,
              chatId: message.chat.id,
              from: {
                id: message.from.id,
                first_name: message.from.first_name,
                username: message.from.username,
              },
              messageId: message.message_id,
            });
            return NextResponse.json({ ok: true, type: 'command', command: commandName });
          } catch (error) {
            console.error(`[telegram] command handler ${commandName} error:`, (error as Error).message);
            return NextResponse.json({ ok: false, error: 'Command handler failed' }, { status: 500 });
          }
        }
      }

      // Unknown command - helpful response, no escalation ticket
      try {
        await client.sendMessage(
          message.chat.id,
          `Unknown command: ${parsed.command}. Use /help to see available commands.`
        );
        return NextResponse.json({ ok: true, type: 'unknown_command' });
      } catch (error) {
        console.error('[telegram] unknown command reply error:', (error as Error).message);
        return NextResponse.json({ ok: false, error: 'Failed to send response' }, { status: 500 });
      }
    }

    // Regular message - route to AI agent (escalation only for genuine enquiries)
    try {
      const reply = await getViztrAgentReply(text, {
        userId: String(message.from.id),
        provider: 'telegram',
        conversationId: String(message.chat.id),
        escalateIfNoAnswer: true,
      });
      await client.sendMessage(message.chat.id, reply.text);
      return NextResponse.json({ ok: true, type: 'message', escalated: reply.escalated });
    } catch (error) {
      console.error('[telegram] agent reply error:', (error as Error).message);
      return NextResponse.json({ ok: false, error: 'Agent reply failed' }, { status: 500 });
    }
  }

  // Non-message, non-callback update - ack
  return NextResponse.json({ ok: true });
}
