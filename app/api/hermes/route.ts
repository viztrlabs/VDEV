export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { getViztrAgentReply } from '@/lib/messaging/viztr-agent';

interface HermesRequest {
  userId?: string;
  message?: string;
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const body: HermesRequest = await req.json();
    const { userId, message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const reply = await getViztrAgentReply(message, {
      userId: userId || guard.userId,
      provider: 'web',
      conversationId: `web_${userId || guard.userId}`,
      escalateIfNoAnswer: true,
    });

    return NextResponse.json({
      type: 'chat_message',
      role: 'assistant',
      content: reply.text,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString(),
      model: reply.model,
      simulated: reply.simulated,
      escalated: reply.escalated,
      ticketId: reply.ticketId,
      sources: reply.sources?.map((s) => ({ title: s.title, url: s.url })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  return NextResponse.json({
    status: 'connected',
    message: 'Hermes API is running',
    mode: apiKey ? 'live-llm' : 'simulation',
  });
}