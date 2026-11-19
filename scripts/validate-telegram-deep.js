/**
 * Deep Telegram Validation - tests both old and new endpoints
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`${name}="?([^"\\n]+)"?`));
  return match ? match[1] : null;
}

const BOT_TOKEN = getEnvVar('TELEGRAM_BOT_TOKEN');
const WEBHOOK_SECRET = getEnvVar('TELEGRAM_WEBHOOK_SECRET');

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function apiCall(method, body = {}) {
  const res = await fetch(`${API_BASE}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function testEndpoint(url, secret, label) {
  console.log(`\n--- Testing ${label} ---`);
  console.log(`URL: ${url}`);
  
  const update = {
    update_id: Math.floor(Math.random() * 10000000),
    message: {
      message_id: 1,
      date: Math.floor(Date.now() / 1000),
      chat: { id: 123456789, type: 'private' },
      from: { id: 123456789, is_bot: false, first_name: 'Test' },
      text: '/help',
    },
  };

  // Test 1: No secret
  try {
    const res1 = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(update),
    });
    const data1 = await res1.json();
    console.log(`  No secret: ${res1.status} ${JSON.stringify(data1)}`);
  } catch (e) {
    console.log(`  No secret: ERROR ${e.message}`);
  }

  // Test 2: With secret in header
  try {
    const res2 = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': secret },
      body: JSON.stringify({ ...update, update_id: update.update_id + 1 }),
    });
    const data2 = await res2.json();
    console.log(`  Secret in header: ${res2.status} ${JSON.stringify(data2)}`);
  } catch (e) {
    console.log(`  Secret in header: ERROR ${e.message}`);
  }

  // Test 3: With secret in query param
  try {
    const urlWithSecret = `${url}${url.includes('?') ? '&' : '?'}secret_token=${secret}`;
    const res3 = await fetch(urlWithSecret, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...update, update_id: update.update_id + 2 }),
    });
    const data3 = await res3.json();
    console.log(`  Secret in query: ${res3.status} ${JSON.stringify(data3)}`);
  } catch (e) {
    console.log(`  Secret in query: ERROR ${e.message}`);
  }

  // Test 4: GET request
  try {
    const res4 = await fetch(url, { method: 'GET' });
    const data4 = await res4.json();
    console.log(`  GET request: ${res4.status} ${JSON.stringify(data4)}`);
  } catch (e) {
    console.log(`  GET request: ERROR ${e.message}`);
  }
}

async function validate() {
  console.log('=== DEEP TELEGRAM VALIDATION ===\n');

  // Get webhook info
  const webhook = await apiCall('getWebhookInfo');
  const oldUrl = webhook.ok ? webhook.result.url : null;
  
  if (oldUrl) {
    console.log(`Registered webhook: ${oldUrl}`);
    const urlObj = new URL(oldUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    
    // Test old endpoint
    await testEndpoint(`${baseUrl}/api/messaging/telegram`, WEBHOOK_SECRET, 'OLD ENDPOINT (/api/messaging/telegram)');
    
    // Test new endpoint
    await testEndpoint(`${baseUrl}/api/telegram/webhook`, WEBHOOK_SECRET, 'NEW ENDPOINT (/api/telegram/webhook)');
  }

  // Check getMyCommands with scope
  console.log('\n--- COMMAND DETAILS ---');
  const commands = await apiCall('getMyCommands');
  if (commands.ok) {
    commands.result.forEach(cmd => {
      console.log(`  /${cmd.command} - ${cmd.description}`);
    });
  }

  // Check bot administrators / webhook allowed updates
  console.log('\n--- WEBHOOK CONFIG ---');
  if (webhook.ok) {
    console.log(`  URL: ${webhook.result.url}`);
    console.log(`  Pending: ${webhook.result.pending_update_count}`);
    console.log(`  Last error: ${webhook.result.last_error_message || 'none'}`);
    console.log(`  Last error date: ${webhook.result.last_error_date ? new Date(webhook.result.last_error_date * 1000).toISOString() : 'none'}`);
    console.log(`  Allowed updates: ${JSON.stringify(webhook.result.allowed_updates)}`);
    console.log(`  Max connections: ${webhook.result.max_connections}`);
    console.log(`  Custom cert: ${webhook.result.has_custom_certificate}`);
  }

  // DNS checks
  console.log('\n--- DNS / DOMAIN CHECKS ---');
  const domains = ['viztr.in', 'viztr.vercel.app'];
  for (const domain of domains) {
    try {
      const res = await fetch(`https://${domain}`, { method: 'HEAD', redirect: 'follow' });
      console.log(`  ${domain}: ${res.status} ${res.url}`);
    } catch (e) {
      console.log(`  ${domain}: FAILED - ${e.cause?.code || e.message}`);
    }
  }

  console.log('\n=== DEEP VALIDATION COMPLETE ===');
}

validate().catch(err => {
  console.error('Validation error:', err);
  process.exit(1);
});