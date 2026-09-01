//!/usr/bin/env node
/**
 * Phase 2 Development Setup Script
 *
 * This script initializes the Phase 2 development environment by:
 * 1. Installing new dependencies for WebXR, WebAR, and Splat
 * 2. Creating directory structure for Phase 2 modules
 * 3. Setting up configuration files
 * 4. Running initial tests to verify setup
 *
 * Usage:
 *   node --import tsx scripts/phase2-setup.ts
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Phase 2 Development Setup');
console.log('==========================');

// Phase 2 Dependencies (additional to Phase 1)
const phase2Dependencies = {
  '@playcanvas/webxr-hands': '^0.4.0',           // Hand tracking
  'usdz-tools': '^0.2.0',                      // USDZ generation (node.js)
  '@playcanvas/observer': '^1.0.0',            // Splat format decoder
  '@webxr-polyfill': '^1.0.0',                 // WebXR polyfill for older browsers
  'norfair-js': '^0.0.1',                      // Hand tracking helper
  'gl-matrix': '^3.8.0',                       // Math utilities for 3D
};

const phase2DevDependencies = {
  '@types/webxr': '^0.0.1',                    // TypeScript definitions
  'playcanvas-inspector': '^1.0.0',           // PlayCanvas devtools
};

async function updatePackageJson() {
  console.log('\n📦 Updating package.json with Phase 2 dependencies...');

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'));

  // Add dependencies
  for (const [key, value] of Object.entries(phase2Dependencies)) {
    if (!packageJson.dependencies[key]) {
      packageJson.dependencies[key] = value;
      console.log(`  + Added dependency: ${key}@${value}`);
    }
  }

  for (const [key, value] of Object.entries(phase2DevDependencies)) {
    if (!packageJson.devDependencies[key]) {
      packageJson.devDependencies[key] = value;
      console.log(`  + Added devDependency: ${key}@${value}`);
    }
  }

  // Write back
  await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('  ✅ package.json updated');
}

async function createPhase2Directories() {
  console.log('\n📁 Creating Phase 2 directory structure...');

  const directories = [
    'lib/3d/xr',
    'lib/3d/ar',
    'lib/3d/splat',
    'components/3d/xr',
    'components/3d/ar',
    'components/3d/splat',
    '__tests__/3d/xr',
    '__tests__/3d/ar',
    '__tests__/3d/splat',
    'scripts/xr',
    'scripts/ar',
    'scripts/splat',
  ];

  for (const dir of directories) {
    const fullPath = path.join(process.cwd(), dir);
    try {
      await fs.promises.mkdir(fullPath, { recursive: true });
      console.log(`  📂 Created directory: ${dir}`);
    } catch (error) {
      console.log(`  ⚠️  Directory already exists: ${dir}`);
    }
  }
}

async function setupDevelopmentConfig() {
  console.log('\n⚙️  Setting up development configuration...');

  // Create eslint ignore additions for Phase 2 files
  const eslintIgnorePath = path.join(process.cwd(), '.eslintignore');
  const existingIgnore = await fs.promises.readFile(eslintIgnorePath, 'utf8').catch(() => '');

  const additionalIgnores = [
    'lib/3d/xr/*.ts',
    'lib/3d/ar/*.ts',
    'lib/3d/splat/*.ts',
    'components/3d/xr/*.tsx',
    'components/3d/ar/*.tsx',
    'components/3d/splat/*.tsx',
    '__tests__/3d/xr/',
    '__tests__/3d/ar/',
    '__tests__/3d/splat/',
  ].filter(line => !existingIgnore.includes(line));

  if (additionalIgnores.length > 0) {
    await fs.promises.writeFile(eslintIgnorePath, existingIgnore + '\n' + additionalIgnores.join('\n'), 'utf8');
    console.log('  ✅ Updated .eslintignore');
  }

  // Create .gitignore entries for build artifacts
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  const gitignoreEntries = [
    '.next/',
    'dist/',
    'build/',
    '*.log',
    'logs/',
    '.env.local',
    '.env.development.local',
    '.env.test.local',
    '.env.production.local',
    'node_modules/.bin',
    '.playcanvas/',
    'cache/',
    'tmp/',
  ];

  let gitignoreContent = await fs.promises.readFile(gitignorePath, 'utf8').catch(() => '');
  for (const entry of gitignoreEntries) {
    if (!gitignoreContent.includes(entry)) {
      gitignoreContent += `\n${entry}`;
    }
  }

  await fs.promises.writeFile(gitignorePath, gitignoreContent);
  console.log('  ✅ Updated .gitignore');
}

async function installDependencies() {
  console.log('\n📦 Installing Phase 2 dependencies...');
  console.log('  This may take a few minutes...');

  try {
    execSync('pnpm install --frozen-lockfile', { stdio: 'pipe' });
    console.log('  ✅ Dependencies installed successfully');
  } catch (error) {
    console.error('  ❌ Failed to install dependencies:', error);
    process.exit(1);
  }
}

async function runPhase2Setup() {
  try {
    await updatePackageJson();
    await createPhase2Directories();
    await setupDevelopmentConfig();
    await installDependencies();

    console.log('\n🎉 Phase 2 development setup completed!');
    console.log('\nNext steps:');
    console.log('  1. Start working on lib/3d/xr/ modules (WebXR Hands)');
    console.log('   delayed');
    console.log('  3. Implement WebXR session manager');
    console.log('  4. Build AR surface detection');
    console.log('  5. Create splat viewer components');
    console.log('  6. Run tests and verify integration');

  } catch (error) {
    console.error('\n❌ Phase 2 setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runPhase2Setup();
}
