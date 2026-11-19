/**
 * Centralized Telegram Bot API Client
 * Handles all Telegram API calls with retry logic, error handling, and type safety
 */

import { validateTelegramConfig } from './config';
import type {
  TelegramMessage,
  TelegramUser,
  TelegramBotCommand,
  TelegramResponse,
  SendMessageOptions,
  EditMessageTextOptions,
  AnswerCallbackQueryOptions,
  SetWebhookOptions,
} from './types';
import { TelegramApiError } from './types';

const API_BASE = 'https://api.telegram.org/bot';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 1000; // 1 second

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  timeout: number;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sanitize token for logging (show only first 10 chars)
 */
function sanitizeToken(token: string): string {
  if (token.length <= 10) return '***';
  return token.slice(0, 10) + '...' + token.slice(-4);
}

/**
 * Telegram API Client Class
 */
export class TelegramClient {
  private readonly token: string;
  private readonly baseUrl: string;
  private readonly defaultOptions: RetryOptions;

  constructor(token?: string, options: Partial<RetryOptions> = {}) {
    this.token = token || validateTelegramConfig().token;
    this.baseUrl = `${API_BASE}${this.token}`;
    this.defaultOptions = {
      maxRetries: options.maxRetries ?? MAX_RETRIES,
      baseDelay: options.baseDelay ?? RETRY_BASE_DELAY,
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
    };
  }

  /**
   * Make HTTP request to Telegram API with retry logic
   */
  private async request<T>(method: string, body: Record<string, any> = {}): Promise<T> {
    const { maxRetries, baseDelay, timeout } = this.defaultOptions;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(`${this.baseUrl}/${method}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data: TelegramResponse<T> = await response.json();

        if (!response.ok) {
          const error = data.description || `HTTP ${response.status}`;
          const apiError = new TelegramApiError(
            data.error_code || response.status,
            error,
            data.parameters
          ) as TelegramApiError & { status: number };
          apiError.status = response.status;

          // Don't retry client errors (4xx) except 429 (rate limited)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw apiError;
          }

          throw apiError;
        }

        if (!data.ok) {
          const apiError = new TelegramApiError(
            data.error_code || 500,
            data.description || 'Unknown Telegram API error',
            data.parameters
          );
          throw apiError;
        }

        return data.result as T;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error as Error;

        // Don't retry if it's a client error (non-retryable)
        if (error instanceof TelegramApiError && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500 && status !== 429) {
            throw error;
          }
        }

        // Don't retry on abort (timeout)
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new TelegramApiError(408, 'Request timeout');
        }

        // If this was the last attempt, throw
        if (attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 100;
        await sleep(delay);
      }
    }

    throw lastError || new Error('Unknown error after retries');
  }

  /**
   * Send a text message
   */
  async sendMessage(
    chatId: string | number,
    text: string,
    options: SendMessageOptions = {}
  ): Promise<TelegramMessage> {
    // Telegram has a 4096 character limit for messages
    const safeText = text.length > 4096 ? text.slice(0, 4093) + '...' : text;

    return this.request<TelegramMessage>('sendMessage', {
      chat_id: chatId,
      text: safeText,
      parse_mode: options.parse_mode || 'HTML',
      disable_web_page_preview: options.disable_web_page_preview ?? true,
      disable_notification: options.disable_notification,
      protect_content: options.protect_content,
      reply_to_message_id: options.reply_to_message_id,
      allow_sending_without_reply: options.allow_sending_without_reply,
      reply_markup: options.reply_markup,
      message_thread_id: options.message_thread_id,
      entities: options.entities,
    });
  }

  /**
   * Edit message text
   */
  async editMessageText(
    chatId: string | number,
    messageId: number,
    text: string,
    options: EditMessageTextOptions = {}
  ): Promise<TelegramMessage | true> {
    const safeText = text.length > 4096 ? text.slice(0, 4093) + '...' : text;

    return this.request<TelegramMessage | true>('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text: safeText,
      parse_mode: options.parse_mode || 'HTML',
      disable_web_page_preview: options.disable_web_page_preview,
      reply_markup: options.reply_markup,
      entities: options.entities,
    });
  }

  /**
   * Answer a callback query
   */
  async answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
    options: AnswerCallbackQueryOptions = {}
  ): Promise<boolean> {
    return this.request<boolean>('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text: text?.slice(0, 200), // Max 200 chars
      show_alert: options.show_alert,
      url: options.url,
      cache_time: options.cache_time,
    });
  }

  /**
   * Set bot commands
   */
  async setMyCommands(commands: TelegramBotCommand[]): Promise<boolean> {
    // Validate commands
    for (const cmd of commands) {
      if (!cmd.command || !cmd.description) {
        throw new Error('Command must have both command and description');
      }
      if (cmd.command.length > 32) {
        throw new Error(`Command "${cmd.command}" exceeds 32 character limit`);
      }
      if (cmd.description.length > 256) {
        throw new Error(`Description for "${cmd.command}" exceeds 256 character limit`);
      }
    }

    return this.request<boolean>('setMyCommands', {
      commands,
    });
  }

  /**
   * Get bot info
   */
  async getMe(): Promise<TelegramUser> {
    return this.request<TelegramUser>('getMe', {});
  }

  /**
   * Set webhook
   */
  async setWebhook(url: string, options: SetWebhookOptions = {}): Promise<boolean> {
    return this.request<boolean>('setWebhook', {
      url,
      ...options,
    });
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(dropPendingUpdates = false): Promise<boolean> {
    return this.request<boolean>('deleteWebhook', {
      drop_pending_updates: dropPendingUpdates,
    });
  }

  /**
   * Get webhook info
   */
  async getWebhookInfo(): Promise<any> {
    return this.request<any>('getWebhookInfo', {});
  }
}

/**
 * Create a TelegramClient instance using environment config
 */
export function createTelegramClient(): TelegramClient {
  return new TelegramClient();
}

/**
 * Re-export error class for external handling
 */
export { TelegramApiError };