import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/client-access',
    error: '/client-access',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock_google_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_google_secret',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        projectId: { label: 'Project ID', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email && !credentials?.projectId) return null;

        // Default admin credentials
        if (credentials.email === 'admin@viztr.com') {
          return {
            id: 'usr_admin_01',
            name: 'VizTR Chief Technology Officer',
            email: 'admin@viztr.com',
            role: 'SUPER_ADMIN',
          };
        }

        // Default manager
        if (credentials.email === 'manager@viztr.com') {
          return {
            id: 'usr_manager_01',
            name: 'Alexander Cross',
            email: 'manager@viztr.com',
            role: 'ADMIN',
          };
        }

        // Client credentials / Project ID
        return {
          id: 'usr_client_01',
          name: 'Elena Rostova',
          email: credentials.email || 'architect@fosterpartners.com',
          role: 'CLIENT',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || 'CLIENT';
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};
