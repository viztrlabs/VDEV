/**
 * Advanced RBAC System — Phase 2D
 * Supports role hierarchies, attribute-based access control (ABAC),
 * permission inheritance, and dynamic role assignment.
 */

import { z } from 'zod';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ENTERPRISE_ADMIN'
  | 'ORG_ADMIN'
  | 'PROJECT_MANAGER'
  | 'DESIGNER'
  | 'CLIENT'
  | 'VIEWER'
  | 'GUEST';

export interface UserContext {
  id: string;
  email?: string;
  role: UserRole;
  orgId?: string;
  projectId?: string;
  attributes?: Record<string, string | number | boolean>;
  groups?: string[];
  teamIds?: string[];
  permissions?: string[]; // explicit overrides
}

export const ResourceActionSchema = z.object({
  resource: z.string().min(1),
  action: z.enum(['create', 'read', 'update', 'delete', 'manage', 'export', 'import']),
  scope: z.record(z.string(), z.unknown()).optional(),
});

export type ResourceAction = z.infer<typeof ResourceActionSchema>;

export interface PermissionRule {
  role: UserRole;
  resource: string;
  actions: string[];
  conditions?: ((ctx: UserContext, action: ResourceAction) => boolean)[];
  inheritFrom?: UserRole;
}

/**
 * Role hierarchy — higher roles inherit permissions from lower roles.
 * A user with 'SUPER_ADMIN' can do everything.
 */
const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  SUPER_ADMIN: ['ENTERPRISE_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'DESIGNER', 'CLIENT', 'VIEWER', 'GUEST'],
  ENTERPRISE_ADMIN: ['ORG_ADMIN', 'PROJECT_MANAGER', 'DESIGNER', 'CLIENT', 'VIEWER', 'GUEST'],
  ORG_ADMIN: ['PROJECT_MANAGER', 'DESIGNER', 'CLIENT', 'VIEWER', 'GUEST'],
  PROJECT_MANAGER: ['DESIGNER', 'CLIENT', 'VIEWER'],
  DESIGNER: ['CLIENT', 'VIEWER'],
  CLIENT: ['VIEWER'],
  VIEWER: ['GUEST'],
  GUEST: [],
};

/**
 * Base permission rules.
 * Each role grants a set of resources + actions.
 */
const PERMISSION_RULES: PermissionRule[] = [
  // Super Admin — all resources
  {
    role: 'SUPER_ADMIN',
    resource: '*',
    actions: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import'],
  },

  // Enterprise Admin
  {
    role: 'ENTERPRISE_ADMIN',
    resource: 'organizations',
    actions: ['read', 'update', 'manage'],
  },
  {
    role: 'ENTERPRISE_ADMIN',
    resource: 'org:settings',
    actions: ['read', 'update'],
  },
  {
    role: 'ENTERPRISE_ADMIN',
    resource: 'billing',
    actions: ['read', 'update', 'manage'],
  },

  // Org Admin
  {
    role: 'ORG_ADMIN',
    resource: 'projects',
    actions: ['create', 'read', 'update', 'manage'],
    conditions: [(ctx) => !!ctx.orgId],
  },
  {
    role: 'ORG_ADMIN',
    resource: 'users',
    actions: ['read', 'update', 'manage'],
    conditions: [(ctx) => !!ctx.orgId],
  },

  // Project Manager
  {
    role: 'PROJECT_MANAGER',
    resource: 'projects',
    actions: ['read', 'update'],
    conditions: [(ctx) => !!ctx.projectId],
  },
  {
    role: 'PROJECT_MANAGER',
    resource: 'project:deliverables',
    actions: ['create', 'read', 'update', 'delete'],
  },

  // Designer
  {
    role: 'DESIGNER',
    resource: 'projects',
    actions: ['read'],
    conditions: [(ctx) => !!ctx.projectId],
  },
  {
    role: 'DESIGNER',
    resource: '3d_scenes',
    actions: ['create', 'read', 'update', 'export'],
  },
  {
    role: 'DESIGNER',
    resource: 'assets',
    actions: ['create', 'read', 'update'],
  },

  // Client
  {
    role: 'CLIENT',
    resource: 'projects',
    actions: ['read'],
    conditions: [(ctx) => !!ctx.projectId],
  },
  {
    role: 'CLIENT',
    resource: 'project:deliverables',
    actions: ['read', 'download'],
  },

  // Viewer / Guest
  {
    role: 'VIEWER',
    resource: 'projects',
    actions: ['read'],
  },
  {
    role: 'GUEST',
    resource: 'tours',
    actions: ['read'],
    conditions: [(ctx) => !!(ctx.attributes?.allow_guest_tours)],
  },
];

/**
 * Check if a user can perform an action on a resource.
 * Uses ABAC + role hierarchy + permission inheritance.
 */
export function canUser(
  ctx: UserContext,
  action: ResourceAction,
): boolean {
  // Validate the request shape
  try {
    ResourceActionSchema.parse(action);
  } catch {
    return false;
  }

  // Explicit overrides (e.g. from DB)
  const explicit = ctx.permissions?.includes(`${action.resource}:${action.action}`) ||
    ctx.permissions?.includes(`${action.resource}:*`);
  if (explicit) return true;

  const allRoles = [ctx.role, ...(ROLE_HIERARCHY[ctx.role] ?? [])];

  for (const rule of PERMISSION_RULES) {
    // If the user's role (or any inherited role) matches
    if (!allRoles.includes(rule.role)) continue;

    // Resource must match or wildcard
    if (rule.resource !== '*' && rule.resource !== action.resource) continue;

    // Action must be allowed
    if (!rule.actions.includes(action.action) && !rule.actions.includes('*')) continue;

    // Conditions must all pass
    if (rule.conditions) {
      const allPass = rule.conditions.every((cond) => cond(ctx, action));
      if (!allPass) continue;
    }

    return true;
  }

  return false;
}

/**
 * Check multiple permissions at once — returns first failure.
 */
export function requireAll(ctx: UserContext, actions: ResourceAction[]): { allowed: boolean; failed?: ResourceAction } {
  for (const a of actions) {
    if (!canUser(ctx, a)) return { allowed: false, failed: a };
  }
  return { allowed: true };
}

/**
 * Get all resources a user role can access.
 */
export function getAccessibleResources(ctx: UserContext, action: string): string[] {
  const allRoles = [ctx.role, ...(ROLE_HIERARCHY[ctx.role] ?? [])];
  const resources = new Set<string>();
  for (const rule of PERMISSION_RULES) {
    if (!allRoles.includes(rule.role)) continue;
    if (!rule.actions.includes(action) && !rule.actions.includes('*')) continue;
    const matches = rule.conditions ? rule.conditions.every((c) => c(ctx, { resource: rule.resource, action })) : true;
    if (matches) resources.add(rule.resource);
  }
  return [...resources];
}

export const rbac = { canUser, requireAll, getAccessibleResources };
export default rbac;
