import { handleStart, handleHelp, handleAbout, handleServices, handlePortfolio, handleWebsite, handleChannel, handleCommunity, handleContact, handleSupport, handlePrivacy, registerAllHandlers } from '@/lib/telegram/commands/handlers';
import { COMMAND_HANDLERS } from '@/lib/telegram/commands/registry';

// Mock TelegramClient
const mockClient = {
  sendMessage: jest.fn().mockResolvedValue({ message_id: 1 }),
};

const mockCtx = {
  client: mockClient,
  chatId: 123456789,
  from: { id: 123456789, first_name: 'Test', username: 'testuser' },
  messageId: 1,
};

describe('Command Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-register handlers
    registerAllHandlers();
  });

  test('/start sends welcome with main menu keyboard', async () => {
    await handleStart(mockCtx);
    expect(mockClient.sendMessage).toHaveBeenCalledWith(
      123456789,
      expect.stringContaining('Welcome to VizTR'),
      expect.objectContaining({
        reply_markup: expect.objectContaining({
          inline_keyboard: expect.any(Array),
        }),
        parse_mode: 'HTML',
      })
    );
  });

  test('/help lists all commands', async () => {
    await handleHelp(mockCtx);
    expect(mockClient.sendMessage).toHaveBeenCalledWith(
      123456789,
      expect.stringContaining('/start'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('/about sends brand description', async () => {
    await handleAbout(mockCtx);
    expect(mockClient.sendMessage).toHaveBeenCalledWith(
      123456789,
      expect.stringContaining('Visualize ✦ Experience ✦ Transform'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('/services sends interactive service categories', async () => {
    await handleServices(mockCtx);
    expect(mockClient.sendMessage).toHaveBeenCalledWith(
      123456789,
      expect.stringContaining('Studio'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('/portfolio shows categories with project counts', async () => {
    await handlePortfolio(mockCtx);
    expect(mockClient.sendMessage).toHaveBeenCalledWith(
      123456789,
      expect.stringContaining('Portfolio'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('/website sends URL button to site', async () => {
    await handleWebsite(mockCtx);
    expect(mockClient.sendMessage).toHaveBeenCalledWith(
      123456789,
      expect.stringContaining('viztr.in'),
      expect.objectContaining({
        reply_markup: expect.objectContaining({
          inline_keyboard: expect.arrayContaining([
            expect.arrayContaining([
              expect.objectContaining({ url: expect.stringContaining('viztr.in') }),
            ]),
          ]),
        }),
      })
    );
  });

  test('/channel shows disabled notice', async () => {
    await handleChannel(mockCtx);
    expect(mockClient.sendMessage).toHaveBeenCalledWith(
      123456789,
      expect.stringContaining('not yet configured'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('/community shows both WhatsApp links', async () => {
    await handleCommunity(mockCtx);
    expect(mockClient.sendMessage).toHaveBeenCalledWith(
      123456789,
      expect.stringContaining('WhatsApp Channel'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('/contact shows verified contact info', async () => {
    await handleContact(mockCtx);
    expect(mockClient.sendMessage).toHaveBeenCalledWith(
      123456789,
      expect.stringContaining('hello@viztr.studio'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('/support shows support instructions', async () => {
    await handleSupport(mockCtx);
    expect(mockClient.sendMessage).toHaveBeenCalledWith(
      123456789,
      expect.stringContaining('support'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('/privacy links to privacy policy', async () => {
    await handlePrivacy(mockCtx);
    expect(mockClient.sendMessage).toHaveBeenCalledWith(
      123456789,
      expect.stringContaining('privacy-policy'),
      expect.objectContaining({ parse_mode: 'HTML' })
    );
  });

  test('all 11 commands are registered', () => {
    const expectedCommands = [
      'start', 'help', 'about', 'services', 'portfolio',
      'website', 'channel', 'community', 'contact', 'support', 'privacy'
    ];
    for (const cmd of expectedCommands) {
      expect(COMMAND_HANDLERS[cmd]).toBeDefined();
    }
  });
});