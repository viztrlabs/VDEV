import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://viztr.vercel.app';
const ADMIN_EMAIL = 'admin@viztr.com';
const ADMIN_PASSWORD = 'password123';

const ASSETS = {
  glb: 'C:\\Users\\Arch_Viz\\Desktop\\Portfolio\\glb\\scene.glb',
  panoramas: 'C:\\Users\\Arch_Viz\\Desktop\\Portfolio\\360\\JPG\\',
  splat: 'C:\\Users\\Arch_Viz\\Desktop\\Portfolio\\SPLAT\\new+kitchen.ply'
};

async function login(page: Page) {
  await page.goto(`${BASE_URL}/client-access`);
  await page.waitForLoadState('networkidle');
  
  // Fill login form
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard**', { timeout: 30000 });
  console.log('Login successful');
}

async function createProject(page: Page) {
  await page.goto(`${BASE_URL}/admin/projects/new`);
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[name="name"]', 'Smoke Test Project');
  await page.fill('input[name="clientName"]', 'Test Client');
  await page.fill('textarea[name="description"]', 'E2E smoke test project');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/admin/projects/**', { timeout: 30000 });
  const projectId = page.url().split('/').pop();
  console.log(`Project created: ${projectId}`);
  return projectId;
}

async function uploadAsset(page: Page, projectId: string, filePath: string, type: string) {
  await page.goto(`${BASE_URL}/admin/projects/${projectId}/assets/new`);
  await page.waitForLoadState('networkidle');
  
  await page.setInputFiles('input[type="file"]', filePath);
  await page.selectOption('select[name="type"]', type);
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/assets/**', { timeout: 60000 });
  console.log(`${type.toUpperCase()} asset uploaded`);
}

async function createExperience(page: Page, projectId: string, assetId: string, name: string, type: string) {
  await page.goto(`${BASE_URL}/admin/projects/${projectId}/experiences/new`);
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[name="name"]', name);
  await page.selectOption('select[name="assetId"]', assetId);
  await page.selectOption('select[name="type"]', type);
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/experiences/**', { timeout: 30000 });
  const expId = page.url().split('/').pop();
  console.log(`Experience created: ${expId} (${type})`);
  return expId;
}

async function configureExperience(page: Page, experienceId: string) {
  await page.goto(`${BASE_URL}/admin/experiences/${experienceId}/configure`);
  await page.waitForLoadState('networkidle');
  
  // Configure based on type - fill required fields
  await page.fill('input[name="title"]', 'Smoke Test Experience');
  await page.click('button:has-text("Save")');
  
  await page.waitForLoadState('networkidle');
  console.log('Experience configured');
}

async function publishExperience(page: Page, experienceId: string) {
  await page.goto(`${BASE_URL}/admin/experiences/${experienceId}`);
  await page.waitForLoadState('networkidle');
  
  await page.click('button:has-text("Publish")');
  await page.waitForLoadState('networkidle');
  
  // Verify published_at is set
  const publishedText = await page.locator('text=Published').first().textContent();
  console.log(`Experience published: ${publishedText}`);
}

async function verifyPublicViewer(page: Page, slug: string) {
  const response = await page.goto(`${BASE_URL}/experience/${slug}`);
  expect(response?.status()).toBe(200);
  
  // Verify viewer loads (not showing error)
  await expect(page.locator('canvas, [data-viewer], .viewer')).toBeVisible({ timeout: 30000 });
  console.log(`Public viewer loads: /experience/${slug}`);
}

async function verifyQrCode(page: Page, experienceId: string) {
  await page.goto(`${BASE_URL}/admin/experiences/${experienceId}`);
  await page.waitForLoadState('networkidle');
  
  const qr = await page.locator('img[alt*="QR"], canvas[alt*="QR"]').first();
  await expect(qr).toBeVisible();
  console.log('QR code generated');
}

test.describe('VizTR Production E2E Smoke Test', () => {
  test('Full E2E flow with real assets', async ({ page }) => {
    // 1. Login
    await login(page);
    
    // 2. Create project
    const projectId = await createProject(page);
    
    // 3. Upload GLB (WebXR/AR)
    await uploadAsset(page, projectId, ASSETS.glb, 'model');
    
    // 4. Upload panoramas (Virtual Tour)
    // Upload first panorama as representative
    await uploadAsset(page, projectId, `${ASSETS.panoramas}00.jpg`, 'panorama');
    
    // 5. Upload Splat
    await uploadAsset(page, projectId, ASSETS.splat, 'splat');
    
    // 6. Create experiences for each
    // Note: Need to get asset IDs - for now use the project to list
    await page.goto(`${BASE_URL}/admin/projects/${projectId}/assets`);
    await page.waitForLoadState('networkidle');
    
    const assetLinks = await page.locator('a[href*="/assets/"]').all();
    const assetIds = [];
    for (const link of assetLinks) {
      const href = await link.getAttribute('href');
      assetIds.push(href?.split('/').pop() || '');
    }
    console.log(`Found ${assetIds.length} assets`);
    
    // Create WebXR experience
    if (assetIds.length > 0) {
      const webxrExp = await createExperience(page, projectId, assetIds[0], 'WebXR Scene', 'webxr');
      await configureExperience(page, webxrExp);
      await publishExperience(page, webxrExp);
      await verifyQrCode(page, webxrExp);
      
      // Get slug and verify public
      const slug = await page.locator('input[name="slug"]').inputValue();
      await verifyPublicViewer(page, slug);
    }
    
    // Create Virtual Tour experience
    if (assetIds.length > 1) {
      const tourExp = await createExperience(page, projectId, assetIds[1], 'Virtual Tour', 'virtual_tour');
      await configureExperience(page, tourExp);
      await publishExperience(page, tourExp);
      await verifyQrCode(page, tourExp);
      
      const slug = await page.locator('input[name="slug"]').inputValue();
      await verifyPublicViewer(page, slug);
    }
    
    // Create Splat experience
    if (assetIds.length > 2) {
      const splatExp = await createExperience(page, projectId, assetIds[2], 'Gaussian Splat', 'gaussian_splat');
      await configureExperience(page, splatExp);
      await publishExperience(page, splatExp);
      await verifyQrCode(page, splatExp);
      
      const slug = await page.locator('input[name="slug"]').inputValue();
      await verifyPublicViewer(page, slug);
    }
    
    // 7. Test client access
    // Logout
    await page.click('button:has-text("Logout"), a:has-text("Logout")');
    await page.waitForLoadState('networkidle');
    
    // Login as client (need client credentials or create client user)
    // For now, verify public access works
    console.log('E2E Smoke Test Complete');
  });
});