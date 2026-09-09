import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

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

export function getDemoAuthUser(email?: string, password?: string) {
  if (!email || !password) return null;

  const normalizedEmail = email.toLowerCase().trim();

  if (normalizedEmail === 'admin@viztr.com' && password === 'password123') {
    return {
      id: 'usr_admin_01',
      name: 'VizTR Chief Technology Officer',
      email: 'admin@viztr.com',
      role: 'super_admin',
    };
  }

  if (
    !isProduction &&
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

  if (normalizedEmail === 'manager@viztr.com' && password === 'password123') {
    return {
      id: 'usr_manager_01',
      name: 'Alexander Cross',
      email: 'manager@viztr.com',
      role: 'admin',
    };
  }

  if (normalizedEmail === 'user@viztr.com' && password === 'password123') {
    return {
      id: 'usr_user_01',
      name: 'Marcus Vance',
      email: 'user@viztr.com',
      role: 'user',
    };
  }

  if (normalizedEmail === 'client@viztr.com' && password === 'password123') {
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

async function lookupClientByCredentials(
  email: string | undefined,
  accessCode: string | undefined
): Promise<ClientAuthLookup | null> {
  if (!email && !accessCode) return null;

  const params = new URLSearchParams();
  if (email) params.set('q', email);
  if (accessCode) params.set('accessCode', accessCode);

  const baseUrl =
    process.env.NEXTAUTH_URL ||
    (typeof process.env.VERCEL_URL === 'string' ? `https://${process.env.VERCEL_URL}` : null) ||
    'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/clients?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    const clients: ClientAuthLookup[] = data?.clients || [];
    if (clients.length === 0) return null;

    if (accessCode) {
      const match = clients.find(
        (c) => c.portalAccessCode.toUpperCase() === accessCode.toUpperCase()
      );
      if (match) return match;
    }

    if (email) {
      const match = clients.find((c) => c.email.toLowerCase() === email.toLowerCase());
      if (match) return match;
    }

    return clients[0] || null;
  } catch (err) {
    console.error('[auth] lookupClientByCredentials failed:', err);
    return null;
  }
}

const isProduction = process.env.NODE_ENV === 'production';

function getSessionSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  // In production a missing secret would silently sign JWTs with a known,
  // publicly-readable constant, allowing admin sessions to be forged.
  if (isProduction) {
    throw new Error(
      'NEXTAUTH_SECRET is required in production. Set it in your deployment environment.'
    );
  }
  // Development fallback only — never reachable in production.
  return 'viztr-dev-insecure-secret-do-not-use-in-prod';
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
        const demoUser = getDemoAuthUser(credentials?.email, credentials?.password);
        if (demoUser) return demoUser;

        if (!credentials?.email && !credentials?.accessCode) return null;

        const client = await lookupClientByCredentials(
          credentials.email,
          credentials.accessCode
        );

        if (client) {
          return {
            id: client.id,
            name: client.name,
            email: client.email,
            role: 'client',
            clientId: client.id,
            accessCode: client.portalAccessCode,
            assignedDirector: client.assignedDirector,
            clientFirm: client.firmName,
          } as any;
        }

        return null;
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
      }
      return session;
    },
  },
};