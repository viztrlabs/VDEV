export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';

const CONTROLLER_URL = process.env.STREAM_CONTROLLER_URL;

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const body = await req.json().catch(() => ({}));
    const streamId = body.streamId || 'apex-tower-ue5';

    if (!CONTROLLER_URL) {
      return NextResponse.json(
        {
          success: false,
          code: 'STREAM_CONTROLLER_UNAVAILABLE',
          error: 'Pixel streaming is not configured: STREAM_CONTROLLER_URL is not set.',
        },
        { status: 503 }
      );
    }

    try {
      const upstream = await fetch(`${CONTROLLER_URL}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId }),
        signal: AbortSignal.timeout(4000),
      });
      if (upstream.ok) {
        const data = await upstream.json();
        return NextResponse.json({
          success: true,
          ...data,
          streamId,
        });
      }
      const upstreamBody = await upstream.text().catch(() => '');
      return NextResponse.json(
        {
          success: false,
          code: 'STREAM_CONTROLLER_ERROR',
          error: `Stream controller responded with status ${upstream.status}${upstreamBody ? `: ${upstreamBody.slice(0, 200)}` : ''}`,
        },
        { status: 502 }
      );
    } catch {
      return NextResponse.json(
        {
          success: false,
          code: 'STREAM_CONTROLLER_UNREACHABLE',
          error: `Stream controller at ${CONTROLLER_URL} is unreachable.`,
        },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to stop pixel streaming instance' },
      { status: 500 }
    );
  }
}
