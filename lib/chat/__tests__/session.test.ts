import { isValidSessionId, shouldHandoff, visitorTopicLabel, HUMAN_INACTIVITY_TIMEOUT_MS } from '@/lib/chat/session';
import { formatHistoryForTelegram } from '@/lib/chat/handoff';
import { parseSupportGroupId, CHAT_SETTING_DEFAULTS } from '@/lib/chat/config';

describe('chat session helpers', () => {
  it('accepts browser session tokens and rejects junk', () => {
    expect(isValidSessionId('VTR-4821-abcdefghijkl')).toBe(true);
    expect(isValidSessionId('short')).toBe(false);
    expect(isValidSessionId('bad token!')).toBe(false);
    expect(isValidSessionId(undefined)).toBe(false);
  });

  it('makes a short forum topic label from the session prefix', () => {
    expect(visitorTopicLabel('VTR-4821-abcdef')).toBe('Visitor #VTR-VTR482');
    expect(visitorTopicLabel('VTR-4821-abcdef', ' Rahul ')).toBe('Visitor #VTR-VTR482 — Rahul');
  });

  it('escalates on explicit human requests', () => {
    expect(shouldHandoff('Can I talk to a human?')).toBe(true);
    expect(shouldHandoff('I want to speak to a specialist')).toBe(true);
    expect(shouldHandoff('Let me talk to someone')).toBe(true);
  });

  it('escalates on quote/project inquiries but not casual mentions', () => {
    expect(shouldHandoff('Can you send me a quote?')).toBe(true);
    expect(shouldHandoff('How much does a 360 tour cost?')).toBe(true);
    expect(shouldHandoff('I saw your project portfolio, thanks')).toBe(false);
  });

  it('escalates when the AI flags low confidence', () => {
    expect(shouldHandoff('What is your refund window?', true)).toBe(true);
  });

  it('uses a 4 hour inactivity timeout', () => {
    expect(HUMAN_INACTIVITY_TIMEOUT_MS).toBe(4 * 60 * 60 * 1000);
  });

  it('uses the admin-configurable topic prefix', () => {
    expect(visitorTopicLabel('VTR-4821-abcdef', 'Rahul', 'Tour #')).toBe('Tour #VTR482 — Rahul');
  });

  it('honours admin-configured handoff keywords', () => {
    expect(shouldHandoff('Please send a proposal', false, ['human', 'proposal'])).toBe(true);
    expect(shouldHandoff('What is the weather?', false, ['human', 'proposal'])).toBe(false);
  });

  it('parses the support group id and exposes defaults', () => {
    expect(parseSupportGroupId('-1004419719289')).toBe(-1004419719289);
    expect(parseSupportGroupId('not-a-number')).toBeNull();
    expect(CHAT_SETTING_DEFAULTS.autoResumeHours).toBe('4');
    expect(CHAT_SETTING_DEFAULTS.topicPrefix).toBe('Visitor #VTR-');
  });

  it('formats Telegram history as escaped HTML with reply instructions', () => {
    const html = formatHistoryForTelegram(
      [
        { sender: 'user', text: 'Hi <there> & friends' },
        { sender: 'bot', text: 'Hello!' },
      ],
      { name: 'Rahul', email: 'r@example.com' },
      'human_request',
    );
    expect(html).toContain('<b>Visitor:</b>');
    expect(html).toContain('Rahul');
    expect(html).toContain('&lt;there&gt; &amp; friends');
    expect(html).toContain('/done');
  });
});
