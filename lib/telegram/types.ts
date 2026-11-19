/**
 * Telegram Bot API TypeScript Types
 * Subset of types needed for Phase 1 implementation
 * Based on Telegram Bot API 8.0+
 */

/** Basic user information */
export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
}

/** Chat information */
export interface TelegramChat {
  id: number | string;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_forum?: boolean;
}

/** Message entity for formatting */
export interface TelegramMessageEntity {
  type: 'mention' | 'hashtag' | 'cashtag' | 'bot_command' | 'url' | 'email' | 'phone_number' | 'bold' | 'italic' | 'underline' | 'strikethrough' | 'spoiler' | 'code' | 'pre' | 'text_link' | 'text_mention' | 'custom_emoji';
  offset: number;
  length: number;
  url?: string;
  user?: TelegramUser;
  language?: string;
  custom_emoji_id?: string;
}

/** Incoming message */
export interface TelegramMessage {
  message_id: number;
  message_thread_id?: number;
  from?: TelegramUser;
  sender_chat?: TelegramChat;
  date: number;
  chat: TelegramChat;
  forward_from?: TelegramUser;
  forward_from_chat?: TelegramChat;
  forward_from_message_id?: number;
  forward_signature?: string;
  forward_sender_name?: string;
  forward_date?: number;
  is_topic_message?: boolean;
  is_automatic_forward?: boolean;
  reply_to_message?: TelegramMessage;
  via_bot?: TelegramUser;
  edit_date?: number;
  has_protected_content?: boolean;
  media_group_id?: string;
  author_signature?: string;
  text?: string;
  entities?: TelegramMessageEntity[];
  animation?: any;
  audio?: any;
  document?: any;
  photo?: any[];
  sticker?: any;
  story?: any;
  video?: any;
  video_note?: any;
  voice?: any;
  caption?: string;
  caption_entities?: TelegramMessageEntity[];
  has_media_spoiler?: boolean;
  contact?: any;
  dice?: any;
  game?: any;
  poll?: any;
  venue?: any;
  location?: any;
  new_chat_members?: TelegramUser[];
  left_chat_member?: TelegramUser;
  new_chat_title?: string;
  new_chat_photo?: any[];
  delete_chat_photo?: boolean;
  group_chat_created?: boolean;
  supergroup_chat_created?: boolean;
  channel_chat_created?: boolean;
  message_auto_delete_timer_changed?: any;
  migrate_to_chat_id?: number;
  migrate_from_chat_id?: number;
  pinned_message?: TelegramMessage;
  invoice?: any;
  successful_payment?: any;
  refunded_payment?: any;
  users_shared?: any;
  chat_shared?: any;
  connected_website?: string;
  write_access_allowed?: any;
  passport_data?: any;
  proximity_alert_triggered?: any;
  boost_added?: any;
  chat_background_set?: any;
  forum_topic_created?: any;
  forum_topic_edited?: any;
  forum_topic_closed?: any;
  forum_topic_reopened?: any;
  general_forum_topic_hidden?: any;
  general_forum_topic_unhidden?: any;
  video_chat_scheduled?: any;
  video_chat_started?: any;
  video_chat_ended?: any;
  video_chat_participants_invited?: any;
  web_app_data?: any;
  reply_markup?: TelegramInlineKeyboardMarkup;
}

/** Callback query from inline keyboard */
export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  inline_message_id?: string;
  chat_instance: string;
  data?: string;
  game_short_name?: string;
}

/** Inline keyboard button */
export interface TelegramInlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  web_app?: { url: string };
  login_url?: any;
  switch_inline_query?: string;
  switch_inline_query_current_chat?: string;
  switch_inline_query_chosen_chat?: any;
  callback_game?: any;
  pay?: boolean;
}

/** Inline keyboard markup */
export interface TelegramInlineKeyboardMarkup {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

/** Reply keyboard markup */
export interface TelegramReplyKeyboardMarkup {
  keyboard: TelegramKeyboardButton[][];
  is_persistent?: boolean;
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  input_field_placeholder?: string;
  selective?: boolean;
}

/** Reply keyboard button */
export interface TelegramKeyboardButton {
  text: string;
  request_contact?: boolean;
  request_location?: boolean;
  request_poll?: any;
  web_app?: { url: string };
}

/** Force reply */
export interface TelegramForceReply {
  force_reply: boolean;
  input_field_placeholder?: string;
  selective?: boolean;
}

/** Reply markup union */
export type TelegramReplyMarkup = TelegramInlineKeyboardMarkup | TelegramReplyKeyboardMarkup | TelegramForceReply | TelegramReplyKeyboardRemove;

/** Reply keyboard remove */
export interface TelegramReplyKeyboardRemove {
  remove_keyboard: boolean;
  selective?: boolean;
}

/** Update from Telegram */
export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
  inline_query?: any;
  chosen_inline_result?: any;
  callback_query?: TelegramCallbackQuery;
  shipping_query?: any;
  pre_checkout_query?: any;
  poll?: any;
  poll_answer?: any;
  my_chat_member?: any;
  chat_member?: any;
  chat_join_request?: any;
  chat_boost?: any;
  removed_chat_boost?: any;
}

/** Bot command */
export interface TelegramBotCommand {
  command: string;
  description: string;
}

/** Bot command scope */
export interface TelegramBotCommandScope {
  type: 'default' | 'all_private_chats' | 'all_group_chats' | 'all_chat_administrators' | 'chat' | 'chat_administrators' | 'chat_member';
  chat_id?: number | string;
  user_id?: number;
}

/** Webhook info */
export interface TelegramWebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  ip_address?: string;
  last_error_date?: number;
  last_error_message?: string;
  last_synchronization_error_date?: number;
  max_connections?: number;
  allowed_updates?: string[];
}

/** Response from Telegram API */
export interface TelegramResponse<T> {
  ok: boolean;
  result?: T;
  error_code?: number;
  description?: string;
  parameters?: {
    migrate_to_chat_id?: number;
    retry_after?: number;
  };
}

/** Send message options */
export interface SendMessageOptions {
  message_thread_id?: number;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  entities?: TelegramMessageEntity[];
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: TelegramReplyMarkup;
}

/** Edit message text options */
export interface EditMessageTextOptions {
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  entities?: TelegramMessageEntity[];
  disable_web_page_preview?: boolean;
  reply_markup?: TelegramInlineKeyboardMarkup;
}

/** Answer callback query options */
export interface AnswerCallbackQueryOptions {
  text?: string;
  show_alert?: boolean;
  url?: string;
  cache_time?: number;
}

/** Set webhook options */
export interface SetWebhookOptions {
  certificate?: any;
  ip_address?: string;
  max_connections?: number;
  allowed_updates?: string[];
  drop_pending_updates?: boolean;
  secret_token?: string;
}

/** Error class for Telegram API errors */
export class TelegramApiError extends Error {
  public readonly errorCode: number;
  public readonly description: string;
  public readonly parameters?: { migrate_to_chat_id?: number; retry_after?: number };

  constructor(errorCode: number, description: string, parameters?: { migrate_to_chat_id?: number; retry_after?: number }) {
    super(`Telegram API Error ${errorCode}: ${description}`);
    this.name = 'TelegramApiError';
    this.errorCode = errorCode;
    this.description = description;
    this.parameters = parameters;
  }
}