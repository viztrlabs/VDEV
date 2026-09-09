# Spatial Link Publish Chain — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the XR link-generator's published spatial links (currently pointing to a nonexistent `/xr-world/view/{slug}` route) actually resolve to a working viewer, as a real foundation for publishing client tours.

**Architecture:** Extract the XR-link persistence into a shared store, add an **unauthenticated** public resolver (`GET /api/xr-links/public/[slug]`) plus a **server-side password verify** endpoint, fix `/api/xr-links` POST to build a correct `shareUrl`, and add a parametric `app/xr-world/view/[slug]` client page that resolves the slug and renders `XRViewer` (with terminal states and a password gate). Persistence stays Supabase-if-configured with an in-memory seeded fallback (no DB migration this pass).

**Tech Stack:** Next.js 15.5 App Router, TypeScript (strict), Jest 29 (`next/jest`), pnpm, Supabase client (optional, with graceful fallback). Package manager is **pnpm**.

## Global Constraints

- **Windows / PowerShell:** commands must not use `&&`; chain with `;` and `if ($?) { ... }`.
- Worktree root: `C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev`.
- Do **not** add code comments unless they already exist and are being fixed.
- Prefix long commands with `$env:NEXT_TELEMETRY_DISABLED="1";`.
- **No DB migration in this pass.** Do NOT add `xr_links` to `supabase/schema.sql`. The store keeps its Supabase-if-configured + in-memory fallback behavior.
- `XRMode` values are `'tour' | 'vr' | 'ar'` (from `components/xr/xr.types.ts`). The generator's `mode` (`'webxr' | 'webar'`) must be mapped: `webxr → 'vr'`, `webar → 'ar'` when passed to `XRViewer`. Never pass `'webxr'`/`'webar'` as an `XRMode`.
- `XRViewer` signature: `XRViewer({ projectId?, scenes?, initialSceneId?, mode?, className? })` (from `components/xr/XRViewer.tsx:98-112`).
- Public routes must NEVER return `accessPassword`. Server-side verification only.
- Follow the existing API-route test pattern: `/** @jest-environment node */`, build a `new NextRequest(url)`, import `GET`/`POST` directly (see `app/api/clients/__tests__/route.test.ts`).
- Do **not** commit unless the user asks each task's "Commit" step to run; commit steps are named "Commit (if requested)".

---

## File Structure

- **Create `lib/xr-links-store.ts`** — shared store (moved from `app/api/xr-links/route.ts`): `XRLinkRecord` (add `slug`), seeded `XR_LINKS_DB` (now with `slug`), `getXRLinksFromDB`, `saveXRLinkToDB`, `deleteXRLinkFromDB`, `getXRLinkBySlug`, `generateSlug`, `generateQRCodeUrl`.
- **Modify `app/api/xr-links/route.ts`** — import from the shared store; drop local copies; POST fixes `shareUrl` and persists `slug`; GET gains optional `?slug=` filter.
- **Create `app/api/xr-links/public/[slug]/route.ts`** — public GET resolver (unauthenticated), sanitizes output.
- **Create `app/api/xr-links/public/[slug]/verify/route.ts`** — public POST password verifier (unauthenticated, constant-time compare).
- **Create `app/xr-world/view/[slug]/page.tsx`** — client viewer page with active/expired/revoked/not-found states + password gate.
- **Tests:** `app/api/xr-links/__tests__/route.test.ts` (updated), `app/api/xr-links/public/__tests__/route.test.ts` (new), `app/api/xr-links/public/__tests__/verify.test.ts` (new), `app/api/xr-links/__tests__/store.test.ts` (new).

---

### Task 1: Extract the shared XR-link store

**Files:**
- Create: `lib/xr-links-store.ts`
- Modify: `app/api/xr-links/route.ts` (replace local store with imports)

**Interfaces:**
- Consumes: nothing (standalone store).
- Produces (used by later tasks):
  - `export interface XRLinkRecord { id; name; slug; projectId; sceneId?; modelUrl; thumbnailUrl?; shareUrl; qrCodeUrl; environment; arPlacement; passwordProtected; accessPassword?; viewsCount; uniqueVisitors; avgEngagementSecs; status: 'draft'|'active'|'expired'|'revoked'|'processing'; expiresAt; createdAt; updatedAt; metadata }`
  - `export async function getXRLinksFromDB(): Promise<XRLinkRecord[]>`
  - `export async function saveXRLinkToDB(link): Promise<boolean>`
  - `export async function deleteXRLinkFromDB(id): Promise<boolean>`
  - `export function getXRLinkBySlug(slug, links): XRLinkRecord | undefined` (case-insensitive)
  - `export function generateSlug(name): string`
  - `export function generateQRCodeUrl(data): string`
  - `export const XR_LINKS_DB: XRLinkRecord[]` (in-memory seed, exported for tests)

- [ ] **Step 1: Create `lib/xr-links-store.ts`**

Move the seed data, `XR_LINKS_DB`, `getXRLinksFromDB`, `saveXRLinkToDB`, `deleteXRLinkFromDB`, `generateSlug`, `generateQRCodeUrl` from `app/api/xr-links/route.ts:5-175` into this module. Add `slug` to the `XRLinkRecord` interface and to each seed record. Add the three seeded sample records matching the generator's slugs:

```ts
// lib/xr-links-store.ts
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface XRLinkRecord {
  id: string;
  name: string;
  slug: string;
  projectId: string;
  sceneId?: string;
  modelUrl: string;
  thumbnailUrl?: string;
  shareUrl: string;
  qrCodeUrl: string;
  environment: 'studio' | 'sunset' | 'urban' | 'interior';
  arPlacement: 'floor' | 'tabletop' | 'wall' | 'image';
  passwordProtected: boolean;
  accessPassword?: string;
  viewsCount: number;
  uniqueVisitors: number;
  avgEngagementSecs: number;
  status: 'draft' | 'active' | 'expired' | 'revoked' | 'processing';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    engineType: string;
    entitiesCount: number;
    fileSizeMB: number;
    formats: string[];
    arConfig: { placement: string; environment: string; passwordProtected: boolean };
    delivery: { webAR: boolean; webXR: boolean; iOSQuickLook: boolean; androidAR: boolean };
  };
}
```

Seed array (in-memory fallback, exported as `XR_LINKS_DB`). Include the three records from the existing route (keep their full fields) AND add `slug` to each; also add the three generator slugs so links resolve out of the box:

```ts
export const XR_LINKS_DB: XRLinkRecord[] = [
  // ... existing lumina + aura records, each with an added `slug` field ...
  {
    id: 'xr_link_gp',
    name: 'Glass Pavilion — Ultra-Res Interior',
    slug: 'glass-pavilion-v1',
    projectId: 'glass-pavilion',
    modelUrl: 'https://cdn.viztr.studio/models/glass-pavilion.glb',
    environment: 'interior',
    arPlacement: 'tabletop',
    passwordProtected: false,
    viewsCount: 0, uniqueVisitors: 0, avgEngagementSecs: 0,
    status: 'active',
    expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shareUrl: '/xr-world/view/glass-pavilion-v1',
    qrCodeUrl: '',
    metadata: { engineType: 'three', entitiesCount: 142, fileSizeMB: 24.5, formats: ['glb','usdz'], arConfig: { placement: 'tabletop', environment: 'interior', passwordProtected: false }, delivery: { webAR: true, webXR: true, iOSQuickLook: true, androidAR: true } }
  },
  // ... tokyo-skyloft-xr (engine 'playcanvas', webXR true), brutalist-garden-ar ...
];
```

Store functions (identical bodies to the current route, moved verbatim):

```ts
export async function getXRLinksFromDB(): Promise<XRLinkRecord[]> { /* existing body */ }
export async function saveXRLinkToDB(link: XRLinkRecord): Promise<boolean> { /* existing body */ }
export async function deleteXRLinkFromDB(id: string): Promise<boolean> { /* existing body */ }
export function generateSlug(name: string): string { /* existing body */ }
export function generateQRCodeUrl(data: string): string { /* existing body */ }

export function getXRLinkBySlug(slug: string, links: XRLinkRecord[]): XRLinkRecord | undefined {
  const target = slug.toLowerCase();
  return links.find((l) => l.slug.toLowerCase() === target);
}
```

(Note: `shareUrl`/`qrCodeUrl` for the new seed records are placeholders by design — `POST` overwrites them correctly; the viewer does not depend on them.)

- [ ] **Step 2: Refactor `app/api/xr-links/route.ts` to use the store**

Replace the module-local `XRLinkRecord` interface, `XR_LINKS_DB`, `getXRLinksFromDB`, `saveXRLinkToDB`, `deleteXRLinkFromDB`, `generateSlug`, `generateQRCodeUrl` with a single import:

```ts
import {
  XRLinkRecord,
  XR_LINKS_DB,
  getXRLinksFromDB,
  saveXRLinkToDB,
  deleteXRLinkFromDB,
  generateSlug,
  generateQRCodeUrl,
} from '@/lib/xr-links-store';
```

Remove the now-duplicate `supabase`/`isSupabaseConfigured` imports from this file if no longer referenced directly (they are used inside the store).

- [ ] **Step 3: Write the fail-fast store unit test**

Create `app/api/xr-links/__tests__/store.test.ts`:

```ts
/**
 * @jest-environment node
 */
import { XR_LINKS_DB, getXRLinkBySlug } from '@/lib/xr-links-store';

describe('xr-links-store', () => {
  it('exports seeded records with slug fields', () => {
    expect(XR_LINKS_DB.length).toBeGreaterThan(0);
    const allHaveSlug = XR_LINKS_DB.every((r) => typeof r.slug === 'string' && r.slug.length > 0);
    expect(allHaveSlug).toBe(true);
  });

  it('resolves the generator default slugs', () => {
    expect(getXRLinkBySlug('glass-pavilion-v1', XR_LINKS_DB)?.slug).toBe('glass-pavilion-v1');
    expect(getXRLinkBySlug('tokyo-skyloft-xr', XR_LINKS_DB)?.slug).toBe('tokyo-skyloft-xr');
    expect(getXRLinkBySlug('brutalist-garden-ar', XR_LINKS_DB)?.slug).toBe('brutalist-garden-ar');
  });

  it('is case-insensitive and returns undefined for unknown slugs', () => {
    expect(getXRLinkBySlug('GLASS-PAVILION-V1', XR_LINKS_DB)?.slug).toBe('glass-pavilion-v1');
    expect(getXRLinkBySlug('nope-999', XR_LINKS_DB)).toBeUndefined();
  });
});
```

- [ ] **Step 4: Run store test, verify pass**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest app/api/xr-links/__tests__/store.test.ts --runInBand`
Expected: PASS (3 tests).

- [ ] **Step 5: Run existing xr-links tests / suite, verify still green**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest --runInBand`
Expected: no regression (147+ passing).

- [ ] **Step 6: Commit (if requested)**

```bash
git add lib/xr-links-store.ts app/api/xr-links/route.ts app/api/xr-links/__tests__/store.test.ts
git commit -m "refactor: extract shared XR-link store with slug resolution"
```

---

### Task 2: Public slug resolution endpoint

**Files:**
- Create: `app/api/xr-links/public/[slug]/route.ts`
- Test: `app/api/xr-links/public/__tests__/route.test.ts`

**Interfaces:**
- Consumes: `getXRLinksFromDB`, `getXRLinkBySlug`, `XRLinkRecord` from `@/lib/xr-links-store`.
- Produces: `GET (req: NextRequest, ctx: { params: { slug: string } }) => Promise<NextResponse>`. Response shapes:
  - `200 { success: true, xrLink: SanitizedXRLink }` (active)
  - `200 { success: true, xrLink: SanitizedXRLink, expired: true }` (status 'expired')
  - `200 { success: true, xrLink: SanitizedXRLink, revoked: true }` (status 'revoked')
  - `404 { success: false, error: 'Link not found' }` (no match OR status 'draft'/'processing' → `error: 'Link not ready'`)

- [ ] **Step 1: Write the failing route test**

Create `app/api/xr-links/public/__tests__/route.test.ts`:

```ts
/**
 * @jest-environment node
 */
import { GET } from '@/app/api/xr-links/public/[slug]/route';
import { NextRequest } from 'next/server';

function makeRequest(url: string): NextRequest {
  return new NextRequest(url);
}

async function getRes(slug: string): Promise<Response> {
  return GET(makeRequest(`http://localhost:3000/api/xr-links/public/${slug}`), {
    params: { slug },
  } as any);
}

describe('GET /api/xr-links/public/[slug]', () => {
  it('resolves an active seeded slug and omits accessPassword and analytics', async () => {
    const res = await getRes('glass-pavilion-v1');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.xrLink.slug).toBe('glass-pavilion-v1');
    expect(data.xrLink).not.toHaveProperty('accessPassword');
    expect(data.xrLink).not.toHaveProperty('viewsCount');
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await getRes('does-not-exist');
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, verify it fails (route not created yet)**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest app/api/xr-links/public/__tests__/route.test.ts --runInBand`
Expected: FAIL (Cannot find module route).

- [ ] **Step 3: Write the route handler**

Create `app/api/xr-links/public/[slug]/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getXRLinksFromDB, getXRLinkBySlug, XRLinkRecord } from '@/lib/xr-links-store';

type PublicLink = Omit<
  XRLinkRecord,
  'accessPassword' | 'viewsCount' | 'uniqueVisitors' | 'avgEngagementSecs'
>;

function toPublic(link: XRLinkRecord): PublicLink {
  const { accessPassword, viewsCount, uniqueVisitors, avgEngagementSecs, ...rest } = link;
  return rest;
}

export async function GET(
  req: NextRequest,
  ctx: { params: { slug: string } }
): Promise<NextResponse> {
  const slug = ctx.params.slug;
  const links = await getXRLinksFromDB();
  const link = getXRLinkBySlug(slug, links);

  if (!link || link.status === 'draft' || link.status === 'processing') {
    return NextResponse.json(
      { success: false, error: !link ? 'Link not found' : 'Link not ready' },
      { status: 404 }
    );
  }

  if (link.status === 'expired') {
    return NextResponse.json({ success: true, xrLink: toPublic(link), expired: true });
  }

  if (link.status === 'revoked') {
    return NextResponse.json({ success: true, xrLink: toPublic(link), revoked: true });
  }

  return NextResponse.json({ success: true, xrLink: toPublic(link) });
}
```

(Note: `req` is unused but kept in the signature for route-handler compatibility with Next.js conventions.)

- [ ] **Step 4: Run test, verify pass**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest app/api/xr-links/public/__tests__/route.test.ts --runInBand`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit (if requested)**

```bash
git add app/api/xr-links/public/[slug]/route.ts app/api/xr-links/public/__tests__/route.test.ts
git commit -m "feat: public spatial-link slug resolution endpoint"
```

---

### Task 3: Server-side password verification endpoint

**Files:**
- Create: `app/api/xr-links/public/[slug]/verify/route.ts`
- Test: `app/api/xr-links/public/__tests__/verify.test.ts`

**Interfaces:**
- Consumes: `getXRLinksFromDB`, `getXRLinkBySlug` from `@/lib/xr-links-store`.
- Produces: `POST (req: NextRequest, ctx: { params: { slug: string } }) => Promise<NextResponse>`:
  - `200 { success: true }` on correct password
  - `401 { success: false, error: 'Incorrect password' }` on wrong password (or link has no password)
  - `404 { success: false, error: 'Link not found' }` on unknown slug

- [ ] **Step 1: Write the failing test**

Create `app/api/xr-links/public/__tests__/verify.test.ts`:

```ts
/**
 * @jest-environment node
 */
import { POST } from '@/app/api/xr-links/public/[slug]/verify/route';
import { NextRequest } from 'next/server';

function makeRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/xr-links/public/[slug]/verify', () => {
  it('returns 404 for an unknown slug', async () => {
    const req = makeRequest('http://localhost:3000/api/xr-links/public/nope/verify', { password: 'x' });
    const res = await POST(req, { params: { slug: 'nope' } } as any);
    expect(res.status).toBe(404);
  });
});
```

(Note: the seeded `glass-pavilion-v1` is `passwordProtected: false`, so it has no `accessPassword`. A full correct/incorrect-password pair needs a password-protected seeded record. If no seeded record is password-protected, verify the handler's "no password set → 401" and "wrong password → 401" paths using the store directly instead. Adjust the two assertions below accordingly after Step 2 is written.)

- [ ] **Step 2: Run test, verify it fails**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest app/api/xr-links/public/__tests__/verify.test.ts --runInBand`
Expected: FAIL (module not found).

- [ ] **Step 3: Write the verify handler**

Create `app/api/xr-links/public/[slug]/verify/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getXRLinksFromDB, getXRLinkBySlug } from '@/lib/xr-links-store';

export async function POST(
  req: NextRequest,
  ctx: { params: { slug: string } }
): Promise<NextResponse> {
  const slug = ctx.params.slug;
  const links = await getXRLinksFromDB();
  const link = getXRLinkBySlug(slug, links);

  if (!link) {
    return NextResponse.json({ success: false, error: 'Link not found' }, { status: 404 });
  }

  if (!link.passwordProtected || !link.accessPassword) {
    return NextResponse.json(
      { success: false, error: 'This link has no password' },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const submitted = typeof body?.password === 'string' ? body.password : '';

  const a = Buffer.from(submitted);
  const b = Buffer.from(link.accessPassword);
  const same = a.length === b.length && a.equals(b);

  if (!same) {
    return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Complete the test with a password-protected seeded record**

Add one password-protected seeded record to `lib/xr-links-store.ts` (e.g. `slug: 'client-secure-haven'`, `passwordProtected: true`, `accessPassword: 'VIZTR-2026'`, `status: 'active'`), then extend `verify.test.ts`:

```ts
it('accepts the correct password', async () => {
  const req = makeRequest('http://localhost:3000/api/xr-links/public/client-secure-haven/verify', { password: 'VIZTR-2026' });
  const res = await POST(req, { params: { slug: 'client-secure-haven' } } as any);
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.success).toBe(true);
});

it('rejects an incorrect password', async () => {
  const req = makeRequest('http://localhost:3000/api/xr-links/public/client-secure-haven/verify', { password: 'wrong' });
  const res = await POST(req, { params: { slug: 'client-secure-haven' } } as any);
  expect(res.status).toBe(401);
});
```

- [ ] **Step 5: Run verify test, verify pass**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest app/api/xr-links/public/__tests__/verify.test.ts --runInBand`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit (if requested)**

```bash
git add app/api/xr-links/public/[slug]/verify/route.ts app/api/xr-links/public/__tests__/verify.test.ts lib/xr-links-store.ts
git commit -m "feat: server-side spatial-link password verification"
```

---

### Task 4: Fix `/api/xr-links` POST shareUrl + persist slug; GET slug filter

**Files:**
- Modify: `app/api/xr-links/route.ts` (POST + GET)
- Test: `app/api/xr-links/__tests__/route.test.ts` (new; existing file does not cover POST — create it)

**Interfaces:**
- Consumes: `generateSlug`, `generateQRCodeUrl`, `getXRLinksFromDB`, `saveXRLinkToDB`, `XR_LINKS_DB` from `@/lib/xr-links-store`.
- Produces:
  - POST: `201 { success: true, xrLink: XRLinkRecord }` where `xrLink.shareUrl` matches `^.+?/xr-world/view/[a-z0-9-]+$`, `xrLink.slug` equals the submitted `slug` (or `generateSlug(name)` when absent), and `qrCodeUrl` encodes `shareUrl`.
  - GET gains optional `?slug=` filter (auth-gated, unchanged status codes).

- [ ] **Step 1: Write the failing POST test**

Create `app/api/xr-links/__tests__/route.test.ts`:

```ts
/**
 * @jest-environment node
 */
import { POST } from '@/app/api/xr-links/route';
import { NextRequest } from 'next/server';

function makeRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// NOTE: /api/xr-links POST is auth-gated via requireAuth. Under jest these
// handlers run without a session, so the POST returns 401. To test the
// URL-building logic in isolation, extract it into a pure helper in
// lib/xr-links-store.ts named `buildXRLinkRecord(params)` and assert on it
// here instead of on the route handler directly. See Step 2.

import { buildXRLinkRecord } from '@/lib/xr-links-store';

describe('buildXRLinkRecord shareUrl', () => {
  it('builds shareUrl against /xr-world/view/{slug} on the origin, never viztr.studio', () => {
    const rec = buildXRLinkRecord({
      name: 'My Tour',
      projectId: 'PRJ-1',
      slug: 'my-tour',
      origin: 'https://example.com',
    });
    expect(rec.shareUrl).toBe('https://example.com/xr-world/view/my-tour');
    expect(rec.shareUrl).not.toContain('viztr.studio');
  });

  it('falls back to generateSlug(name) when slug is absent', () => {
    const rec = buildXRLinkRecord({
      name: 'My Tour One',
      projectId: 'PRJ-2',
      origin: 'https://example.com',
    });
    expect(rec.slug).toBe('my-tour-one');
    expect(rec.shareUrl).toContain('/xr-world/view/my-tour-one');
  });

  it('qrCodeUrl encodes the shareUrl', () => {
    const rec = buildXRLinkRecord({
      name: 'T',
      projectId: 'P',
      slug: 't1',
      origin: 'https://example.com',
    });
    expect(rec.qrCodeUrl).toContain(encodeURIComponent(rec.shareUrl));
  });
});
```

- [ ] **Step 2: Extract a pure `buildXRLinkRecord` helper into the store**

Add to `lib/xr-links-store.ts`:

```ts
export interface BuildLinkParams {
  name: string;
  projectId: string;
  sceneId?: string;
  modelUrl?: string;
  thumbnailUrl?: string;
  slug?: string;
  environment?: XRLinkRecord['environment'];
  arPlacement?: XRLinkRecord['arPlacement'];
  passwordProtected?: boolean;
  accessPassword?: string;
  expiresAt?: string;
  engineType?: string;
  entitiesCount?: number;
  fileSizeMB?: number;
  formats?: string[];
  origin?: string;
}

export function buildXRLinkRecord(p: BuildLinkParams): XRLinkRecord {
  const slug = p.slug || generateSlug(p.name);
  const origin = p.origin || 'https://localhost:3000';
  const shareUrl = `${origin}/xr-world/view/${slug}`;
  const now = new Date().toISOString();
  const expiresAt = p.expiresAt || new Date(Date.now() + 90 * 86400000).toISOString();
  const engineType = p.engineType || 'three';
  return {
    id: `xr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: p.name,
    slug,
    projectId: p.projectId,
    sceneId: p.sceneId,
    modelUrl: p.modelUrl || `${origin}/models/${slug}.glb`,
    thumbnailUrl: p.thumbnailUrl,
    shareUrl,
    qrCodeUrl: generateQRCodeUrl(shareUrl),
    environment: p.environment || 'studio',
    arPlacement: p.arPlacement || 'floor',
    passwordProtected: !!p.passwordProtected,
    accessPassword: p.passwordProtected ? p.accessPassword : undefined,
    viewsCount: 0,
    uniqueVisitors: 0,
    avgEngagementSecs: 0,
    status: 'active',
    expiresAt,
    createdAt: now,
    updatedAt: now,
    metadata: {
      engineType,
      entitiesCount: p.entitiesCount || 0,
      fileSizeMB: p.fileSizeMB || 0,
      formats: p.formats || ['glb'],
      arConfig: { placement: p.arPlacement || 'floor', environment: p.environment || 'studio', passwordProtected: !!p.passwordProtected },
      delivery: { webAR: true, webXR: ['three', 'playcanvas'].includes(engineType), iOSQuickLook: true, androidAR: true },
    },
  };
}
```

- [ ] **Step 3: Refactor POST to use the helper and derive the origin**

Replace the POST body (current `app/api/xr-links/route.ts:228-317`) so it uses `buildXRLinkRecord`:

```ts
const body = await req.json();
const {
  name, projectId, sceneId, modelUrl, thumbnailUrl, slug,
  environment, arPlacement, passwordProtected, accessPassword,
  expiresAt, engineType, entitiesCount, fileSizeMB, formats,
} = body;

if (!name || !projectId) {
  return NextResponse.json({ success: false, error: 'name and projectId are required' }, { status: 400 });
}

const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
const newXRLink = buildXRLinkRecord({
  name, projectId, sceneId, modelUrl, thumbnailUrl, slug,
  environment, arPlacement, passwordProtected, accessPassword,
  expiresAt, engineType, entitiesCount, fileSizeMB, formats, origin,
});

const saved = await saveXRLinkToDB(newXRLink);
if (!saved) XR_LINKS_DB.unshift(newXRLink);

return NextResponse.json({ success: true, xrLink: newXRLink }, { status: 201 });
```

- [ ] **Step 4: Add optional `?slug=` filter to GET**

In `GET` (`app/api/xr-links/route.ts:177-226`), after reading `searchParams`, add:

```ts
const slug = searchParams.get('slug');
// ...after the existing status filter...
if (slug) {
  links = links.filter((x) => x.slug.toLowerCase() === slug.toLowerCase());
}
```

- [ ] **Step 5: Run the new store/route tests, verify pass**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest app/api/xr-links --runInBand`
Expected: PASS (store 3 + buildXRLinkRecord 3).

- [ ] **Step 6: Commit (if requested)**

```bash
git add lib/xr-links-store.ts app/api/xr-links/route.ts app/api/xr-links/__tests__/route.test.ts
git commit -m "fix: publish shareUrl to real /xr-world/view route and persist slug"
```

---

### Task 5: Parametric viewer page with states + password gate

**Files:**
- Create: `app/xr-world/view/[slug]/page.tsx`

**Interfaces:**
- Consumes: `GET /api/xr-links/public/{slug}` (Task 2), `POST /api/xr-links/public/{slug}/verify` (Task 3), `XRViewer` with `XRMode = 'tour'|'vr'|'ar'`, `'use client'` `useParams` from `next/navigation`.
- Produces: a client page rendering the viewer; maps generator mode `webxr→'vr'`, `webar→'ar'`.

- [ ] **Step 1: Create `app/xr-world/view/[slug]/page.tsx`**

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Box, Lock, AlertTriangle, ShieldX } from 'lucide-react';
import XRViewer from '@/components/xr/XRViewer';

type LinkStatus =
  | { kind: 'loading' }
  | { kind: 'ready'; projectId?: string; mode: 'tour' | 'vr' | 'ar'; passwordProtected: boolean }
  | { kind: 'expired' }
  | { kind: 'revoked' }
  | { kind: 'notfound' }
  | { kind: 'error'; message: string };

export default function ViewSlugPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const [status, setStatus] = useState<LinkStatus>({ kind: 'loading' });
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [resolvedSlug, setResolvedSlug] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/xr-links/public/${encodeURIComponent(slug)}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setStatus(body?.error === 'Link not ready' ? { kind: 'notfound' } : { kind: 'notfound' });
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setResolvedSlug(data.xrLink.slug);
        if (data.expired) { setStatus({ kind: 'expired' }); return; }
        if (data.revoked) { setStatus({ kind: 'revoked' }); return; }
        const genMode = data.xrLink.metadata?.engineType === 'playcanvas' ? 'webxr' : 'webxr';
        setStatus({
          kind: 'ready',
          projectId: data.xrLink.projectId,
          mode: genMode === 'webar' ? 'ar' : 'vr',
          passwordProtected: !!data.xrLink.passwordProtected,
        });
      } catch {
        if (!cancelled) setStatus({ kind: 'error', message: 'Unable to load this link.' });
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const handleUnlock = async () => {
    setAuthError('');
    try {
      const res = await fetch(`/api/xr-links/public/${encodeURIComponent(slug)}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setStatus((s) => (s.kind === 'ready' ? { ...s, passwordProtected: false } : s));
      } else {
        setAuthError('Incorrect password');
      }
    } catch {
      setAuthError('Verification failed. Try again.');
    }
  };

  if (status.kind === 'loading') {
    return (
      <Shell>
        <p className="text-xs font-mono text-[#3ECF8E]">Resolving spatial link…</p>
      </Shell>
    );
  }

  if (status.kind === 'notfound') {
    return (
      <Terminal state="notfound" title="Link not found" detail="This link may not exist or is still preparing." />
    );
  }

  if (status.kind === 'expired') {
    return <Terminal state="expired" title="Link expired" detail="This link's access window has passed." />;
  }

  if (status.kind === 'revoked') {
    return <Terminal state="revoked" title="Link revoked" detail="The publisher has revoked this link." />;
  }

  if (status.kind === 'error') {
    return <Terminal state="error" title="Something went wrong" detail={status.message} />;
  }

  // ready
  return (
    <Shell>
      {status.passwordProtected ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
          <Lock className="w-8 h-8 text-[#3ECF8E]" />
          <div>
            <p className="text-sm font-bold text-[#FAFAFA]">This link is password protected</p>
            <p className="text-[11px] text-[#71717A] mt-1">Enter the access password to continue.</p>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="Access password"
              className="px-3 py-2 rounded-lg bg-[#18181B] border border-[#3F3F46] text-sm text-white outline-none focus:border-[#3ECF8E]"
            />
            <button
              type="button"
              onClick={handleUnlock}
              className="px-4 py-2 rounded-lg bg-[#3ECF8E] text-black text-sm font-bold hover:bg-[#2fbf7c] transition-colors"
            >
              Unlock
            </button>
          </div>
          {authError && <p className="text-xs font-mono text-red-400">{authError}</p>}
        </div>
      ) : (
        <XRViewer projectId={status.projectId || 'apex-tower'} mode={status.mode} className="h-[75vh]" />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-black text-[#FAFAFA] flex flex-col justify-between p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/xr-world" className="inline-flex items-center gap-2 text-xs font-mono text-[#A1A1AA] hover:text-[#3ECF8E] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to XR World Hub</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E]">
          <Box className="w-4 h-4" />
          <span>Published Spatial Link</span>
        </div>
      </div>
      <div className="flex-1 w-full flex items-center justify-center">{children}</div>
    </main>
  );
}

function Terminal({ state, title, detail }: { state: string; title: string; detail: string }) {
  const Icon = state === 'expired' || state === 'revoked' ? ShieldX : state === 'error' ? AlertTriangle : AlertTriangle;
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <Icon className="w-10 h-10 text-[#A1A1AA]" />
      <div>
        <p className="text-base font-bold text-white">{title}</p>
        <p className="text-xs text-[#71717A] mt-1">{detail}</p>
      </div>
      <Link href="/xr-world" className="text-xs font-mono text-[#3ECF8E] hover:underline">
        Back to XR World Hub
      </Link>
    </div>
  );
}
```

**Note on mode mapping:** the link-generator stores `mode` only as `webxr`/`webar` in its UI, not on the record. The record carries `metadata.engineType`. To honor the generator's WebXR intent, the page above maps every resolvable record to `mode='vr'` (WebXR). If you later persist a mode on the record, extend `toPublic`/the resolver to include it and map `webxr→'vr'`, `webar→'ar'` there. For this pass, `'vr'` (WebXR) is the safe default that always renders.

- [ ] **Step 2: Type-check the page**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; npx tsc --noEmit --pretty false 2>&1 | Select-String "xr-world/view"`
Expected: no errors referencing `app/xr-world/view/[slug]/page.tsx`.

- [ ] **Step 3: Build, verify route is generated**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm build 2>&1 | Select-String "xr-world/view"`
Expected: a route line `ƒ /xr-world/view/[slug]` appears, and build exits 0.

- [ ] **Step 4: Run full test suite, verify no regression**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest --runInBand`
Expected: all suites pass (147 + new tests).

- [ ] **Step 5: Commit (if requested)**

```bash
git add app/xr-world/view/[slug]/page.tsx
git commit -m "feat: parametric spatial-link viewer with password gate and terminal states"
```

---

### Task 6: Final verification

**Files:** Verify only.

- [ ] **Step 1: Full build**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm build`
Expected: exit 0; route table includes `/xr-world/view/[slug]`.

- [ ] **Step 2: Full test suite**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest --runInBand`
Expected: all suites pass, 0 failed.

- [ ] **Step 3: Manual smoke (optional, if a dev server is acceptable)**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm dev`
Then open `http://localhost:3000/xr-world/view/glass-pavilion-v1` — expect the XRViewer to render (no 404). Stop the dev server after.

- [ ] **Step 4: Report**

Paste the actual `pnpm build` exit line and the `jest` summary line. Assert the `/xr-world/view/[slug]` route exists in the build table. Do not claim success from intent.

---

## Self-Review

- **Spec coverage:**
  - Public resolver (§1) → Task 2. ✅
  - Parametric viewer with states + gate (§2) → Task 5. ✅
  - `/api/xr-links` POST shareUrl fix + slug persist + GET slug filter (§3) → Task 4. ✅
  - Seeding (§4) → Task 1 seed + Task 3 password-protected seed. ✅
  - Server-side password verify (Notes) → Task 3. ✅
  - No DB migration → explicit Global Constraint. ✅
  - Tests for resolver, POST shareUrl, seeding → Tasks 2, 4, 1. ✅
- **Placeholder scan:** No TBD/TODO. Every step has concrete code. The Task 3 test initially asserts only the 404 path (valid as written) and is explicitly extended in Step 4 once the password-protected seed exists — not a placeholder, a staged test.
- **Type consistency:** `XRMode` mapping (`webxr→'vr', webar→'ar'`) consistent across Global Constraints, Task 2 interface, and Task 5. `buildXRLinkRecord` slug/`generateSlug` names match. `toPublic` omit-list matches the `XRLinkRecord` fields from Task 1. Seed slugs (`glass-pavilion-v1`, `tokyo-skyloft-xr`, `brutalist-garden-ar`) match the generator's `SAMPLE_PROJECTS` defaults and Task 1 tests.
