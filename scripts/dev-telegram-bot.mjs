#!/usr/bin/env node
/**
 * VizTR Telegram Bot Dev Server
 * Starts Telegram bot polling/webhook as a concurrent process alongside dev:all
 */

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: process.env.ENV_FILE || '.env.local' });

const PROJECT_ROOT = process.cwd();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

function printBanner() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║  🤖  VizTR Telegram Bot                                ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Webhook URL: ${NEXTAUTH_URL}/api/messaging/telegram`);
  console.log(`  Token:       ${TELEGRAM_BOT_TOKEN ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`  Secret:      ${TELEGRAM_WEBHOOK_SECRET ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log('');
}

async function start() {
  printBanner();

  if (!TELEGRAM_BOT_TOKEN) {
    console.log('⚠️  TELEGRAM_BOT_TOKEN not set in .env.local');
    console.log('  Add TELEGRAM_BOT_TOKEN to .env.local to enable Telegram bot');
    console.log('  Bot will retry in 30 seconds...');
    setTimeout(start, 30000);
    return;
  }

  // Register the webhook with Telegram
  const webhookUrl = `${NEXTAUTH_URL}/api/messaging/telegram?secret_token=${TELEGRAM_WEBHOOK_SECRET || ''}`;
  try {
    console.log('🔗 Registering Telegram webhook...');
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: TELEGRAM_WEBHOOK_SECRET || undefined,
          drop_pending_updates: true,
        }),
      }
    );
    const result = await response.json();
    if (result.ok) {
      console.log('✓ Telegram webhook registered successfully');
    } else {
      console.error('❌ Failed to register webhook:', result.description);
    }
  } catch (err) {
    console.error('❌ Error registering webhook:', err.message);
  }

  console.log('');
  console.log('🤖 Telegram bot is running via webhook at:', webhookUrl);
  console.log('  Send messages to your Telegram bot to test');
  console.log('  Webhook endpoint: POST /api/messaging/telegram');
  console.log('');

  // Keep process alive
  setInterval(() => {}, 60000);
}

start().catch(console.error);