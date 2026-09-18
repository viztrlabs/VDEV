const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const BASE = 'https://viztr.vercel.app';
  
  try {
    // Step 1: Navigate to login page
    await page.goto(`${BASE}/client-access`);
    await page.waitForLoadState('networkidle');
    
    // Step 2: Fill login form
    await page.fill('input[type="email"]', 'admin@viztr.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to admin dashboard
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    console.log('✅ Logged in');
    
    // Step 3: Create project
    await page.goto(`${BASE}/admin/projects`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("New"), button:has-text("Create"), button:has-text("Add")');
    await page.waitForTimeout(2000);
    
    await page.fill('input[name="name"], input[placeholder*="Project"]', 'BMW i8 XS Upload Test');
    await page.fill('input[name="clientName"], input[placeholder*="Client"]', 'BMW');
    await page.click('button[type="submit"], button:has-text("Create"), button:has-text("Save")');
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    const pidMatch = url.match(/\/projects\/([a-f0-9-]+)/);
    const pid = pidMatch ? pidMatch[1] : null;
    console.log(`✅ Project created: ${pid}`);
    
    if (!pid) {
      // Try extracting from page
      const projectText = await page.locator('text=BMW i8 XS Upload Test').first().textContent();
      console.log('Project name found on page:', projectText);
    }
    
    // Step 4: Upload GLB
    await page.goto(`${BASE}/admin/projects/${pid}/assets`);
    await page.waitForLoadState('networkidle');
    
    const fileInput = await page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('C:\\Users\\Arch_Viz\\Desktop\\Portfolio\\GLB\\bmw-i8-xs-2015\\source\\2015-bmw-i8_xs_car.glb');
    
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
    
    // Check if upload succeeded
    const uploadText = await page.locator('text=Uploaded, text=Asset uploaded, text=Complete').first().textContent();
    console.log(`✅ GLB uploaded: ${uploadText}`);
    
    // Step 5: Verify asset exists
    const assetRow = await page.locator('tr, [data-testid="asset-row"]').first();
    const assetVisible = await assetRow.isVisible();
    console.log(`Asset visible: ${assetVisible}`);
    
    await browser.close();
    console.log('DONE');
  } catch (e) {
    console.error('Error:', e.message);
    await browser.close();
  }
}

main();