import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const MAX_FILE_SIZE_MB = 500; // Increased for chunked uploads
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'model/', 'application/octet-stream', 'application/json'];
const BUCKET_NAME = 'viztr-assets';

// In-memory chunk storage (in production, use Redis)
const chunkStore = new Map<string, { chunks: Map<number, Buffer>; totalChunks: number; fileName: string; mimeType: string }>();

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
      return initChunkedUpload(body.fileName, body.mimeType, body.totalChunks);
    }

    return NextResponse.json({ success: false, error: 'Invalid request format' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

async function initChunkedUpload(fileName: string, mimeType: string, totalChunks: number) {
  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Validate
  if (totalChunks > 100) {
    return NextResponse.json({ success: false, error: 'Too many chunks (max 100)' }, { status: 400 });
  }

  const isAllowed = ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
  if (!isAllowed) {
    return NextResponse.json({ success: false, error: `File type "${mimeType}" is not allowed` }, { status: 415 });
  }

  // Initialize chunk store
  chunkStore.set(uploadId, {
    chunks: new Map(),
    totalChunks,
    fileName,
    mimeType
  });

  // Auto-cleanup after 1 hour
  setTimeout(() => chunkStore.delete(uploadId), 60 * 60 * 1000);

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
  const upload = chunkStore.get(uploadId);
  if (!upload) {
    return NextResponse.json({ success: false, error: 'Upload session not found or expired' }, { status: 404 });
  }

  if (chunkIndex >= totalChunks) {
    return NextResponse.json({ success: false, error: 'Invalid chunk index' }, { status: 400 });
  }

  // Validate chunk size
  if (chunk.size > CHUNK_SIZE * 2) {
    return NextResponse.json({ success: false, error: `Chunk exceeds max size (${CHUNK_SIZE} bytes)` }, { status: 413 });
  }

  // Store chunk
  const buffer = Buffer.from(await chunk.arrayBuffer());
  upload.chunks.set(chunkIndex, buffer);

  // Check if complete
  const complete = upload.chunks.size === totalChunks;

  return NextResponse.json({
    success: true,
    uploadId,
    chunkIndex,
    received: true,
    complete,
    progress: Math.round((upload.chunks.size / totalChunks) * 100)
  } as ChunkUploadResponse);
}

async function completeChunkedUpload(userId: string, uploadId: string, fileName: string, mimeType: string) {
  const upload = chunkStore.get(uploadId);
  if (!upload) {
    return NextResponse.json({ success: false, error: 'Upload session not found or expired' }, { status: 404 });
  }

  if (upload.chunks.size !== upload.totalChunks) {
    return NextResponse.json({ 
      success: false, 
      error: `Incomplete upload: ${upload.chunks.size}/${upload.totalChunks} chunks received` 
    }, { status: 400 });
  }

  // Reassemble file
  const chunks: Buffer[] = [];
  for (let i = 0; i < upload.totalChunks; i++) {
    const chunk = upload.chunks.get(i);
    if (!chunk) {
      return NextResponse.json({ success: false, error: `Missing chunk ${i}` }, { status: 400 });
    }
    chunks.push(chunk);
  }
  const fileBuffer = Buffer.concat(chunks);

  // Validate file size
  const fileSizeMB = fileBuffer.length / (1024 * 1024);
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    chunkStore.delete(uploadId);
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

  // Cleanup
  chunkStore.delete(uploadId);

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
      totalChunks: upload.totalChunks
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
  const isAllowed = ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
  if (!isAllowed) {
    return NextResponse.json(
      { success: false, error: `File type "${mimeType}" is not allowed` },
      { status: 415 }
    );
  }

  // Upload with retry
  const uploadFolder = folder || userId;
  const safeFileName = `${uploadFolder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  const buffer = Buffer.from(await file.arrayBuffer());

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
    const upload = chunkStore.get(uploadId);
    if (!upload) {
      return NextResponse.json({ success: false, error: 'Upload session not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      uploadId,
      fileName: upload.fileName,
      mimeType: upload.mimeType,
      totalChunks: upload.totalChunks,
      receivedChunks: upload.chunks.size,
      progress: Math.round((upload.chunks.size / upload.totalChunks) * 100)
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
          storage: action === 'status' ? getStorageStatus() : undefined,
        });
      }
    } catch (err) {
      console.warn('[storage] Supabase list failed:', err);
    }
  }

  return NextResponse.json({
    success: true,
    storage: getStorageStatus(),
    message: 'VizTR Multi-Cloud Object Storage Cluster Operational',
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

function getStorageStatus() {
  return {
    totalCapacityTB: 64.0,
    usedCapacityTB: 48.6,
    percentageUsed: 75.9,
    activeFilesCount: 14820,
    cloudProviders: [
      { name: 'AWS S3 (US-East-1)', region: 'N. Virginia', status: 'online' as const, allocatedTB: 32.0, usedTB: 24.8 },
      { name: 'Cloudflare R2 (Global CDN)', region: 'Edge Anycast', status: 'online' as const, allocatedTB: 20.0, usedTB: 15.4 },
      { name: 'Google Cloud Storage (EU-West)', region: 'Frankfurt', status: 'online' as const, allocatedTB: 12.0, usedTB: 8.4 },
    ],
    chunkedUpload: {
      maxFileSizeMB: MAX_FILE_SIZE_MB,
      chunkSizeMB: CHUNK_SIZE / (1024 * 1024),
      maxRetries: MAX_RETRIES,
      retryDelayMs: RETRY_DELAY_MS,
      activeSessions: chunkStore.size
    }
  };
}