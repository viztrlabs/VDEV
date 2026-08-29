import { NextRequest, NextResponse } from 'next/server';

const CONTROLLER_URL =
  process.env.STREAM_CONTROLLER_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const streamId = body.streamId || 'apex-tower-ue5';

    // Forward to the GPU-PC stream controller sidecar. Fall back to a
    // simulated response if the controller is unreachable.
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
    } catch {
      // controller unreachable — fall through to simulation
    }

    return NextResponse.json({
      success: true,
      simulated: true,
      streamId,
      status: 'ENDED',
      message: 'GPU container gracefully spun down (simulation — controller offline).',
      endedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to stop pixel streaming instance' },
      { status: 500 }
    );
  }
}
