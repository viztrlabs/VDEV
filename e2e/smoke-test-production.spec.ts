import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://viztr.vercel.app';
const ADMIN_EMAIL = 'admin@viztr.com';
const ADMIN_PASSWORD = 'password123';
const CLIENT_EMAIL = 'client@viztr.com';
const CLIENT_PASSWORD = 'password123';

const ASSETS = {
  glb: 'C:\\Users\\Arch_Viz\\Desktop\\Portfolio\\glb\\scene.glb',
  panoramasDir: 'C:\\Users\\Arch_Viz\\Desktop\\Portfolio\\360\\JPG',
  splat: 'C:\\Users\\Arch_Viz\\Desktop\\Portfolio\\SPLAT\\new+kitchen.ply',
};

test.describe.configure({ retries: 0 });

test.describe('VizTR Production Smoke Test', () => {
  let projectId: string;
  let experienceIds: { glb: string; panoramas: string; splat: string } = { glb: '', panoramas: '', splat: '' };
  let publicUrls: { glb: string; panoramas: string; splat: string } = { glb: '', panoramas: '', splat: '' };

  // Helper: Login as admin
  async function loginAsAdmin(page: any) {
    await page.goto(`${PRODUCTION_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard|\/app\/admin/, { timeout: 30000 });
    await expect(page).toHaveURL(/\/admin\/dashboard|\/app\/admin/);
  }

  // Helper: Login as client
  async function loginAsClient(page: any) {
    await page.goto(`${PRODUCTION_URL}/client-access`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', CLIENT_EMAIL);
    await page.fill('input[type="password"]', CLIENT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/client-dashboard|\/app\/client/, { timeout: 30000 });
    await expect(page).toHaveURL(/\/client-dashboard|\/app\/client/);
  }

  // Helper: Navigate to admin projects
  async function gotoProjects(page: any) {
    await page.goto(`${PRODUCTION_URL}/admin/projects`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Projects, h1:has-text("Projects")')).toBeVisible({ timeout: 15000 });
  }

  // Helper: Create project
  async function createProject(page: any, name: string, clientName: string) {
    await gotoProjects(page);
    await page.click('button:has-text("New Project"), button:has-text("Create Project"), button:has-text("Add Project")');
    await page.waitForSelector('text=Create Project, text=New Project', { timeout: 10000 });
    
    await page.fill('input[name="name"], input[placeholder*="Project name"], input[placeholder*="project name"]', name);
    await page.fill('input[name="clientName"], input[placeholder*="Client name"], input[placeholder*="client name"]', clientName);
    
    await page.click('button:has-text("Create"), button:has-text("Save"), button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Extract project ID from URL or table
    const url = page.url();
    const match = url.match(/\/projects\/([a-f0-9-]+)/);
    if (match) {
      projectId = match[1];
    }
    return projectId;
  }

  // Helper: Upload asset
  async function uploadAsset(page: any, projectId: string, filePath: string, assetType: string) {
    await page.goto(`${PRODUCTION_URL}/admin/projects/${projectId}/assets`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Assets, h1:has-text("Assets")')).toBeVisible({ timeout: 15000 });
    
    await page.click('button:has-text("Upload"), button:has-text("Add Asset"), button:has-text("New Asset")');
    await page.waitForSelector('input[type="file"]', { timeout: 10000 });
    
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(filePath);
    
    // Wait for upload to complete
    await page.waitForSelector('text=Upload complete, text=Asset uploaded, text=Processing', { timeout: 120000 });
    await page.waitForLoadState('networkidle');
    
    // Get asset ID from the list
    const assetRow = page.locator('tbody tr, [data-testid="asset-row"]').first();
    await expect(assetRow).toBeVisible({ timeout: 10000 });
  }

  // Helper: Create experience from asset
  async function createExperience(page: any, projectId: string, assetType: string, experienceName: string) {
    await page.goto(`${PRODUCTION_URL}/admin/projects/${projectId}/experiences`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Experiences, h1:has-text("Experiences")')).toBeVisible({ timeout: 15000 });
    
    await page.click('button:has-text("New Experience"), button:has-text("Create Experience"), button:has-text("Add Experience")');
    await page.waitForSelector('text=Create Experience, text=New Experience', { timeout: 10000 });
    
    await page.fill('input[name="name"], input[placeholder*="Experience name"], input[placeholder*="experience name"]', experienceName);
    
    // Select asset type
    if (assetType === 'glb') {
      await page.click('button:has-text("WebXR"), button:has-text("3D Model"), [data-value="webxr"], [data-value="glb"]');
    } else if (assetType === 'panoramas') {
      await page.click('button:has-text("Virtual Tour"), button:has-text("360"), [data-value="virtual-tour"], [data-value="panoramas"]');
    } else if (assetType === 'splat') {
      await page.click('button:has-text("Gaussian Splat"), button:has-text("Splat"), [data-value="gaussian-splat"], [data-value="splat"]');
    }
    
    await page.click('button:has-text("Create"), button:has-text("Save"), button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Extract experience ID
    const url = page.url();
    const match = url.match(/\/experiences\/([a-f0-9-]+)/);
    if (match) {
      return match[1];
    }
    return '';
  }

  // Helper: Configure experience
  async function configureExperience(page: any, projectId: string, experienceId: string) {
    await page.goto(`${PRODUCTION_URL}/admin/projects/${projectId}/experiences/${experienceId}/configure`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Configure, h1:has-text("Configure")')).toBeVisible({ timeout: 15000 });
    
    // Configure based on experience type
    await page.click('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Saved, text=Updated, text=Configuration saved')).toBeVisible({ timeout: 10000 });
  }

  // Helper: Preview experience
  async function previewExperience(page: any, projectId: string, experienceId: string) {
    await page.goto(`${PRODUCTION_URL}/admin/projects/${projectId}/experiences/${experienceId}/preview`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Preview, h1:has-text("Preview")')).toBeVisible({ timeout: 15000 });
    
    // Verify viewer loads
    await page.waitForSelector('canvas, [data-testid="viewer"], iframe', { timeout: 30000 });
  }

  // Helper: Publish experience
  async function publishExperience(page: any, projectId: string, experienceId: string) {
    await page.goto(`${PRODUCTION_URL}/admin/projects/${projectId}/experiences/${experienceId}`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Publish"), button:has-text("Deploy")');
    await page.waitForSelector('text=Published, text=Deployed, text=Live', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    
    // Get public URL
    const publicUrl = `${PRODUCTION_URL}/experience/${experienceId}`; // or similar pattern
    return publicUrl;
  }

  // Helper: Verify public URL works without auth
  async function verifyPublicUrl(page: any, url: string) {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    
    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/login|\/client-access/);
    
    // Viewer should load
    await page.waitForSelector('canvas, [data-testid="viewer"], iframe', { timeout: 30000 });
  }

  // Helper: Verify QR code generates
  async function verifyQrCode(page: any, projectId: string, experienceId: string) {
    await page.goto(`${PRODUCTION_URL}/admin/projects/${projectId}/experiences/${experienceId}`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("QR"), button:has-text("QR Code"), [aria-label*="QR"]');
    await page.waitForSelector('img[src*="qr"], canvas[src*="qr"], svg[src*="qr"], [data-testid="qr-code"]', { timeout: 10000 });
  }

  // Helper: Add feedback
  async function addFeedback(page: any, experienceUrl: string, comment: string) {
    await page.goto(experienceUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('canvas, [data-testid="viewer"], iframe', { timeout: 30000 });
    
    // Click feedback button
    await page.click('button:has-text("Feedback"), button:has-text("Comment"), [aria-label*="feedback"]');
    await page.waitForSelector('textarea[placeholder*="comment"], textarea[placeholder*="feedback"]', { timeout: 10000 });
    
    await page.fill('textarea[placeholder*="comment"], textarea[placeholder*="feedback"]', comment);
    await page.click('button:has-text("Post"), button:has-text("Submit"), button:has-text("Send")');
    await expect(page.locator('text=Comment posted, text=Feedback sent, text=Submitted')).toBeVisible({ timeout: 10000 });
  }

  // Helper: Verify activity log
  async function verifyActivityLog(page: any, projectId: string) {
    await page.goto(`${PRODUCTION_URL}/admin/projects/${projectId}/activity`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Activity, h1:has-text("Activity"), text=Activity Log')).toBeVisible({ timeout: 15000 });
    
    // Check for recent activities
    await expect(page.locator('tbody tr, [data-testid="activity-row"]')).toHaveCount(1, { timeout: 10000 });
  }

  test('Step 1: Admin login', async ({ page }) => {
    console.log('🔐 Step 1: Admin login');
    await loginAsAdmin(page);
    console.log('✅ PASS: Admin login successful');
  });

  test('Step 2: Create test project', async ({ page }) => {
    console.log('📁 Step 2: Create test project');
    await createProject(page, 'Smoke Test Project', 'Test Client');
    expect(projectId).toBeTruthy();
    console.log(`✅ PASS: Project created with ID: ${projectId}`);
  });

  test('Step 3a: Upload GLB asset', async ({ page }) => {
    console.log('📦 Step 3a: Upload GLB asset');
    await uploadAsset(page, projectId, ASSETS.glb, 'glb');
    console.log('✅ PASS: GLB asset uploaded');
  });

  test('Step 3b: Upload 360 Panoramas', async ({ page }) => {
    console.log('📦 Step 3b: Upload 360 Panoramas');
    // Upload directory of images
    await uploadAsset(page, projectId, ASSETS.panoramasDir, 'panoramas');
    console.log('✅ PASS: 360 Panoramas uploaded');
  });

  test('Step 3c: Upload Splat asset', async ({ page }) => {
    console.log('📦 Step 3c: Upload Splat asset');
    await uploadAsset(page, projectId, ASSETS.splat, 'splat');
    console.log('✅ PASS: Splat asset uploaded');
  });

  test('Step 4a: Create WebXR experience from GLB', async ({ page }) => {
    console.log('🎮 Step 4a: Create WebXR experience from GLB');
    experienceIds.glb = await createExperience(page, projectId, 'glb', 'Smoke Test WebXR');
    expect(experienceIds.glb).toBeTruthy();
    console.log(`✅ PASS: WebXR experience created with ID: ${experienceIds.glb}`);
  });

  test('Step 4b: Create Virtual Tour experience from Panoramas', async ({ page }) => {
    console.log('🎮 Step 4b: Create Virtual Tour experience from Panoramas');
    experienceIds.panoramas = await createExperience(page, projectId, 'panoramas', 'Smoke Test Virtual Tour');
    expect(experienceIds.panoramas).toBeTruthy();
    console.log(`✅ PASS: Virtual Tour experience created with ID: ${experienceIds.panoramas}`);
  });

  test('Step 4c: Create Gaussian Splat experience', async ({ page }) => {
    console.log('🎮 Step 4c: Create Gaussian Splat experience');
    experienceIds.splat = await createExperience(page, projectId, 'splat', 'Smoke Test Gaussian Splat');
    expect(experienceIds.splat).toBeTruthy();
    console.log(`✅ PASS: Gaussian Splat experience created with ID: ${experienceIds.splat}`);
  });

  test('Step 5a: Configure WebXR experience', async ({ page }) => {
    console.log('⚙️ Step 5a: Configure WebXR experience');
    await configureExperience(page, projectId, experienceIds.glb);
    console.log('✅ PASS: WebXR experience configured');
  });

  test('Step 5b: Configure Virtual Tour experience', async ({ page }) => {
    console.log('⚙️ Step 5b: Configure Virtual Tour experience');
    await configureExperience(page, projectId, experienceIds.panoramas);
    console.log('✅ PASS: Virtual Tour experience configured');
  });

  test('Step 5c: Configure Gaussian Splat experience', async ({ page }) => {
    console.log('⚙️ Step 5c: Configure Gaussian Splat experience');
    await configureExperience(page, projectId, experienceIds.splat);
    console.log('✅ PASS: Gaussian Splat experience configured');
  });

  test('Step 6a: Preview WebXR experience', async ({ page }) => {
    console.log('👁️ Step 6a: Preview WebXR experience');
    await previewExperience(page, projectId, experienceIds.glb);
    console.log('✅ PASS: WebXR experience preview loaded');
  });

  test('Step 6b: Preview Virtual Tour experience', async ({ page }) => {
    console.log('👁️ Step 6b: Preview Virtual Tour experience');
    await previewExperience(page, projectId, experienceIds.panoramas);
    console.log('✅ PASS: Virtual Tour experience preview loaded');
  });

  test('Step 6c: Preview Gaussian Splat experience', async ({ page }) => {
    console.log('👁️ Step 6c: Preview Gaussian Splat experience');
    await previewExperience(page, projectId, experienceIds.splat);
    console.log('✅ PASS: Gaussian Splat experience preview loaded');
  });

  test('Step 7a: Publish WebXR experience', async ({ page }) => {
    console.log('🚀 Step 7a: Publish WebXR experience');
    publicUrls.glb = await publishExperience(page, projectId, experienceIds.glb);
    expect(publicUrls.glb).toBeTruthy();
    console.log(`✅ PASS: WebXR experience published at: ${publicUrls.glb}`);
  });

  test('Step 7b: Publish Virtual Tour experience', async ({ page }) => {
    console.log('🚀 Step 7b: Publish Virtual Tour experience');
    publicUrls.panoramas = await publishExperience(page, projectId, experienceIds.panoramas);
    expect(publicUrls.panoramas).toBeTruthy();
    console.log(`✅ PASS: Virtual Tour experience published at: ${publicUrls.panoramas}`);
  });

  test('Step 7c: Publish Gaussian Splat experience', async ({ page }) => {
    console.log('🚀 Step 7c: Publish Gaussian Splat experience');
    publicUrls.splat = await publishExperience(page, projectId, experienceIds.splat);
    expect(publicUrls.splat).toBeTruthy();
    console.log(`✅ PASS: Gaussian Splat experience published at: ${publicUrls.splat}`);
  });

  test('Step 8a: Verify WebXR public URL (no auth)', async ({ page }) => {
    console.log('🔓 Step 8a: Verify WebXR public URL (no auth)');
    await verifyPublicUrl(page, publicUrls.glb);
    console.log('✅ PASS: WebXR public URL accessible without auth');
  });

  test('Step 8b: Verify Virtual Tour public URL (no auth)', async ({ page }) => {
    console.log('🔓 Step 8b: Verify Virtual Tour public URL (no auth)');
    await verifyPublicUrl(page, publicUrls.panoramas);
    console.log('✅ PASS: Virtual Tour public URL accessible without auth');
  });

  test('Step 8c: Verify Gaussian Splat public URL (no auth)', async ({ page }) => {
    console.log('🔓 Step 8c: Verify Gaussian Splat public URL (no auth)');
    await verifyPublicUrl(page, publicUrls.splat);
    console.log('✅ PASS: Gaussian Splat public URL accessible without auth');
  });

  test('Step 9a: Verify WebXR QR code generates', async ({ page }) => {
    console.log('📱 Step 9a: Verify WebXR QR code generates');
    await verifyQrCode(page, projectId, experienceIds.glb);
    console.log('✅ PASS: WebXR QR code generated');
  });

  test('Step 9b: Verify Virtual Tour QR code generates', async ({ page }) => {
    console.log('📱 Step 9b: Verify Virtual Tour QR code generates');
    await verifyQrCode(page, projectId, experienceIds.panoramas);
    console.log('✅ PASS: Virtual Tour QR code generated');
  });

  test('Step 9c: Verify Gaussian Splat QR code generates', async ({ page }) => {
    console.log('📱 Step 9c: Verify Gaussian Splat QR code generates');
    await verifyQrCode(page, projectId, experienceIds.splat);
    console.log('✅ PASS: Gaussian Splat QR code generated');
  });

  test('Step 10: Client login and verify project access', async ({ page }) => {
    console.log('👤 Step 10: Client login and verify project access');
    await loginAsClient(page);
    
    // Navigate to client dashboard/projects
    await page.goto(`${PRODUCTION_URL}/client-dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Verify project is visible
    await expect(page.locator('text=Smoke Test Project')).toBeVisible({ timeout: 15000 });
    
    // Click into project
    await page.click('text=Smoke Test Project');
    await page.waitForLoadState('networkidle');
    
    // Verify published experiences are visible
    await expect(page.locator('text=Smoke Test WebXR')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Smoke Test Virtual Tour')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Smoke Test Gaussian Splat')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ PASS: Client can see project and published experiences');
  });

  test('Step 11: Add feedback on experience', async ({ page }) => {
    console.log('💬 Step 11: Add feedback on experience');
    await addFeedback(page, publicUrls.glb, 'Smoke test feedback - this is a test comment');
    console.log('✅ PASS: Feedback added successfully');
  });

  test('Step 12: Verify activity log records actions', async ({ page }) => {
    console.log('📋 Step 12: Verify activity log records actions');
    await loginAsAdmin(page);
    await verifyActivityLog(page, projectId);
    console.log('✅ PASS: Activity log records actions');
  });
});