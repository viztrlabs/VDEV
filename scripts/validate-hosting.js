/**
 * Hosting & Deployment Validation
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
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function checkUrl(url, label) {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'manual' });
    let body = '';
    try { body = await res.text(); } catch {}
    console.log(`  ${label}`);
    console.log(`    URL: ${url}`);
    console.log(`    Status: ${res.status}`);
    if (body) console.log(`    Body: ${body.slice(0, 200)}`);
    return res.status;
  } catch (e) {
    console.log(`  ${label}`);
    console.log(`    URL: ${url}`);
    console.log(`    ERROR: ${e.cause?.code || e.message}`);
    return null;
  }
}

async function validate() {
  console.log('=== HOSTING & DEPLOYMENT VALIDATION ===\n');

  console.log('--- PRODUCTION (viztr.vercel.app) ---');
  await checkUrl('https://viztr.vercel.app/api/telegram/webhook', 'New webhook endpoint');
  await checkUrl('https://viztr.vercel.app/api/messaging/telegram', 'Old messaging endpoint');
  await checkUrl('https://viztr.vercel.app/privacy-policy', 'Privacy policy');
  await checkUrl('https://viztr.vercel.app/portfolio', 'Portfolio page');
  console.log('');

  console.log('--- CUSTOM DOMAIN (viztr.in) ---');
  await checkUrl('https://viztr.in', 'Website');
  await checkUrl('https://viztr.in/privacy-policy', 'Privacy policy');
  console.log('');

  console.log('--- ENVIRONMENT VARIABLES (local .env.local) ---');
  const required = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_WEBHOOK_SECRET', 'TELEGRAM_BOT_USERNAME', 'NEXT_PUBLIC_SITE_URL'];
  for (const name of required) {
    const val = getEnvVar(name);
    if (val) {
      const display = name.includes('TOKEN') || name.includes('SECRET') ? `${val.slice(0,8)}...${val.slice(-4)}` : val;
      console.log(`  ✅ ${name} = ${display}`);
    } else {
      console.log(`  ❌ ${name} = MISSING`);
    }
  }
  console.log('');

  console.log('--- WEBHOOK REGISTRATION ---');
  const res = await fetch(`${API_BASE}/getWebhookInfo`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  const data = await res.json();
  if (data.ok) {
    console.log(`  URL: ${data.result.url}`);
    console.log(`  Pending: ${data.result.pending_update_count}`);
    console.log(`  Last error: ${data.result.last_error_message || 'none'}`);
  }
  console.log('');

  console.log('--- VERCEL PROJECT CONFIG ---');
  const vercelJson = path.join(process.cwd(), 'vercel.json');
  if (fs.existsSync(vercelJson)) {
    console.log(`  vercel.json: ${fs.readFileSync(vercelJson, 'utf8').replace(/\n/g, ' ')}`);
  }
  const nowJson = path.join(process.cwd(), 'now.json');
  if (fs.existsSync(nowJson)) {
    console.log(`  now.json exists`);
  }
  console.log('');

  console.log('=== HOSTING VALIDATION COMPLETE ===');
}

validate().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});