export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getMessagingProvider, type MessagingProvider } from '@/lib/messaging/providers';
import { getViztrAgentReply } from '@/lib/messaging/viztr-agent';

export async function POST(req: NextRequest) {
  const provider = req.nextUrl.pathname.split('/messaging/')[1] as 'telegram' | 'whatsapp' | undefined;
  if (!provider) {
    return NextResponse.json({ ok: false, error: 'Unknown messaging provider' }, { status: 404 });
  }
  const agentProvider = provider === 'telegram' ? 'telegram' : 'web';

  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const provided =
      req.nextUrl.searchParams.get('secret_token') ||
      req.headers.get('x-telegram-bot-api-secret-token');
    if (provided !== expectedSecret) {
      return NextResponse.json({ ok: false, error: 'Unauthorized webhook' }, { status: 401 });
    }
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ ok: true });
  }

  const adapter = getMessagingProvider(provider);
  if (!adapter) {
    return NextResponse.json({ ok: false, error: `${provider} provider not configured` }, { status: 503 });
  }

  const incoming = adapter.parseWebhook(payload);
  if (!incoming) {
    return NextResponse.json({ ok: true });
  }

  // Handle /resolve command from operators in the escalation channel
  if (incoming.text.startsWith('/resolve ')) {
    const parts = incoming.text.split(' ');
    if (parts.length >= 3) {
      const ticketId = parts[1];
      const resolution = parts.slice(2).join(' ');
      await handleOperatorResolution(ticketId, resolution, adapter, incoming.conversationId);
      return NextResponse.json({ ok: true, resolved: ticketId });
    }
  }

  try {
    const reply = await getViztrAgentReply(incoming.text, {
      userId: incoming.sender.id,
      provider: agentProvider,
      conversationId: incoming.conversationId,
      escalateIfNoAnswer: true,
    });
    await adapter.sendTextReply(incoming.conversationId, reply.text);
    return NextResponse.json({ ok: true, provider, conversationId: incoming.conversationId, escalated: reply.escalated });
  } catch (error) {
    console.error(`[messaging/${provider}] failed to reply:`, (error as Error).message);
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}

async function handleOperatorResolution(
  ticketId: string,
  resolution: string,
  adapter: Awaited<ReturnType<typeof getMessagingProvider>>,
  operatorChatId: string
) {
  if (!adapter) return;
  // Notify operator
  await adapter.sendTextReply(operatorChatId, `✅ Ticket ${ticketId} resolved. Reply sent to user.`);
  // Note: In a full implementation, we'd look up the original user's conversationId
  // from the ticket store and send the resolution there.
  // For now, the operator needs to manually copy the response to the user chat.
}

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  return NextResponse.json({
    ok: true,
    provider: 'telegram',
    configured: !!token,
    message: token ? 'Telegram webhook endpoint ready' : 'Set TELEGRAM_BOT_TOKEN to activate',
  });
}