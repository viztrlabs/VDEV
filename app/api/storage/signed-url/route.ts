export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET_NAME = 'viztr-assets';
const SIGN_URL_EXPIRY_SECONDS = 3600; // 1 hour

/**
 * Generate a signed URL for private storage assets.
 *
 * Usage:
 *   GET /api/storage/signed-url?path=user-id/filename.jpg
 *
 * The signed URL allows temporary access to private files without
 * making the entire bucket public. Useful for:
 * - User-uploaded working assets (drafts, unpublished)
 * - Client project files
 * - Any file that should not be publicly accessible
 *
 * Published assets (under tour/ or published prefixes) continue to use
 * public URLs. This endpoint is for private access only.
 */
export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');
  const expiresIn = parseInt(searchParams.get('expiresIn') || String(SIGN_URL_EXPIRY_SECONDS), 10);

  if (!path) {
    return NextResponse.json({ success: false, error: 'path query parameter required' }, { status: 400 });
  }

  // Validate expiry (max 24 hours)
  const clampedExpiry = Math.min(Math.max(expiresIn, 60), 86400);

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
  }

  // SECURITY: Verify the user owns the file or is an admin
  const pathParts = path.split('/');
  const folderOwner = pathParts[0];
  const isAdmin = guard.role === 'super_admin' || guard.role === 'admin';
  if (!isAdmin && folderOwner !== guard.userId) {
    return NextResponse.json({ success: false, error: 'Forbidden: you can only access your own files' }, { status: 403 });
  }

  const { data, error } = await admin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, clampedExpiry);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    signedUrl: data.signedUrl,
    expiresIn: clampedExpiry,
    path,
  });
}

/**
 * Generate signed URLs for multiple files in batch.
 *
 * Usage:
 *   POST /api/storage/signed-url
 *   Body: { paths: ["user-id/file1.jpg", "user-id/file2.glb"], expiresIn: 3600 }
 */
export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  try {
    const body = await req.json();
    const paths = body.paths;
    const expiresIn = parseInt(body.expiresIn || String(SIGN_URL_EXPIRY_SECONDS), 10);

    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json({ success: false, error: 'paths array required' }, { status: 400 });
    }

    if (paths.length > 20) {
      return NextResponse.json({ success: false, error: 'Maximum 20 paths per batch' }, { status: 400 });
    }

    const clampedExpiry = Math.min(Math.max(expiresIn, 60), 86400);

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    const isAdmin = guard.role === 'super_admin' || guard.role === 'admin';
    const results: Array<{ path: string; signedUrl?: string; error?: string }> = [];

    for (const path of paths) {
      const pathParts = path.split('/');
      const folderOwner = pathParts[0];
      if (!isAdmin && folderOwner !== guard.userId) {
        results.push({ path, error: 'Forbidden' });
        continue;
      }

      const { data, error } = await admin.storage
        .from(BUCKET_NAME)
        .createSignedUrl(path, clampedExpiry);

      if (error) {
        results.push({ path, error: error.message });
      } else {
        results.push({ path, signedUrl: data.signedUrl });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      expiresIn: clampedExpiry,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
