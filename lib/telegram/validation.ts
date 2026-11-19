/**
 * Zod Validation Schemas for Telegram Bot API Types
 * Provides runtime validation for incoming updates
 */

import { z } from 'zod';
import type {
  TelegramUser,
  TelegramChat,
  TelegramMessage,
  TelegramMessageEntity,
  TelegramCallbackQuery,
  TelegramInlineKeyboardButton,
  TelegramInlineKeyboardMarkup,
  TelegramUpdate,
} from './types';

/** User schema */
export const UserSchema: z.ZodType<TelegramUser> = z.object({
  id: z.number().int().positive(),
  is_bot: z.boolean(),
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  username: z.string().optional(),
  language_code: z.string().optional(),
  is_premium: z.boolean().optional(),
  added_to_attachment_menu: z.boolean().optional(),
});

/** Chat schema */
export const ChatSchema: z.ZodType<TelegramChat> = z.object({
  id: z.union([z.number().int(), z.string()]),
  type: z.enum(['private', 'group', 'supergroup', 'channel']),
  title: z.string().optional(),
  username: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  is_forum: z.boolean().optional(),
});

/** Message entity schema */
export const MessageEntitySchema: z.ZodType<TelegramMessageEntity> = z.object({
  type: z.enum([
    'mention', 'hashtag', 'cashtag', 'bot_command', 'url', 'email', 'phone_number',
    'bold', 'italic', 'underline', 'strikethrough', 'spoiler', 'code', 'pre',
    'text_link', 'text_mention', 'custom_emoji'
  ]),
  offset: z.number().int().nonnegative(),
  length: z.number().int().positive(),
  url: z.string().url().optional(),
  user: UserSchema.optional(),
  language: z.string().optional(),
  custom_emoji_id: z.string().optional(),
});

/** Inline keyboard button schema */
export const InlineKeyboardButtonSchema: z.ZodType<TelegramInlineKeyboardButton> = z.object({
  text: z.string().min(1).max(64),
  url: z.string().url().optional(),
  callback_data: z.string().min(1).max(64).optional(),
  web_app: z.object({ url: z.string().url() }).optional(),
  login_url: z.any().optional(),
  switch_inline_query: z.string().optional(),
  switch_inline_query_current_chat: z.string().optional(),
  switch_inline_query_chosen_chat: z.any().optional(),
  callback_game: z.any().optional(),
  pay: z.boolean().optional(),
}).refine(
  (data) => {
    // Must have exactly one of: url, callback_data, web_app, login_url, switch_inline_query, switch_inline_query_current_chat, switch_inline_query_chosen_chat, callback_game, pay
    const optionalFields = ['url', 'callback_data', 'web_app', 'login_url', 'switch_inline_query', 'switch_inline_query_current_chat', 'switch_inline_query_chosen_chat', 'callback_game', 'pay'];
    const present = optionalFields.filter(f => data[f as keyof TelegramInlineKeyboardButton] !== undefined);
    return present.length <= 1;
  },
  { message: 'InlineKeyboardButton must have at most one optional action field' }
);

/** Inline keyboard markup schema */
export const InlineKeyboardMarkupSchema: z.ZodType<TelegramInlineKeyboardMarkup> = z.object({
  inline_keyboard: z.array(z.array(InlineKeyboardButtonSchema)).min(1),
});

/** Message schema - using lazy for recursive reference */
const MessageSchemaBase = z.object({
  message_id: z.number().int().positive(),
  message_thread_id: z.number().int().positive().optional(),
  from: UserSchema.optional(),
  sender_chat: ChatSchema.optional(),
  date: z.number().int().positive(),
  chat: ChatSchema,
  forward_from: UserSchema.optional(),
  forward_from_chat: ChatSchema.optional(),
  forward_from_message_id: z.number().int().positive().optional(),
  forward_signature: z.string().optional(),
  forward_sender_name: z.string().optional(),
  forward_date: z.number().int().positive().optional(),
  is_topic_message: z.boolean().optional(),
  is_automatic_forward: z.boolean().optional(),
  reply_to_message: z.lazy(() => MessageSchema).optional(),
  via_bot: UserSchema.optional(),
  edit_date: z.number().int().positive().optional(),
  has_protected_content: z.boolean().optional(),
  media_group_id: z.string().optional(),
  author_signature: z.string().optional(),
  text: z.string().optional(),
  entities: z.array(MessageEntitySchema).optional(),
  caption: z.string().optional(),
  caption_entities: z.array(MessageEntitySchema).optional(),
  has_media_spoiler: z.boolean().optional(),
  reply_markup: InlineKeyboardMarkupSchema.optional(),
});

export const MessageSchema: z.ZodType<TelegramMessage> = MessageSchemaBase;

/** Callback query schema */
export const CallbackQuerySchema: z.ZodType<TelegramCallbackQuery> = z.object({
  id: z.string().min(1),
  from: UserSchema,
  message: MessageSchema.optional(),
  inline_message_id: z.string().optional(),
  chat_instance: z.string().min(1),
  data: z.string().max(64).optional(),
  game_short_name: z.string().optional(),
});

/** Update schema */
export const UpdateSchema: z.ZodType<TelegramUpdate> = z.object({
  update_id: z.number().int().positive(),
  message: MessageSchema.optional(),
  edited_message: MessageSchema.optional(),
  channel_post: MessageSchema.optional(),
  edited_channel_post: MessageSchema.optional(),
  inline_query: z.any().optional(),
  chosen_inline_result: z.any().optional(),
  callback_query: CallbackQuerySchema.optional(),
  shipping_query: z.any().optional(),
  pre_checkout_query: z.any().optional(),
  poll: z.any().optional(),
  poll_answer: z.any().optional(),
  my_chat_member: z.any().optional(),
  chat_member: z.any().optional(),
  chat_join_request: z.any().optional(),
  chat_boost: z.any().optional(),
  removed_chat_boost: z.any().optional(),
}).refine(
  (data) => {
    // At least one of message, edited_message, channel_post, edited_channel_post, inline_query, chosen_inline_result, callback_query, shipping_query, pre_checkout_query, poll, poll_answer, my_chat_member, chat_member, chat_join_request, chat_boost, removed_chat_boost must be present
    const updateTypes = [
      'message', 'edited_message', 'channel_post', 'edited_channel_post',
      'inline_query', 'chosen_inline_result', 'callback_query',
      'shipping_query', 'pre_checkout_query', 'poll', 'poll_answer',
      'my_chat_member', 'chat_member', 'chat_join_request',
      'chat_boost', 'removed_chat_boost'
    ];
    return updateTypes.some(type => data[type as keyof TelegramUpdate] !== undefined);
  },
  { message: 'Update must contain at least one update type' }
);

/** Validation helpers */
export function validateUpdate(data: unknown): { success: true; data: TelegramUpdate } | { success: false; error: z.ZodError } {
  const result = UpdateSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function validateCallbackQuery(data: unknown): { success: true; data: TelegramCallbackQuery } | { success: false; error: z.ZodError } {
  const result = CallbackQuerySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function validateMessage(data: unknown): { success: true; data: TelegramMessage } | { success: false; error: z.ZodError } {
  const result = MessageSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/** Extract command from message text */
export function extractCommand(text: string): { command: string; args: string } | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed.startsWith('/')) return null;
  const parts = trimmed.split(/\s+/);
  const command = parts[0].toLowerCase();
  // Single "/" without command name is not a valid command
  if (command === '/') return null;
  const args = parts.slice(1).join(' ');
  return { command, args };
}

/** Check if message is a command */
export function isCommand(text: string): boolean {
  return extractCommand(text) !== null;
}

/** Parse callback data in format "action:param" */
export function parseCallbackData(data: string | undefined): { action: string; param?: string } | null {
  if (!data) return null;
  const [action, ...params] = data.split(':');
  if (!action) return null;
  return { action, param: params.join(':') || undefined };
}