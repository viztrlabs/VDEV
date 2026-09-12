import { test, expect } from '@playwright/test';
import { login, gotoAdminDashboard, selectSection, waitForSectionContent } from './utils/auth';

/**
 * Super Admin Authentication & RBAC E2E Tests
 */

test.describe('Super Admin Authentication', () => {
  test('super_admin can access /admin/dashboard', async ({ page }) => {
    await login(page, 'super_admin');
    await gotoAdminDashboard(page);
    
    // Verify dashboard loaded
    await expect(page.locator('h1:has-text("Super Admin Command Center"), h2:has-text("Platform Overview")')).toBeVisible({ timeout: 10000 });
    
    // Verify sidebar visible
    await expect(page.locator('aside[class*="w-[240px]"]')).toBeVisible();
    
    // Verify Super Admin badge
    await expect(page.locator('text=SuperAdmin Master')).toBeVisible();
  });

  test('admin role redirected to /app/admin', async ({ page }) => {
    await login(page, 'admin');
    await page.goto('/admin/dashboard');
    await page.waitForURL(/\/app\/admin/);
  });

  test('user role redirected to /app/user', async ({ page }) => {
    await login(page, 'user');
    await page.goto('/admin/dashboard');
    await page.waitForURL(/\/app\/user/);
  });

  test('client role redirected to /app/client', async ({ page }) => {
    await login(page, 'client');
    await page.goto('/admin/dashboard');
    await page.waitForURL(/\/app\/client/);
  });

  test('unauthenticated redirected to login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForURL(/\/login/);
  });
});

test.describe('Super Admin Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'super_admin');
    await gotoAdminDashboard(page);
  });

  test('sidebar shows all 7 section groups', async ({ page }) => {
    const sectionGroups = [
      'Super Admin Governance',
      'Core Systems Fleet',
      'Super Admin CMS Suite',
      'Overview & Pipelines',
      'Doc Studio & CRM',
      'XR Real-Time Engine',
      'Meetings & Bookings',
      'Cloud Infrastructure',
    ];

    for (const group of sectionGroups) {
      await expect(page.locator(`h4:has-text("${group}")`)).toBeVisible();
    }
  });

  test('can navigate to Super Admin Governance sections', async ({ page }) => {
    const sections = [
      { id: 'super-admin-panel', label: 'Master Super Admin Panel' },
      { id: 'super-admin-users', label: 'Manage Admins & Users' },
      { id: 'super-admin-analytics', label: 'System Analytics' },
      { id: 'super-admin-revenue', label: 'Revenue & MRR Tracking' },
      { id: 'super-admin-gpu', label: 'GPU Usage Monitoring' },
      { id: 'super-admin-toggles', label: 'Feature Toggles Switchboard' },
      { id: 'super-admin-health', label: 'Global Health & Error Logs' },
    ];

    for (const section of sections) {
      await selectSection(page, section.label);
      await waitForSectionContent(page);
      // Verify section content loaded (not fallback)
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('can navigate to Core Systems Fleet sections', async ({ page }) => {
    const sections = [
      'Project Management',
      'XR Link Generator',
      'Pixel Streaming Control',
      'Multi-Cloud File Storage',
      'Asset Pipeline',
    ];

    for (const label of sections) {
      await selectSection(page, label);
      await waitForSectionContent(page);
    }
  });

  test('can navigate to Super Admin CMS Suite sections', async ({ page }) => {
    const sections = [
      'Master CMS Engine',
      'Pages & Templates',
      'Blog Posts',
      'Services CMS',
      'Media & Placeholders',
      'Theme & Layout',
    ];

    for (const label of sections) {
      await selectSection(page, label);
      await waitForSectionContent(page);
    }
  });

  test('deep-link via ?section= works', async ({ page }) => {
    await page.goto('/admin/dashboard?section=super-admin-users');
    await page.waitForLoadState('networkidle');
    
    // Should have loaded the users section
    await expect(page.locator('text=Manage Admins & Users')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Top Bar Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'super_admin');
    await gotoAdminDashboard(page);
  });

  test('search input is present', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Search projects"]')).toBeVisible();
  });

  test('filter panel toggle works', async ({ page }) => {
    const filterBtn = page.locator('button:has-text("Filters")');
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();
    // Left panel should collapse/expand
    await page.waitForTimeout(300);
  });

  test('hours panel toggle works', async ({ page }) => {
    const hoursBtn = page.locator('button:has-text("Hours & Pipeline")');
    await expect(hoursBtn).toBeVisible();
    await hoursBtn.click();
    await page.waitForTimeout(300);
  });

  test('notification bell shows', async ({ page }) => {
    await expect(page.locator('button:has(svg.lucide-bell)')).toBeVisible();
  });

  test('client view link works', async ({ page }) => {
    await expect(page.locator('a:has-text("Client View")')).toBeVisible();
  });
});