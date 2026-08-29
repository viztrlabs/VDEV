import { NextRequest, NextResponse } from 'next/server';

const CONTROLLER_URL =
  process.env.STREAM_CONTROLLER_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const streamId = searchParams.get('streamId') || 'apex-tower-ue5';

  // Live status from the GPU-PC controller when available; otherwise report
  // a simulated healthy cluster so the UI still renders.
  try {
    const upstream = await fetch(
      `${CONTROLLER_URL}/status?streamId=${encodeURIComponent(streamId)}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (upstream.ok) {
      const data = await upstream.json();
      return NextResponse.json({
        streamId,
        ue5Available: data.ue5Available,
        activeNodes: data.activeNodes,
        clusterHealth: data.clusterHealth,
        gpuUtilization: data.gpuUtilization,
        cirrusStreamers: data.cirrusStreamers,
        session: data.session,
        supportedCodecs: ['H.264', 'H.265 (HEVC)', 'AV1'],
      });
    }
  } catch {
    // controller unreachable — fall through to simulation
  }

  return NextResponse.json({
    streamId,
    ue5Available: false,
    activeNodes: 32,
    clusterHealth: 'SIMULATED',
    gpuUtilization: '38%',
    averageLatencyMs: 14.2,
    fps: 60,
    supportedCodecs: ['H.264', 'H.265 (HEVC)', 'AV1'],
    note: 'Controller offline — simulated telemetry.',
  });
}
