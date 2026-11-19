/**
 * Register Telegram Bot Commands
 * Calls setMyCommands to register all bot commands with Telegram
 * Run with: pnpm run telegram:register-commands
 */

import { validateTelegramConfig } from '@/lib/telegram/config';
import { createTelegramClient } from '@/lib/telegram/client';
import { COMMANDS } from '@/lib/telegram/commands/registry';

async function main() {
  console.log('[register-commands] Starting command registration...');

  try {
    const config = validateTelegramConfig();
    console.log(`[register-commands] Bot: @${config.username}`);
    console.log(`[register-commands] Registering ${COMMANDS.length} commands...`);

    const client = createTelegramClient();
    const result = await client.setMyCommands(COMMANDS);

    if (result) {
      console.log('[register-commands] ✅ Commands registered successfully!');
      for (const cmd of COMMANDS) {
        console.log(`  /${cmd.command} - ${cmd.description}`);
      }
      process.exit(0);
    } else {
      console.error('[register-commands] ❌ Failed to register commands');
      process.exit(1);
    }
  } catch (error) {
    console.error('[register-commands] Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();