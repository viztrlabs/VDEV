import { hasRouteAccess, getDefaultDashboard, getNavigationForRole, normalizeUserRole, UserRole } from '@/lib/rbac';
import { getDemoAuthUser } from '@/lib/auth';

describe('RBAC System', () => {
  describe('normalizeUserRole', () => {
    test('normalizes lowercase and uppercase role variants', () => {
      expect(normalizeUserRole('SUPER_ADMIN')).toBe('super_admin');
      expect(normalizeUserRole('super_admin')).toBe('super_admin');
      expect(normalizeUserRole('superadmin')).toBe('super_admin');
      expect(normalizeUserRole('ADMIN')).toBe('admin');
      expect(normalizeUserRole('admin')).toBe('admin');
      expect(normalizeUserRole('USER')).toBe('user');
      expect(normalizeUserRole('user')).toBe('user');
      expect(normalizeUserRole('creator')).toBe('user');
      expect(normalizeUserRole('CLIENT')).toBe('client');
      expect(normalizeUserRole('client')).toBe('client');
      expect(normalizeUserRole(null)).toBe('user');
      expect(normalizeUserRole(undefined)).toBe('user');
    });
  });

  describe('Demo Accounts for all 4 roles', () => {
    test('authenticates super_admin demo user', () => {
      const user = getDemoAuthUser('admin@viztr.com', 'password123');
      expect(user).toBeDefined();
      expect(user?.role).toBe('super_admin');
    });

    test('authenticates admin demo user', () => {
      const user = getDemoAuthUser('manager@viztr.com', 'password123');
      expect(user).toBeDefined();
      expect(user?.role).toBe('admin');
    });

    test('authenticates user / creator demo user', () => {
      const user = getDemoAuthUser('user@viztr.com', 'password123');
      expect(user).toBeDefined();
      expect(user?.role).toBe('user');
    });

    test('authenticates client demo user', () => {
      const user = getDemoAuthUser('client@viztr.com', 'password123');
      expect(user).toBeDefined();
      expect(user?.role).toBe('client');
    });
  });

  describe('Route Access and Redirection', () => {
    test('hasRouteAccess allows correct roles (case-insensitive)', () => {
      expect(hasRouteAccess('super_admin', '/app/super-admin')).toBe(true);
      expect(hasRouteAccess('SUPER_ADMIN', '/app/super-admin')).toBe(true);
      expect(hasRouteAccess('admin', '/app/admin')).toBe(true);
      expect(hasRouteAccess('ADMIN', '/app/admin')).toBe(true);
      expect(hasRouteAccess('user', '/app/user')).toBe(true);
      expect(hasRouteAccess('USER', '/app/user')).toBe(true);
      expect(hasRouteAccess('client', '/app/client')).toBe(true);
      expect(hasRouteAccess('CLIENT', '/app/client')).toBe(true);
    });

    test('hasRouteAccess denies unauthorized roles', () => {
      expect(hasRouteAccess('client', '/app/super-admin')).toBe(false);
      expect(hasRouteAccess('user', '/app/super-admin')).toBe(false);
      expect(hasRouteAccess('admin', '/app/super-admin')).toBe(false);
      expect(hasRouteAccess('client', '/app/admin')).toBe(false);
      expect(hasRouteAccess('user', '/app/admin')).toBe(false);
    });

    test('getDefaultDashboard returns correct routes for each role', () => {
      expect(getDefaultDashboard('super_admin')).toBe('/app/super-admin');
      expect(getDefaultDashboard('SUPER_ADMIN')).toBe('/app/super-admin');
      expect(getDefaultDashboard('admin')).toBe('/app/admin');
      expect(getDefaultDashboard('ADMIN')).toBe('/app/admin');
      expect(getDefaultDashboard('user')).toBe('/app/user');
      expect(getDefaultDashboard('USER')).toBe('/app/user');
      expect(getDefaultDashboard('client')).toBe('/app/client');
      expect(getDefaultDashboard('CLIENT')).toBe('/app/client');
    });

    test('getNavigationForRole returns correct nav items', () => {
      const superNav = getNavigationForRole('super_admin');
      expect(superNav.find(item => item.name === 'Organizations')).toBeDefined();
      expect(superNav.find(item => item.name === 'System Health')).toBeDefined();

      const adminNav = getNavigationForRole('admin');
      expect(adminNav.find(item => item.name === 'Projects')).toBeDefined();
      expect(adminNav.find(item => item.name === 'Leads')).toBeDefined();
      expect(adminNav.find(item => item.name === 'Settings')).toBeDefined();

      const userNav = getNavigationForRole('user');
      expect(userNav.find(item => item.name === 'Projects')).toBeDefined();
      expect(userNav.find(item => item.name === 'Assets')).toBeDefined();

      const clientNav = getNavigationForRole('client');
      expect(clientNav.find(item => item.name === 'Projects')).toBeDefined();
      expect(clientNav.find(item => item.name === 'Invoices')).toBeDefined();
    });
  });
});
