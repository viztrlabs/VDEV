/**
 * Storage provider abstraction.
 *
 * VizTR must not depend directly on a single storage vendor. All upload,
 * access and lifecycle operations go through this interface so the backing
 * provider (Supabase Storage today, Cloudflare R2 later) is a config swap.
 *
 * Conventions:
 * - Paths are slash-separated keys relative to the bucket root
 *   (e.g. "tours/{experienceId}/v1/index.html").
 * - `signedUrl` is for private access with a TTL; `publicUrl` is for assets
 *   published under public prefixes (tour/, published/).
 */

export interface StorageObject {
  path: string;
  size: number;
  contentType?: string;
  updatedAt?: string;
}

export interface StorageUploadOptions {
  contentType: string;
  /** Cache-Control header for CDN delivery, e.g. "public, max-age=31536000, immutable". */
  cacheControl?: string;
  /** Overwrite an existing object at the same path (default true for idempotent uploads). */
  upsert?: boolean;
}

export interface StorageProvider {
  readonly name: string;

  /** Upload a file. Creates intermediate "folders" implicitly. */
  upload(path: string, body: ArrayBuffer | Blob | Buffer, options: StorageUploadOptions): Promise<{ path: string }>;

  /** Temporary access URL for private objects. */
  signedUrl(path: string, expiresInSeconds: number): Promise<string>;

  /** Stable public URL for published objects. */
  publicUrl(path: string): string;

  /** Object metadata, or null when missing. */
  head(path: string): Promise<StorageObject | null>;

  /** Delete a single object. */
  delete(path: string): Promise<void>;

  /** List objects under a prefix (non-recursive semantics are provider-dependent). */
  list(prefix: string): Promise<StorageObject[]>;
}

export class StorageError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'StorageError';
  }
}
