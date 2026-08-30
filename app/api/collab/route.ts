import { NextRequest, NextResponse } from 'next/server';

// Returns the WebSocket collaboration server URL for the XR viewer.
// The collab server is started separately (scripts/collab-server.mjs) and
// exposed via COLLAB_WS_URL, falling back to an inferred localhost URL.
export async function GET() {
  const url =
    process.env.COLLAB_WS_URL ||
    `ws://localhost:${process.env.COLLAB_PORT || 4000}`;
  return NextResponse.json({ url });
}
