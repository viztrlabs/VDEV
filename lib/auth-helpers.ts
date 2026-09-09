import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import { normalizeUserRole, type UserRole } from './rbac';
import type { Session } from 'next-auth';

export interface ClientSessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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
  const role = normalizeUserRole(user.role);
  if (role !== 'client' && role !== 'super_admin' && role !== 'admin') {
    throw new Error('FORBIDDEN: Client role required');
  }
  return { ...user, role };
}

export async function requireAdminRole(): Promise<ClientSessionUser> {
  const user = await requireClientSession();
  const role = normalizeUserRole(user.role);
  if (role !== 'super_admin' && role !== 'admin') {
    throw new Error('FORBIDDEN: Admin role required');
  }
  return { ...user, role };
}

export function isClientUser(session: Session | null): boolean {
  if (!session?.user) return false;
  const role = normalizeUserRole((session.user as any).role);
  return role === 'client' || role === 'super_admin' || role === 'admin';
}

export interface UnderAdminUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

export async function requireUnderAdminSession(): Promise<UnderAdminUser> {
  const session = await getClientSession();
  if (!session || !session.user) {
    throw new Error('UNAUTHORIZED: No active session');
  }
  const role = normalizeUserRole(session.user.role);
  if (role !== 'super_admin' && role !== 'admin') {
    throw new Error('FORBIDDEN: Admin role required');
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role,
  };
}
