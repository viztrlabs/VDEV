/**
 * VizTR Role-Based Access Control
 * 
 * Defines roles, permissions, and route access for the SaaS application.
 */

export type UserRole = 'super_admin' | 'admin' | 'user' | 'client';

export function normalizeUserRole(role?: string | null): UserRole {
  if (!role) return 'user';
  const clean = role.trim().toLowerCase().replace(/[-_\s]+/g, '_');
  if (clean === 'super_admin' || clean === 'superadmin') return 'super_admin';
  if (clean === 'admin' || clean === 'administrator') return 'admin';
  if (clean === 'client' || clean === 'customer') return 'client';
  if (clean === 'user' || clean === 'creator' || clean === 'member') return 'user';
  return 'user';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  avatar?: string;
  plan: 'starter' | 'professional' | 'enterprise';
}

export const roles: Record<UserRole, { label: string; description: string; color: string }> = {
  super_admin: { label: 'Super Admin', description: 'Platform-wide administration', color: 'purple' },
  admin: { label: 'Admin', description: 'Organization administration', color: 'blue' },
  user: { label: 'User', description: 'Project creator and collaborator', color: 'emerald' },
  client: { label: 'Client', description: 'Project reviewer and stakeholder', color: 'amber' },
};

// Route access control
export const routeAccess: Record<string, UserRole[]> = {
  // Super Admin routes
  '/app/super-admin': ['super_admin'],
  '/app/super-admin/organizations': ['super_admin'],
  '/app/super-admin/users': ['super_admin'],
  '/app/super-admin/admins': ['super_admin'],
  '/app/super-admin/clients': ['super_admin'],
  '/app/super-admin/projects': ['super_admin'],
  '/app/super-admin/storage': ['super_admin'],
  '/app/super-admin/billing': ['super_admin'],
  '/app/super-admin/analytics': ['super_admin'],
  '/app/super-admin/cms': ['super_admin'],
  '/app/super-admin/referrals': ['super_admin'],
  '/app/super-admin/system-health': ['super_admin'],
  '/app/super-admin/security': ['super_admin'],
  '/app/super-admin/api-integrations': ['super_admin'],
  '/app/super-admin/settings': ['super_admin'],

  // Admin routes
  '/app/admin': ['admin', 'super_admin'],
  '/app/admin/projects': ['admin', 'super_admin'],
  '/app/admin/leads': ['admin', 'super_admin'],
  '/app/admin/clients': ['admin', 'super_admin'],
  '/app/admin/team': ['admin', 'super_admin'],
  '/app/admin/quotes': ['admin', 'super_admin'],
  '/app/admin/invoices': ['admin', 'super_admin'],
  '/app/admin/payments': ['admin', 'super_admin'],
  '/app/admin/files': ['admin', 'super_admin'],
  '/app/admin/approvals': ['admin', 'super_admin'],
  '/app/admin/meetings': ['admin', 'super_admin'],
  '/app/admin/support': ['admin', 'super_admin'],
  '/app/admin/analytics': ['admin', 'super_admin'],
  '/app/admin/settings': ['admin', 'super_admin'],

  // User routes
  '/app/user': ['user', 'admin', 'super_admin'],
  '/app/user/projects': ['user', 'admin', 'super_admin'],
  '/app/user/projects/new': ['user', 'admin', 'super_admin'],
  '/app/user/files': ['user', 'admin', 'super_admin'],
  '/app/user/assets': ['user', 'admin', 'super_admin'],
  '/app/user/renders': ['user', 'admin', 'super_admin'],
  '/app/user/xr-experiences': ['user', 'admin', 'super_admin'],
  '/app/user/vizsplat': ['user', 'admin', 'super_admin'],
  '/app/user/editor': ['user', 'admin', 'super_admin'],
  '/app/user/shared': ['user', 'admin', 'super_admin'],
  '/app/user/team': ['user', 'admin', 'super_admin'],
  '/app/user/usage': ['user', 'admin', 'super_admin'],
  '/app/user/billing': ['user', 'admin', 'super_admin'],
  '/app/user/settings': ['user', 'admin', 'super_admin'],

  // Client routes (existing + enhanced)
  '/app/client': ['client', 'user', 'admin', 'super_admin'],
  '/app/client/projects': ['client', 'user', 'admin', 'super_admin'],
  '/app/client/meetings': ['client', 'user', 'admin', 'super_admin'],
  '/app/client/messages': ['client', 'user', 'admin', 'super_admin'],
  '/app/client/invoices': ['client', 'user', 'admin', 'super_admin'],
  '/app/client/payments': ['client', 'user', 'admin', 'super_admin'],
  '/app/client/support': ['client', 'user', 'admin', 'super_admin'],
  '/app/client/profile': ['client', 'user', 'admin', 'super_admin'],
};

/**
 * Check if a user role has access to a route
 */
export function hasRouteAccess(role: UserRole | string | null | undefined, route: string): boolean {
  const normalized = normalizeUserRole(role);
  // Find the most specific matching route
  const matchingRoutes = Object.keys(routeAccess).filter(r => route.startsWith(r));
  if (matchingRoutes.length === 0) return true; // Public route

  const mostSpecific = matchingRoutes.reduce((a, b) => a.length > b.length ? a : b);
  return routeAccess[mostSpecific].includes(normalized);
}

/**
 * Get the default dashboard route for a role
 */
export function getDefaultDashboard(role: UserRole | string | null | undefined): string {
  const normalized = normalizeUserRole(role);
  switch (normalized) {
    case 'super_admin': return '/app/super-admin';
    case 'admin': return '/app/admin';
    case 'user': return '/app/user';
    case 'client': return '/app/client';
    default: return '/app/user';
  }
}

/**
 * Get navigation items for a role
 */
export function getNavigationForRole(role: UserRole | string | null | undefined) {
  const normalized = normalizeUserRole(role);
  const baseNav = [
    { name: 'Dashboard', href: getDefaultDashboard(normalized), icon: 'LayoutDashboard' },
  ];

  switch (normalized) {
    case 'super_admin':
      return [
        ...baseNav,
        { name: 'Organizations', href: '/app/super-admin/organizations', icon: 'Building2' },
        { name: 'Users', href: '/app/super-admin/users', icon: 'Users' },
        { name: 'Admins', href: '/app/super-admin/admins', icon: 'Shield' },
        { name: 'Clients', href: '/app/super-admin/clients', icon: 'UserCheck' },
        { name: 'Projects', href: '/app/super-admin/projects', icon: 'FolderOpen' },
        { name: 'Storage', href: '/app/super-admin/storage', icon: 'Database' },
        { name: 'Billing', href: '/app/super-admin/billing', icon: 'CreditCard' },
        { name: 'Analytics', href: '/app/super-admin/analytics', icon: 'BarChart3' },
        { name: 'CMS', href: '/app/super-admin/cms', icon: 'FileText' },
        { name: 'Referrals', href: '/app/super-admin/referrals', icon: 'Gift' },
        { name: 'System Health', href: '/app/super-admin/system-health', icon: 'Activity' },
        { name: 'Security', href: '/app/super-admin/security', icon: 'ShieldAlert' },
        { name: 'API Integrations', href: '/app/super-admin/api-integrations', icon: 'Plug' },
        { name: 'Settings', href: '/app/super-admin/settings', icon: 'Settings' },
      ];

    case 'admin':
      return [
        ...baseNav,
        { name: 'Projects', href: '/app/admin/projects', icon: 'FolderOpen' },
        { name: 'Leads', href: '/app/admin/leads', icon: 'Target' },
        { name: 'Clients', href: '/app/admin/clients', icon: 'Users' },
        { name: 'Team', href: '/app/admin/team', icon: 'Users' },
        { name: 'Quotes', href: '/app/admin/quotes', icon: 'FileText' },
        { name: 'Invoices', href: '/app/admin/invoices', icon: 'Receipt' },
        { name: 'Payments', href: '/app/admin/payments', icon: 'CreditCard' },
        { name: 'Files', href: '/app/admin/files', icon: 'FolderOpen' },
        { name: 'Approvals', href: '/app/admin/approvals', icon: 'CheckCircle' },
        { name: 'Meetings', href: '/app/admin/meetings', icon: 'Calendar' },
        { name: 'Support', href: '/app/admin/support', icon: 'HelpCircle' },
        { name: 'Analytics', href: '/app/admin/analytics', icon: 'BarChart3' },
        { name: 'Settings', href: '/app/admin/settings', icon: 'Settings' },
      ];

    case 'user':
      return [
        ...baseNav,
        { name: 'Projects', href: '/app/user/projects', icon: 'FolderOpen' },
        { name: 'New Project', href: '/app/user/projects/new', icon: 'Plus' },
        { name: 'Files', href: '/app/user/files', icon: 'File' },
        { name: 'Assets', href: '/app/user/assets', icon: 'Box' },
        { name: 'Renders', href: '/app/user/renders', icon: 'Image' },
        { name: 'XR Experiences', href: '/app/user/xr-experiences', icon: 'Globe' },
        { name: 'VizSplat', href: '/app/user/vizsplat', icon: 'Sparkles' },
        { name: 'Editor', href: '/app/user/editor', icon: 'PenTool' },
        { name: 'Shared', href: '/app/user/shared', icon: 'Share2' },
        { name: 'Team', href: '/app/user/team', icon: 'Users' },
        { name: 'Usage', href: '/app/user/usage', icon: 'Activity' },
        { name: 'Billing', href: '/app/user/billing', icon: 'CreditCard' },
        { name: 'Settings', href: '/app/user/settings', icon: 'Settings' },
      ];

    case 'client':
      return [
        ...baseNav,
        { name: 'Projects', href: '/app/client/projects', icon: 'FolderOpen' },
        { name: 'Meetings', href: '/app/client/meetings', icon: 'Calendar' },
        { name: 'Messages', href: '/app/client/messages', icon: 'MessageSquare' },
        { name: 'Invoices', href: '/app/client/invoices', icon: 'Receipt' },
        { name: 'Payments', href: '/app/client/payments', icon: 'CreditCard' },
        { name: 'Support', href: '/app/client/support', icon: 'HelpCircle' },
        { name: 'Profile', href: '/app/client/profile', icon: 'User' },
      ];
    default:
      return baseNav;
  }
}

export const mockUser: User = {
  id: 'usr_1',
  name: 'John Doe',
  email: 'john@studio.com',
  role: 'user',
  organizationId: 'org_1',
  plan: 'professional',
};