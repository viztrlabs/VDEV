/**
 * Supabase JWT minting utility.
 *
 * Mints a JWT compatible with Supabase's GoTrue auth system.
 * This allows server-side code to create user-scoped Supabase clients
 * that enforce Row-Level Security.
 *
 * Requires SUPABASE_JWT_SECRET env var (found in Supabase Dashboard → Settings → API → JWT Secret).
 *
 * Architecture:
 *   NextAuth session → supabaseAccessToken (minted here) → getUserClient(token) → RLS
 */

import { SignJWT, importPKCS8, type JWK } from 'jose';
import { createClient } from '@supabase/supabase-js';

function stripBom(s: string): string {
  return s.replace(/^\uFEFF/, '');
}

const JWT_SECRET = stripBom(process.env.SUPABASE_JWT_SECRET || '');
const SUPABASE_URL = stripBom(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
const SUPABASE_ANON_KEY = stripBom(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

/**
 * Check if Supabase JWT minting is configured.
 */
export function isSupabaseJwtConfigured(): boolean {
  return Boolean(
    JWT_SECRET &&
      SUPABASE_URL &&
      SUPABASE_ANON_KEY &&
      SUPABASE_ANON_KEY !== '[SENSITIVE]'
  );
}

/**
 * Mint a Supabase-compatible JWT for a user.
 *
 * The JWT contains:
 * - `sub`: The user's Supabase auth UUID (must exist in auth.users)
 * - `role`: "authenticated" (Supabase role for logged-in users)
 * - `aud`: "authenticated"
 * - `iat`, `exp`: Standard claims
 *
 * @param userId - The user's Supabase auth UUID (from auth.users table)
 * @param email - Optional email claim
 * @returns Signed JWT string, or null if not configured
 */
export async function mintSupabaseJwt(
  userId: string,
  email?: string
): Promise<string | null> {
  if (!JWT_SECRET || !userId) return null;

  try {
    // Convert the HMAC secret to a KeyObject for jose
    const secretKey = new TextEncoder().encode(JWT_SECRET);

    const jwt = await new SignJWT({
      role: 'authenticated',
      aud: 'authenticated',
      email: email || undefined,
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secretKey);

    return jwt;
  } catch (err) {
    console.error('[Supabase JWT] Minting failed:', err);
    return null;
  }
}

/**
 * Create a user-scoped Supabase client using a minted JWT.
 *
 * This client enforces RLS — the user can only access rows
 * they own according to Supabase RLS policies.
 *
 * @param userId - The user's Supabase auth UUID
 * @param email - Optional email for the JWT
 * @returns Supabase client with user-scoped JWT, or null if not configured
 */
export async function createUserScopedClient(
  userId: string,
  email?: string
) {
  if (!isSupabaseJwtConfigured() || !userId) return null;

  const token = await mintSupabaseJwt(userId, email);
  if (!token) return null;

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}
