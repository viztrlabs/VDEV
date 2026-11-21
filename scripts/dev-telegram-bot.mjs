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
 *
 * Health check server runs on port 4567 (TELEGRAM_BOT_PORT)
 */

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';

import { supabase } from '../lib/supabase.ts';
import { SOCIAL_LINKS, labels } from './social-links.mjs';

dotenv.config({ path: process.env.ENV_FILE || '.env.local' });

const PROJECT_ROOT = process.cwd();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'https://viztr.vercel.app';
const TELEGRAM_BOT_PORT = process.env.TELEGRAM_BOT_PORT || 4567;

// Determine mode: webhook requires public HTTPS URL, polling works locally
const IS_LOCALHOST = NEXTAUTH_URL?.includes('localhost') || NEXTAUTH_URL?.includes('127.0.0.1');
const IS_HTTPS = NEXTAUTH_URL?.startsWith('https://') && !IS_LOCALHOST;
const MODE = IS_HTTPS ? 'webhook' : 'polling';

// Markdown escape function (v2)
function escapeMarkdown(text) {
  return text.replace(/[^\w\s]/g, match => {
    const specialChars = /[`*_{}[]()#+\-.!|\\]/;
    if (specialChars.test(match)) {
      return '\\' + match;
    }
    return match;
  });
}

// Create inline keyboard with social links
function createSocialKeyboard() {
  const keyboard = {
    inline_keyboard: [
      [
        { text: labels.INSTAGRAM, url: SOCIAL_LINKS.INSTAGRAM },
        { text: labels.THREADS, url: SOCIAL_LINKS.THREADS },
      ],
      [
        { text: labels.X, url: SOCIAL_LINKS.X },
        { text: labels.FACEBOOK, url: SOCIAL_LINKS.FACEBOOK },
      ],
      [
        { text: labels.LINKEDIN, url: SOCIAL_LINKS.LINKEDIN },
        { text: labels.DISCORD_PROFILE, url: SOCIAL_LINKS.DISCORD_PROFILE },
      ],
      [
        { text: labels.DISCORD_SERVER, url: SOCIAL_LINKS.DISCORD_SERVER },
        { text: labels.TELEGRAM_BOT, url: SOCIAL_LINKS.TELEGRAM_BOT },
      ],
      [
        { text: labels.YOUTUBE_COMMUNITY, url: SOCIAL_LINKS.YOUTUBE_COMMUNITY },
        { text: labels.WEBSITE, url: SOCIAL_LINKS.WEBSITE },
      ],
    ],
  };

  return keyboard;
}

// Create main menu keyboard
function createMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🏠 Home', url: SOCIAL_LINKS.WEBSITE },
        { text: '🤖 Bot', url: SOCIAL_LINKS.TELEGRAM_BOT },
      ],
      [
        { text: '📱 Social Media', callback_data: 'open_socials' },
        { text: '💬 Help', callback_data: 'help' },
      ],
    ],
  };
}

// /start command handler
async function handleStart(message, bot) {
  const chatId = message.chat.id;
  const firstName = message.from?.first_name || 'User';
  const username = message.from?.username || '';

  const welcomeMessage = `
👋 Hello, ${firstName}!

Welcome to the VizTR Telegram Bot. I help you explore our social channels,
get support, and learn more about our projects.

Use /help to see available commands.
`;

  const mainMenu = createMainMenuKeyboard();

  await bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: mainMenu,
  });
}

// /help command handler
async function handleHelp(message, bot) {
  const chatId = message.chat.id;

  const helpText = `
📚 Available Commands

/start - Start the bot and see main menu
/help - Show this help message
/socials - Open social media links
/register - Register as VizTR user
/enquiry - Submit project enquiry
/profile - View your profile
/status - Check registration status

📌 Social Media: View our official links on Instagram, X, Facebook, LinkedIn, Discord, YouTube, and more.

💡 Tips: Click any button below to open the link directly.
`;

  await bot.sendMessage(chatId, helpText);
}

// /socials command handler
async function handleSocials(message, bot) {
  const chatId = message.chat.id;

  const socialsText = `
🌐 Official Social Media Links

Click any button below to open the link directly.

🔗 All links are official VizTR channels.
`;

  const keyboard = createSocialKeyboard();

  await bot.sendMessage(chatId, socialsText, {
    reply_markup: keyboard,
  });
}

// /register command handler - starts registration flow
async function handleRegister(message, bot) {
  const chatId = message.chat.id;
  const from = message.from;

  // Check if user is already registered
  const { data: existingProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, category, status')
    .eq('id', from.id.toString())
    .single();

  if (!profileError && existingProfile) {
    // User is already registered
    const statusText = existingProfile.status === 'approved'
      ? `✅ Your profile is approved! Category: ${existingProfile.category}`
      : `⏳ Your registration is ${existingProfile.status}. Please wait for admin approval.`;

    await bot.sendMessage(chatId, `
${statusText}

Use /profile to view your full profile details.
`);
    return;
  }

  // Show category selection keyboard
  const registrationText = `
👤 VizTR User Registration

Welcome to VizTR! To join our community, please select your role category:

\u2022 Client - Client looking for visualization services
\u2022 Architect - Architectural visualization professional
\u2022 3D Artist - 3D modeling and rendering artist
\u2022 Freelancer - Independent creative professional
\u2022 Learner - Student or learning enthusiast
\u2022 Technology Enthusiast - Technology and XR enthusiast

Please reply with your category name to register.
`;

  await bot.sendMessage(chatId, registrationText);
}

// /enquiry command handler - submit project enquiry
async function handleEnquiry(message, bot) {
  const chatId = message.chat.id;
  const from = message.from;

  const enquiryText = `
📋 VizTR Project Enquiry

Please provide your project details:

1. Service Type (architectural, virtual_reality, webxr, webar, virtual_tour_360, animation, still_renders, other)
2. Project Description
3. Budget Range
4. Timeline

Reply with your project details to submit an enquiry.
`;

  await bot.sendMessage(chatId, enquiryText);
}

// /profile command handler - view user profile
async function handleProfile(message, bot) {
  const chatId = message.chat.id;
  const from = message.from;

  // Check if user has a profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', from.id.toString())
    .single();

  if (profileError || !profile) {
    await bot.sendMessage(chatId, `
👤 VizTR User Profile

Use /register to create your profile if you haven't already.

Once registered, your profile will show:
- Category and experience level
- Company and location
- Portfolio link (if provided)
- Registration status
`);
    return;
  }

  const statusText = profile.status === 'approved'
    ? '✅ Approved'
    : profile.status === 'rejected'
      ? '❌ Rejected'
      : '⏳ Pending';

  const profileText = `
👤 VizTR User Profile

Category: ${profile.category}
Status: ${statusText}
Company: ${profile.company || 'Not provided'}
Location: ${profile.location || 'Not provided'}
Experience Level: ${profile.experience_level || 'Not provided'}
Bio: ${profile.bio || 'Not provided'}
Website: ${profile.website || 'Not provided'}
Portfolio URL: ${profile.portfolio_url || 'Not provided'}

Registration Date: ${new Date(profile.created_at).toLocaleDateString()}
`;

  await bot.sendMessage(chatId, profileText);
}

// /status command handler - check registration status
async function handleStatus(message, bot) {
  const chatId = message.chat.id;
  const from = message.from;

  // Check if user has a profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('status')
    .eq('id', from.id.toString())
    .single();

  if (profileError || !profile) {
    await bot.sendMessage(chatId, `
👤 VizTR Registration Status

Use /register to create your profile if you haven't already.

Your registration status will be displayed here once registered.

Status options:
- Pending - Awaiting admin approval
- Approved - Active community member
- Rejected - Application not approved
`);
    return;
  }

  const statusText = profile.status === 'approved'
    ? '✅ Approved - Active community member'
    : profile.status === 'rejected'
      ? '❌ Rejected - Application not approved'
      : '⏳ Pending - Awaiting admin approval';

  await bot.sendMessage(chatId, `
📋 VizTR Registration Status

${statusText}

Your profile was submitted on ${new Date(profile.created_at).toLocaleDateString()}.

Use /profile to view your full profile details.
`);
}

// Callback query handler for main menu
async function handleCallback(query, bot) {
  const data = query.data;
  const chatId = query.message?.chat?.id;
  const messageId = query.message?.message_id;

  if (!chatId) return;

  if (data === 'open_socials') {
    try {
      await bot.editMessageText(
        `🌐 Official Social Media Links\n\nClick any button below to open the link directly.\n\n🔗 All links are official VizTR channels.`,
        {
          chatId: chatId,
          messageId: messageId,
          reply_markup: createSocialKeyboard(),
        }
      );
    } catch (err) {
      // If edit fails, send new message
      await bot.sendMessage(
        chatId,
        `🌐 Official Social Media Links\n\nClick any button below to open the link directly.\n\n🔗 All links are official VizTR channels.`,
        {
          reply_markup: createSocialKeyboard(),
        }
      );
    }
  } else if (data === 'help') {
    try {
      await bot.editMessageText(
        `📚 Available Commands\n\n/start - Start the bot and see main menu\n/help - Show this help message\n/socials - Open social media links\n/register - Register as VizTR user\n/enquiry - Submit project enquiry\n/profile - View your profile\n/status - Check registration status\n\n📌 Social Media: View our official links on Instagram, X, Facebook, LinkedIn, Discord, YouTube, and more.`,
        {
          chatId: chatId,
          messageId: messageId,
          reply_markup: createMainMenuKeyboard(),
        }
      );
    } catch (err) {
      await bot.sendMessage(
        chatId,
        `📚 Available Commands\n\n/start - Start the bot and see main menu\n/help - Show this help message\n/socials - Open social media links\n/register - Register as VizTR user\n/enquiry - Submit project enquiry\n/profile - View your profile\n/status - Check registration status\n\n📌 Social Media: View our official links on Instagram, X, Facebook, LinkedIn, Discord, YouTube, and more.`,
        { reply_markup: createMainMenuKeyboard() },
      );
    }
  }
}

// Create a simple bot wrapper using Telegram API
function createBotWrapper() {
  return {
    async sendMessage(chatId, text, options = {}) {
      const payload = {
        chat_id: chatId,
        text: text,
        parse_mode: options.parse_mode || 'Markdown',
        ...options,
      };
      if (options.reply_markup) {
        payload.reply_markup = options.reply_markup;
      }
      
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      return response.json();
    },
    
    async editMessageText(text, options = {}) {
      const payload = {
        chat_id: options.chatId,
        message_id: options.messageId,
        text: text,
        parse_mode: 'Markdown',
        ...options,
      };
      
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      return response.json();
    },
  };
}

// Handle Telegram updates
async function handleUpdate(update) {
  const bot = createBotWrapper();

  // Handle callback queries (button clicks)
  if (update.callback_query) {
    await handleCallback(update.callback_query, bot);
    return;
  }

  const message = update.message;

  if (!message || !message.from) {
    return; // Skip updates without message or from
  }

  const text = message.text;

  if (!text) {
    return; // Skip non-text messages
  }

  // Commands
  if (text === '/start') {
    await handleStart(message, bot);
  } else if (text === '/help') {
    await handleHelp(message, bot);
  } else if (text === '/socials') {
    await handleSocials(message, bot);
  } else if (text === '/register') {
    await handleRegister(message, bot);
  } else if (text === '/enquiry') {
    await handleEnquiry(message, bot);
  } else if (text === '/profile') {
    await handleProfile(message, bot);
  } else if (text === '/status') {
    await handleStatus(message, bot);
  }
}

// Start polling
async function startPolling() {
  let offset = 0;
  let consecutiveErrors = 0;
  const MAX_CONSECUTIVE_ERRORS = 5;
  
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
        // Check for conflict error (multiple instances)
        if (result.error_code === 409 || result.description?.includes('Conflict')) {
          console.error('⚠️  Conflict detected: Another bot instance is running.');
          console.error('   Waiting 10 seconds before retrying...');
          consecutiveErrors++;
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            console.error('❌ Max consecutive errors reached. Exiting...');
            process.exit(1);
          }
          await new Promise((r) => setTimeout(r, 10000));
          continue;
        }
        console.error('❌ Polling error:', result.description);
        consecutiveErrors++;
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          console.error('❌ Max consecutive errors reached. Exiting...');
          process.exit(1);
        }
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      
      // Reset error counter on success
      consecutiveErrors = 0;

      const updates = result.result || [];
      for (const update of updates) {
        offset = update.update_id + 1;

        // Handle the update locally
        await handleUpdate(update);
      }
    } catch (err) {
      console.error('❌ Polling error:', err.message);
      consecutiveErrors++;
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.error('❌ Max consecutive errors reached. Exiting...');
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, 5000));
    }

    // Poll every 2 seconds
    await new Promise((r) => setTimeout(r, 2000));
  }
}

// Start the bot
async function start() {
  // Check for existing instance lock
  const lockFile = path.join(PROJECT_ROOT, '.telegram-bot.lock');
  if (fs.existsSync(lockFile)) {
    const pid = fs.readFileSync(lockFile, 'utf8').trim();
    try {
      // Check if process is still running
      process.kill(parseInt(pid), 0);
      console.error(`❌ Another Telegram bot instance is already running (PID: ${pid})`);
      console.error('   Stop it first or delete .telegram-bot.lock');
      process.exit(1);
    } catch {
      // Process not running, remove stale lock
      fs.unlinkSync(lockFile);
    }
  }
  
  // Create lock file
  fs.writeFileSync(lockFile, process.pid.toString());
  
  // Cleanup on exit
  const cleanup = () => {
    try {
      if (fs.existsSync(lockFile)) {
        fs.unlinkSync(lockFile);
      }
    } catch {}
    process.exit(0);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);

  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║  🤖  VizTR Telegram Bot                                ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Mode: ${MODE === 'webhook' ? 'Webhook' : 'Polling (local dev)'}`);
  console.log(`  Webhook URL: ${NEXTAUTH_URL}/api/messaging/telegram`);
  console.log(`  Token: ${TELEGRAM_BOT_TOKEN ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`  Secret: ${TELEGRAM_WEBHOOK_SECRET ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`  Health Port: ${TELEGRAM_BOT_PORT}`);
  console.log('');
  
  // Start health check server on port 4567
  const healthServer = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        service: 'telegram-bot',
        mode: MODE,
        port: TELEGRAM_BOT_PORT,
        pid: process.pid,
        timestamp: new Date().toISOString(),
      }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });
  
  healthServer.listen(TELEGRAM_BOT_PORT, () => {
    console.log(`  ✓ Health check server running on http://localhost:${TELEGRAM_BOT_PORT}`);
    console.log('');
  });
  
  if (MODE === 'polling') {
    console.log('  📡 Polling mode: Bot polls Telegram every 2 seconds.');
    console.log('     No HTTPS tunnel required for local development.');
    console.log('');
  }

  if (!TELEGRAM_BOT_TOKEN) {
    console.log('⚠️  TELEGRAM_BOT_TOKEN not set in .env.local');
    console.log('  Add TELEGRAM_BOT_TOKEN to .env.local to enable Telegram bot');
    console.log('  Bot will retry in 30 seconds...');
    setTimeout(start, 30000);
    return;
  }

  if (MODE === 'webhook') {
    try {
      // Register webhook
      const webhookUrl = `${NEXTAUTH_URL}/api/messaging/telegram?secret_token=${TELEGRAM_WEBHOOK_SECRET || ''}`;
      console.log('🔗 Registering Telegram webhook...');
      const webhookResponse = await fetch(
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
      const webhookResult = await webhookResponse.json();
      if (webhookResult.ok) {
        console.log('✓ Telegram webhook registered successfully');
        console.log(`  URL: ${webhookUrl}`);
      } else {
        console.error('❌ Failed to register webhook:', webhookResult.description);
      }
    } catch (err) {
      console.error('❌ Error registering webhook:', err.message);
    }
  } else {
    // Delete any existing webhook before starting polling mode
    console.log('🔗 Deleting existing webhook (if any) before starting polling mode...');
    try {
      const webhookResponse = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
      );
      const webhookResult = await webhookResponse.json();
      if (webhookResult.ok) {
        console.log('✓ Webhook deleted successfully');
      } else {
        console.error('⚠️  Could not delete webhook:', webhookResult.description);
      }
    } catch (err) {
      console.error('❌ Error deleting webhook:', err.message);
    }
    console.log('');
    console.log('🤖 Telegram bot is running via polling at:', NEXTAUTH_URL);
    console.log('  Send messages to your Telegram bot to test');
    console.log('  Webhook endpoint: POST /api/messaging/telegram');
    console.log('');
    console.log('📡 Polling mode: Bot polls Telegram every 2 seconds.');
    console.log('  No HTTPS tunnel required for local development.');
    console.log('');

    // Start polling loop
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

// Main startup function
async function main() {
  await start();
}

main().catch(console.error);