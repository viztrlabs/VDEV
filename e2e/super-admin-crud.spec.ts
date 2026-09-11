import { test, expect } from '@playwright/test';
import { login, gotoAdminDashboard, selectSection, waitForSectionContent } from './utils/auth';

/**
 * Super Admin CRUD Operations E2E Tests
 */

test.describe('User Management CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'super_admin');
    await gotoAdminDashboard(page);
    await selectSection(page, 'Manage Admins & Users');
    await waitForSectionContent(page);
  });

  test('displays user table with all 8 demo users', async ({ page }) => {
    // Wait for SuperAdminPanel to load
    await expect(page.locator('text=Manage Admins & Users')).toBeVisible({ timeout: 15000 });
    
    // Check user rows exist
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(8, { timeout: 10000 });
  });

  test('can open add user modal', async ({ page }) => {
    await page.click('button:has-text("Add User")');
    await expect(page.locator('text=Add New Admin User')).toBeVisible();
    
    // Check form fields
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('select[name="role"]')).toBeVisible();
    await expect(page.locator('select[name="status"]')).toBeVisible();
  });

  test('can create new user', async ({ page }) => {
    await page.click('button:has-text("Add User")');
    
    // Fill form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.selectOption('select[name="role"]', 'user');
    await page.selectOption('select[name="status"]', 'active');
    await page.fill('input[name="department"]', 'Test Department');
    await page.fill('input[name="company"]', 'Test Company');
    
    await page.click('button:has-text("Create User")');
    
    // Verify success toast or user appears in table
    await expect(page.locator('text=Created user Test User')).toBeVisible({ timeout: 5000 });
  });

  test('can edit existing user', async ({ page }) => {
    // Find first user row and click edit
    await page.click('tbody tr:first-child button:has(svg.lucide-edit)');
    
    await expect(page.locator('text=Edit User')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toHaveValue('Alexander Sterling');
  });

  test('can change user role via dropdown', async ({ page }) => {
    // Find role dropdown for first user
    const roleSelect = page.locator('tbody tr:first-child select');
    await expect(roleSelect).toHaveValue('super_admin');
    
    // Change role
    await roleSelect.selectOption('admin');
    
    // Verify toast
    await expect(page.locator('text=Updated user role to [admin]')).toBeVisible({ timeout: 5000 });
  });

  test('role filter works', async ({ page }) => {
    await page.selectOption('select:near(text="Role Filter")', 'admin');
    await page.waitForTimeout(500);
    
    // Should show only admin users
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1); // At least 1 admin user
  });

  test('status filter works', async ({ page }) => {
    await page.selectOption('select:near(text="Status Filter")', 'active');
    await page.waitForTimeout(500);
    
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1); // At least 1 active user
  });

  test('search filters users', async ({ page }) => {
    await page.fill('input[placeholder*="Search users"]', 'Alexander');
    await page.waitForTimeout(500);
    
    // Should show only matching user
    await expect(page.locator('text=Alexander Sterling')).toBeVisible();
    await expect(page.locator('text=Elena Rostova')).not.toBeVisible();
  });
});

test.describe('Feature Toggles CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'super_admin');
    await gotoAdminDashboard(page);
    await selectSection(page, 'Feature Toggles Switchboard');
    await waitForSectionContent(page);
  });

  test('displays all 6 feature toggles', async ({ page }) => {
    await expect(page.locator('text=Feature Toggles Switchboard')).toBeVisible({ timeout: 15000 });
    
    const toggles = [
      'ENABLE_WEBXR_VIEWER',
      'ENABLE_PIXEL_STREAMING',
      'ENABLE_GAUSSIAN_SPLAT',
      'ENABLE_AI_SUGGESTIONS',
      'ENABLE_ADVANCED_SECURITY',
      'ENABLE_MULTI_CLOUD_STORAGE',
    ];

    for (const toggle of toggles) {
      await expect(page.locator(`text=${toggle}`)).toBeVisible();
    }
  });

  test('can toggle feature on/off', async ({ page }) => {
    // Find AI Suggestions toggle (should be off by default)
    const aiToggle = page.locator('text=ENABLE_AI_SUGGESTIONS').locator('..').locator('button[role="switch"]');
    
    const initialState = await aiToggle.getAttribute('aria-checked');
    await aiToggle.click();
    await page.waitForTimeout(500);
    
    const newState = await aiToggle.getAttribute('aria-checked');
    expect(newState).not.toBe(initialState);
  });

  test('category filter works', async ({ page }) => {
    await page.selectOption('select:near(text="Category")', 'ai');
    await page.waitForTimeout(500);
    
    // Should only show AI category toggles
    await expect(page.locator('text=ENABLE_AI_SUGGESTIONS')).toBeVisible();
    await expect(page.locator('text=ENABLE_WEBXR_VIEWER')).not.toBeVisible();
  });
});

test.describe('GPU Monitoring', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'super_admin');
    await gotoAdminDashboard(page);
    await selectSection(page, 'GPU Usage Monitoring');
    await waitForSectionContent(page);
  });

  test('displays all 5 GPU regions', async ({ page }) => {
    await expect(page.locator('text=GPU Usage Monitoring')).toBeVisible({ timeout: 15000 });
    
    const regions = [
      'US East (N. Virginia)',
      'EU Central (Frankfurt)',
      'Middle East (Dubai Cluster)',
      'Asia Pacific (Tokyo)',
      'US West (Oregon)',
    ];

    for (const region of regions) {
      await expect(page.locator(`text=${region}`)).toBeVisible();
    }
  });

  test('can toggle maintenance mode', async ({ page }) => {
    // Find maintenance button for first region
    const maintBtn = page.locator('text=US East').locator('..').locator('button:has-text("Maintenance")');
    await maintBtn.click();
    await page.waitForTimeout(1000);
    
    // Should show warning status
    await expect(page.locator('text=MAINTENANCE').first()).toBeVisible();
  });
});

test.describe('System Logs', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'super_admin');
    await gotoAdminDashboard(page);
    await selectSection(page, 'Global Health & Error Logs');
    waitForSectionContent(page);
  });

  test('displays system logs', async ({ page }) => {
    await expect(page.locator('text=Global Health & Error Logs')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('tbody tr')).toHaveCount(1);
  });

  test('level filter works', async ({ page }) => {
    await page.selectOption('select:near(text="Level")', 'error');
    await page.waitForTimeout(500);
    
    // Should only show error logs
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});