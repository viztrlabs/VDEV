import { test, expect } from '@playwright/test';

/**
 * Test authentication utilities
 */

const DEMO_CREDENTIALS = {
  super_admin: { email: 'admin@viztr.com', password: 'password123' },
  admin: { email: 'manager@viztr.com', password: 'password123' },
  user: { email: 'user@viztr.com', password: 'password123' },
  client: { email: 'client@viztr.com', password: 'password123' },
};

export async function login(page: any, role: keyof typeof DEMO_CREDENTIALS = 'super_admin') {
  const creds = DEMO_CREDENTIALS[role];
  await page.goto('/login');
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/dashboard|\/app\/(super-admin|admin|user|client)/);
}

export async function gotoAdminDashboard(page: any) {
  await page.goto('/admin/dashboard');
  await page.waitForLoadState('networkidle');
}

export async function selectSection(page: any, sectionId: string) {
  // Click sidebar item
  await page.click(`button:has-text("${sectionId}")`);
  await page.waitForTimeout(500); // Allow lazy loading
}

export async function waitForSectionContent(page: any) {
  await page.waitForSelector('main', { state: 'visible' });
  await page.waitForLoadState('networkidle');
}