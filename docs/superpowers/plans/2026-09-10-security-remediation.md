# Security & Hardening Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the Critical/High findings from the 2026-09-10 technical audit: production demo super-admin backdoor, client auth fallback bypass, auth-guard role casing mismatch, unguarded client data exposure, Next 15 async-params breakage of the public XR share flow, unauthenticated editor DDL endpoint, dead mock form submissions, and duplicate content routes — while keeping the suite green and the share feature working.

**Architecture:** Consolidate the client directory into a single server-side module used by both the HTTP route and the NextAuth client lookup (removing the fragile server self-fetch), then guard the HTTP surface with session checks and strip secrets. Fix the three auth defects (demo gating, fallback removal, lowercase role convention) directly in `lib/auth.ts` / `lib/auth-helpers.ts`. Migrate public XR routes to awaited Promise `params`. Add real persistence behind the existing `/api/forms/[type]` endpoint and point the client forms at it. Reconcile duplicate routes with `next.config.ts` redirects.

**Tech Stack:** Next.js 15.1.6 (App Router, async `params`), NextAuth v4 (JWT + middleware RBAC), `@supabase/supabase-js`, jest + ts-jest (`lib/__tests__/`), node `fs` file-store pattern (`.data/`), Node built-in `crypto`, pnpm.

## Global Constraints

- Test gate for every task: `pnpm exec jest --runInBand` full suite stays green (baseline 27 suites / 180 tests) AND `pnpm build` exits 0. `package.json` uses `next/jest`; env in tests comes from jest mocks — never from real `.env.local`.
- `params` is a `Promise` on this codebase (Next 15.1.6). Route handlers must `await params`. Do not reintroduce sync `params` access anywhere.
- Role convention is lowercase (`UserRole = 'super_admin' | 'admin' | 'user' | 'client'`, `lib/rbac.ts:8`). Never compare against uppercase role strings.
- No new runtime dependencies beyond the current lockfile.
- Working directly on `main`; run the full suite + `pnpm build` before pushing; push after completion (user-approved precedent).
- Do not commit `.data/analytics/events.jsonl` or `tsconfig.tsbuildinfo`.
- The known demo/client login chain in `lib/auth.ts` is: **Supabase first → demo accounts → client access-code lookup**. All three paths stay reachable; only the insecure behaviors (prod super-admin demo, `clients[0]` fallback, uppercase guards) change.
- Server-side client lookup must NOT call its own HTTP API. It reads the repository layer directly.
- Shell is PowerShell. Chain with `;` and `if ($?) { }` — never `&&`. Prefix long commands with `$env:NEXT_TELEMETRY_DISABLED="1";`.
- `next.config.ts` sets `typescript.ignoreBuildErrors: true` — `tsc --noEmit` (for changed files) is the type gate; `pnpm build` verifies compilation.

---

### Task 1: Gate production demo super-admin accounts

**Files:**
- Modify: `lib/auth.ts:20-45`
- Test: `lib/__tests__/auth.test.ts`

**Interfaces:**
- Consumes: nothing new — `getDemoAuthUser(email, password)` already exported.
- Produces: `getDemoAuthUser` still returns demo users in test/dev, but `super_admin`-role demo accounts return `null` when `process.env.NODE_ENV === 'production'`.

- [ ] **Step 1: Write the failing tests**

Append to `lib/__tests__/auth.test.ts` inside `describe('Demo auth contract (lib/auth.ts)')`:

```ts
it('rejects admin demo credentials in production', () => {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  expect(getDemoAuthUser('admin@viztr.com', 'password123')).toBeNull();
  expect(getDemoAuthUser('manager@viztr.com', 'password123')).toBeNull();
  process.env.NODE_ENV = prev;
});

it('still allows demo accounts in non-production', () => {
  expect(getDemoAuthUser('admin@viztr.com', 'password123')).toMatchObject({
    role: 'super_admin',
  });
});
```

Run: `pnpm exec jest lib/__tests__/auth.test.ts -t "production" -v`
Expected: FAIL — `getDemoAuthUser` currently returns the super_admin account regardless of env. (If it already reads a module-scope `const isProduction`, the test still fails for the same reason — `isProduction` will be `true` for the loaded module, which is exactly the bug.)

- [ ] **Step 2: Implement production gating**

In `lib/auth.ts`, replace the module-level constant with a lazy check so tests can flip `NODE_ENV`:

```ts
const isProduction = (): boolean => process.env.NODE_ENV === 'production';
```

Then wrap the `admin@viztr.com` and `manager@viztr.com` branches (lines 25-32 and 47-54) with the same guard the labs account uses:

```ts
if (
  !isProduction() &&
  normalizedEmail === 'admin@viztr.com' &&
  password === 'password123'
) {
  // ... unchanged super_admin return
}
```

Add the same `!isProduction()` condition to the `manager@viztr.com` branch. Leave `user@viztr.com` and `client@viztr.com` ungated (non-privileged roles).

If `isProduction()` is referenced anywhere else in the file (e.g. `getSessionSecret`), update those call sites from `isProduction` to `isProduction()`.

- [ ] **Step 3: Run tests to verify they pass**

Run: `pnpm exec jest lib/__tests__/auth.test.ts -v`
Expected: PASS (both new tests green), including the non-production demo test.

- [ ] **Step 4: Verify full suite + build**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest --runInBand; if ($?) { pnpm build }`
Expected: all 27 suites pass; build exits 0.

- [ ] **Step 5: Commit**

```bash
git add lib/auth.ts lib/__tests__/auth.test.ts
git commit -m "fix(auth): gate privileged demo accounts behind non-production"
```

---

### Task 2: Remove client auth fallback bypass and stop self-fetching

**Files:**
- Create: `lib/client-directory.ts`
- Modify: `lib/auth.ts:76-120` (`lookupClientByCredentials`), `app/api/clients/route.ts`
- Test: `lib/__tests__/auth.test.ts`

**Interfaces:**
- Produces (exact contract later tasks rely on):

```ts
// lib/client-directory.ts
export interface ClientDirectoryRecord {
  id: string;
  name: string;
  firmName: string;
  email: string;
  phone: string;
  tier: string;
  activeProjects: number;
  totalSpend: string;
  status: 'Active' | 'Pending Review' | 'Archived';
  portalAccessCode: string;
  assignedDirector: string;
  joinedDate: string;
  notes: string;
  logoUrl?: string;
}

export interface ClientDirectoryQuery {
  tier?: string;
  query?: string;
  accessCode?: string;
  id?: string;
  email?: string;
}

export async function listClientDirectory(
  q: ClientDirectoryQuery = {}
): Promise<ClientDirectoryRecord[]>

export function toPublicClient(
  c: ClientDirectoryRecord
): Omit<ClientDirectoryRecord, 'portalAccessCode' | 'notes' | 'totalSpend'>
```

The module owns the in-memory fallback table (moved out of `app/api/clients/route.ts`), tries `listClientsSupabase` first, and falls back to the table when Supabase is unconfigured. `email` is matched exactly (case-insensitive). `toPublicClient` strips `portalAccessCode`, `notes`, `totalSpend`.

- Consumes: `listClientsSupabase`, `isSupabaseAdminReady` from `@/lib/supabase/repositories`; `ClientQuery` family from the same module.

- [ ] **Step 1: Write the failing test**

Two edits to `lib/__tests__/auth.test.ts`:

**(a)** Update the existing `authenticateUser — Supabase-first validation` setup: replace the `global.fetch` mock in its `beforeEach` (file lines ~63-79) with a `listClientDirectory` mock, since the refactor removes the self-fetch. Add a module mock at the top of the file next to the existing `jest.mock('@/lib/supabase', ...)` call:

```ts
const mockListClients = jest.fn();
jest.mock('@/lib/client-directory', () => ({
  listClientDirectory: mockListClients,
}));
```

Then in the existing `beforeEach`, replace `global.fetch = ...` with:

```ts
mockListClients.mockReset();
mockListClients.mockResolvedValue([
  {
    id: 'cli_test_1',
    name: 'Test Client',
    firmName: 'Test Studio',
    email: 'client@test.com',
    portalAccessCode: 'FST-2025-VTR',
    assignedDirector: 'Alex',
    status: 'Active',
  },
]);
```

Remove the `originalFetch`/`afterEach` restore block, since no self-fetch remains. Import the mock at top alongside other imports:

```ts
import { listClientDirectory } from '@/lib/client-directory'; // gets the jest mock
const mockListClients = listClientDirectory as jest.Mock;
```

**(b)** Append a new describe block:

```ts
describe('lookupClientByCredentials hardening', () => {
  const matchingClient = {
    id: 'cli_a',
    name: 'A Sterling',
    firmName: 'Foster + Partners London',
    email: 'a.sterling@fosterpartners.com',
    phone: '+44 20 7738 0455',
    tier: 'Enterprise VIP',
    activeProjects: 3,
    totalSpend: '$420,000',
    status: 'Active' as const,
    portalAccessCode: 'FST-2025-VTR',
    assignedDirector: 'Marcus Vance',
    joinedDate: '2024-03-15',
    notes: 'x',
  };

  beforeEach(() => {
    mockListClients.mockResolvedValue([matchingClient]);
  });

  it('resolves an exact email match', async () => {
    const user = await lookupClientByCredentials('A.STERLING@fosterpartners.com', undefined);
    expect(user?.email).toBe('a.sterling@fosterpartners.com');
  });

  it('resolves an exact access-code match', async () => {
    const user = await lookupClientByCredentials(undefined, 'fst-2025-vtr');
    expect(user?.portalAccessCode).toBe('FST-2025-VTR');
  });

  it('returns null instead of the first client when nothing matches', async () => {
    const user = await lookupClientByCredentials('nobody@nowhere.com', undefined);
    expect(user).toBeNull();
  });
});
```

Add `lookupClientByCredentials` to the top-level import from `@/lib/auth` (it is currently a module-local function at `lib/auth.ts:77`; Task 2's step 3 re-exports it — add it to the import statement here in the same task).

Run: `pnpm exec jest lib/__tests__/auth.test.ts -v`
Expected: FAIL — the third new test fails because `clients[0]` is returned for a non-matching email.

- [ ] **Step 2: Create `lib/client-directory.ts`**

Move `CLIENTS_DB` and its seed data from `app/api/clients/route.ts` verbatim into the new module. Add:

```ts
import {
  listClientsSupabase,
  isSupabaseAdminReady,
} from '@/lib/supabase/repositories';
import type { ClientRecord } from '@/app/api/clients/route';

// Reuses the full ClientRecord contract from the route module (Task 2 contracts
// alias it as ClientDirectoryRecord — they are the same type).
export type ClientDirectoryRecord = ClientRecord;

// Mutable, shared by read and mutation handlers in app/api/clients/route.ts.
export let CLIENTS_DB: ClientRecord[] = [ /* moved seed data */ ];

export async function listClientDirectory(
  q: ClientDirectoryQuery = {}
): Promise<ClientRecord[]> {
  if (isSupabaseAdminReady()) {
    const fromDb = await listClientsSupabase({
      tier: q.tier,
      query: q.query,
      accessCode: q.accessCode,
      id: q.id,
    });
    if (fromDb !== null) return fromDb;
  }

  let filtered = [...CLIENTS_DB];
  if (q.tier && q.tier !== 'ALL') filtered = filtered.filter((c) => c.tier === q.tier);
  if (q.email) {
    const needle = q.email.toLowerCase().trim();
    filtered = filtered.filter((c) => c.email.toLowerCase() === needle);
  }
  if (q.query) {
    const term = q.query.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.firmName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.portalAccessCode.toLowerCase().includes(term)
    );
  }
  if (q.accessCode) {
    const code = q.accessCode.toUpperCase();
    filtered = filtered.filter((c) => c.portalAccessCode.toUpperCase() === code);
  }
  if (q.id) filtered = filtered.filter((c) => c.id === q.id);
  return filtered;
}

export function toPublicClient(
  c: ClientRecord
): Omit<ClientRecord, 'portalAccessCode' | 'notes' | 'totalSpend'> {
  const { portalAccessCode: _p, notes: _n, totalSpend: _t, ...rest } = c;
  return rest;
}
```

- [ ] **Step 3: Rewire `lookupClientByCredentials` in `lib/auth.ts`**

Replace the body of `lookupClientByCredentials` (now exported — change `async function lookupClientByCredentials` to `export async function lookupClientByCredentials` at `lib/auth.ts:77`) so it queries the directory module directly — no `fetch`, no `NEXTAUTH_URL` derivation, no `clients[0]` fallback:

```ts
async function lookupClientByCredentials(
  email: string | undefined,
  accessCode: string | undefined
): Promise<ClientAuthLookup | null> {
  if (!email && !accessCode) return null;

  const candidates = await listClientDirectory({
    email,
    accessCode,
  });
  if (accessCode) {
    const match = candidates.find(
      (c) => c.portalAccessCode.toUpperCase() === accessCode.toUpperCase()
    );
    if (match) return toClientLookup(match);
  }
  if (email) {
    const match = candidates.find(
      (c) => c.email.toLowerCase() === email.toLowerCase().trim()
    );
    if (match) return toClientLookup(match);
  }
  return null;
}
```

Add the top-level import and a `toClientLookup` helper in the same file:

```ts
import { listClientDirectory } from './client-directory';
import type { ClientDirectoryRecord } from './client-directory';

function toClientLookup(c: ClientDirectoryRecord): ClientAuthLookup {
  return {
    id: c.id,
    name: c.name,
    firmName: c.firmName,
    email: c.email,
    portalAccessCode: c.portalAccessCode,
    assignedDirector: c.assignedDirector,
    status: c.status,
  };
}
```

- [ ] **Step 4: Refactor `app/api/clients/route.ts`**

Remove the local `CLIENTS_DB` seed array (now lives in `lib/client-directory.ts`) and route the GET through the shared directory. Keep the existing response shape (`success`, `count`, `clients`, `source`) and the `tier`/`q`/`accessCode`/`id` filters, plus accept `email`. Auth gating is added in the next task — for now preserve current (unguarded) behavior:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { listClientDirectory } from '@/lib/client-directory';
import { isSupabaseAdminReady } from '@/lib/supabase/repositories';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get('tier') || undefined;
  const query = searchParams.get('q')?.toLowerCase() || undefined;
  const accessCode = searchParams.get('accessCode') || undefined;
  const id = searchParams.get('id') || undefined;
  const email = searchParams.get('email') || undefined;

  const clients = await listClientDirectory({ tier, query, accessCode, id, email });
  return NextResponse.json({
    success: true,
    count: clients.length,
    clients,
    // listClientDirectory already falls back to the in-memory table when
    // Supabase is unconfigured; report the source that will be apparent.
    source: isSupabaseAdminReady() ? 'supabase' : 'memory',
  });
}
```

Keep `POST`, `PUT`, `DELETE` working against the same in-memory list. The seed records moved to `lib/client-directory.ts`; export `CLIENTS_DB` from that module (a mutable `let`) and have the mutation handlers import and mutate it, so this file no longer owns the data.

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest --runInBand; if ($?) { pnpm build }`
Expected: all suites pass (new + existing 27), build exits 0.

- [ ] **Step 5: Commit**

```bash
git add lib/client-directory.ts lib/auth.ts app/api/clients/route.ts lib/__tests__/auth.test.ts
git commit -m "fix(auth): drop client[0] fallback and self-fetch; shared client directory"
```

---

### Task 3: Guard `/api/clients` and strip secrets for non-admins

**Files:**
- Modify: `app/api/clients/route.ts`
- Test: create `app/api/clients/__tests__/route.test.ts`

**Interfaces:**
- Consumes: `listClientDirectory` + `toPublicClient` from `lib/client-directory.ts`; `getServerSession` from `next-auth/next`; `authOptions` from `@/lib/auth`; `normalizeUserRole` from `@/lib/rbac`.
- Produces: authenticated `super_admin`/`admin` see full records including `portalAccessCode`; every other caller sees `toPublicClient`-stripped records; unauthenticated callers get `401`.

- [ ] **Step 1: Write the failing tests**

Create `app/api/clients/__tests__/route.test.ts`:

```ts
/**
 * @jest-environment node
 */
import { GET } from '@/app/api/clients/route';
import { NextRequest } from 'next/server';

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

import { getServerSession } from 'next-auth/next';
import { normalizeUserRole } from '@/lib/rbac';
import { listClientDirectory } from '@/lib/client-directory';

jest.mock('@/lib/supabase/repositories', () => ({
  isSupabaseAdminReady: () => false,
  listClientsSupabase: async () => null,
}));

describe('GET /api/clients — auth guard', () => {
  beforeEach(() => {
    (getServerSession as jest.Mock).mockReset();
  });

  it('returns 401 when unauthenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const res = await GET(new NextRequest('http://localhost:3000/api/clients'));
    expect(res.status).toBe(401);
  });

  it('returns full records for admins', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { role: 'super_admin' },
    });
    const res = await GET(new NextRequest('http://localhost:3000/api/clients'));
    expect(res.status).toBe(200);
    const body = await res.json();
    for (const c of body.clients) {
      expect(c).toHaveProperty('portalAccessCode');
    }
  });

  it('strips portalAccessCode, notes, totalSpend for non-admins', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { role: 'user' },
    });
    const res = await GET(new NextRequest('http://localhost:3000/api/clients'));
    expect(res.status).toBe(200);
    const body = await res.json();
    for (const c of body.clients) {
      expect(c).not.toHaveProperty('portalAccessCode');
      expect(c).not.toHaveProperty('notes');
      expect(c).not.toHaveProperty('totalSpend');
    }
  });
});
```

Run: `pnpm exec jest app/api/clients/__tests__/route.test.ts -v`
Expected: FAIL — unauthenticated GET currently returns 200 with full client records.

- [ ] **Step 2: Implement the guard in `app/api/clients/route.ts`**

Add a session helper at the top of the route module:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { listClientDirectory } from '@/lib/client-directory';
import { toPublicClient } from '@/lib/client-directory';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { normalizeUserRole } from '@/lib/rbac';
import type { UserRole } from '@/lib/rbac';

async function requireSessionRole(): Promise<UserRole | null> {
  const session = await getServerSession(authOptions);
  const role = normalizeUserRole((session?.user as any)?.role);
  return session?.user ? role : null;
}
```

In `GET`, gate first; in `POST`/`PUT`/`DELETE`, import `CLIENTS_DB` from `@/lib/client-directory` and re-assign/mutate the exported array as the current handlers do (they already read from the same list the directory module seeds):

```ts
export async function GET(req: NextRequest) {
  const role = await requireSessionRole();
  if (!role) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const isAdmin = role === 'super_admin' || role === 'admin';
  // ... existing filtering via listClientDirectory ...
  const payload = isAdmin ? filtered : filtered.map(toPublicClient);
  return NextResponse.json({ success: true, count: payload.length, clients: payload, source });
}
```

- [ ] **Step 3: Run the tests to verify they pass**

Run: `pnpm exec jest app/api/clients/__tests__/route.test.ts -v`
Expected: 3 tests PASS.

- [ ] **Step 4: Full suite + build**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest --runInBand; if ($?) { pnpm build }`
Expected: all 27 + 3 new suites pass; build exits 0.

- [ ] **Step 5: Commit**

```bash
git add app/api/clients/route.ts app/api/clients/__tests__/route.test.ts
git commit -m "fix(api): require session and strip client secrets for non-admins"
```

---

### Task 4: Fix the auth-guard role casing (unblocks under-admin)

**Files:**
- Modify: `lib/auth-helpers.ts:1-62`
- Test: create `lib/__tests__/auth-helpers.test.ts`

**Interfaces:**
- Consumes: `getServerSession` from `next-auth/next`, `authOptions` from `./auth`, `normalizeUserRole` from `./rbac` (all already imported).
- Produces: unchanged exported names — `getClientSession`, `requireClientSession`, `requireClientRole`, `requireAdminRole`, `requireUnderAdminSession`, `isClientUser` — but role comparisons now use the normalized lowercase convention, so legitimate admins pass and the under-admin tree at `app/under-admin/**` becomes reachable again.

- [ ] **Step 1: Write the failing test**

Create `lib/__tests__/auth-helpers.test.ts`:

```ts
import { requireClientRole, requireAdminRole, requireUnderAdminSession } from '@/lib/auth-helpers';
import { getServerSession } from 'next-auth/next';

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));

function sessionFor(role: string) {
  (getServerSession as jest.Mock).mockResolvedValue({
    user: { id: 'u1', email: 'a@b.c', name: 'A', role },
  });
}

describe('lib/auth-helpers.ts — lowercase role convention', () => {
  beforeEach(() => (getServerSession as jest.Mock).mockReset());

  it('requireClientRole passes for a lowercase client', async () => {
    sessionFor('client');
    const user = await requireClientRole();
    expect(user.role).toBe('client');
  });

  it('requireAdminRole passes for a lowercase super_admin', async () => {
    sessionFor('super_admin');
    const user = await requireAdminRole();
    expect(user.role).toBe('super_admin');
  });

  it('requireAdminRole rejects a lowercase user', async () => {
    sessionFor('user');
    await expect(requireAdminRole()).rejects.toThrow('FORBIDDEN'); // role used to be 'USER' uppercase
  });

  it('requireUnderAdminSession passes for a lowercase admin', async () => {
    sessionFor('admin');
    const user = await requireUnderAdminSession();
    expect(user.role).toBe('admin');
  });
});
```

Note: the third test asserts the *old* error string only loosely (`FORBIDDEN`); update the string match to whatever message your implementation produces.

Run: `pnpm exec jest lib/__tests__/auth-helpers.test.ts -v`
Expected: FAIL — guards compare against uppercase literals and throw for every lowercase session.

- [ ] **Step 2: Normalize roles in `lib/auth-helpers.ts`**

- Change the `ClientSessionUser.role` type to `UserRole` (import `type { UserRole }` from `./rbac`).
- In `requireClientRole`, `requireAdminRole`, `requireUnderAdminSession`, and `isClientUser`, normalize before comparing:

```ts
export async function requireClientRole(): Promise<ClientSessionUser> {
  const user = await requireClientSession();
  const role = normalizeUserRole(user.role);
  if (role !== 'client' && role !== 'super_admin' && role !== 'admin') {
    throw new Error('FORBIDDEN: Client role required');
  }
  return { ...user, role };
}

export async function requireAdminRole(): Promise<ClientSessionUser> {
  const user = await requireClientSession();
  const role = normalizeUserRole(user.role);
  if (role !== 'super_admin' && role !== 'admin') {
    throw new Error('FORBIDDEN: Admin role required');
  }
  return { ...user, role };
}

export async function requireUnderAdminSession(): Promise<UnderAdminUser> {
  const session = await getClientSession();
  if (!session || !session.user) {
    throw new Error('UNAUTHORIZED: No active session');
  }
  const role = normalizeUserRole(session.user.role);
  if (role !== 'super_admin' && role !== 'admin') {
    throw new Error('FORBIDDEN: Admin role required');
  }
  return { id: session.user.id, email: session.user.email, name: session.user.name, role };
}

export function isClientUser(session: Session | null): boolean {
  if (!session?.user) return false;
  const role = normalizeUserRole((session.user as any).role);
  return role === 'client' || role === 'super_admin' || role === 'admin';
}
```

- [ ] **Step 3: Run the tests to verify they pass**

Run: `pnpm exec jest lib/__tests__/auth-helpers.test.ts -v`
Expected: 4 tests PASS.

- [ ] **Step 4: Full suite + build + verify the under-admin route compiles**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest --runInBand; if ($?) { pnpm build }`
Expected: all suites pass; build exits 0; `app/under-admin/users/[userId]/projects/[projectId]/layout.tsx:14` now imports cleanly (no type break).

- [ ] **Step 5: Commit**

```bash
git add lib/auth-helpers.ts lib/__tests__/auth-helpers.test.ts
git commit -m "fix(auth): normalize roles to lowercase in guard helpers"
```

---

### Task 5: Fix Next 15 async params on public XR share routes

**Files:**
- Modify: `app/api/xr-links/public/[slug]/route.ts:1-25`, `app/api/xr-links/public/[slug]/verify/route.ts:1-20`
- Test: `app/api/xr-links/public/__tests__/route.test.ts`, `app/api/xr-links/public/__tests__/verify.test.ts`

**Interfaces:**
- Consumes: unchanged handler bodies; only the signature/params unwrap changes.
- Produces: `GET(req, { params })` and `POST(req, { params })` with `params: Promise<{ slug: string }>`, awaited. Runtime behavior now matches the existing 404/200 tests AND the real Next.js runtime.

- [ ] **Step 1: Add a runtime-shaped failing test**

Append to `app/api/xr-links/public/__tests__/route.test.ts`:

```ts
it('resolves a slug when params is a Promise (Next 15 runtime shape)', async () => {
  const res = await GET(
    makeRequest('http://localhost:3000/api/xr-links/public/glass-pavilion-v1'),
    { params: Promise.resolve({ slug: 'glass-pavilion-v1' }) } as any
  );
  expect(res.status).toBe(200);
});
```

Run: `pnpm exec jest app/api/xr-links/public/__tests__/route.test.ts -t "Promise" -v`
Expected: FAIL — `ctx.params.slug` is `undefined` on a Promise, so the handler 404s. (If this test accidentally passes, confirm why before proceeding — the handler may already unwrap.)

- [ ] **Step 2: Await `params` in `[slug]/route.ts`**

```ts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;
  // ...rest unchanged...
}
```

- [ ] **Step 3: Await `params` in `[slug]/verify/route.ts`**

```ts
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;
  // ...rest unchanged...
}
```

- [ ] **Step 4: Run both route test files + full suite + build**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest app/api/xr-links/public/__tests__ --runInBand; if ($?) { pnpm exec jest --runInBand }; if ($?) { pnpm build }`
Expected: public route + verify suites pass; full suite passes; build exits 0.

- [ ] **Step 5: Commit**

```bash
git add "app/api/xr-links/public/[slug]/route.ts" "app/api/xr-links/public/[slug]/verify/route.ts" "app/api/xr-links/public/__tests__/route.test.ts"
git commit -m "fix(xr-links): await Promise params on public share routes (Next 15)"
```

---

### Task 6: Harden the editor setup endpoint

**Files:**
- Modify: `app/api/editor-setup/route.ts`
- Test: create `app/api/editor-setup/__tests__/route.test.ts`

**Interfaces:**
- Consumes: `getServerSession` from `next-auth/next`, `authOptions` from `@/lib/auth`, `normalizeUserRole` from `@/lib/rbac`.
- Produces: `POST` requires a `super_admin` session (401 otherwise); on a project without the `exec_sql` RPC it returns a clear `503` payload instead of pretending success; it no longer creates `*_anon_all FOR ALL USING (true)` policies.

- [ ] **Step 1: Write the failing test**

Create `app/api/editor-setup/__tests__/route.test.ts`:

```ts
/**
 * @jest-environment node
 */
import { POST } from '@/app/api/editor-setup/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: { rpc: jest.fn().mockResolvedValue({ error: { message: 'function exec_sql does not exist' } }) },
}));

describe('POST /api/editor-setup', () => {
  beforeEach(() => (getServerSession as jest.Mock).mockReset());

  it('returns 401 for unauthenticated callers', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const res = await POST(new NextRequest('http://localhost:3000/api/editor-setup', { method: 'POST' }));
    expect(res.status).toBe(401);
  });

  it('returns 503 with clear diagnostics when exec_sql RPC is unavailable', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { role: 'super_admin' } });
    const res = await POST(new NextRequest('http://localhost:3000/api/editor-setup', { method: 'POST' }));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/exec_sql/i);
  });
});
```

Run: `pnpm exec jest app/api/editor-setup/__tests__/route.test.ts -v`
Expected: FAIL — no guard and an unconfigured RPC resolves to an error-with-contextual payload.

- [ ] **Step 2: Implement the guard and honest failure**

In `app/api/editor-setup/route.ts`, before running any SQL:

```ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { normalizeUserRole } from '@/lib/rbac';

export async function POST() {
  const session = await getServerSession(authOptions);
  const role = normalizeUserRole((session?.user as any)?.role);
  if (role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  // ... existing migrations loop ...
  const failures = results.filter((r) => !r.ok);
  if (failures.length > 0) {
    return NextResponse.json(
      {
        error:
          'Migration failed. The exec_sql RPC is unavailable on this project. Run migrations via Supabase CLI instead.',
        results,
      },
      { status: 503 }
    );
  }
  return NextResponse.json({ results, ok: true });
}
```

Also remove the `DROP POLICY … editor_*_anon_all` / `CREATE POLICY … FOR ALL USING (true)` block from the `migrations` array; replace those entries with a note that RLS stays default-deny until a proper migration is authored.

- [ ] **Step 3: Run tests to verify pass**

Run: `pnpm exec jest app/api/editor-setup/__tests__/route.test.ts -v`
Expected: 2 tests PASS.

- [ ] **Step 4: Full suite + build**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest --runInBand; if ($?) { pnpm build }`
Expected: all suites pass; build exits 0.

- [ ] **Step 5: Commit**

```bash
git add app/api/editor-setup/route.ts app/api/editor-setup/__tests__/route.test.ts
git commit -m "fix(api): require super_admin for editor-setup and fail honestly without exec_sql"
```

---

### Task 7: Persist lead-capture forms and wire client forms to the API

**Files:**
- Create: `lib/leadsStore.ts`, `lib/__tests__/leadsStore.test.ts`
- Modify: `app/api/forms/[type]/route.ts` (persist instead of console.log), `components/forms/ContactForm.tsx:36-41`, `components/forms/BookingForm.tsx:48-53`
- Test: create `app/api/forms/__tests__/route.test.ts`

**Interfaces:**
- Produces from `lib/leadsStore.ts`:

```ts
export type LeadType = 'contact' | 'booking' | 'demo' | 'inquiry' | 'newsletter' | 'portfolio-enquiry';

export interface LeadRecord {
  id: string;
  type: LeadType;
  payload: Record<string, unknown>;
  receivedAt: string;
}

export async function saveLead(type: LeadType, payload: Record<string, unknown>): Promise<LeadRecord>
export async function listLeads(): Promise<LeadRecord[]>
```

Stores to `.data/leads/leads.json` using the `fs` try/catch pattern from `lib/projectsStore.ts` (missing file → `[]`).

- Consumes from the UI: the form components POST JSON to `/api/forms/contact` and `/api/forms/booking` with honeypot field present in the payload.

- [ ] **Step 1: Write `lib/leadsStore` tests**

Create `lib/__tests__/leadsStore.test.ts`:

```ts
import { saveLead, listLeads } from '@/lib/leadsStore';

jest.mock('node:fs', () => {
  const actual = jest.requireActual('node:fs') as typeof import('node:fs');
  return {
    ...actual,
    promises: {
      readFile: jest.fn(),
      mkdir: jest.fn().mockResolvedValue(undefined),
      writeFile: jest.fn().mockResolvedValue(undefined),
    },
  };
});

import { promises as fs } from 'node:fs';

describe('lib/leadsStore.ts', () => {
  beforeEach(() => {
    (fs.readFile as jest.Mock).mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    (fs.writeFile as jest.Mock).mockClear();
  });

  it('saves a lead and returns it with id + timestamp', async () => {
    const lead = await saveLead('contact', { name: 'Ada', email: 'ada@x.dev' });
    expect(lead.id).toMatch(/^lead_/);
    expect(lead.type).toBe('contact');
    expect(lead.payload.name).toBe('Ada');
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('lists leads from file, defaulting to [] when missing', async () => {
    const leads = await listLeads();
    expect(Array.isArray(leads)).toBe(true);
  });
});
```

Run: `pnpm exec jest lib/__tests__/leadsStore.test.ts -v`
Expected: FAIL — module doesn't exist.

- [ ] **Step 2: Implement `lib/leadsStore.ts`**

```ts
import { promises as fs } from 'node:fs';
import path from 'node:path';

export type LeadType =
  | 'contact'
  | 'booking'
  | 'demo'
  | 'inquiry'
  | 'newsletter'
  | 'portfolio-enquiry';

export interface LeadRecord {
  id: string;
  type: LeadType;
  payload: Record<string, unknown>;
  receivedAt: string;
}

const LEAD_TYPES: LeadType[] = [
  'contact',
  'booking',
  'demo',
  'inquiry',
  'newsletter',
  'portfolio-enquiry',
];

const DATA_DIR = path.join(process.cwd(), '.data', 'leads');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

export function isLeadType(value: unknown): value is LeadType {
  return typeof value === 'string' && LEAD_TYPES.includes(value as LeadType);
}

export async function listLeads(): Promise<LeadRecord[]> {
  try {
    const raw = await fs.readFile(LEADS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as LeadRecord[];
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // no file yet
  }
  return [];
}

export async function saveLead(
  type: LeadType,
  payload: Record<string, unknown>
): Promise<LeadRecord> {
  const lead: LeadRecord = {
    id: `lead_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    type,
    payload,
    receivedAt: new Date().toISOString(),
  };
  const list = await listLeads();
  list.push(lead);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(LEADS_FILE, JSON.stringify(list, null, 2), 'utf8');
  return lead;
}
```

- [ ] **Step 3: Persist in `/api/forms/[type]/route.ts`**

Replace the `console.log` with a real save and return the stored record:

```ts
import { isLeadType, saveLead } from '@/lib/leadsStore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const body = await request.json();

    if (body._hp_field) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }
    if (!isLeadType(type)) {
      return NextResponse.json({ error: 'Invalid form submission type' }, { status: 400 });
    }

    const lead = await saveLead(type, body);
    return NextResponse.json({
      success: true,
      id: lead.id,
      type,
      message: `Form of type ${type} received and persisted.`,
      receivedAt: lead.receivedAt,
    });
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json({ error: 'Internal server error processing form' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Wire ContactForm to the real API**

In `components/forms/ContactForm.tsx`, replace the `setTimeout` block (lines 36-41) with:

```ts
try {
  const res = await fetch('/api/forms/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!res.ok) throw new Error('submit failed');
  setLoading(false);
  setSubmitted(true);
  showToast('Thank you! Your project inquiry has been dispatched to our architectural directors.', 'success');
} catch (err) {
  setLoading(false);
  showToast('Something went wrong. Please try again.', 'error');
}
```

- [ ] **Step 5: Wire BookingForm to the real API**

In `components/forms/BookingForm.tsx`, replace the `setTimeout` block with the same pattern targeting `/api/forms/booking` and its own fields; keep the confirmed-state render unchanged.

- [ ] **Step 6: Add a route test for `/api/forms/[type]`**

Create `app/api/forms/__tests__/route.test.ts`:

```ts
/**
 * @jest-environment node
 */
import { POST } from '@/app/api/forms/[type]/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/leadsStore', () => ({
  isLeadType: (v: unknown) =>
    ['contact', 'booking', 'demo', 'inquiry', 'newsletter', 'portfolio-enquiry'].includes(v as string),
  saveLead: jest.fn().mockResolvedValue({
    id: 'lead_1',
    type: 'contact',
    payload: {},
    receivedAt: '2026-09-10T00:00:00.000Z',
  }),
}));

function makePost(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/forms/[type]', () => {
  it('persists a contact lead', async () => {
    const res = await POST(
      makePost('http://localhost:3000/api/forms/contact', { name: 'Ada', email: 'ada@x.dev' }),
      { params: Promise.resolve({ type: 'contact' }) } as any
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.id).toBe('lead_1');
  });

  it('rejects invalid types', async () => {
    const res = await POST(
      makePost('http://localhost:3000/api/forms/bogus', { name: 'Ada' }),
      { params: Promise.resolve({ type: 'bogus' }) } as any
    );
    expect(res.status).toBe(400);
  });
});

- [ ] **Step 7: Full suite + build**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest --runInBand; if ($?) { pnpm build }`
Expected: all suites pass; build exits 0.

- [ ] **Step 8: Commit**

```bash
git add lib/leadsStore.ts lib/__tests__/leadsStore.test.ts "app/api/forms/[type]/route.ts" app/api/forms/__tests__/route.test.ts components/forms/ContactForm.tsx components/forms/BookingForm.tsx
git commit -m "feat(forms): persist lead submissions and wire Contact/Booking forms to the API"
```

---

### Task 8: Consolidate duplicate routes

**Files:**
- Modify: `next.config.ts`
- Test: `next.config.ts` unit test via `pnpm exec jest` (config export shape) — covered implicitly by build.

**Interfaces:**
- Consumes: existing route structure.
- Produces: `/privacy` → `/privacy-policy` (308), `/terms` → `/terms-conditions` (308), `/admin` → `/admin/dashboard` (308). The canonical pages keep their paths; no page content removed.

- [ ] **Step 1: Inspect current redirect setup**

Locate the config export in `next.config.ts` and confirm whether a `redirects()` async function already exists. If it does, merge into it.

- [ ] **Step 2: Add the redirects block**

```ts
async redirects() {
  return [
    { source: '/privacy', destination: '/privacy-policy', permanent: true },
    { source: '/terms', destination: '/terms-conditions', permanent: true },
    { source: '/admin', destination: '/admin/dashboard', permanent: true },
  ];
}
```

- [ ] **Step 3: Verify build and smoke-check canonical paths**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm build`
Expected: exit 0, 162+ static pages. Then confirm `/privacy-policy`, `/terms-conditions`, `/admin/dashboard` still render (pages untouched).

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "chore(seo): redirect duplicate routes to canonical pages"
```

---

### Task 9: Fix the signup role claim and final verification + push

**Files:**
- Modify: `app/signup/page.tsx:47`
- Test: covered by `tsc --noEmit` on changed file (metadata role is not a runtime gate in tests).

**Interfaces:**
- Consumes: existing signup flow.
- Produces: `user_metadata.role` is `'user'` (the only role `normalizeUserRole` will actually grant a new signup), eliminating the misleading `'owner'` claim. `org_name`/`full_name` metadata unchanged.

- [ ] **Step 1: Change the metadata role**

In `app/signup/page.tsx:47`, change:

```ts
data: { full_name: fullName, org_name: orgName, role: 'owner' },
```

to:

```ts
data: { full_name: fullName, org_name: orgName, role: 'user' },
```

- [ ] **Step 2: Final full gate + tsc on changed files**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest --runInBand; if ($?) { pnpm build }`
Then `pnpm exec tsc --noEmit -p tsconfig.json --pretty false` if your flow uses project-level tsc; otherwise verify changed files typecheck as in prior tasks.

Expected: 27+ suites pass (baseline plus new tasks 1, 3, 6, 7), build exits 0.

- [ ] **Step 3: Commit the signup change**

```bash
git add app/signup/page.tsx
git commit -m "fix(signup): claim only the user role in signup metadata"
```

- [ ] **Step 4: Push to main**

```bash
git push origin main
```

Expected: `main -> main` up to date at the new head. Confirm local `main` equals `origin/main` (`git rev-parse HEAD` vs `git rev-parse origin/main`).

---

## Non-goals (explicitly deferred)

- `/api/clients` POST/PUT/DELETE Supabase write path — mutations currently only touch the in-memory table; converting them to real Supabase writes is a separate backend plan.
- Distributed token-based rate limiting (Upstash/Redis) — R14; logged as follow-up.
- Replacing `.data/` file stores with a database-backed repository — R9; requires a deployment platform decision first.
- Rewiring the `/app/*` SaaS mock dashboards to real repositories — R10; separate product plan.
- Type-debt zeroing / flipping `typescript.ignoreBuildErrors` — R15; track separately.
- Re-auditing PDE/Style of the whole suite after this hardening batch.