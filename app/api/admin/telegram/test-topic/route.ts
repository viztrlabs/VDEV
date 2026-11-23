export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { createTelegramClient } from '@/lib/telegram/client';
import { getChatConfig, parseSupportGroupId } from '@/lib/chat/config';

/** POST /api/admin/telegram/test-topic — one-click permission check. */
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req, ['super_admin', 'admin']);
  if (guard.error) return guard.error;

  const cfg = await getChatConfig();
  const groupId = parseSupportGroupId(cfg.supportGroupId);
  if (groupId === null) {
    return NextResponse.json({ success: false, error: 'Telegram support group ID is not configured' }, { status: 400 });
  }
  if (!cfg.botToken) {
    return NextResponse.json({ success: false, error: 'Telegram bot token is not configured' }, { status: 400 });
  }

  try {
    const client = createTelegramClient(cfg.botToken);
    const topic = await client.createForumTopic(groupId, 'Test Ping — Admin Dashboard');
    await client.sendMessage(
      groupId,
      '<b>Live chat handoff test</b>\nThis topic was created from the VizTR Admin Dashboard. If you can see this message, @viztr_bot has permission to create topics and reply to visitors.',
      { message_thread_id: topic.message_thread_id, parse_mode: 'HTML' },
    );
    return NextResponse.json({
      success: true,
      topicName: topic.name,
      messageThreadId: topic.message_thread_id,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to create test topic' }, { status: 500 });
  }
}
