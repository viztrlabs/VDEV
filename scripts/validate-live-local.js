/**
 * Live local HTTP validation of /api/telegram/webhook (port 3000)
 * Reads the secret from .env.local. No production changes.
 */

const fs = require('fs');
const path = require('path');

const env = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const secret = (env.match(/TELEGRAM_WEBHOOK_SECRET="?([^"\n]+)"?/) || [])[1];

const BASE = 'http://localhost:3000/api/telegram/webhook';

async function post(body, headers = {}) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

async function main() {
  console.log('=== LIVE LOCAL WEBHOOK VALIDATION ===\n');

  // 1. GET
  {
    const res = await fetch(BASE, { method: 'GET' });
    console.log(`GET: ${res.status} ${JSON.stringify(await res.json().catch(() => null))}`);
  }

  // 2. POST no secret
  {
    const r = await post({ update_id: 1 });
    console.log(`POST no secret: ${r.status} ${JSON.stringify(r.json)}`);
  }

  // 3. POST wrong secret
  {
    const r = await post({ update_id: 2 }, { 'x-telegram-bot-api-secret-token': 'wrong' });
    console.log(`POST wrong secret: ${r.status} ${JSON.stringify(r.json)}`);
  }

  // 4. POST secret in query param (should now be rejected — header-only)
  {
    const res = await fetch(`${BASE}?secret_token=${secret}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ update_id: 3 }),
    });
    console.log(`POST secret in query only: ${res.status} ${JSON.stringify(await res.json().catch(() => null))}`);
  }

  // 5. POST valid secret, invalid structure
  {
    const r = await post({ update_id: 4 }, { 'x-telegram-bot-api-secret-token': secret });
    console.log(`POST valid secret + invalid structure: ${r.status} ${JSON.stringify(r.json)}`);
  }

  // 6. POST valid secret + malformed JSON
  {
    const r = await post('not json', { 'x-telegram-bot-api-secret-token': secret });
    console.log(`POST valid secret + malformed JSON: ${r.status} ${JSON.stringify(r.json)}`);
  }

  // 7. POST valid secret + unknown command (reaches Telegram, fake chat)
  {
    const r = await post({
      update_id: 5,
      message: {
        message_id: 1,
        date: Math.floor(Date.now() / 1000),
        chat: { id: 999999999, type: 'private' },
        from: { id: 999999999, is_bot: false, first_name: 'Test' },
        text: '/thiscommanddoesnotexist',
      },
    }, { 'x-telegram-bot-api-secret-token': secret });
    console.log(`POST valid secret + unknown command (fake chat): ${r.status} ${JSON.stringify(r.json)}`);
  }

  // 8. POST valid secret + /help (reaches Telegram, fake chat)
  {
    const r = await post({
      update_id: 6,
      message: {
        message_id: 1,
        date: Math.floor(Date.now() / 1000),
        chat: { id: 999999999, type: 'private' },
        from: { id: 999999999, is_bot: false, first_name: 'Test' },
        text: '/help',
      },
    }, { 'x-telegram-bot-api-secret-token': secret });
    console.log(`POST valid secret + /help (fake chat): ${r.status} ${JSON.stringify(r.json)}`);
  }

  console.log('\n=== LIVE LOCAL VALIDATION COMPLETE ===');
}

main().catch(e => { console.error(e); process.exit(1); });
