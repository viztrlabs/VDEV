import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { normalizeUserRole, type UserRole } from '@/lib/rbac';

/**
 * Shared API authentication & authorization helper.
 *
 * Usage:
 *   const guard = await requireAuth(req);
 *   if (guard.error) return guard.error;
 *   const { session, role } = guard;
 */
export async function requireAuth(
  _req: NextRequest,
  allowedRoles?: UserRole[]
): Promise<
  | { session: any; role: UserRole; userId: string; error?: undefined }
  | { error: NextResponse; session?: undefined; role?: undefined; userId?: undefined }
> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  const role = normalizeUserRole((session.user as any)?.role);
  const userId = (session.user as any)?.id || session.user?.email || '';

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return { session, role, userId };
}

/**
 * Sanitize a string input: trim, enforce max length, strip control characters.
 */
export function sanitizeString(value: unknown, maxLength = 255): string {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x1f\x7f]/g, '');
}

/**
 * Validate that a value is one of the allowed enum values.
 */
export function validateEnum<T extends string>(value: unknown, allowed: T[]): T | null {
  if (typeof value !== 'string') return null;
  return allowed.includes(value as T) ? (value as T) : null;
}

const apiGuard = {
  requireAuth,
  sanitizeString,
  validateEnum,
};

export default apiGuard;
