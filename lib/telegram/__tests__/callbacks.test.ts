import { handleCallbackQuery } from '@/lib/telegram/callbacks';

// Mock TelegramClient
const mockClient = {
  editMessageText: jest.fn().mockResolvedValue(true),
  answerCallbackQuery: jest.fn().mockResolvedValue(true),
};

const createMockCallback = (data: string, messageId = 1) => ({
  id: 'cb_123',
  from: { id: 123456789, is_bot: false, first_name: 'Test' },
  message: {
    message_id: messageId,
    date: Math.floor(Date.now() / 1000),
    chat: { id: 123456789, type: 'private' },
    text: 'Menu',
  },
  data,
  chat_instance: 'chat_instance_123',
});

describe('Callback Query Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('about callback shows about text with back button', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('about'));
    expect(mockClient.editMessageText).toHaveBeenCalledWith(
      123456789,
      1,
      expect.stringContaining('Visualize \u2726 Experience \u2726 Transform'),
      expect.objectContaining({
        reply_markup: expect.objectContaining({ inline_keyboard: expect.any(Array) }),
        parse_mode: 'HTML',
      })
    );
    expect(mockClient.answerCallbackQuery).toHaveBeenCalledWith('cb_123', undefined, { show_alert: false });
  });

  test('services callback shows service categories', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('services'));
    expect(mockClient.editMessageText).toHaveBeenCalledWith(
      123456789,
      1,
      expect.stringContaining('Studio'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('studio callback shows 3 studio services', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('service:interior_renders'));
    expect(mockClient.editMessageText).toHaveBeenCalledWith(
      123456789,
      1,
      expect.stringContaining('Interior Still Renders'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('services:studio drills into studio services list', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('services:studio'));
    const [chatId, messageId, text, options] = (mockClient.editMessageText as jest.Mock).mock.calls[0];
    expect(chatId).toBe(123456789);
    expect(messageId).toBe(1);
    expect(text).toContain('Studio');
    expect(text).toContain('Interior Still Renders');
    expect(text).toContain('Exterior Still Renders');
    expect(text).toContain('Animation / Walkthrough');
    expect(text).not.toContain('WebXR');
    const callbacks = options.reply_markup.inline_keyboard.flat().map((b: any) => b.callback_data);
    expect(callbacks).toContain('service:interior_renders');
    expect(callbacks).toContain('service:exterior_renders');
    expect(callbacks).toContain('service:animation_walkthrough');
    expect(callbacks).toContain('back:services');
  });

  test('services:xrworld drills into XR World services list', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('services:xrworld'));
    const [chatId, messageId, text, options] = (mockClient.editMessageText as jest.Mock).mock.calls[0];
    expect(chatId).toBe(123456789);
    expect(messageId).toBe(1);
    expect(text).toContain('XR World');
    expect(text).toContain('WebXR');
    expect(text).toContain('Pixel Streaming');
    expect(text).not.toContain('Interior Still Renders');
    const callbacks = options.reply_markup.inline_keyboard.flat().map((b: any) => b.callback_data);
    expect(callbacks).toContain('service:webxr');
    expect(callbacks).toContain('service:pixel_streaming');
    expect(callbacks).toContain('back:services');
  });

  test('quote callback shows enquiry action', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('quote'));
    const [chatId, messageId, text, options] = (mockClient.editMessageText as jest.Mock).mock.calls[0];
    expect(chatId).toBe(123456789);
    expect(messageId).toBe(1);
    expect(text).toContain('Get a Quote');
    const urls = options.reply_markup.inline_keyboard.flat().map((b: any) => b.url).filter(Boolean);
    expect(urls.some((u: string) => u.includes('/book-consultation'))).toBe(true);
  });

  test('start callback returns to main menu', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('start'));
    const [chatId, messageId, text, options] = (mockClient.editMessageText as jest.Mock).mock.calls[0];
    expect(chatId).toBe(123456789);
    expect(messageId).toBe(1);
    expect(text).toContain('Welcome to VizTR');
    const callbacks = options.reply_markup.inline_keyboard.flat().map((b: any) => b.callback_data);
    expect(callbacks).toContain('about');
    expect(callbacks).toContain('services');
  });

  test('help callback shows command reference', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('help'));
    expect(mockClient.editMessageText).toHaveBeenCalledWith(
      123456789,
      1,
      expect.stringContaining('/start'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('portfolio callback shows categories', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('portfolio'));
    expect(mockClient.editMessageText).toHaveBeenCalledWith(
      123456789,
      1,
      expect.stringContaining('Portfolio'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('contact callback shows contact info', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('contact'));
    expect(mockClient.editMessageText).toHaveBeenCalledWith(
      123456789,
      1,
      expect.stringContaining('hello@viztr.studio'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('back:main returns to main menu', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('back:main'));
    expect(mockClient.editMessageText).toHaveBeenCalledWith(
      123456789,
      1,
      expect.stringContaining('Welcome to VizTR'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('back:services returns to services menu', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('back:services'));
    expect(mockClient.editMessageText).toHaveBeenCalledWith(
      123456789,
      1,
      expect.stringContaining('Studio'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('back:portfolio returns to portfolio menu', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('back:portfolio'));
    expect(mockClient.editMessageText).toHaveBeenCalledWith(
      123456789,
      1,
      expect.stringContaining('Portfolio'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('unknown callback answers with alert', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('unknown_action'));
    expect(mockClient.answerCallbackQuery).toHaveBeenCalledWith(
      'cb_123',
      expect.stringContaining('Unknown action'),
      { show_alert: true }
    );
  });

  test('callback without data answers with alert', async () => {
    const callback = createMockCallback('');
    callback.data = '';
    await handleCallbackQuery(mockClient, callback);
    expect(mockClient.answerCallbackQuery).toHaveBeenCalledWith(
      'cb_123',
      'Unknown action',
      { show_alert: true }
    );
  });

  test('portfolio category callback shows category detail', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('portfolio:exterior'));
    const [chatId, messageId, text, options] = (mockClient.editMessageText as jest.Mock).mock.calls[0];
    expect(chatId).toBe(123456789);
    expect(messageId).toBe(1);
    // Detail view, not the category list
    expect(text).toContain('Exterior Visualization');
    expect(text).toContain('project');
    expect(text).toContain('website');
    const callbacks = options.reply_markup.inline_keyboard.flat().map((b: any) => b.callback_data);
    expect(callbacks).toContain('back:portfolio');
  });

  test('portfolio category detail does not show other categories', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('portfolio:exterior'));
    const text = (mockClient.editMessageText as jest.Mock).mock.calls[0][2];
    expect(text).not.toContain('Interior Visualization');
    expect(text).not.toContain('Virtual Tours');
  });

  test('portfolio web link callback shows website link', async () => {
    await handleCallbackQuery(mockClient, createMockCallback('portfolio:web:exterior'));
    expect(mockClient.editMessageText).toHaveBeenCalledWith(
      123456789,
      1,
      expect.stringContaining('viztr.in/portfolio'),
      expect.objectContaining({
        reply_markup: expect.objectContaining({
          inline_keyboard: expect.arrayContaining([
            expect.arrayContaining([
              expect.objectContaining({ url: expect.stringContaining('viztr.in/portfolio') }),
            ]),
          ]),
        }),
      })
    );
  });
});