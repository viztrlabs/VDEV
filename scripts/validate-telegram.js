/**
 * Telegram Bot Validation Script
 * Checks webhook health, commands, and configuration
 */

const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`${name}="?([^"\\n]+)"?`));
  return match ? match[1] : null;
}

const BOT_TOKEN = getEnvVar('TELEGRAM_BOT_TOKEN');
const BOT_USERNAME = getEnvVar('TELEGRAM_BOT_USERNAME') || 'Viztr_bot';

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN not found in .env.local');
  process.exit(1);
}

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function apiCall(method, body = {}) {
  const res = await fetch(`${API_BASE}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function validate() {
  console.log('=== VIZTR TELEGRAM BOT VALIDATION ===\n');
  console.log(`Bot Username: @${BOT_USERNAME}\n`);

  // 1. getMe
  console.log('--- 1. BOT INFO (getMe) ---');
  const me = await apiCall('getMe');
  if (me.ok) {
    console.log(`✅ Bot ID: ${me.result.id}`);
    console.log(`✅ Username: @${me.result.username}`);
    console.log(`✅ First Name: ${me.result.first_name}`);
    console.log(`✅ Can Join Groups: ${me.result.can_join_groups}`);
    console.log(`✅ Can Read All Group Messages: ${me.result.can_read_all_group_messages}`);
    console.log(`✅ Supports Inline: ${me.result.supports_inline_queries}`);
  } else {
    console.log(`❌ getMe failed: ${me.description}`);
  }
  console.log('');

  // 2. getWebhookInfo
  console.log('--- 2. WEBHOOK HEALTH (getWebhookInfo) ---');
  const webhook = await apiCall('getWebhookInfo');
  if (webhook.ok) {
    const info = webhook.result;
    console.log(`✅ Webhook URL: ${info.url}`);
    console.log(`✅ Pending Updates: ${info.pending_update_count}`);
    console.log(`✅ Max Connections: ${info.max_connections || 40}`);
    console.log(`✅ Has Custom Certificate: ${info.has_custom_certificate}`);
    console.log(`✅ IP Address: ${info.ip_address || 'N/A'}`);
    if (info.last_error_date) {
      console.log(`⚠️  Last Error Date: ${new Date(info.last_error_date * 1000).toISOString()}`);
    }
    if (info.last_error_message) {
      console.log(`⚠️  Last Error Message: ${info.last_error_message}`);
    }
    if (!info.last_error_message) {
      console.log(`✅ No recent errors`);
    }
  } else {
    console.log(`❌ getWebhookInfo failed: ${webhook.description}`);
  }
  console.log('');

  // 3. getMyCommands
  console.log('--- 3. COMMAND REGISTRATION (getMyCommands) ---');
  const commands = await apiCall('getMyCommands');
  if (commands.ok) {
    console.log(`✅ ${commands.result.length} commands registered:`);
    commands.result.forEach(cmd => {
      console.log(`   /${cmd.command} - ${cmd.description}`);
    });
    // Check expected commands
    const expected = ['start','help','about','services','portfolio','website','channel','community','contact','support','privacy'];
    const registered = commands.result.map(c => c.command);
    const missing = expected.filter(c => !registered.includes(c));
    const extra = registered.filter(c => !expected.includes(c));
    if (missing.length) console.log(`❌ Missing commands: ${missing.join(', ')}`);
    if (extra.length) console.log(`⚠️  Extra commands: ${extra.join(', ')}`);
    if (!missing.length && !extra.length) console.log('✅ All 11 expected commands registered');
  } else {
    console.log(`❌ getMyCommands failed: ${commands.description}`);
  }
  console.log('');

  // 4. Webhook secret validation test
  console.log('--- 4. WEBHOOK SECURITY ---');
  const webhookUrl = webhook.ok ? webhook.result.url : null;
  if (webhookUrl) {
    const urlObj = new URL(webhookUrl);
    const hasSecretParam = urlObj.searchParams.has('secret_token');
    console.log(`✅ Webhook URL found: ${webhookUrl}`);
    if (hasSecretParam) {
      console.log(`⚠️  SECRET_TOKEN FOUND IN URL QUERY PARAM - should use header instead`);
    } else {
      console.log(`✅ No secret in URL query params (uses header)`);
    }
    // Test invalid secret
    const testRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': 'invalid_secret_test' },
      body: JSON.stringify({ update_id: 999999, message: { message_id: 1, date: Math.floor(Date.now()/1000), chat: { id: 1, type: 'private' }, from: { id: 1, is_bot: false, first_name: 'Test' }, text: '/start' } }),
    });
    const testData = await testRes.json();
    if (testRes.status === 401) {
      console.log(`✅ Invalid secret rejected with 401`);
    } else {
      console.log(`⚠️  Invalid secret returned status ${testRes.status}: ${JSON.stringify(testData)}`);
    }
  } else {
    console.log('❌ No webhook URL to test');
  }
  console.log('');

  // 5. Hosting verification
  console.log('--- 5. HOSTING & DEPLOYMENT ---');
  if (webhook.ok) {
    const url = webhook.result.url;
    if (url.includes('vercel.app')) {
      console.log('✅ Hosting: Vercel');
    } else if (url.includes('cloudflare') || url.includes('workers.dev') || url.includes('pages.dev')) {
      console.log('✅ Hosting: Cloudflare (testing)');
    } else if (url.includes('hostinger')) {
      console.log('✅ Hosting: Hostinger');
    } else if (url.includes('viztr.in')) {
      console.log('✅ Hosting: Custom domain viztr.in');
    } else {
      console.log(`✅ Hosting: ${url.split('/')[2]}`);
    }
    console.log(`✅ Deployment URL: ${url}`);
    console.log(`✅ Webhook endpoint: ${url}`);
  }
  console.log('');

  // 6. Privacy policy check
  console.log('--- 6. CONTENT VERIFICATION ---');
  const privacyRes = await fetch('https://viztr.in/privacy-policy', { method: 'HEAD', redirect: 'follow' });
  if (privacyRes.ok || privacyRes.status === 301 || privacyRes.status === 302) {
    console.log(`✅ Privacy policy accessible: ${privacyRes.status} ${privacyRes.url || ''}`);
  } else {
    console.log(`⚠️  Privacy policy status: ${privacyRes.status}`);
  }

  // Website check
  const siteRes = await fetch('https://viztr.in', { method: 'HEAD', redirect: 'follow' });
  if (siteRes.ok) {
    console.log(`✅ Website accessible: ${siteRes.status}`);
  } else {
    console.log(`⚠️  Website status: ${siteRes.status}`);
  }
  console.log('');

  console.log('=== VALIDATION COMPLETE ===');
}

validate().catch(err => {
  console.error('Validation error:', err);
  process.exit(1);
});