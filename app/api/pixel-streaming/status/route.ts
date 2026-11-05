export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';

const CONTROLLER_URL = process.env.STREAM_CONTROLLER_URL;

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;
  const { searchParams } = new URL(req.url);
  const streamId = searchParams.get('streamId') || 'apex-tower-ue5';

  if (!CONTROLLER_URL) {
    return NextResponse.json({
      streamId,
      ue5Available: false,
      activeNodes: 0,
      clusterHealth: 'UNCONFIGURED',
      gpuUtilization: null,
      averageLatencyMs: null,
      fps: null,
      supportedCodecs: ['H.264', 'H.265 (HEVC)', 'AV1'],
      note: 'STREAM_CONTROLLER_URL is not configured.',
    });
  }

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
    // controller unreachable
  }

  return NextResponse.json({
    streamId,
    ue5Available: false,
    activeNodes: 0,
    clusterHealth: 'UNAVAILABLE',
    gpuUtilization: null,
    averageLatencyMs: null,
    fps: null,
    supportedCodecs: ['H.264', 'H.265 (HEVC)', 'AV1'],
    note: 'Stream controller is unreachable.',
  });
}
