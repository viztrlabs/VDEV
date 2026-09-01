import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import type { Session } from 'next-auth';

export interface ClientSessionUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'CLIENT';
  clientId?: string;
  accessCode?: string;
  assignedDirector?: string;
  clientFirm?: string;
}

export interface ClientSession {
  user: ClientSessionUser;
}

export async function getClientSession(): Promise<ClientSession | null> {
  const session = (await getServerSession(authOptions)) as ClientSession | null;
  if (!session || !session.user) return null;
  return session;
}

export async function requireClientSession(): Promise<ClientSessionUser> {
  const session = await getClientSession();
  if (!session) {
    throw new Error('UNAUTHORIZED: No active session');
  }
  return session.user;
}

export async function requireClientRole(): Promise<ClientSessionUser> {
  const user = await requireClientSession();
  const allowedRoles: Array<ClientSessionUser['role']> = ['CLIENT', 'SUPER_ADMIN', 'ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN: Client role required');
  }
  return user;
}

export async function requireAdminRole(): Promise<ClientSessionUser> {
  const user = await requireClientSession();
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN: Admin role required');
  }
  return user;
}

export function isClientUser(session: Session | null): boolean {
  if (!session?.user) return false;
  const role = (session.user as any).role;
  return role === 'CLIENT' || role === 'SUPER_ADMIN' || role === 'ADMIN';
}
