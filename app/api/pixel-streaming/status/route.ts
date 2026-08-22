import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const streamId = searchParams.get('streamId') || 'apex-tower-ue5';

  return NextResponse.json({
    streamId,
    activeNodes: 32,
    clusterHealth: 'OPTIMAL',
    gpuUtilization: '38%',
    averageLatencyMs: 14.2,
    fps: 60,
    supportedCodecs: ['H.264', 'H.265 (HEVC)', 'AV1']
  });
}
