/**
 * Phase 6 Sprint 1 — Security Regression Tests
 *
 * Unit-level verification of Sprint 1 security hardening.
 * Route-level and CORS tests excluded due to next-auth ESM
 * transpile issue (pre-existing Jest config limitation).
 */

import { describe, it, expect } from '@jest/globals';

// ============================================================
// S1-01: getUserClient() is exported
// ============================================================
describe('S1-01: getUserClient()', () => {
  it('should be exported from services/client', async () => {
    const mod = await import('@/lib/services/client');
    expect(typeof mod.getUserClient).toBe('function');
  });
});

// ============================================================
// S1-02: Authorization helpers exist
// ============================================================
describe('S1-02: Authorization helpers', () => {
  it('should export verifyProjectAccess', async () => {
    const mod = await import('@/lib/auth/project-access');
    expect(typeof mod.verifyProjectAccess).toBe('function');
  });

  it('should export verifyExperienceAccess', async () => {
    const mod = await import('@/lib/auth/project-access');
    expect(typeof mod.verifyExperienceAccess).toBe('function');
  });

  it('should export verifyResourceAccess', async () => {
    const mod = await import('@/lib/auth/project-access');
    expect(typeof mod.verifyResourceAccess).toBe('function');
  });

  it('should export verifyConfigAccess', async () => {
    const mod = await import('@/lib/auth/project-access');
    expect(typeof mod.verifyConfigAccess).toBe('function');
  });
});

// ============================================================
// S1-02b: RBAC fail-closed
// ============================================================
describe('S1-02b: RBAC fail-closed', () => {
  it('should return false for unknown routes', async () => {
    const { hasRouteAccess } = await import('@/lib/rbac');
    expect(hasRouteAccess('user', '/api/unknown-route')).toBe(false);
  });

  it('should allow super_admin on admin routes', async () => {
    const { hasRouteAccess } = await import('@/lib/rbac');
    expect(hasRouteAccess('super_admin', '/app/admin')).toBe(true);
  });

  it('should deny user on admin routes', async () => {
    const { hasRouteAccess } = await import('@/lib/rbac');
    expect(hasRouteAccess('user', '/app/admin')).toBe(false);
  });
});

// ============================================================
// S1-07: Editor auth middleware
// ============================================================
describe('S1-07: Editor auth middleware', () => {
  it('should export requireEditorAuth', async () => {
    const mod = await import('@/forks/editor/server/auth-middleware.js');
    expect(typeof mod.requireEditorAuth).toBe('function');
  });

  it('should export validateWsOrigin', async () => {
    const mod = await import('@/forks/editor/server/auth-middleware.js');
    expect(typeof mod.validateWsOrigin).toBe('function');
  });

  it('validateWsOrigin should reject untrusted origins', async () => {
    const { validateWsOrigin } = await import('@/forks/editor/server/auth-middleware.js');
    expect(validateWsOrigin({ headers: { origin: 'http://evil.com' } })).toBe(false);
  });

  it('validateWsOrigin should allow trusted origins', async () => {
    const { validateWsOrigin } = await import('@/forks/editor/server/auth-middleware.js');
    expect(validateWsOrigin({ headers: { origin: 'http://localhost:3000' } })).toBe(true);
  });

  it('validateWsOrigin should allow non-browser clients (no origin)', async () => {
    const { validateWsOrigin } = await import('@/forks/editor/server/auth-middleware.js');
    expect(validateWsOrigin({ headers: {} })).toBe(true);
  });
});

// ============================================================
// S1-05: Storage migration exists
// ============================================================
describe('S1-05: Storage RLS migration', () => {
  it('should have migration file for storage RLS policies', async () => {
    const { existsSync } = await import('fs');
    const { join } = await import('path');
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20260919_storage_rls_policies.sql');
    expect(existsSync(migrationPath)).toBe(true);
  });
});

// ============================================================
// S1-08: Editor env template exists
// ============================================================
describe('S1-08: Editor env template', () => {
  it('should have .env.example for editor', async () => {
    const { existsSync } = await import('fs');
    const { join } = await import('path');
    expect(existsSync(join(process.cwd(), 'forks', 'editor', '.env.example'))).toBe(true);
  });
});

// ============================================================
// S2-02: ShareDB auth middleware exports
// ============================================================
describe('S2-02: ShareDB auth middleware', () => {
  it('should export extractToken', async () => {
    const mod = await import('@/forks/editor/server/auth-middleware.js');
    expect(typeof mod.extractToken).toBe('function');
  });

  it('should export validateToken', async () => {
    const mod = await import('@/forks/editor/server/auth-middleware.js');
    expect(typeof mod.validateToken).toBe('function');
  });
});

// ============================================================
// S2-03: Zod validation schemas
// ============================================================
describe('S2-03: Zod config validation', () => {
  it('should export validateExperienceConfig', async () => {
    const mod = await import('@/lib/validation/experience-config');
    expect(typeof mod.validateExperienceConfig).toBe('function');
  });

  it('should reject invalid experience_id on POST', async () => {
    const { validateExperienceConfig } = await import('@/lib/validation/experience-config');
    const result = validateExperienceConfig({ experience_id: 'not-a-uuid' }, 'POST');
    expect(result.success).toBe(false);
  });

  it('should accept valid POST payload', async () => {
    const { validateExperienceConfig } = await import('@/lib/validation/experience-config');
    const result = validateExperienceConfig({
      experience_id: '550e8400-e29b-41d4-a716-446655440000',
      config: { engine: 'playcanvas', scene: { name: 'Test' } },
      assets: [],
      settings: {},
    }, 'POST');
    expect(result.success).toBe(true);
  });

  it('should reject PUT with no fields', async () => {
    const { validateExperienceConfig } = await import('@/lib/validation/experience-config');
    const result = validateExperienceConfig({
      id: '550e8400-e29b-41d4-a716-446655440000',
    }, 'PUT');
    expect(result.success).toBe(false);
  });
});

// ============================================================
// S2-04: Demo accounts gated on Vercel
// ============================================================
describe('S2-04: Demo account gating', () => {
  it('should export getDemoAuthUser', async () => {
    const { getDemoAuthUser } = await import('@/lib/auth');
    expect(typeof getDemoAuthUser).toBe('function');
  });

  it('should reject demo credentials when VERCEL_ENV is set', async () => {
    const original = process.env.VERCEL_ENV;
    process.env.VERCEL_ENV = 'preview';
    try {
      const { getDemoAuthUser } = await import('@/lib/auth');
      const result = getDemoAuthUser('admin@viztr.com', 'password123');
      expect(result).toBeNull();
    } finally {
      process.env.VERCEL_ENV = original;
    }
  });
});

// ============================================================
// S2-05: Pixel Streaming no simulation fallback
// ============================================================
describe('S2-05: Pixel Streaming routes', () => {
  it('stop route should not have simulated response', async () => {
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const content = readFileSync(join(process.cwd(), 'app', 'api', 'pixel-streaming', 'stop', 'route.ts'), 'utf-8');
    expect(content).not.toContain('simulated: true');
  });

  it('status route should not have SIMULATED health', async () => {
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const content = readFileSync(join(process.cwd(), 'app', 'api', 'pixel-streaming', 'status', 'route.ts'), 'utf-8');
    expect(content).not.toContain("'SIMULATED'");
  });
});

// ============================================================
// S3-01: Supabase JWT integration
// ============================================================
describe('S3-01: Supabase JWT integration', () => {
  it('should export mintSupabaseJwt', async () => {
    const { mintSupabaseJwt, isSupabaseJwtConfigured } = await import('@/lib/supabase/jwt');
    expect(typeof mintSupabaseJwt).toBe('function');
    expect(typeof isSupabaseJwtConfigured).toBe('function');
  });

  it('should return false when SUPABASE_JWT_SECRET is not set', async () => {
    const original = process.env.SUPABASE_JWT_SECRET;
    delete process.env.SUPABASE_JWT_SECRET;
    const { isSupabaseJwtConfigured } = await import('@/lib/supabase/jwt');
    expect(isSupabaseJwtConfigured()).toBe(false);
    process.env.SUPABASE_JWT_SECRET = original;
  });
});

// ============================================================
// S3-02: Mass assignment prevention
// ============================================================
describe('S3-02: Mass assignment prevention', () => {
  it('PUT /api/editor-projects/[id] should have field whitelisting', async () => {
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const content = readFileSync(
      join(process.cwd(), 'app', 'api', 'editor-projects', '[id]', 'route.ts'), 'utf-8'
    );
    expect(content).toContain('allowedFields');
    expect(content).toContain('name');
    expect(content).toContain('updatePayload');
  });

  it('PATCH /api/xr-links should have field whitelisting', async () => {
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const content = readFileSync(join(process.cwd(), 'app', 'api', 'xr-links', 'route.ts'), 'utf-8');
    expect(content).toContain('allowedFields');
    expect(content).toContain('safeUpdates');
  });

  it('/api/tour/floorplans should require auth', async () => {
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const content = readFileSync(join(process.cwd(), 'app', 'api', 'tour', 'floorplans', 'route.ts'), 'utf-8');
    expect(content).toContain('requireAuth');
  });
});

// ============================================================
// S3-03: CSP headers
// ============================================================
describe('S3-03: CSP headers', () => {
  it('should include Content-Security-Policy in next.config headers', async () => {
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const content = readFileSync(join(process.cwd(), 'next.config.ts'), 'utf-8');
    expect(content).toContain('Content-Security-Policy');
    expect(content).toContain("object-src 'none'");
    expect(content).toContain("base-uri 'self'");
    expect(content).toContain("form-action 'self'");
  });
});

// ============================================================
// S3-04: Signed storage URLs
// ============================================================
describe('S3-04: Signed storage URLs', () => {
  it('should have signed URL endpoint', async () => {
    const { existsSync } = await import('fs');
    const { join } = await import('path');
    expect(existsSync(join(process.cwd(), 'app', 'api', 'storage', 'signed-url', 'route.ts'))).toBe(true);
  });

  it('should require auth for signed URL generation', async () => {
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const content = readFileSync(
      join(process.cwd(), 'app', 'api', 'storage', 'signed-url', 'route.ts'), 'utf-8'
    );
    expect(content).toContain('requireAuth');
    expect(content).toContain('createSignedUrl');
    expect(content).toContain('clampedExpiry');
  });

  it('should enforce ownership check on signed URLs', async () => {
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const content = readFileSync(
      join(process.cwd(), 'app', 'api', 'storage', 'signed-url', 'route.ts'), 'utf-8'
    );
    expect(content).toContain('Forbidden');
    expect(content).toContain('folderOwner');
  });
});
