import { COMMANDS, COMMAND_HANDLERS, COMMAND_NAMES, isKnownCommand, getCommandDescription, validateCommands, registerCommandHandler, getCommandHandler } from '@/lib/telegram/commands/registry';

describe('Command Registry', () => {
  beforeEach(() => {
    // Clear handlers between tests
    Object.keys(COMMAND_HANDLERS).forEach(key => delete COMMAND_HANDLERS[key]);
  });

  test('exports all 11 required commands', () => {
    const names = COMMANDS.map(c => c.command);
    expect(names).toEqual([
      'start', 'help', 'about', 'services', 'portfolio',
      'website', 'channel', 'community', 'contact', 'support', 'privacy'
    ]);
  });

  test('each command has description', () => {
    for (const cmd of COMMANDS) {
      expect(cmd.description).toBeTruthy();
      expect(cmd.description.length).toBeLessThanOrEqual(256); // Telegram limit
    }
  });

  test('COMMAND_NAMES matches commands', () => {
    expect(COMMAND_NAMES).toEqual(COMMANDS.map(c => c.command));
  });

  test('isKnownCommand returns true for valid commands', () => {
    expect(isKnownCommand('start')).toBe(true);
    expect(isKnownCommand('help')).toBe(true);
    expect(isKnownCommand('about')).toBe(true);
    expect(isKnownCommand('START')).toBe(true); // case insensitive
    expect(isKnownCommand('Help')).toBe(true);
  });

  test('isKnownCommand returns false for invalid commands', () => {
    expect(isKnownCommand('unknown')).toBe(false);
    expect(isKnownCommand('')).toBe(false);
    expect(isKnownCommand('notacommand')).toBe(false);
  });

  test('getCommandDescription returns description', () => {
    expect(getCommandDescription('start')).toBe('Welcome to VizTR — Visualize ✦ Experience ✦ Transform');
    expect(getCommandDescription('help')).toBe('Show all available commands and how to use them');
  });

  test('getCommandDescription returns undefined for unknown', () => {
    expect(getCommandDescription('unknown')).toBeUndefined();
  });

  test('validateCommands passes for valid commands', () => {
    expect(() => validateCommands()).not.toThrow();
  });

  test('registerCommandHandler and getCommandHandler work', () => {
    const mockHandler = jest.fn();
    registerCommandHandler('test', mockHandler);
    expect(getCommandHandler('test')).toBe(mockHandler);
    expect(getCommandHandler('TEST')).toBe(mockHandler); // case insensitive
  });

  test('getCommandHandler returns undefined for unregistered', () => {
    expect(getCommandHandler('unregistered')).toBeUndefined();
  });
});