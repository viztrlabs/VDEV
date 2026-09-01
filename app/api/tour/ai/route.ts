import { NextRequest, NextResponse } from 'next/server';
import { processFloorplanImage } from '@/lib/floorplanAI';
import type { VtedFloorplanAI } from '@/lib/vted-types';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.file) {
      return NextResponse.json({ success: false, error: 'file required' }, { status: 400 });
    }

    const result = await processBase64Image(body.file);

    return NextResponse.json({
      success: true,
      floorplan: {
        rooms: result.rooms,
        walls: result.walls,
        doors: result.doors,
        windows: result.windows,
        scale: result.scale,
        processingConfidence: result.processingConfidence,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'failed to process floorplan' },
      { status: 500 },
    );
  }
}

async function processBase64Image(fileData: string): Promise<VtedFloorplanAI> {
  let base64 = fileData;
  let mimeType = 'image/png';

  if (fileData.includes(',')) {
    const parts = fileData.split(';base64,');
    if (parts[0]) {
      const header = parts[0];
      const mimeMatch = header.match(/data:(image\/\w+)/);
      if (mimeMatch && mimeMatch[1]) mimeType = mimeMatch[1];
    }
    base64 = fileData.split(',')[1] || '';
  }

  const buffer = Buffer.from(base64, 'base64');
  const file = new File([buffer], `floorplan.${mimeType.split('/')[1] || 'png'}`, {
    type: mimeType,
  });

  const result = await processFloorplanImage(file);
  return result.ai;
}
