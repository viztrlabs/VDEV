import { test, expect } from '@playwright/test';
import { login, gotoAdminDashboard, selectSection, waitForSectionContent } from './utils/auth';

test.describe('Booking System E2E', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'super_admin');
    await gotoAdminDashboard(page);
  });

  test('can navigate to bookings section', async ({ page }) => {
    await selectSection(page, 'All Bookings');
    await waitForSectionContent(page);
    
    await expect(page.locator('text=All Bookings')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=MEETINGS & BOOKINGS')).toBeVisible();
  });

  test('can view booking stats', async ({ page }) => {
    await selectSection(page, 'All Bookings');
    await waitForSectionContent(page);
    
    await expect(page.locator('text=Total')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=Approved')).toBeVisible();
  });

  test('can create new booking', async ({ page }) => {
    await selectSection(page, 'All Bookings');
    await waitForSectionContent(page);
    
    await page.click('button:has-text("New Booking")');
    await page.waitForSelector('text=Create New Booking', { timeout: 5000 });
    
    await page.fill('input[placeholder="Full name"]', 'Test Client');
    await page.fill('input[placeholder="client@example.com"]', 'test@example.com');
    await page.click('button:has-text("Create Booking")');
    
    await expect(page.locator('text=Booking created successfully')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Contact Form E2E', () => {
  test('contact form submits successfully', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[placeholder="Your name"]', 'E2E Test User');
    await page.fill('input[placeholder="your@email.com"]', 'e2e@test.com');
    await page.fill('textarea[placeholder="Tell us about your project..."]', 'E2E test message');
    await page.click('button[type="submit"]:has-text("Send Message")');
    
    await expect(page.locator('text=Thank you for reaching out')).toBeVisible({ timeout: 10000 });
  });

  test('admin can view contact submissions', async ({ page }) => {
    await login(page, 'super_admin');
    await gotoAdminDashboard(page);
    await selectSection(page, 'Contact Submissions');
    await waitForSectionContent(page);
    
    await expect(page.locator('text=Contact Submissions')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=INBOX')).toBeVisible();
  });
});

test.describe('Client Authentication E2E', () => {
  test('client can login with access code', async ({ page }) => {
    await page.goto('/client-access');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[placeholder="e.g. FST-2025-VTR"]', 'FST-2025-VTR');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button:has-text("Track Project")');
    
    await page.waitForURL(/\/client-dashboard|\/app\/client/, { timeout: 10000 });
  });

  test('unauthenticated client redirected to login', async ({ page }) => {
    await page.goto('/client-dashboard');
    await page.waitForURL(/\/client-access/, { timeout: 10000 });
  });
});

test.describe('File Downloads E2E', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'client');
    await page.goto('/client-dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('files tab shows project files', async ({ page }) => {
    await page.click('button:has-text("Files & Documents")');
    await waitForSectionContent(page);
    
    await expect(page.locator('text=Project Files')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Chat/Comments E2E', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'client');
    await page.goto('/client-dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('feedback tab shows comments section', async ({ page }) => {
    await page.click('button:has-text("Feedback")');
    await waitForSectionContent(page);
    
    await expect(page.locator('text=Threaded Comments')).toBeVisible({ timeout: 10000 });
  });

  test('can post a comment', async ({ page }) => {
    await page.click('button:has-text("Feedback")');
    await waitForSectionContent(page);
    
    await page.fill('textarea[placeholder="Add a comment..."]', 'E2E test comment');
    await page.click('button:has-text("Post Comment")');
    
    await expect(page.locator('text=E2E test comment')).toBeVisible({ timeout: 10000 });
  });
});
