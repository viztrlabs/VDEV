/**
 * Telegram Bot Command Registry
 * Defines all bot commands and their metadata for setMyCommands
 */

import type { TelegramBotCommand } from '../types';
import type { CommandHandler } from './handlers';

/** Command handler type - implemented in handlers.ts */
export type { CommandHandler };

/** Context passed to command handlers */
export interface CommandContext {
  client: any; // TelegramClient (circular dep avoided)
  chatId: number | string;
  from: { id: number; first_name?: string; username?: string };
  messageId?: number;
}

/** Bot Commands for Telegram Bot API */
export const COMMANDS: readonly TelegramBotCommand[] = [
  { command: 'start', description: 'Welcome to VizTR — Visualize ✦ Experience ✦ Transform' },
  { command: 'help', description: 'Show all available commands and how to use them' },
  { command: 'about', description: 'Learn about VizTR studio and our mission' },
  { command: 'services', description: 'Explore our services: Studio & XR World' },
  { command: 'portfolio', description: 'Browse our portfolio categories and projects' },
  { command: 'website', description: 'Open VizTR website (viztr.in)' },
  { command: 'channel', description: 'Telegram channel (not yet configured)' },
  { command: 'community', description: 'Join our WhatsApp Channel and Community' },
  { command: 'contact', description: 'Get verified contact information' },
  { command: 'support', description: 'Support options and project enquiry' },
  { command: 'privacy', description: 'View our privacy policy' },
] as const;

/** Command names for validation */
export const COMMAND_NAMES = COMMANDS.map(c => c.command) as readonly string[];

/** Check if a string is a known command */
export function isKnownCommand(command: string): boolean {
  return COMMAND_NAMES.includes(command.toLowerCase());
}

/** Get command description */
export function getCommandDescription(command: string): string | undefined {
  return COMMANDS.find(c => c.command === command.toLowerCase())?.description;
}

/** Validate commands meet Telegram requirements */
export function validateCommands(): void {
  for (const cmd of COMMANDS) {
    if (cmd.command.length > 32) {
      throw new Error(`Command "${cmd.command}" exceeds 32 character limit`);
    }
    if (cmd.description.length > 256) {
      throw new Error(`Description for "${cmd.command}" exceeds 256 character limit`);
    }
    if (!/^[a-z0-9_]+$/.test(cmd.command)) {
      throw new Error(`Command "${cmd.command}" must contain only lowercase letters, numbers, and underscores`);
    }
  }
}

// Handler map - populated by handlers.ts
export const COMMAND_HANDLERS: Record<string, CommandHandler> = {};

/** Register a command handler (called from handlers.ts) */
export function registerCommandHandler(command: string, handler: CommandHandler): void {
  COMMAND_HANDLERS[command] = handler;
}

/** Get handler for a command */
export function getCommandHandler(command: string): CommandHandler | undefined {
  return COMMAND_HANDLERS[command.toLowerCase()];
}