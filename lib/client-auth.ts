/**
 * Client Portal Authentication
 *
 * Token utilities for client portal access.
 * Separate from NextAuth admin/client auth.
 *
 * Uses Web Crypto API (SubtleCrypto) so this module is safe to import
 * in both the Edge Runtime (middleware) and the Node.js runtime.
 */

export interface ClientPortalTokenPayload {
  clientId: string;
  clientName: string;
  clientFirm: string;
  clientEmail: string;
  accessCode: string;
  assignedDirector: string;
  tier: string;
  iat: number;
  exp: number;
}

// ─── Base64URL helpers (no Buffer — Edge safe) ───────────────────────────────

function base64urlEncode(data: string): string {
  // TextEncoder is available in both Edge and Node runtimes
  const bytes = new TextEncoder().encode(data);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(data: string): string {
  const padded = data.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (padded.length % 4)) % 4;
  const b64 = padded + '='.repeat(padding);
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function getSecret(): string {
  const secret = process.env.CLIENT_PORTAL_SECRET;
  if (
    process.env.NODE_ENV === 'production' &&
    (!secret || secret === 'dev-client-portal-secret-change-in-production')
  ) {
    throw new Error('CLIENT_PORTAL_SECRET must be set in production');
  }
  return secret || 'dev-client-portal-secret-change-in-production';
}

// ─── HMAC-SHA256 via Web Crypto ───────────────────────────────────────────────

async function importKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function signAsync(header: string, body: string, secret: string): Promise<string> {
  const key = await importKey(secret);
  const data = new TextEncoder().encode(`${header}.${body}`);
  const sig = await crypto.subtle.sign('HMAC', key, data);
  const bytes = new Uint8Array(sig);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function verifyAsync(
  header: string,
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const key = await importKey(secret);
  const data = new TextEncoder().encode(`${header}.${body}`);
  const padded = signature.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (padded.length % 4)) % 4;
  const b64 = padded + '='.repeat(padding);
  const binary = atob(b64);
  const sigBytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return crypto.subtle.verify('HMAC', key, sigBytes, data);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function createClientPortalToken(
  payload: Omit<ClientPortalTokenPayload, 'iat' | 'exp'>
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payloadFull: ClientPortalTokenPayload = {
    ...payload,
    iat: now,
    exp: now + 60 * 60 * 24,
  };

  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64urlEncode(JSON.stringify(payloadFull));
  const secret = getSecret();
  const signature = await signAsync(header, body, secret);

  return `${header}.${body}.${signature}`;
}

export async function verifyClientPortalToken(
  token: string
): Promise<ClientPortalTokenPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const secret = getSecret();

    const valid = await verifyAsync(header, body, signature, secret);
    if (!valid) return null;

    const payload = JSON.parse(base64urlDecode(body)) as ClientPortalTokenPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export function getClientPortalTokenFromRequest(request: Request): string | null {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/viztr-client-token=([^;]+)/);
  return match ? match[1] : null;
}
