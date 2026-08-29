import { NextRequest, NextResponse } from 'next/server';

const CONTROLLER_URL =
  process.env.STREAM_CONTROLLER_URL || 'http://localhost:3001';

interface SessionConfig {
  streamId: string;
  resolution: '720p' | '1080p' | '2k' | '4k';
  fps: 30 | 60;
  quality: 'low' | 'medium' | 'high' | 'epic';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const config: SessionConfig = {
      streamId: body.streamId || 'apex-tower-ue5',
      resolution: body.resolution || '4k',
      fps: body.fps || 60,
      quality: body.quality || 'epic',
    };

    // Forward to the GPU-PC stream controller sidecar. If the controller is
    // unreachable (dev machine without GPU PC), fall back to a simulated
    // allocation so the UI still works for demos.
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
              credential: process.env.PS_TURN_PASS || 'yourpassword',
            },
          ],
        });
      }
    } catch {
      // controller unreachable — fall through to simulation
    }

    // Simulated allocation (no GPU-PC controller online)
    return NextResponse.json({
      success: true,
      simulated: true,
      sessionId: `stream_${Date.now()}`,
      status: 'ALLOCATED',
      webrtcSignalingUrl:
        process.env.NEXT_PUBLIC_PS_SIGNALING_URL || 'wss://stream.viztr.io',
      nodeRegion: 'eu-central-1 (Frankfurt)',
      gpuModel: 'NVIDIA RTX 4090 Dedicated (24GB VRAM)',
      streamId: config.streamId,
      resolution: config.resolution,
      fps: config.fps,
      quality: config.quality,
      createdAt: new Date().toISOString(),
      iceServers: [
        {
          urls: process.env.PS_TURN_URL || 'turn:turn.viztr.io:3478',
          username: process.env.PS_TURN_USER || 'viztr',
          credential: process.env.PS_TURN_PASS || 'yourpassword',
        },
      ],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start pixel streaming instance' },
      { status: 500 }
    );
  }
}
