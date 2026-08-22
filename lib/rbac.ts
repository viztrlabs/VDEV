export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'CLIENT';

export interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
}

export const PERMISSIONS = {
  MANAGE_SYSTEM_SETTINGS: ['SUPER_ADMIN'],
  MANAGE_ADMINS: ['SUPER_ADMIN'],
  MANAGE_ALL_PROJECTS: ['SUPER_ADMIN', 'ADMIN'],
  MANAGE_USERS: ['SUPER_ADMIN', 'ADMIN'],
  MANAGE_CMS: ['SUPER_ADMIN', 'ADMIN'],
  UPLOAD_ASSETS: ['SUPER_ADMIN', 'ADMIN', 'USER'],
  VIEW_ASSIGNED_PROJECTS: ['SUPER_ADMIN', 'ADMIN', 'USER', 'CLIENT'],
  DOWNLOAD_DELIVERABLES: ['SUPER_ADMIN', 'ADMIN', 'USER', 'CLIENT'],
} as const;

export function hasPermission(role: UserRole, action: keyof typeof PERMISSIONS): boolean {
  const allowedRoles = PERMISSIONS[action] as readonly UserRole[];
  return allowedRoles.includes(role);
}

export function canAccessAdmin(role?: string | null): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}

export function canAccessClientDashboard(role?: string | null): boolean {
  return role === 'CLIENT' || role === 'SUPER_ADMIN' || role === 'ADMIN';
}
