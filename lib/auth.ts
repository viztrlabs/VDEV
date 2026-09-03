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

export function getDemoAuthUser(email?: string, password?: string) {
  if (!email || !password) return null;

  const normalizedEmail = email.toLowerCase();

  if (normalizedEmail === 'admin@viztr.com' && password === 'password123') {
    return {
      id: 'usr_admin_01',
      name: 'VizTR Chief Technology Officer',
      email: 'admin@viztr.com',
      role: 'SUPER_ADMIN',
    };
  }

  if (normalizedEmail === 'manager@viztr.com' && password === 'password123') {
    return {
      id: 'usr_manager_01',
      name: 'Alexander Cross',
      email: 'manager@viztr.com',
      role: 'ADMIN',
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

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
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

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseAnonKey && credentials?.email && credentials?.password) {
          try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(supabaseUrl, supabaseAnonKey);
            const { data, error } = await supabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            });

            if (!error && data.user) {
              return {
                id: data.user.id,
                name:
                  data.user.user_metadata?.full_name ||
                  data.user.user_metadata?.name ||
                  data.user.email ||
                  'Supabase User',
                email: data.user.email || credentials.email,
                role:
                  (data.user.app_metadata?.role as string) ||
                  (data.user.user_metadata?.role as string) ||
                  'ADMIN',
              } as any;
            }
          } catch (err) {
            console.warn('[auth] Supabase credentials fallback failed:', err);
          }
        }

        const client = await lookupClientByCredentials(
          credentials.email,
          credentials.accessCode
        );

        if (client) {
          return {
            id: client.id,
            name: client.name,
            email: client.email,
            role: 'CLIENT',
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
        token.role = u.role || 'CLIENT';
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
        (session.user as any).role = t.role;
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