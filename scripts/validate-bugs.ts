/**
 * Focused validation of suspected navigation bugs
 */

process.env.TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'test_token';
process.env.TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || 'test_secret';
process.env.TELEGRAM_BOT_USERNAME = 'Viztr_bot';
process.env.NEXT_PUBLIC_SITE_URL = 'https://viztr.in';

async function main() {
  const { handleCallbackQuery } = await import('@/lib/telegram/callbacks');

  const edited: Array<{ text: string; options: any }> = [];
  const answered: Array<{ text?: string; opts?: any }> = [];

  const mockClient: any = {
    sendMessage: async () => ({ message_id: 1 }),
    editMessageText: async (_c: any, _m: any, text: string, options: any) => {
      edited.push({ text, options });
      return true;
    },
    answerCallbackQuery: async (_id: string, text?: string, opts?: any) => {
      answered.push({ text, opts });
      return true;
    },
  };

  const cb = (data: string) => ({
    id: 'cb_test',
    from: { id: 123456789, is_bot: false, first_name: 'Test' },
    message: { message_id: 1, date: Math.floor(Date.now() / 1000), chat: { id: 123456789, type: 'private' }, text: 'Menu' },
    data,
    chat_instance: 'chat_123',
  });

  const cases = [
    'services:studio',
    'services:xrworld',
    'portfolio:exterior',
    'quote',
    'channel',
    'website',
    'community',
    'support',
    'privacy',
    'help',
    'start',
  ];

  console.log('=== NAVIGATION BUG VALIDATION ===\n');

  for (const data of cases) {
    edited.length = 0;
    answered.length = 0;
    await handleCallbackQuery(mockClient, cb(data) as any);
    const edit = edited[0];
    const ans = answered[0];
    console.log(`callback "${data}":`);
    if (edit) {
      const kb = edit.options?.reply_markup?.inline_keyboard || [];
      const firstRow = kb[0]?.map((b: any) => b.callback_data || b.url || b.text).join(', ') || '';
      console.log(`  → edited: "${edit.text.slice(0, 80).replace(/\n/g, ' | ')}"`);
      console.log(`  → keyboard row1: ${firstRow}`);
      console.log(`  → rows: ${kb.length}`);
    } else {
      console.log(`  → NO EDIT`);
    }
    if (ans) {
      console.log(`  → answered: "${ans.text}" alert=${ans.opts?.show_alert}`);
    }
    console.log('');
  }

  console.log('=== BUG VALIDATION COMPLETE ===');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});