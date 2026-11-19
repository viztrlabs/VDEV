import { UpdateSchema, MessageSchema, CallbackQuerySchema, validateUpdate, validateCallbackQuery, validateMessage, extractCommand, isCommand, parseCallbackData } from '@/lib/telegram/validation';

describe('Telegram Validation Schemas', () => {
  const validUser = {
    id: 123456789,
    is_bot: false,
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser',
    language_code: 'en',
  };

  const validChat = {
    id: 123456789,
    type: 'private' as const,
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser',
  };

  const validMessage = {
    message_id: 1,
    date: Math.floor(Date.now() / 1000),
    chat: validChat,
    from: validUser,
    text: '/start',
  };

  const validCallbackQuery = {
    id: 'callback_123',
    from: validUser,
    message: validMessage,
    chat_instance: 'chat_instance_123',
    data: 'about',
  };

  describe('UpdateSchema', () => {
    test('validates minimal message update', () => {
      const update = {
        update_id: 123456,
        message: validMessage,
      };
      const result = UpdateSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    test('validates callback query update', () => {
      const update = {
        update_id: 123457,
        callback_query: validCallbackQuery,
      };
      const result = UpdateSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    test('rejects update without message or callback_query', () => {
      const result = UpdateSchema.safeParse({ update_id: 1 });
      expect(result.success).toBe(false);
    });

    test('validates edited_message update', () => {
      const update = {
        update_id: 123458,
        edited_message: validMessage,
      };
      const result = UpdateSchema.safeParse(update);
      expect(result.success).toBe(true);
    });
  });

  describe('MessageSchema', () => {
    test('validates minimal message', () => {
      const result = MessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    test('validates message with entities', () => {
      const message = {
        ...validMessage,
        entities: [{ type: 'bot_command' as const, offset: 0, length: 6 }],
      };
      const result = MessageSchema.safeParse(message);
      expect(result.success).toBe(true);
    });

    test('rejects message without chat', () => {
      const result = MessageSchema.safeParse({ message_id: 1, date: 123, from: validUser });
      expect(result.success).toBe(false);
    });
  });

  describe('CallbackQuerySchema', () => {
    test('validates callback query with message', () => {
      const result = CallbackQuerySchema.safeParse(validCallbackQuery);
      expect(result.success).toBe(true);
    });

    test('validates callback query without message (inline)', () => {
      const callback = {
        ...validCallbackQuery,
        message: undefined,
        inline_message_id: 'inline_123',
      };
      const result = CallbackQuerySchema.safeParse(callback);
      expect(result.success).toBe(true);
    });

    test('rejects callback query without from', () => {
      const result = CallbackQuerySchema.safeParse({
        id: 'cb_1',
        chat_instance: 'chat_1',
        data: 'test',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('validateUpdate', () => {
    test('returns success for valid update', () => {
      const result = validateUpdate({ update_id: 1, message: validMessage });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.update_id).toBe(1);
      }
    });

    test('returns error for invalid update', () => {
      const result = validateUpdate({ update_id: 1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });
  });

  describe('validateCallbackQuery', () => {
    test('returns success for valid callback', () => {
      const result = validateCallbackQuery(validCallbackQuery);
      expect(result.success).toBe(true);
    });

    test('returns error for invalid callback', () => {
      const result = validateCallbackQuery({ id: '1' });
      expect(result.success).toBe(false);
    });
  });

  describe('validateMessage', () => {
    test('returns success for valid message', () => {
      const result = validateMessage(validMessage);
      expect(result.success).toBe(true);
    });
  });

  describe('extractCommand', () => {
    test('extracts command without args', () => {
      const result = extractCommand('/start');
      expect(result).toEqual({ command: '/start', args: '' });
    });

    test('extracts command with args', () => {
      const result = extractCommand('/command arg1 arg2');
      expect(result).toEqual({ command: '/command', args: 'arg1 arg2' });
    });

    test('handles leading/trailing whitespace', () => {
      const result = extractCommand('  /help  ');
      expect(result).toEqual({ command: '/help', args: '' });
    });

    test('returns null for non-command text', () => {
      expect(extractCommand('hello')).toBeNull();
      expect(extractCommand('')).toBeNull();
      expect(extractCommand('not a command')).toBeNull();
    });
  });

  describe('isCommand', () => {
    test('returns true for commands', () => {
      expect(isCommand('/start')).toBe(true);
      expect(isCommand('/help')).toBe(true);
      expect(isCommand('/command arg')).toBe(true);
    });

    test('returns false for non-commands', () => {
      expect(isCommand('hello')).toBe(false);
      expect(isCommand('')).toBe(false);
      expect(isCommand('/')).toBe(false);
    });
  });

  describe('parseCallbackData', () => {
    test('parses action:param format', () => {
      expect(parseCallbackData('about')).toEqual({ action: 'about', param: undefined });
      expect(parseCallbackData('services:studio')).toEqual({ action: 'services', param: 'studio' });
      expect(parseCallbackData('back:main')).toEqual({ action: 'back', param: 'main' });
    });

    test('handles multiple colons in param', () => {
      expect(parseCallbackData('action:param:with:colons')).toEqual({ action: 'action', param: 'param:with:colons' });
    });

    test('returns null for empty/undefined', () => {
      expect(parseCallbackData('')).toBeNull();
      expect(parseCallbackData(undefined)).toBeNull();
    });
  });
});