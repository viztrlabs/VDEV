/**
 * End-to-end validation of the NEW webhook endpoint (/api/telegram/webhook)
 * Sets env vars in-process and invokes the route handler directly.
 * Does NOT modify .env.local, does NOT restart dev server, does NOT touch production.
 */

// Set required env vars BEFORE importing route modules
process.env.TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'test_token';
process.env.TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || 'test_secret';
process.env.TELEGRAM_BOT_USERNAME = 'Viztr_bot';
process.env.NEXT_PUBLIC_SITE_URL = 'https://viztr.in';

async function main() {
  console.log('=== NEW ENDPOINT E2E VALIDATION ===\n');

  const { POST, GET } = await import('@/app/api/telegram/webhook/route');
  const { NextRequest } = await import('next/server');

  const BASE = 'https://viztr.in/api/telegram/webhook';
  const SECRET = 'test_secret';

  function makeReq(body: unknown, opts: { secret?: string; method?: string; rawBody?: string } = {}) {
    const url = new URL(BASE);
    // Secret is sent ONLY via header (query-param secrets get logged).
    const method = opts.method || 'POST';
    const init: RequestInit = {
      method,
      headers: {
        'content-type': 'application/json',
        ...(opts.secret ? { 'x-telegram-bot-api-secret-token': opts.secret } : {}),
      },
    };
    if (method !== 'GET' && method !== 'HEAD') {
      init.body = opts.rawBody !== undefined ? opts.rawBody : JSON.stringify(body);
    }
    return new NextRequest(url.toString(), init);
  }

  const results: Array<{ name: string; status: number; ok: boolean }> = [];

  // 1. GET should be 405
  {
    const res = await GET(makeReq({}, { method: 'GET' }) as any);
    const body = await res.json();
    console.log(`GET request: ${res.status} ${JSON.stringify(body)}`);
    results.push({ name: 'GET rejected (405)', status: res.status, ok: res.status === 405 });
  }

  // 2. POST without secret should be 401
  {
    const res = await POST(makeReq({ update_id: 1 }));
    const body = await res.json();
    console.log(`POST no secret: ${res.status} ${JSON.stringify(body)}`);
    results.push({ name: 'No secret rejected (401)', status: res.status, ok: res.status === 401 });
  }

  // 3. POST with wrong secret should be 401
  {
    const res = await POST(makeReq({ update_id: 2 }, { secret: 'wrong' }));
    const body = await res.json();
    console.log(`POST wrong secret: ${res.status} ${JSON.stringify(body)}`);
    results.push({ name: 'Wrong secret rejected (401)', status: res.status, ok: res.status === 401 });
  }

  // 4. POST with valid secret + /start command should be 200
  {
    const res = await POST(makeReq({
      update_id: 1001,
      message: {
        message_id: 1,
        date: Math.floor(Date.now() / 1000),
        chat: { id: 123456789, type: 'private' },
        from: { id: 123456789, is_bot: false, first_name: 'Test' },
        text: '/start',
      },
    }, { secret: SECRET }));
    const body = await res.json();
    console.log(`POST /start (valid secret): ${res.status} ${JSON.stringify(body)}`);
    results.push({ name: '/start accepted (200)', status: res.status, ok: res.status === 200 });
  }

  // 5. POST with valid secret + callback query should be 200
  {
    const res = await POST(makeReq({
      update_id: 1002,
      callback_query: {
        id: 'cb_1',
        from: { id: 123456789, is_bot: false, first_name: 'Test' },
        message: { message_id: 1, date: Math.floor(Date.now() / 1000), chat: { id: 123456789, type: 'private' }, text: 'Menu' },
        data: 'about',
        chat_instance: 'chat_123',
      },
    }, { secret: SECRET }));
    const body = await res.json();
    console.log(`POST callback (valid secret): ${res.status} ${JSON.stringify(body)}`);
    results.push({ name: 'callback accepted (200)', status: res.status, ok: res.status === 200 });
  }

  // 6. POST with malformed JSON should be 400
  {
    const res = await POST(makeReq({}, { secret: SECRET, rawBody: 'not json' }));
    const body = await res.json();
    console.log(`POST malformed JSON: ${res.status} ${JSON.stringify(body)}`);
    results.push({ name: 'Malformed JSON rejected (400)', status: res.status, ok: res.status === 400 });
  }

  // 7. POST with invalid update structure should be 400
  {
    const res = await POST(makeReq({ update_id: 1003 }, { secret: SECRET }));
    const body = await res.json();
    console.log(`POST invalid structure: ${res.status} ${JSON.stringify(body)}`);
    results.push({ name: 'Invalid structure rejected (400)', status: res.status, ok: res.status === 400 });
  }

  // 8. Duplicate update_id should be 200 (dedup)
  {
    const dupUpdate = {
      update_id: 1001, // same as /start test
      message: {
        message_id: 1,
        date: Math.floor(Date.now() / 1000),
        chat: { id: 123456789, type: 'private' },
        from: { id: 123456789, is_bot: false, first_name: 'Test' },
        text: '/start',
      },
    };
    const res = await POST(makeReq(dupUpdate, { secret: SECRET }));
    const body = await res.json();
    console.log(`POST duplicate update_id: ${res.status} ${JSON.stringify(body)}`);
    results.push({ name: 'Duplicate update_id deduped (200)', status: res.status, ok: res.status === 200 });
  }

  // 9. Unknown command should be 200 (handled gracefully)
  {
    const res = await POST(makeReq({
      update_id: 1004,
      message: {
        message_id: 1,
        date: Math.floor(Date.now() / 1000),
        chat: { id: 123456789, type: 'private' },
        from: { id: 123456789, is_bot: false, first_name: 'Test' },
        text: '/unknowncmd',
      },
    }, { secret: SECRET }));
    const body = await res.json();
    console.log(`POST unknown command: ${res.status} ${JSON.stringify(body)}`);
    results.push({ name: 'Unknown command handled (200)', status: res.status, ok: res.status === 200 });
  }

  console.log('\n--- SUMMARY ---');
  let pass = 0;
  for (const r of results) {
    console.log(`  ${r.ok ? '✅' : '❌'} ${r.name} (got ${r.status})`);
    if (r.ok) pass++;
  }
  console.log(`\n${pass}/${results.length} checks passed`);
  console.log('\n=== E2E VALIDATION COMPLETE ===');
}

main().catch(err => {
  console.error('Validation error:', err);
  process.exit(1);
});