export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getChatConfig } from '@/lib/chat/config';

/**
 * GET /api/chat/config — public, non-sensitive flags only.
 * Never expose tokens, secrets, group ids or topic internals here.
 */
export async function GET() {
  const cfg = await getChatConfig();
  return NextResponse.json({
    chatEnabled: cfg.chatEnabled,
    chatAiEnabled: cfg.chatAiEnabled,
  });
}
