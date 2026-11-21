/**
 * Content-hash utilities for asset deduplication.
 *
 * The browser computes SHA-256 before upload so the API can short-circuit
 * duplicate master files (one canonical asset record per unique content).
 */

export async function sha256Hex(input: ArrayBuffer | Blob): Promise<string> {
  let buffer: ArrayBuffer;
  if (input instanceof Blob) {
    buffer = await input.arrayBuffer();
  } else {
    buffer = input;
  }
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
