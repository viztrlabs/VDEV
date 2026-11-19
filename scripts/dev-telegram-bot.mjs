#!/usr/bin/env node
/**
 * VizTR Telegram Bot Dev Server
 * Starts Telegram bot as a concurrent process alongside dev:all
 *
 * Supports two modes:
 * 1. Webhook mode (production): Receives updates via HTTPS webhook URL
 * 2. Polling mode (local dev): Polls Telegram API for updates every 2 seconds
 *
 * For local development, polling mode works without HTTPS tunnel.
 * For production (Vercel), webhook mode requires a public HTTPS URL.
 */

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: process.env.ENV_FILE || '.env.local' });

const PROJECT_ROOT = process.cwd();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'https://viztr.vercel.app';

// Determine mode: webhook requires public HTTPS URL, polling works locally
const IS_LOCALHOST = NEXTAUTH_URL?.includes('localhost') || NEXTAUTH_URL?.includes('127.0.0.1');
const IS_HTTPS = NEXTAUTH_URL?.startsWith('https://') && !IS_LOCALHOST;
const MODE = IS_HTTPS ? 'webhook' : 'polling';

function printBanner() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║  🤖  VizTR Telegram Bot                                ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Mode:         ${MODE === 'webhook' ? 'Webhook' : 'Polling (local dev)'}`);
  console.log(`  Webhook URL:  ${NEXTAUTH_URL}/api/messaging/telegram`);
  console.log(`  Token:        ${TELEGRAM_BOT_TOKEN ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`  Secret:       ${TELEGRAM_WEBHOOK_SECRET ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log('');
  if (MODE === 'polling') {
    console.log('  📡 Polling mode: Bot polls Telegram every 2 seconds.');
    console.log('     No HTTPS tunnel required for local development.');
    console.log('');
  }
}

async function registerWebhook() {
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
      console.log(`  URL: ${webhookUrl}`);
    } else {
      console.error('❌ Failed to register webhook:', result.description);
    }
  } catch (err) {
    console.error('❌ Error registering webhook:', err.message);
  }
}

async function startPolling() {
  let offset = 0;
  console.log('📡 Polling mode active - bot is listening for messages...');
  console.log('  Send /start to your Telegram bot to test');
  console.log('');

  while (true) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${offset}&limit=100&timeout=30`,
        { method: 'GET' }
      );
      const result = await response.json();

      if (!result.ok) {
        console.error('❌ Polling error:', result.description);
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }

      const updates = result.result || [];
      for (const update of updates) {
        offset = update.update_id + 1;

        // Forward the update to the local webhook endpoint
        try {
          await fetch(`${NEXTAUTH_URL}/api/messaging/telegram`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(TELEGRAM_WEBHOOK_SECRET ? { 'x-telegram-bot-api-secret-token': TELEGRAM_WEBHOOK_SECRET } : {}),
            },
            body: JSON.stringify(update),
          });
        } catch (err) {
          // Webhook endpoint might not be running yet - that's ok
          console.error('❌ Failed to forward update to webhook:', err.message);
        }
      }
    } catch (err) {
      console.error('❌ Polling error:', err.message);
    }

    // Poll every 2 seconds
    await new Promise((r) => setTimeout(r, 2000));
  }
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

  if (MODE === 'webhook') {
    try {
      await registerWebhook();
    } catch (err) {
      console.error('❌ Error registering webhook:', err.message);
    }
  } else {
    // Delete any existing webhook before starting polling mode
    console.log('🔗 Deleting existing webhook (if any) before starting polling mode...');
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
      );
      const result = await response.json();
      if (result.ok) {
        console.log('✓ Webhook deleted successfully');
      } else {
        console.error('⚠️  Could not delete webhook:', result.description);
      }
    } catch (err) {
      console.error('❌ Error deleting webhook:', err.message);
    }
    console.log('');

    console.log('🤖 Telegram bot is running via polling at:', NEXTAUTH_URL);
    console.log('  Send messages to your Telegram bot to test');
    console.log('  Webhook endpoint: POST /api/messaging/telegram');
    console.log('');
    await startPolling();
    return; // Polling mode runs forever
  }

  console.log('');
  console.log('🤖 Telegram bot is running via webhook at:', `${NEXTAUTH_URL}/api/messaging/telegram`);
  console.log('  Send messages to your Telegram bot to test');
  console.log('  Webhook endpoint: POST /api/messaging/telegram');
  console.log('');

  // Keep process alive
  setInterval(() => {}, 60000);
}

start().catch(console.error);
