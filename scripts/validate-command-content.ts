/**
 * Validates the exact message content each command handler produces.
 * Uses a capturing mock client — no Telegram API calls, no production changes.
 */

process.env.TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'test_token';
process.env.TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || 'test_secret';
process.env.TELEGRAM_BOT_USERNAME = 'Viztr_bot';
process.env.NEXT_PUBLIC_SITE_URL = 'https://viztr.in';

async function main() {
  const handlers = await import('@/lib/telegram/commands/handlers');
  const { handleCallbackQuery } = await import('@/lib/telegram/callbacks');

  const sent: Array<{ chatId: any; text: string; options: any }> = [];
  const edited: Array<{ chatId: any; messageId: any; text: string; options: any }> = [];
  const answered: Array<{ id: string; text?: string; opts?: any }> = [];

  const mockClient: any = {
    sendMessage: async (chatId: any, text: string, options: any) => {
      sent.push({ chatId, text, options });
      return { message_id: 1 };
    },
    editMessageText: async (chatId: any, messageId: any, text: string, options: any) => {
      edited.push({ chatId, messageId, text, options });
      return true;
    },
    answerCallbackQuery: async (id: string, text?: string, opts?: any) => {
      answered.push({ id, text, opts });
      return true;
    },
  };

  const ctx = {
    client: mockClient,
    chatId: 123456789,
    from: { id: 123456789, first_name: 'Test', username: 'testuser' },
    messageId: 1,
  };

  const commandList: Array<[string, (c: typeof ctx) => Promise<void>]> = [
    ['/start', handlers.handleStart],
    ['/help', handlers.handleHelp],
    ['/about', handlers.handleAbout],
    ['/services', handlers.handleServices],
    ['/portfolio', handlers.handlePortfolio],
    ['/website', handlers.handleWebsite],
    ['/channel', handlers.handleChannel],
    ['/community', handlers.handleCommunity],
    ['/contact', handlers.handleContact],
    ['/support', handlers.handleSupport],
    ['/privacy', handlers.handlePrivacy],
  ];

  console.log('=== COMMAND CONTENT VALIDATION ===\n');

  for (const [name, handler] of commandList) {
    sent.length = 0;
    await handler(ctx);
    const msg = sent[0];
    console.log(`\n### ${name}`);
    if (!msg) {
      console.log('  ❌ NO MESSAGE SENT');
      continue;
    }
    console.log(`  Text: ${msg.text.slice(0, 300).replace(/\n/g, ' | ')}${msg.text.length > 300 ? '...' : ''}`);
    const kb = msg.options?.reply_markup?.inline_keyboard;
    if (kb) {
      console.log(`  Keyboard rows: ${kb.length}`);
      kb.forEach((row: any[], i: number) => {
        const desc = row.map(b => b.callback_data ? `[${b.text}→${b.callback_data}]` : `[${b.text}→URL:${b.url?.slice(0, 40)}]`).join(' ');
        console.log(`    Row ${i + 1}: ${desc}`);
      });
    } else {
      console.log('  Keyboard: none');
    }
    console.log(`  parse_mode: ${msg.options?.parse_mode}`);
  }

  // Callback validation
  console.log('\n\n=== CALLBACK CONTENT VALIDATION ===\n');
  const callbacks = ['about', 'services', 'portfolio', 'contact', 'back:main', 'back:services', 'back:portfolio', 'service:webxr', 'portfolio:exterior', 'portfolio:web:exterior', 'unknown_action'];
  for (const data of callbacks) {
    edited.length = 0;
    answered.length = 0;
    await handleCallbackQuery(mockClient, {
      id: 'cb_test',
      from: { id: 123456789, is_bot: false, first_name: 'Test' },
      message: { message_id: 1, date: Math.floor(Date.now() / 1000), chat: { id: 123456789, type: 'private' }, text: 'Menu' },
      data,
      chat_instance: 'chat_123',
    } as any);
    const edit = edited[0];
    const ans = answered[0];
    console.log(`\n### callback: ${data}`);
    if (edit) {
      console.log(`  Edited text: ${edit.text.slice(0, 200).replace(/\n/g, ' | ')}${edit.text.length > 200 ? '...' : ''}`);
      const kb = edit.options?.reply_markup?.inline_keyboard;
      if (kb) {
        console.log(`  Keyboard rows: ${kb.length}`);
        kb.forEach((row: any[], i: number) => {
          const desc = row.map(b => b.callback_data ? `[${b.text}→${b.callback_data}]` : `[${b.text}→URL:${b.url?.slice(0, 40)}]`).join(' ');
          console.log(`    Row ${i + 1}: ${desc}`);
        });
      }
    } else {
      console.log('  No edit');
    }
    if (ans) {
      console.log(`  Answered: text="${ans.text}" show_alert=${ans.opts?.show_alert}`);
    }
  }

  console.log('\n\n=== CONTENT VALIDATION COMPLETE ===');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});