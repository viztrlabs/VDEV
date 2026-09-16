/**
 * Auth utilities for API routes
 * 
 * Shared authentication and authorization helpers for API routes.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UnauthorizedError, ForbiddenError } from '@/lib/api/contracts/schemas';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Get the authenticated user from the NextAuth session.
 */
export async function getAuthUser(): Promise<AuthUser> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const user = session.user as any;

  return {
    id: user.id || '',
    email: user.email || '',
    role: user.role || '',
  };
}

/**
 * Check if user has super_admin role
 */
export function requireSuperAdmin(user: AuthUser): void {
  if (user.role !== 'super_admin') {
    throw new ForbiddenError('Super admin access required');
  }
}

/**
 * Check if user has admin or super_admin role
 */
export function requireAdmin(user: AuthUser): void {
  if (user.role !== 'super_admin' && user.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }
}

/**
 * Check if user owns the resource or is admin
 */
export function requireOwnershipOrAdmin(user: AuthUser, resourceOwnerId: string): void {
  if (user.role !== 'super_admin' && user.role !== 'admin' && user.id !== resourceOwnerId) {
    throw new ForbiddenError('Access denied');
  }
}