export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';

const CONTROLLER_URL = process.env.STREAM_CONTROLLER_URL;

interface SessionConfig {
  streamId: string;
  resolution: '720p' | '1080p' | '2k' | '4k';
  fps: 30 | 60;
  quality: 'low' | 'medium' | 'high' | 'epic';
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  try {
    const body = await req.json().catch(() => ({}));
    const config: SessionConfig = {
      streamId: body.streamId || 'apex-tower-ue5',
      resolution: body.resolution || '4k',
      fps: body.fps || 60,
      quality: body.quality || 'epic',
    };

    // Forward to the GPU-PC stream controller sidecar. There is no local
    // simulation: if no controller is configured or reachable, fail loudly
    // with 503 so callers never mistake a fake session for a real GPU stream.
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
      const upstream = await fetch(`${CONTROLLER_URL}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
        // Don't hang the request if the controller is down
        signal: AbortSignal.timeout(4000),
      });
      if (upstream.ok) {
        const data = await upstream.json();
        return NextResponse.json({
          success: true,
          ...data,
          webrtcSignalingUrl:
            process.env.NEXT_PUBLIC_PS_SIGNALING_URL || 'wss://stream.viztr.io',
          nodeRegion: 'eu-central-1 (Frankfurt)',
          gpuModel: 'NVIDIA RTX 4090 Dedicated (24GB VRAM)',
          iceServers: [
            {
              urls: process.env.PS_TURN_URL || 'turn:turn.viztr.io:3478',
              username: process.env.PS_TURN_USER || 'viztr',
            },
          ],
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
      { error: 'Failed to start pixel streaming instance' },
      { status: 500 }
    );
  }
}
