import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import { supabase, isSupabaseConfigured } from './supabase';

export interface ClientAuthLookup {
  id: string;
  name: string;
  firmName: string;
  email: string;
  portalAccessCode: string;
  assignedDirector: string;
  status: string;
}

import { normalizeUserRole } from './rbac';
import type { UserRole } from './rbac';
import { listClientDirectory } from './client-directory';
import type { ClientDirectoryRecord } from './client-directory';
import { mintSupabaseJwt, isSupabaseJwtConfigured } from './supabase/jwt';

export function getDemoAuthUser(email?: string, password?: string) {
  if (!email || !password) return null;

  const normalizedEmail = email.toLowerCase().trim();

  if (
    !isProduction() &&
    normalizedEmail === 'admin@viztr.com' &&
    password === 'password123'
  ) {
    return {
      id: 'usr_admin_01',
      name: 'VizTR Chief Technology Officer',
      email: 'admin@viztr.com',
      role: 'super_admin',
    };
  }

  if (
    !isProduction() &&
    normalizedEmail === 'viztr.labs@gmail.com' &&
    password === '123456'
  ) {
    return {
      id: 'usr_viztr_labs_01',
      name: 'VizTR Labs Admin',
      email: 'viztr.labs@gmail.com',
      role: 'super_admin',
    };
  }

  if (
    !isProduction() &&
    normalizedEmail === 'manager@viztr.com' &&
    password === 'password123'
  ) {
    return {
      id: 'usr_manager_01',
      name: 'Alexander Cross',
      email: 'manager@viztr.com',
      role: 'admin',
    };
  }

  if (
    !isProduction() &&
    normalizedEmail === 'user@viztr.com' &&
    password === 'password123'
  ) {
    return {
      id: 'usr_user_01',
      name: 'Marcus Vance',
      email: 'user@viztr.com',
      role: 'user',
    };
  }

  if (
    !isProduction() &&
    normalizedEmail === 'client@viztr.com' &&
    password === 'password123'
  ) {
    return {
      id: 'usr_client_01',
      name: 'Elena Rostova',
      email: 'client@viztr.com',
      role: 'client',
      clientId: 'cli_foster_01',
      accessCode: 'FST-2025-VTR',
      assignedDirector: 'Alexander Cross',
      clientFirm: 'Foster + Partners',
    };
  }

  return null;
}

export async function lookupClientByCredentials(
  email: string | undefined,
  accessCode: string | undefined
): Promise<ClientAuthLookup | null> {
  if (!email && !accessCode) return null;

  const candidates = await listClientDirectory({
    email,
    accessCode,
  });
  if (accessCode) {
    const match = candidates.find(
      (c) => c.portalAccessCode.toUpperCase() === accessCode.toUpperCase()
    );
    if (match) return toClientLookup(match);
  }
  if (email) {
    const match = candidates.find(
      (c) => c.email.toLowerCase() === email.toLowerCase().trim()
    );
    if (match) return toClientLookup(match);
  }
  return null;
}

function toClientLookup(c: ClientDirectoryRecord): ClientAuthLookup {
  return {
    id: c.id,
    name: c.name,
    firmName: c.firmName,
    email: c.email,
    portalAccessCode: c.portalAccessCode,
    assignedDirector: c.assignedDirector,
    status: c.status,
  };
}

const isProduction = (): boolean => {
  // Local development (`next dev`) always allows demo accounts even if VERCEL_ENV was pulled into .env.local
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  // SECURITY: Demo accounts are disabled on ANY Vercel deployment (preview or production).
  // Only allow demo accounts in true local development (no VERCEL_ENV set).
  if (process.env.VERCEL_ENV) {
    return true; // Treat all Vercel environments as production for demo account purposes
  }
  return process.env.NODE_ENV === 'production';
};

function getSessionSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  // In production a missing secret would silently sign JWTs with a known,
  // publicly-readable constant, allowing admin sessions to be forged.
  if (isProduction()) {
    throw new Error(
      'NEXTAUTH_SECRET is required in production. Set it in your deployment environment.'
    );
  }
  // Development fallback only — never reachable in production.
  return 'viztr-dev-insecure-secret-do-not-use-in-prod';
}

interface AuthenticateInput {
  email?: string;
  password?: string;
  accessCode?: string;
}

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId?: string;
  accessCode?: string;
  assignedDirector?: string;
  clientFirm?: string;
} | null;

export async function authenticateUser(
  credentials: AuthenticateInput
): Promise<AuthenticatedUser> {
  const { email, password, accessCode } = credentials ?? {};

  // 1. Supabase validation (primary path for real users).
  //    Anon client only — never the service-role client.
  if (email && password && isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data.user) {
        const meta = (data.user.user_metadata ?? {}) as { role?: unknown; full_name?: unknown };
        const role = normalizeUserRole(typeof meta?.role === 'string' ? meta.role : undefined);
        const name =
          typeof meta?.full_name === 'string' && meta.full_name
            ? meta.full_name
            : data.user.email || email || '';
        return {
          id: data.user.id,
          name,
          email: data.user.email || email || '',
          role,
        };
      }
      console.warn('[auth] Supabase signInWithPassword failed:', error?.message);
    } catch (err) {
      console.warn('[auth] Supabase sign-in threw; falling back to demo/client.', err);
    }
    // Fall through to demo and client paths on error OR thrown exception.
  }

  // 2. Demo accounts — only in local development (disabled on Vercel).
  const demoUser = getDemoAuthUser(email, password);
  if (demoUser) {
    if (isProduction()) {
      console.warn('[auth] SECURITY: Demo account login attempted in production-like environment — blocked');
      return null;
    }
    console.warn('[auth] Demo account login — local development only');
    return demoUser as AuthenticatedUser;
  }

  // 3. Client access-code / directory lookup (unchanged behavior).
  if (!email && !accessCode) return null;

  const client = await lookupClientByCredentials(email, accessCode);
  if (client) {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      role: 'client' as UserRole,
      clientId: client.id,
      accessCode: client.portalAccessCode,
      assignedDirector: client.assignedDirector,
      clientFirm: client.firmName,
    };
  }

  return null;
}

export const authOptions: NextAuthOptions = {
  secret: getSessionSecret(),
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/client-access',
    error: '/client-access',
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID !== 'mock_google_id'
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        accessCode: { label: 'Access Code', type: 'text' },
      },
      async authorize(credentials) {
        return authenticateUser({
          email: typeof credentials?.email === 'string' ? credentials.email : undefined,
          password: typeof credentials?.password === 'string' ? credentials.password : undefined,
          accessCode: typeof credentials?.accessCode === 'string' ? credentials.accessCode : undefined,
        });
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.role = normalizeUserRole(u.role || 'client');
        token.id = u.id;
        token.clientId = u.clientId;
        token.accessCode = u.accessCode;
        token.assignedDirector = u.assignedDirector;
        token.clientFirm = u.clientFirm;

        // SECURITY: Mint a Supabase JWT for user-scoped RLS enforcement.
        // The token is stored in the NextAuth JWT and passed to API routes
        // so they can create user-scoped Supabase clients.
        if (isSupabaseJwtConfigured() && u.id && !u.id.startsWith('usr_')) {
          // Only mint for real Supabase UUIDs, not demo user IDs
          const supabaseToken = await mintSupabaseJwt(u.id, u.email);
          if (supabaseToken) {
            token.supabaseAccessToken = supabaseToken;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const t = token as any;
        (session.user as any).role = normalizeUserRole(t.role || 'client');
        (session.user as any).id = t.id;
        (session.user as any).clientId = t.clientId;
        (session.user as any).accessCode = t.accessCode;
        (session.user as any).assignedDirector = t.assignedDirector;
        (session.user as any).clientFirm = t.clientFirm;
        // Supabase access token for user-scoped RLS (null for demo users)
        (session.user as any).supabaseAccessToken = t.supabaseAccessToken || null;
      }
      return session;
    },
  },
};