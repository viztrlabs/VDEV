import { isValidSessionId, shouldHandoff, visitorTopicLabel, HUMAN_INACTIVITY_TIMEOUT_MS } from '@/lib/chat/session';
import { formatHistoryForTelegram } from '@/lib/chat/handoff';

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
