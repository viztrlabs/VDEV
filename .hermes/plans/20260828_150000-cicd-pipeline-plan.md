# CI/CD Pipeline Plan

**Goal:** Establish a CI/CD pipeline for the VizTR platform using pnpm + Turborepo.

## Current State
- Repository: `C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev`
- Package Manager: pnpm
- Build Tool: Next.js 15
- No CI/CD pipeline currently exists

## Pipeline Stages

### 1. Lint & Type Check
```yaml
- pnpm lint
- pnpm tsc --noEmit
```

### 2. Build
```yaml
- pnpm build
```

### 3. Tests
```yaml
- pnpm test --ci --coverage
```

### 4. Deploy (Conditional)
- Deploy to Vercel on merge to `main`
- Deploy to preview on PR to any branch

## GitHub Actions Workflow

Create: `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Lint
        run: pnpm lint
      
      - name: Type Check
        run: pnpm tsc --noEmit
      
      - name: Build
        run: pnpm build
      
      - name: Test
        run: pnpm test --ci --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/**/lcov.info
```

## Deployment

### Production (Vercel)
- Auto-deploy on merge to `main`
- Environment variables configured in Vercel dashboard
- Custom domain: viztr.ai

### Preview
- Auto-preview on PRs
- Unique URL per PR