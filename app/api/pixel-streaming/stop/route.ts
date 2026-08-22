import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      status: 'TERMINATED',
      streamId: body.streamId || 'apex-tower-ue5',
      releasedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to stop streaming instance' }, { status: 500 });
  }
}
