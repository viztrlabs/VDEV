import crypto from 'crypto';

/**
 * Client Portal Authentication
 * 
 * Token utilities for client portal access.
 * Separate from NextAuth admin/client auth.
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

function base64urlEncode(data: string): string {
  return Buffer.from(data).toString('base64url');
}

function base64urlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf8');
}

function getSecret(): string {
  const secret = process.env.CLIENT_PORTAL_SECRET;
  if (process.env.NODE_ENV === 'production' && (!secret || secret === 'dev-client-portal-secret-change-in-production')) {
    throw new Error('CLIENT_PORTAL_SECRET must be set in production');
  }
  return secret || 'dev-client-portal-secret-change-in-production';
}

function sign(header: string, body: string, secret: string): string {
  const data = `${header}.${body}`;
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

export function createClientPortalToken(payload: Omit<ClientPortalTokenPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000);
  const payloadFull: ClientPortalTokenPayload = {
    ...payload,
    iat: now,
    exp: now + 60 * 60 * 24,
  };

  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64urlEncode(JSON.stringify(payloadFull));
  const secret = getSecret();
  const signature = sign(header, body, secret);

  return `${header}.${body}.${signature}`;
}

export function verifyClientPortalToken(token: string): ClientPortalTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const secret = getSecret();
    const expectedSignature = sign(header, body, secret);

    const sigBuffer = Buffer.from(signature, 'base64url');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url');

    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

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
