export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/services/client';
import { requireAuth } from '@/lib/api-guard';
import { verifyExperienceAccess } from '@/lib/auth/project-access';
import { getStorageProvider } from '@/lib/storage';

/**
 * Pano2VR tour package registry.
 *
 * Upload flow (see components/builder/Pano2VrPackageEditor.tsx):
 *   1. Client unzips the Pano2VR export (JSZip) in the browser
 *   2. Client uploads files directly to storage under
 *      `{userId}/published/tours/{experienceId}/v{version}/<relative path>`
 *      (the `published` segment makes the package publicly readable per the
 *      existing storage RLS; sandboxed iframe isolates the HTML)
 *   3. Client POSTs the manifest here; this route validates the entry file
 *      exists and registers the package (status: ready)
 *
 * GET /api/tour-packages?experienceId=... — list packages (ready first)
 */

const MAX_TOTAL_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB per package
const MAX_FILE_COUNT = 5000; // Pano2VR multires can emit thousands of tiles
const ALLOWED_ENTRY_EXTENSIONS = ['.html', '.htm'];

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  try {
    const { searchParams } = new URL(req.url);
    const experienceId = searchParams.get('experienceId');
    if (!experienceId) return NextResponse.json({ success: false, error: 'experienceId required' }, { status: 400 });

    const access = await verifyExperienceAccess(guard.userId, experienceId, guard.role);
    if (!access.allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    const { data, error } = await svc
      .from('tour_packages')
      .select('*')
      .eq('experience_id', experienceId)
      .order('version', { ascending: false });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, count: data?.length || 0, packages: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req, ['super_admin', 'admin', 'user']);
  if (guard.error) return guard.error;

  try {
    const body = await req.json();
    const experienceId = body.experienceId;
    const entryFile = typeof body.entryFile === 'string' ? body.entryFile : '';
    const prefix = typeof body.prefix === 'string' ? body.prefix : '';
    const fileCount = Number.isFinite(body.fileCount) ? parseInt(body.fileCount, 10) : 0;
    const totalBytes = Number.isFinite(body.totalBytes) ? parseInt(body.totalBytes, 10) : 0;
    const checksum = typeof body.checksum === 'string' ? body.checksum : null;

    if (!experienceId || !entryFile || !prefix) {
      return NextResponse.json({ success: false, error: 'experienceId, entryFile and prefix required' }, { status: 400 });
    }

    const entryExt = entryFile.slice(entryFile.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_ENTRY_EXTENSIONS.includes(entryExt)) {
      return NextResponse.json({ success: false, error: `entry file must be ${ALLOWED_ENTRY_EXTENSIONS.join(' or ')}` }, { status: 400 });
    }

    // Budget guards (protect storage from runaway uploads)
    if (fileCount > MAX_FILE_COUNT) {
      return NextResponse.json({ success: false, error: `package exceeds ${MAX_FILE_COUNT} files` }, { status: 413 });
    }
    if (totalBytes > MAX_TOTAL_BYTES) {
      return NextResponse.json({ success: false, error: 'package exceeds 2 GB' }, { status: 413 });
    }

    // Access + entry-file existence validation
    const access = await verifyExperienceAccess(guard.userId, experienceId, guard.role);
    if (!access.allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const provider = getStorageProvider();
    if (!provider) return NextResponse.json({ success: false, error: 'storage provider not configured' }, { status: 500 });

    const entryPath = `${prefix}/${entryFile.replace(/^\/+/, '')}`;
    const entryStat = await provider.head(entryPath);
    if (!entryStat) {
      return NextResponse.json({ success: false, error: `entry file not found in storage: ${entryPath}` }, { status: 400 });
    }

    const svc = getServiceClient();
    if (!svc) return NextResponse.json({ success: false, error: 'supabase not configured' }, { status: 500 });

    // Next version for this experience
    const { data: existing } = await svc
      .from('tour_packages')
      .select('version')
      .eq('experience_id', experienceId)
      .order('version', { ascending: false })
      .limit(1);
    const version = (existing?.[0]?.version || 0) + 1;

    const { data, error } = await svc
      .from('tour_packages')
      .insert({
        experience_id: experienceId,
        version,
        storage_prefix: prefix,
        entry_file: entryFile.replace(/^\/+/, ''),
        status: 'ready',
        file_count: fileCount,
        total_bytes: totalBytes,
        checksum_sha256: checksum,
        metadata: {
          entry_size: entryStat.size,
          uploaded_by: guard.userId,
          ...(body.metadata && typeof body.metadata === 'object' ? body.metadata : {}),
        },
        created_by: guard.userId,
      })
      .select('*')
      .single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, package: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'failed' }, { status: 500 });
  }
}
