export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';

// GET /api/storage/[id]/signed-url - Generate signed download URL
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAuth(request);
  if (guard.error) return guard.error;

  return NextResponse.json(
    { error: 'Signed URLs not yet implemented. Use direct Supabase Storage URLs.' },
    { status: 501 }
  );
}
