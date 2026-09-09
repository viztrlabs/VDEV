# XR Links Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist spatial links (`xr_links`) to Supabase via a server-only service-role client, with a new DB table and seed, plus snake_case mapping in the existing store — while preserving the in-memory fallback when Supabase is unconfigured.

**Architecture:** Add `public.xr_links` (snake_case, text PK, RLS on, zero grants) to `supabase/schema.sql` and a new dated migration. Add a server-only admin client (`lib/supabase-admin.ts`). Rewire `lib/xr-links-store.ts` to use the admin client with `toDbRow`/`fromDbRow` mappers; reads fall back to in-memory, writes return `false` when unconfigured (unchanged today's semantics).

**Tech Stack:** Next.js 15 (App Router, TypeScript), `@supabase/supabase-js` ^2.112.3, Postgres (Supabase), Jest 29 + ts-jest.

## Global Constraints

- **Package manager is `pnpm`** — run all installs/scripts via `pnpm`, never `npm`.
- **Windows / PowerShell** — no `&&` chaining; use `;` to chain dependent commands. Prefix long commands with `$env:NEXT_TELEMETRY_DISABLED="1";`.
- **Production gate:** `pnpm build` exit 0 + `pnpm exec jest --runInBand` green (currently 26 suites / 163 tests).
- **Service-role key is SERVER ONLY** — `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`/`.env.example`, never `NEXT_PUBLIC_`, never a real value in committed files.
- **RLS on `xr_links` with ZERO policies** — no anon/authenticated grants (unlike the editor anon_all policies in `20260905_editor_backend.sql`). `access_password` must never be reachable via the Data API.
- **Snake_case identifiers only** — no camelCase column names (satisfies schema-lowercase-identifiers; supabase-js maps to unquoted lowercase columns).
- **Do NOT modify** the seed records' values vs. the in-memory `XR_LINKS_DB` — mirror them exactly (incl. legacy `viztr.studio` shareUrls for `xr_link_01`/`xr_link_02`). Only timestamps for the 4 dynamic generator rows are pinned (documented divergence).
- **Do NOT touch** `lib/supabase.ts` (anon client stays as-is; out of scope).

---

### Task 1: `xr_links` DDL + seed (schema.sql + dated migration)

**Files:**
- Modify: `supabase/schema.sql:208` (append at end)
- Create: `supabase/migrations/20260909_xr_links.sql`

**Interfaces:**
- Consumes: nothing (standalone SQL; docs/superpowers/specs/2026-09-09-xr-links-persistence-design.md is the source of truth).
- Produces: `public.xr_links` table + `xr_links_slug_idx` + `xr_links_created_at_idx`, RLS enabled, 6 seeded rows that `lib/xr-links-store.ts` reads in Task 2.

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/20260909_xr_links.sql` with exactly this content (uppercase style mirrors `20260905_editor_backend.sql`):

```sql
-- VizTR XR Links — spatial-link publish persistence
-- Safe to re-run (idempotent).

CREATE TABLE IF NOT EXISTS public.xr_links (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  project_id text,
  scene_id text,
  model_url text NOT NULL,
  thumbnail_url text,
  share_url text NOT NULL,
  qr_code_url text NOT NULL DEFAULT '',
  environment text NOT NULL DEFAULT 'studio'
    CHECK (environment IN ('studio','sunset','urban','interior')),
  ar_placement text NOT NULL DEFAULT 'floor'
    CHECK (ar_placement IN ('floor','tabletop','wall','image')),
  password_protected boolean NOT NULL DEFAULT false,
  access_password text,
  views_count integer NOT NULL DEFAULT 0,
  unique_visitors integer NOT NULL DEFAULT 0,
  avg_engagement_secs double precision NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','active','expired','revoked','processing')),
  expires_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS xr_links_slug_idx ON public.xr_links (slug);
CREATE INDEX IF NOT EXISTS xr_links_created_at_idx ON public.xr_links (created_at DESC);

ALTER TABLE public.xr_links ENABLE ROW LEVEL SECURITY;
-- Intentionally NO policies. Service role bypasses RLS; anon/authenticated are
-- granted nothing, so the table is NOT reachable through the Data API and
-- access_password stays private. Do not add anon_all policies like the editor tables.

-- =====================================================================
-- SEED — mirrors the in-memory XR_LINKS_DB records exactly.
-- Timestamps for the 4 generator rows (xr_link_gp/ts/bg/secure) are pinned
-- (in-memory computes now + 90 days at module load); the 2 legacy rows keep
-- their original fixed dates.
-- =====================================================================
INSERT INTO public.xr_links
  (id, name, slug, project_id, scene_id, model_url, thumbnail_url, share_url,
   qr_code_url, environment, ar_placement, password_protected, access_password,
   views_count, unique_visitors, avg_engagement_secs, status, expires_at, metadata,
   created_at, updated_at)
VALUES
  (
    'xr_link_01', 'Lumina Sky Atrium — WebXR Spatial Tour', 'lumina-sky-atrium',
    'PRJ-VTR-8821', 'scene_lumina_01',
    'https://cdn.viztr.studio/models/lumina-sky-atrium.glb',
    'https://cdn.viztr.studio/thumbs/lumina-sky-atrium.jpg',
    'https://viztr.studio/xr/lumina-sky-atrium',
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://viztr.studio/xr/lumina-sky-atrium',
    'interior', 'floor', true, 'LUMINA-2025-XR',
    428, 312, 184, 'active', '2025-12-31T23:59:59Z',
    '{"engineType":"three","entitiesCount":142,"fileSizeMB":24.5,"formats":["glb","usdz","gltf"],"arConfig":{"placement":"floor","environment":"interior","passwordProtected":true},"delivery":{"webAR":true,"webXR":true,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2025-06-10T11:00:00Z', '2025-06-10T11:00:00Z'
  ),
  (
    'xr_link_02', 'Aura Waterfront Organic Pavilion — AR QuickLook', 'aura-waterfront-pavilion',
    'PRJ-VTR-9042', 'scene_aura_01',
    'https://cdn.viztr.studio/models/aura-pavilion.glb',
    'https://cdn.viztr.studio/thumbs/aura-pavilion.jpg',
    'https://viztr.studio/xr/aura-pavilion',
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://viztr.studio/xr/aura-pavilion',
    'sunset', 'tabletop', false, NULL,
    684, 540, 215, 'active', '2025-11-30T23:59:59Z',
    '{"engineType":"playcanvas","entitiesCount":89,"fileSizeMB":18.2,"formats":["glb","usdz"],"arConfig":{"placement":"tabletop","environment":"sunset","passwordProtected":false},"delivery":{"webAR":true,"webXR":false,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2025-06-25T14:30:00Z', '2025-06-25T14:30:00Z'
  ),
  (
    'xr_link_gp', 'Glass Pavilion — Ultra-Res Interior', 'glass-pavilion-v1',
    'glass-pavilion', NULL,
    'https://cdn.viztr.studio/models/glass-pavilion.glb', NULL,
    '/xr-world/view/glass-pavilion-v1', '',
    'interior', 'tabletop', false, NULL,
    0, 0, 0, 'active', '2026-12-08T00:00:00Z',
    '{"engineType":"three","entitiesCount":142,"fileSizeMB":24.5,"formats":["glb","usdz"],"arConfig":{"placement":"tabletop","environment":"interior","passwordProtected":false},"delivery":{"webAR":true,"webXR":true,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2026-09-09T00:00:00Z', '2026-09-09T00:00:00Z'
  ),
  (
    'xr_link_ts', 'Tokyo Skyloft XR', 'tokyo-skyloft-xr',
    'tokyo-skyloft', NULL,
    'https://cdn.viztr.studio/models/tokyo-skyloft.glb', NULL,
    '/xr-world/view/tokyo-skyloft-xr', '',
    'urban', 'floor', false, NULL,
    0, 0, 0, 'active', '2026-12-08T00:00:00Z',
    '{"engineType":"playcanvas","entitiesCount":142,"fileSizeMB":24.5,"formats":["glb","usdz"],"arConfig":{"placement":"floor","environment":"urban","passwordProtected":false},"delivery":{"webAR":true,"webXR":true,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2026-09-09T00:00:00Z', '2026-09-09T00:00:00Z'
  ),
  (
    'xr_link_bg', 'Brutalist Garden AR', 'brutalist-garden-ar',
    'brutalist-garden', NULL,
    'https://cdn.viztr.studio/models/brutalist-garden.glb', NULL,
    '/xr-world/view/brutalist-garden-ar', '',
    'studio', 'image', false, NULL,
    0, 0, 0, 'active', '2026-12-08T00:00:00Z',
    '{"engineType":"three","entitiesCount":142,"fileSizeMB":24.5,"formats":["glb","usdz"],"arConfig":{"placement":"image","environment":"studio","passwordProtected":false},"delivery":{"webAR":true,"webXR":true,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2026-09-09T00:00:00Z', '2026-09-09T00:00:00Z'
  ),
  (
    'xr_link_secure', 'Client Secure Haven — Gated XR', 'client-secure-haven',
    'client-secure-haven', NULL,
    'https://cdn.viztr.studio/models/client-secure-haven.glb', NULL,
    '/xr-world/view/client-secure-haven', '',
    'interior', 'floor', true, 'VIZTR-2026',
    0, 0, 0, 'active', '2026-12-08T00:00:00Z',
    '{"engineType":"three","entitiesCount":142,"fileSizeMB":24.5,"formats":["glb","usdz"],"arConfig":{"placement":"floor","environment":"interior","passwordProtected":true},"delivery":{"webAR":true,"webXR":true,"iOSQuickLook":true,"androidAR":true}}'::jsonb,
    '2026-09-09T00:00:00Z', '2026-09-09T00:00:00Z'
  )
ON CONFLICT (id) DO NOTHING;
```

- [ ] **Step 2: Mirror the DDL in `supabase/schema.sql`**

Append to the end of `supabase/schema.sql` (line 208), using its lowercase idempotent style, identical table/index/RLS statements plus the same seed block above (keep the SQL identical apart from statement casing — the file already favours `create table if not exists` / `create index if not exists`):

```sql
-- =====================================================================
-- XR LINKS (spatial-link publish persistence)
-- Used by public resolver/verify + auth-gated store via a server-only
-- service-role client. RLS enabled with zero policies (service role
-- bypasses RLS; Data API gets nothing, so access_password stays private).
-- =====================================================================
```

then the table/index/RLS/seed SQL from Step 1, capitalisation adjusted to the file's lowercase style (e.g. `create table if not exists public.xr_links (`, `check (environment in (...))`, `insert into public.xr_links ... on conflict (id) do nothing;`).

- [ ] **Step 3: Verify both files are consistent**

Run:
```powershell
$env:NEXT_TELEMETRY_DISABLED="1"; git diff --stat; git status
```

Expected: `supabase/schema.sql` modified, `supabase/migrations/20260909_xr_links.sql` untracked; visually confirm the seed block is byte-identical between the two files (same 6 rows, same pinned timestamps, same metadata JSON).

- [ ] **Step 4: Commit**

```bash
git add supabase/schema.sql supabase/migrations/20260909_xr_links.sql
git commit -m "feat(db): add xr_links table with service-role-only RLS and seed"
```

---

### Task 2: Service-role admin client + store rework with mappers

**Files:**
- Create: `lib/supabase-admin.ts`
- Modify: `lib/xr-links-store.ts:1` (imports), `:186-243` (the three DB functions)
- Test: `app/api/xr-links/__tests__/store.test.ts` (add mapper tests), `app/api/xr-links/__tests__/store-db.test.ts` (new)

**Interfaces:**
- Consumes: `XRLinkRecord`, `XR_LINKS_DB`, `getXRLinkBySlug` (all already defined in `lib/xr-links-store.ts`, unchanged); the anon `lib/supabase.ts` client is no longer used by this store.
- Produces:
  - `lib/supabase-admin.ts`: `isSupabaseAdminConfigured: boolean`, `adminClient: SupabaseClient | null` (null when env vars missing or client-side).
  - `lib/xr-links-store.ts`: `XrLinkDbRow` (snake_case row shape), `toDbRow(link: XRLinkRecord): XrLinkDbRow`, `fromDbRow(row: XrLinkDbRow): XRLinkRecord`, and rewired `getXRLinksFromDB(): Promise<XRLinkRecord[]>` / `saveXRLinkToDB(link: XRLinkRecord): Promise<boolean>` / `deleteXRLinkFromDB(id: string): Promise<boolean>`.

- [ ] **Step 1: Write the failing mapper tests**

Append to `app/api/xr-links/__tests__/store.test.ts`:

```ts
import { XR_LINKS_DB, getXRLinkBySlug, toDbRow, fromDbRow } from '@/lib/xr-links-store';
```

(replace the existing import on line 4) and append these tests inside the `describe('xr-links-store', ...)` block:

```ts
  describe('mappers', () => {
    it('toDbRow maps camelCase record to snake_case row', () => {
      const link = XR_LINKS_DB[0];
      const row = toDbRow(link);
      expect(row.id).toBe(link.id);
      expect(row.project_id).toBe(link.projectId);
      expect(row.model_url).toBe(link.modelUrl);
      expect(row.ar_placement).toBe(link.arPlacement);
      expect(row.password_protected).toBe(link.passwordProtected);
      expect(row.access_password).toBe(link.accessPassword);
      expect(row.views_count).toBe(link.viewsCount);
      expect(row.avg_engagement_secs).toBe(link.avgEngagementSecs);
      expect(row.expires_at).toBe(link.expiresAt);
      expect(row.created_at).toBe(link.createdAt);
      expect(row.updated_at).toBe(link.updatedAt);
      expect(row.metadata).toEqual(link.metadata);
    });

    it('toDbRow turns missing optional strings into null', () => {
      const row = toDbRow(XR_LINKS_DB[2]);
      expect(row.scene_id).toBeNull();
      expect(row.thumbnail_url).toBeNull();
      expect(row.access_password).toBeNull();
    });

    it('fromDbRow restores a round-trip record', () => {
      const original = XR_LINKS_DB[1];
      expect(fromDbRow(toDbRow(original))).toEqual(original);
    });

    it('fromDbRow maps null optionals back to undefined', () => {
      const link = fromDbRow(toDbRow(XR_LINKS_DB[2]));
      expect(link.sceneId).toBeUndefined();
      expect(link.thumbnailUrl).toBeUndefined();
      expect(link.accessPassword).toBeUndefined();
    });
  });
```

- [ ] **Step 2: Run mapper tests to verify they fail**

Run:
```powershell
$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest app/api/xr-links/__tests__/store.test.ts --runInBand
```

Expected: FAIL — `toDbRow is not a function` / `fromDbRow is not a function` (they don't exist yet).

- [ ] **Step 3: Create `lib/supabase-admin.ts`**

```ts
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Server-only admin client. The service role key bypasses RLS and must never
// be shipped to the browser (no NEXT_PUBLIC_ prefix). Reads .env.local values
// at module load; tests run without the key, so adminClient is null there and
// the store falls back to the in-memory DB.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseAdminConfigured =
  Boolean(supabaseUrl && serviceRoleKey) && typeof window === 'undefined';

export const adminClient: SupabaseClient | null = isSupabaseAdminConfigured
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
```

Note: reuse `NEXT_PUBLIC_SUPABASE_URL` for the URL (it is public; only the key is a secret). Do **not** add a separate `SUPABASE_URL` var — the repo convention is `NEXT_PUBLIC_SUPABASE_URL`.

- [ ] **Step 4: Add failing DB-path tests (new file)**

Create `app/api/xr-links/__tests__/store-db.test.ts`:

```ts
/**
 * @jest-environment node
 */
import {
  getXRLinksFromDB,
  saveXRLinkToDB,
  deleteXRLinkFromDB,
  buildXRLinkRecord,
} from '@/lib/xr-links-store';
import { adminClient } from '@/lib/supabase-admin';

jest.mock('@/lib/supabase-admin', () => ({
  isSupabaseAdminConfigured: true,
  adminClient: {
    from: jest.fn(),
  },
}));

const mockedFrom = adminClient!.from as jest.Mock;

const snakeRow = {
  id: 'xr_db_1',
  name: 'DB Link',
  slug: 'db-link',
  project_id: 'PRJ-XR-1',
  scene_id: null,
  model_url: 'https://example.test/models/db-link.glb',
  thumbnail_url: null,
  share_url: '/xr-world/view/db-link',
  qr_code_url: '',
  environment: 'studio' as const,
  ar_placement: 'floor' as const,
  password_protected: false,
  access_password: null,
  views_count: 0,
  unique_visitors: 0,
  avg_engagement_secs: 0,
  status: 'active' as const,
  expires_at: '2026-12-08T00:00:00Z',
  metadata: {
    engineType: 'three',
    entitiesCount: 1,
    fileSizeMB: 1,
    formats: ['glb'],
    arConfig: { placement: 'floor', environment: 'studio', passwordProtected: false },
    delivery: { webAR: true, webXR: false, iOSQuickLook: true, androidAR: false },
  },
  created_at: '2026-09-09T00:00:00Z',
  updated_at: '2026-09-09T00:00:00Z',
};

describe('xr-links-store admin DB path', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getXRLinksFromDB maps snake_case rows to camelCase records', async () => {
    mockedFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [snakeRow], error: null }),
      }),
    });

    const links = await getXRLinksFromDB();
    expect(links).toHaveLength(1);
    expect(links[0].projectId).toBe('PRJ-XR-1');
    expect(links[0].modelUrl).toBe('https://example.test/models/db-link.glb');
    expect(links[0].createdAt).toBe('2026-09-09T00:00:00Z');
    expect(links[0].sceneId).toBeUndefined();
    expect(links[0].accessPassword).toBeUndefined();
    expect(links[0].metadata).toEqual(snakeRow.metadata);
  });

  it('getXRLinksFromDB falls back to in-memory on admin error', async () => {
    mockedFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: null, error: { message: 'boom' } }),
      }),
    });

    const links = await getXRLinksFromDB();
    expect(links.length).toBeGreaterThan(0);
    expect(links[0].id).not.toBe('xr_db_1');
  });

  it('saveXRLinkToDB upserts the snake_case row and returns true', async () => {
    const { upsert } = { upsert: jest.fn().mockResolvedValue({ error: null }) };
    mockedFrom.mockReturnValue({ upsert });

    const link = buildXRLinkRecord({ name: 'Save Me', projectId: 'PRJ-SAVE', origin: 'https://example.test' });
    const ok = await saveXRLinkToDB(link);
    expect(ok).toBe(true);
    expect(mockedFrom).toHaveBeenCalledWith('xr_links');
    const [row, opts] = upsert.mock.calls[0];
    expect(opts).toEqual({ onConflict: 'id' });
    expect(row.id).toBe(link.id);
    expect(row.project_id).toBe('PRJ-SAVE');
    expect(row.created_at).toBe(link.createdAt);
    expect(row.model_url).toBe('https://example.test/models/save-me.glb');
    expect(row.access_password).toBeNull();
  });

  it('saveXRLinkToDB returns false on upsert error', async () => {
    mockedFrom.mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: { message: 'constraint' } }),
    });

    const ok = await saveXRLinkToDB(buildXRLinkRecord({ name: 'Fail', projectId: 'PRJ-FAIL' }));
    expect(ok).toBe(false);
  });

  it('deleteXRLinkFromDB deletes by id', async () => {
    const eq = jest.fn().mockResolvedValue({ error: null });
    const del = jest.fn().mockReturnValue({ eq });
    mockedFrom.mockReturnValue({ delete: del });

    const ok = await deleteXRLinkFromDB('xr_db_1');
    expect(ok).toBe(true);
    expect(mockedFrom).toHaveBeenCalledWith('xr_links');
    expect(del).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 'xr_db_1');
  });
});
```

Note: the mock chain returns the admin client's builder objects directly (not promises) for `select().order()` and `delete().eq()`; the awaited call resolves via `.mockResolvedValue` on the final builder method. This matches `@supabase/supabase-js` PostgrestBuilder behavior (thenable objects), so the real store code works unchanged against these mocks.

- [ ] **Step 5: Run DB-path tests to verify they fail**

Run:
```powershell
$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest app/api/xr-links/__tests__/store-db.test.ts --runInBand
```

Expected: FAIL — store still imports from `@/lib/supabase` (anon) and ignores the mock, so `getXRLinksFromDB` hits real `supabase` and the mocked `adminClient` is unused.

- [ ] **Step 6: Implement the store rework**

In `lib/xr-links-store.ts`:

a) Replace line 1 import with the admin client:

```ts
import { adminClient, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
```

b) Add the row type + mappers directly below the `XRLinkRecord` interface (after line 41):

```ts
export interface XrLinkDbRow {
  id: string;
  name: string;
  slug: string;
  project_id: string;
  scene_id: string | null;
  model_url: string;
  thumbnail_url: string | null;
  share_url: string;
  qr_code_url: string;
  environment: XRLinkRecord['environment'];
  ar_placement: XRLinkRecord['arPlacement'];
  password_protected: boolean;
  access_password: string | null;
  views_count: number;
  unique_visitors: number;
  avg_engagement_secs: number;
  status: XRLinkRecord['status'];
  expires_at: string;
  metadata: XRLinkRecord['metadata'];
  created_at: string;
  updated_at: string;
}

export function toDbRow(link: XRLinkRecord): XrLinkDbRow {
  return {
    id: link.id,
    name: link.name,
    slug: link.slug,
    project_id: link.projectId,
    scene_id: link.sceneId ?? null,
    model_url: link.modelUrl,
    thumbnail_url: link.thumbnailUrl ?? null,
    share_url: link.shareUrl,
    qr_code_url: link.qrCodeUrl,
    environment: link.environment,
    ar_placement: link.arPlacement,
    password_protected: link.passwordProtected,
    access_password: link.accessPassword ?? null,
    views_count: link.viewsCount,
    unique_visitors: link.uniqueVisitors,
    avg_engagement_secs: link.avgEngagementSecs,
    status: link.status,
    expires_at: link.expiresAt,
    metadata: link.metadata,
    created_at: link.createdAt,
    updated_at: link.updatedAt,
  };
}

export function fromDbRow(row: XrLinkDbRow): XRLinkRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    projectId: row.project_id,
    sceneId: row.scene_id ?? undefined,
    modelUrl: row.model_url,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    shareUrl: row.share_url,
    qrCodeUrl: row.qr_code_url,
    environment: row.environment,
    arPlacement: row.ar_placement,
    passwordProtected: row.password_protected,
    accessPassword: row.access_password ?? undefined,
    viewsCount: row.views_count,
    uniqueVisitors: row.unique_visitors,
    avgEngagementSecs: row.avg_engagement_secs,
    status: row.status,
    expiresAt: row.expires_at,
    metadata: row.metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
```

c) Replace the bodies of the three DB functions (lines 186-243) to use the admin client + mappers:

```ts
export async function getXRLinksFromDB(): Promise<XRLinkRecord[]> {
  if (isSupabaseAdminConfigured && adminClient) {
    try {
      const { data, error } = await adminClient
        .from('xr_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return (data as XrLinkDbRow[]).map(fromDbRow);
      }
    } catch (err) {
      console.warn('[XR Links] Supabase fetch failed:', err);
    }
  }
  return XR_LINKS_DB;
}

export async function saveXRLinkToDB(link: XRLinkRecord): Promise<boolean> {
  if (isSupabaseAdminConfigured && adminClient) {
    try {
      const { error } = await adminClient
        .from('xr_links')
        .upsert(toDbRow(link), { onConflict: 'id' });

      if (error) {
        console.warn('[XR Links] Supabase upsert failed:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[XR Links] Supabase upsert error:', err);
      return false;
    }
  }
  return false;
}

export async function deleteXRLinkFromDB(id: string): Promise<boolean> {
  if (isSupabaseAdminConfigured && adminClient) {
    try {
      const { error } = await adminClient
        .from('xr_links')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('[XR Links] Supabase delete failed:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[XR Links] Supabase delete error:', err);
      return false;
    }
  }
  return false;
}
```

Do not touch anything else in the file (buildXRLinkRecord, generateSlug, generateQRCodeUrl, getXRLinkBySlug, XR_LINKS_DB, BuildLinkParams remain unchanged).

- [ ] **Step 7: Run store + DB-path tests**

Run:
```powershell
$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest app/api/xr-links/__tests__ --runInBand
```

Expected: PASS — mapper tests in `store.test.ts` and all five DB-path tests in `store-db.test.ts`.

- [ ] **Step 8: Full suite + build**

Run:
```powershell
$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest --runInBand
$env:NEXT_TELEMETRY_DISABLED="1"; pnpm build
```

Expected: full jest suite green (26 suites, tests ≥ 163 — new mapper + DB-path tests added); `pnpm build` exits 0. Note: under jest `isSupabaseAdminConfigured` is false (no service key), so existing route tests resolve via the in-memory fallback exactly as before; they are the regression backstop for live queries.

- [ ] **Step 9: Commit**

```bash
git add lib/supabase-admin.ts lib/xr-links-store.ts app/api/xr-links/__tests__/store.test.ts app/api/xr-links/__tests__/store-db.test.ts
git commit -m "feat(store): persist xr_links via server-only service-role client with snake_case mappers"
```

---

### Task 3: Env example note + final verification

**Files:**
- Verify: `.env.example:12-13` (already contains `SUPABASE_SERVICE_ROLE_KEY` server-only comment)
- Test/verify: full suite + build

**Interfaces:**
- Consumes: Task 1 + Task 2 outputs.
- Produces: confirmation the feature is shippable; a reminder that the user must supply a real `SUPABASE_SERVICE_ROLE_KEY` locally and run the migration against the Supabase project.

- [ ] **Step 1: Confirm `.env.example` already documents the key**

Read `.env.example`. It already has:

```
# Service-role key — SERVER ONLY. Bypasses RLS. Never expose to the client.
SUPABASE_SERVICE_ROLE_KEY=
```

No change needed. Do **not** put a real key in this file.

- [ ] **Step 2: Regression check — route logic untouched**

Run the public + admin route tests:
```powershell
$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest app/api/xr-links --runInBand
```

Expected: PASS (covers resolver status branches, verify no-password guard, shareUrl/slug assertions from the earlier publish-chain work).

- [ ] **Step 3: Final gate**

Run:
```powershell
$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest --runInBand; if ($?) { $env:NEXT_TELEMETRY_DISABLED="1"; pnpm build }
```

Expected: full suite green and build exit 0.

- [ ] **Step 4: Commit any stragglers**

```powershell
git status
```

Expected: clean working tree (or only docs/loose ends from earlier work, which you should NOT commit unless the user asks). If `.environment`-style artifacts (`tsconfig.tsbuildinfo`, `.data/analytics/events.jsonl`) appear modified, leave them untouched.

---

## Self-Review

**Spec coverage**
- Table DDL + indexes + RLS-zero-policies → Task 1 ✓
- Seed of the 6 records idempotently → Task 1 ✓
- `lib/supabase-admin.ts` server-only client (isSupabaseAdminConfigured, adminClient, no NEXT_PUBLIC_ key) → Task 2 step 3 ✓
- Store rework (mappers, upsert `{onConflict:'id'}`, `.order('created_at')`, reads fall back / writes return false) → Task 2 step 6 ✓
- `.env.example` note → Task 3 ✓ (already present)
- Mapper unit tests + DB-path tests → Task 2 steps 1/4 ✓
- Error handling → Task 2 step 6 (try/catch + fallback preserved) ✓
- Full suite + build gate → Tasks 2 step 8 / 3 step 3 ✓

**Placeholder scan**: no TBD/TODO/“similar to”/hand-wavy steps; every code step has full content. The one `as never`/`as any` cast in Task 2 step 4 has an explicit runtime-truth note and a fallback cast.

**Type consistency**: `XrLinkDbRow` defined once in Task 2 and referenced consistently; `toDbRow`/`fromDbRow` signatures match across tests and implementation; `adminClient`/`isSupabaseAdminConfigured` names consistent between `lib/supabase-admin.ts` (Task 2 step 3), the store import (step 6a), and the tests (step 4). `getXRLinksFromDB`/`saveXRLinkToDB`/`deleteXRLinkFromDB` keep their existing signatures so route handlers and the verify/resolver endpoints need zero changes. The DB-path tests build real records via `buildXRLinkRecord` (no `any` casts), and the mock `upsert`/`order`/`eq` builders return thenable mocks matching PostgrestBuilder's `.then()` contract so the untouched store code resolves them on `await`.