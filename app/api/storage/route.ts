export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getAssetTypeByMime, validateMagicBytes } from '@/lib/asset-types';

const MAX_FILE_SIZE_MB = 500; // Increased for chunked uploads
const MAX_AGGREGATE_CHUNKS_MB = 500;
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'model/', 'application/octet-stream', 'application/json'];
const BUCKET_NAME = 'viztr-assets';

function isMimeAllowed(mimeType: string): boolean {
  if (ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix))) return true;
  return getAssetTypeByMime(mimeType) !== undefined;
}

function validateMimeMagicBytes(buf: Buffer, mimeType: string): boolean {
  const assetType = getAssetTypeByMime(mimeType);
  if (!assetType) return true; // no definition — pass through
  return validateMagicBytes(buf, assetType);
}

// Chunked-upload sessions are persisted in Supabase (`public.upload_sessions`)
// with chunk objects staged in the bucket under `chunks/<uploadId>/`, so
// uploads survive restarts and work across instances. Staging prefix:
const CHUNK_PREFIX = 'chunks';

function chunkObjectPath(uploadId: string, chunkIndex: number): string {
  return `${CHUNK_PREFIX}/${uploadId}/${String(chunkIndex).padStart(4, '0')}`;
}

interface UploadSession {
  upload_id: string;
  user_id: string;
  file_name: string;
  mime_type: string;
  total_chunks: number;
  received_chunks: number;
  expires_at: string;
}

async function getUploadSession(uploadId: string): Promise<UploadSession | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data, error } = await admin
    .from('upload_sessions')
    .select('*')
    .eq('upload_id', uploadId)
    .maybeSingle();
  if (error || !data) return null;
  const session = data as UploadSession;
  if (new Date(session.expires_at).getTime() < Date.now()) {
    await admin.from('upload_sessions').delete().eq('upload_id', uploadId);
    await admin.storage.from(BUCKET_NAME).remove(
      (await admin.storage.from(BUCKET_NAME).list(`${CHUNK_PREFIX}/${uploadId}`)).data?.map(
        (f) => `${CHUNK_PREFIX}/${uploadId}/${f.name}`
      ) ?? []
    );
    return null;
  }
  return session;
}

async function countStagedChunks(uploadId: string): Promise<number> {
  const admin = getSupabaseAdmin();
  if (!admin) return 0;
  const { data, error } = await admin.storage.from(BUCKET_NAME).list(`${CHUNK_PREFIX}/${uploadId}`);
  if (error || !data) return 0;
  return data.filter((f) => f.name !== '.keep').length;
}

export interface ChunkUploadRequest {
  uploadId: string;
  chunkIndex: number;
  totalChunks: number;
  fileName: string;
  mimeType: string;
  chunk: Buffer;
}

export interface ChunkUploadResponse {
  success: boolean;
  uploadId: string;
  chunkIndex: number;
  received: boolean;
  complete: boolean;
  fileUrl?: string;
  error?: string;
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY_MS
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(operation, retries - 1, delay * 2);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  try {
    const contentType = req.headers.get('content-type') || '';

    // Handle chunked upload
    if (contentType.includes('multipart/form-data') && isSupabaseConfigured && supabase) {
      const formData = await req.formData();
      
      // Check if this is a chunked upload
      const uploadId = formData.get('uploadId') as string;
      const chunkIndex = parseInt(formData.get('chunkIndex') as string || '0');
      const totalChunks = parseInt(formData.get('totalChunks') as string || '1');
      const fileName = formData.get('fileName') as string;
      const mimeType = formData.get('mimeType') as string || 'application/octet-stream';
      const chunk = formData.get('chunk') as File;

      if (uploadId && chunk) {
        return await handleChunkedUpload(guard.userId, uploadId, chunkIndex, totalChunks, fileName, mimeType, chunk);
      }

      // Regular single-file upload (existing logic)
      const file = formData.get('file') as File | null;
      if (file) {
        return await handleSingleFileUpload(guard.userId, file, formData.get('folder') as string);
      }
    }

    // Handle chunked upload completion
    const body = await req.json();
    if (body.action === 'complete' && body.uploadId) {
      return await completeChunkedUpload(guard.userId, body.uploadId, body.fileName, body.mimeType);
    }

    // Handle chunked upload initialization
    if (body.action === 'init' && body.fileName && body.mimeType && body.totalChunks) {
      return initChunkedUpload(guard.userId, body.fileName, body.mimeType, body.totalChunks);
    }

    return NextResponse.json({ success: false, error: 'Invalid request format' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

async function initChunkedUpload(userId: string, fileName: string, mimeType: string, totalChunks: number) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Chunked upload unavailable: server storage not configured' }, { status: 503 });
  }

  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Validate
  if (totalChunks > 100) {
    return NextResponse.json({ success: false, error: 'Too many chunks (max 100)' }, { status: 400 });
  }

  if (!isMimeAllowed(mimeType)) {
    return NextResponse.json({ success: false, error: `File type "${mimeType}" is not allowed` }, { status: 415 });
  }

  // Sweep expired sessions opportunistically
  await admin.from('upload_sessions').delete().lt('expires_at', new Date().toISOString());

  const { error } = await admin.from('upload_sessions').insert({
    upload_id: uploadId,
    user_id: userId,
    file_name: fileName,
    mime_type: mimeType,
    total_chunks: totalChunks,
    received_chunks: 0,
  });
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, uploadId, chunkSize: CHUNK_SIZE });
}

async function handleChunkedUpload(
  userId: string,
  uploadId: string,
  chunkIndex: number,
  totalChunks: number,
  fileName: string,
  mimeType: string,
  chunk: File
) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Chunked upload unavailable: server storage not configured' }, { status: 503 });
  }

  const upload = await getUploadSession(uploadId);
  if (!upload || upload.user_id !== userId) {
    return NextResponse.json({ success: false, error: 'Upload session not found or expired' }, { status: 404 });
  }

  if (chunkIndex >= upload.total_chunks) {
    return NextResponse.json({ success: false, error: 'Invalid chunk index' }, { status: 400 });
  }

  // Validate chunk size
  if (chunk.size > CHUNK_SIZE * 2) {
    return NextResponse.json({ success: false, error: `Chunk exceeds max size (${CHUNK_SIZE} bytes)` }, { status: 413 });
  }

  // Validate magic bytes on first chunk
  if (chunkIndex === 0) {
    const header = Buffer.from(await chunk.arrayBuffer());
    if (!validateMimeMagicBytes(header, upload.mime_type)) {
      return NextResponse.json(
        { success: false, error: `File content does not match declared MIME type "${upload.mime_type}"` },
        { status: 400 },
      );
    }
  }

  // Stage chunk object in Supabase Storage (idempotent per index)
  const buffer = Buffer.from(await chunk.arrayBuffer());
  const { error: stageError } = await admin.storage
    .from(BUCKET_NAME)
    .upload(chunkObjectPath(uploadId, chunkIndex), buffer, {
      contentType: 'application/octet-stream',
      upsert: true,
    });
  if (stageError) {
    return NextResponse.json({ success: false, error: stageError.message }, { status: 500 });
  }

  // Aggregate chunk size guard
  const received = await countStagedChunks(uploadId);
  const approxBytes = received * CHUNK_SIZE;
  if (approxBytes > MAX_AGGREGATE_CHUNKS_MB * 1024 * 1024) {
    await admin.from('upload_sessions').delete().eq('upload_id', uploadId);
    return NextResponse.json(
      { success: false, error: `Upload exceeds ${MAX_AGGREGATE_CHUNKS_MB}MB limit` },
      { status: 413 },
    );
  }

  await admin.from('upload_sessions').update({ received_chunks: received }).eq('upload_id', uploadId);

  // Check if complete
  const complete = received === upload.total_chunks;

  return NextResponse.json({
    success: true,
    uploadId,
    chunkIndex,
    received: true,
    complete,
    progress: Math.round((received / upload.total_chunks) * 100)
  } as ChunkUploadResponse);
}

async function completeChunkedUpload(userId: string, uploadId: string, fileName: string, mimeType: string) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Chunked upload unavailable: server storage not configured' }, { status: 503 });
  }

  const upload = await getUploadSession(uploadId);
  if (!upload || upload.user_id !== userId) {
    return NextResponse.json({ success: false, error: 'Upload session not found or expired' }, { status: 404 });
  }

  const finishWithCleanup = async () => {
    const staged = await admin.storage.from(BUCKET_NAME).list(`${CHUNK_PREFIX}/${uploadId}`);
    if (staged.data && staged.data.length > 0) {
      await admin.storage.from(BUCKET_NAME).remove(
        staged.data.map((f) => `${CHUNK_PREFIX}/${uploadId}/${f.name}`)
      );
    }
    await admin.from('upload_sessions').delete().eq('upload_id', uploadId);
  };

  const received = await countStagedChunks(uploadId);
  if (received !== upload.total_chunks) {
    return NextResponse.json({
      success: false,
      error: `Incomplete upload: ${received}/${upload.total_chunks} chunks received`
    }, { status: 400 });
  }

  // Reassemble file from staged chunk objects
  const chunks: Buffer[] = [];
  for (let i = 0; i < upload.total_chunks; i++) {
    const { data, error } = await admin.storage.from(BUCKET_NAME).download(chunkObjectPath(uploadId, i));
    if (error || !data) {
      return NextResponse.json({ success: false, error: `Missing chunk ${i}` }, { status: 400 });
    }
    chunks.push(Buffer.from(await data.arrayBuffer()));
  }
  const fileBuffer = Buffer.concat(chunks);

  // Validate magic bytes
  if (!validateMimeMagicBytes(fileBuffer, upload.mime_type)) {
    await finishWithCleanup();
    return NextResponse.json(
      { success: false, error: `File content does not match declared MIME type "${upload.mime_type}"` },
      { status: 400 },
    );
  }

  // Validate file size
  const fileSizeMB = fileBuffer.length / (1024 * 1024);
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    await finishWithCleanup();
    return NextResponse.json({ success: false, error: `File exceeds ${MAX_FILE_SIZE_MB}MB limit` }, { status: 413 });
  }

  // Upload to Supabase with retry
  const folder = userId;
  const safeFileName = `${folder}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  const { data, error } = await retryWithBackoff(() =>
    supabase!.storage.from(BUCKET_NAME).upload(safeFileName, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    })
  );

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase!.storage.from(BUCKET_NAME).getPublicUrl(data!.path);

  // Cleanup staged chunks + session
  await finishWithCleanup();

  return NextResponse.json({
    success: true,
    file: {
      fileId: data!.id || data!.path,
      fileName,
      storagePath: data!.path,
      size: `${fileSizeMB.toFixed(2)} MB`,
      mimeType,
      publicUrl: urlData.publicUrl,
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId,
      chunked: true,
      totalChunks: upload.total_chunks
    }
  }, { status: 201 });
}

async function handleSingleFileUpload(userId: string, file: File, folder?: string) {
  // Validate file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    return NextResponse.json(
      { success: false, error: `File exceeds ${MAX_FILE_SIZE_MB}MB limit (${fileSizeMB.toFixed(1)}MB)` },
      { status: 413 }
    );
  }

  // Validate MIME type
  const mimeType = file.type || 'application/octet-stream';
  if (!isMimeAllowed(mimeType)) {
    return NextResponse.json(
      { success: false, error: `File type "${mimeType}" is not allowed` },
      { status: 415 }
    );
  }

  // Upload with retry
  const uploadFolder = folder || userId;
  const safeFileName = `${uploadFolder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!validateMimeMagicBytes(buffer, mimeType)) {
    return NextResponse.json(
      { success: false, error: `File content does not match declared MIME type "${mimeType}"` },
      { status: 400 },
    );
  }

  const { data, error } = await retryWithBackoff(() =>
    supabase!.storage.from(BUCKET_NAME).upload(safeFileName, buffer, {
      contentType: mimeType,
      upsert: false,
    })
  );

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase!.storage.from(BUCKET_NAME).getPublicUrl(data!.path);

  return NextResponse.json({
    success: true,
    file: {
      fileId: data!.id || data!.path,
      fileName: file.name,
      storagePath: data!.path,
      size: `${fileSizeMB.toFixed(2)} MB`,
      mimeType,
      publicUrl: urlData.publicUrl,
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId,
      chunked: false
    }
  }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  // Handle chunked upload status check
  const uploadId = searchParams.get('uploadId');
  if (uploadId) {
    const upload = await getUploadSession(uploadId);
    if (!upload || upload.user_id !== guard.userId) {
      return NextResponse.json({ success: false, error: 'Upload session not found' }, { status: 404 });
    }
    const received = await countStagedChunks(uploadId);
    return NextResponse.json({
      success: true,
      uploadId,
      fileName: upload.file_name,
      mimeType: upload.mime_type,
      totalChunks: upload.total_chunks,
      receivedChunks: received,
      progress: Math.round((received / upload.total_chunks) * 100)
    });
  }

  // Existing storage status endpoint
  if (isSupabaseConfigured && supabase) {
    try {
      const folder = searchParams.get('folder') || '';
      const { data, error } = await supabase.storage.from(BUCKET_NAME).list(folder, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) {
        console.warn('[storage] Supabase list error:', error.message);
      } else {
        return NextResponse.json({
          success: true,
          files: data || [],
          storage: action === 'status' ? await getStorageStatus() : undefined,
        });
      }
    } catch (err) {
      console.warn('[storage] Supabase list failed:', err);
    }
  }

  return NextResponse.json({
    success: true,
    storage: await getStorageStatus(),
    message: 'VizTR Object Storage (Supabase) Operational',
  });
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ success: false, error: 'path query parameter required' }, { status: 400 });
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await retryWithBackoff(() => 
      supabase!.storage.from(BUCKET_NAME).remove([path])
    );
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

async function getStorageStatus() {
  // Real values only: active chunked-upload sessions from the DB.
  // Bucket-wide capacity/file counts are not exposed by the Storage API
  // without full traversal, so they are reported as unknown rather than fabricated.
  let activeSessions = 0;
  const admin = getSupabaseAdmin();
  if (admin) {
    const { count } = await admin
      .from('upload_sessions')
      .select('upload_id', { count: 'exact', head: true })
      .gte('expires_at', new Date().toISOString());
    activeSessions = count ?? 0;
  }
  return {
    bucket: BUCKET_NAME,
    backend: 'supabase-storage',
    configured: isSupabaseConfigured,
    chunkedUpload: {
      maxFileSizeMB: MAX_FILE_SIZE_MB,
      chunkSizeMB: CHUNK_SIZE / (1024 * 1024),
      maxRetries: MAX_RETRIES,
      retryDelayMs: RETRY_DELAY_MS,
      activeSessions,
    },
  };
}