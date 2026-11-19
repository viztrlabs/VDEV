#!/usr/bin/env node
/**
 * VizTR WhatsApp Bot Dev Server (FEI-XMD by Benfei Tech - Rebranded as VizTR)
 * Per YouTube: "How to Create Your Own WhatsApp Bot for Free (Full Tutorial)"
 * https://www.youtube.com/watch?v=mERGnWWIfB4
 *
 * ARCHITECTURAL NOTE (from video):
 * - WhatsApp bot uses @whiskeysockets/baileys requiring persistent WebSocket connection
 * - Next.js API routes are serverless - will timeout/disconnect after a few seconds
 * - Bot MUST run as separate Node.js service, NOT inside Next.js API routes
 * - Next.js communicates with bot via webhook/database
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();

// Bot directory - clone FEI-XMD here per video Step 1
const WHATSAPP_BOT_DIR = path.join(
  process.env.LOCALAPPDATA || process.env.HOME || '',
  'Temp',
  'kilo',
  'whatsapp_bot'
);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WHATSAPP_PHONE_NUMBER = process.env.WHATSAPP_PHONE_NUMBER || '919336561591'; // without +
const WHATSAPP_WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET || 'viztr_whatsapp_webhook_9336561591_secret';
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

async function getSupabaseSetting(key) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await supabase.from('settings').select('value').eq('key', key).single();
    return data?.value || null;
  } catch {
    return null;
  }
}

function printBanner() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║  📱  VizTR WhatsApp Bot (FEI-XMD by Benfei Tech)       ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('  Architecture: Separate Node.js service (NOT in Next.js API routes)');
  console.log(`  Webhook URL:  ${NEXTAUTH_URL}/api/messaging/whatsapp`);
  console.log(`  Send URL:     ${NEXTAUTH_URL}/api/messaging/whatsapp/send`);
  console.log(`  Phone:        ${WHATSAPP_PHONE_NUMBER}`);
  console.log(`  Secret:       ${WHATSAPP_WEBHOOK_SECRET}`);
  console.log('');
}

async function start() {
  printBanner();

  // Step 1: Check if bot directory exists (clone FEI-XMD here)
  if (!fs.existsSync(WHATSAPP_BOT_DIR)) {
    console.log('⚠️  WhatsApp bot directory not found at:', WHATSAPP_BOT_DIR);
    console.log('');
    console.log('  Step 1 - Clone FEI-XMD repository (per YouTube video):');
    console.log(`  git clone https://github.com/viztrlabs/whatsapp_bot ${WHATSAPP_BOT_DIR}`);
    console.log(`  cd ${WHATSAPP_BOT_DIR}`);
    console.log('');
    console.log('  Step 2 - Install dependencies:');
    console.log('  npm install');
    console.log('');
    console.log('  Step 3 - Create .env with VizTR configuration:');
    console.log('  (Template below - copy to bot/.env)');
    console.log('');
    console.log(getBotEnvTemplate());
    console.log('');
    console.log('  Bot will retry in 30 seconds...');
    setTimeout(start, 30000);
    return;
  }

  // Step 2: Check if node_modules exist
  if (!fs.existsSync(path.join(WHATSAPP_BOT_DIR, 'node_modules'))) {
    console.log('📦 Installing WhatsApp bot dependencies...');
    try {
      execSync('npm install', { cwd: WHATSAPP_BOT_DIR, stdio: 'inherit' });
    } catch (err) {
      console.error('❌ Failed to install bot dependencies:', err.message);
      setTimeout(start, 30000);
      return;
    }
  }

  // Step 3: Create .env if it doesn't exist (per video Step 2)
  const envPath = path.join(WHATSAPP_BOT_DIR, '.env');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, getBotEnvTemplate());
    console.log('📝 Created .env file for WhatsApp bot at:', envPath);
  }

  // Step 5/6: Start the bot (per video Step 5/6)
  console.log('🚀 Starting VizTR WhatsApp Bot (FEI-XMD)...');
  console.log('');
  try {
    execSync('npm start', { cwd: WHATSAPP_BOT_DIR, stdio: 'inherit' });
  } catch (err) {
    console.error('❌ WhatsApp bot exited:', err.message);
    console.log('  Restarting in 10 seconds...');
    setTimeout(start, 10000);
  }
}

function getBotEnvTemplate() {
  return `# VizTR WhatsApp Bot (.env)
# Rebranded FEI-XMD by Benfei Tech
# Per YouTube: "How to Create Your Own WhatsApp Bot for Free (Full Tutorial)"
# https://www.youtube.com/watch?v=mERGnWWIfB4

# =====================================================================
# BRANDING (Step 2 - Customize for VizTR)
# =====================================================================
BOT_NAME=VizTR Assistant
BOT_VERSION=1.0.0
OWNER_NAME=VizTR Admin
OWNER_NUMBER=${WHATSAPP_PHONE_NUMBER}
PREFIX=.

# URLs (Point to your Next.js VizTR website)
BOT_URL=${NEXTAUTH_URL}
BOT_IMAGE_URL=${NEXTAUTH_URL}/logo.png

# =====================================================================
# SESSION STORAGE (Keep local - per video Step 2)
# =====================================================================
FEI_SESSION_DIR=./auth_info_baileys
FEI_DATA_DIR=./data

# =====================================================================
# VIZTR INTEGRATION WEBHOOKS (Step 4)
# =====================================================================
# Bot posts incoming WhatsApp messages to this endpoint
VIZTR_WEBHOOK_URL=${NEXTAUTH_URL}/api/messaging/whatsapp
VIZTR_WEBHOOK_SECRET=${WHATSAPP_WEBHOOK_SECRET}

# VizTR sends outbound replies to this endpoint for bot delivery
VIZTR_SEND_URL=${NEXTAUTH_URL}/api/messaging/whatsapp/send
`;
}

start().catch(console.error);
