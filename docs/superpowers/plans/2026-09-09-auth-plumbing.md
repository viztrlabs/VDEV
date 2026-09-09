# Auth Plumbing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Supabase the credential authority so real Supabase-registered users can log in, land on the right dashboard, and sign out — while NextAuth keeps owning sessions, cookies, and middleware RBAC.

**Architecture:** Extend the NextAuth Credentials `authorize()` to validate against Supabase `auth.signInWithPassword` (anon client) and map `user.user_metadata.role` through `normalizeUserRole`. Signup handles both autoconfirm and email-confirmation outcomes. `VirtualTourAdminPanel` sign-out routes through NextAuth instead of the no-op Supabase call.

**Tech Stack:** NextAuth v4 (JWT sessions, middleware RBAC), `@supabase/supabase-js` anon client (`lib/supabase.ts`), jest + ts-jest, Next.js App Router, pnpm.

## Global Constraints

- `authorize()` order: **Supabase first → demo accounts → client access-code lookup**. All three preserved; Supabase must not mask demo or client logins.
- Supabase validation uses the **anon client only** (`@/lib/supabase` export `supabase`) — never the service-role `supabaseAdmin` in `@/lib/supabase-admin`.
- Role comes from `user.user_metadata.role`, normalized via `normalizeUserRole` (import from `@/lib/rbac`). `owner` → `user`.
- No middleware changes. No new dependencies. No cookie/auth-session changes.
- Gate for all tasks: `pnpm exec jest --runInBand` full suite stays green (currently 27 suites / 172 tests) and `pnpm build` exits 0. `package.json` uses `next/jest`; env for tests is controlled by jest mocks, never real `.env.local`.
- Do not commit `.data/analytics/events.jsonl` or `tsconfig.tsbuildinfo`.
- Working directly on `main`; push after completion (user-approved precedent).

---

### Task 1: Supabase-first validation via extracted `authenticateUser()`

**Files:**
- Modify: `lib/auth.ts` (new exported helper + `authorize()` delegates to it)
- Test: `lib/__tests__/auth.test.ts`

**Interfaces:**
- Produces (the contract later tasks rely on):

```ts
// lib/auth.ts
export async function authenticateUser(input: {
  email?: string;
  password?: string;
  accessCode?: string;
}): Promise<{
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId?: string;
  accessCode?: string;
  assignedDirector?: string;
  clientFirm?: string;
} | null>
```

Returns, in order of precedence: Supabase user (role from `user_metadata.role`,
normalized) → demo user → client record → `null`. `UserRole` is imported as a
type from `./rbac` (`import { normalizeUserRole } from './rbac'; type { UserRole }`).

- Consumes: `normalizeUserRole` from `./rbac` (already imported); `supabase`, `isSupabaseConfigured`
  from `./supabase`; `getDemoAuthUser`, `lookupClientByCredentials` (same file).

- [ ] **Step 1: Add the Supabase import to `lib/auth.ts`**

At the top of `lib/auth.ts`, after the existing imports, add:

```ts
import { supabase, isSupabaseConfigured } from './supabase';
```

- [ ] **Step 2: Add the exported `authenticateUser()` helper**

Add this function to `lib/auth.ts` (place it just before `export const authOptions`):

```ts
interface AuthenticateInput {
  email?: string;
  password?: string;
  accessCode?: string;
}

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId?: string;
  accessCode?: string;
  assignedDirector?: string;
  clientFirm?: string;
} | null;

export async function authenticateUser(
  credentials: AuthenticateInput
): Promise<AuthenticatedUser> {
  const { email, password, accessCode } = credentials ?? {};

  // 1. Supabase validation (primary path for real users).
  //    Anon client only — never the service-role client.
  if (email && password && isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      const meta = data.user.user_metadata as { role?: unknown; full_name?: unknown } | null;
      const role = normalizeUserRole(typeof meta?.role === 'string' ? meta.role : undefined);
      return {
        id: data.user.id,
        name: typeof meta?.full_name === 'string' && meta.full_name
          ? meta.full_name
          : data.user.email || email,
        email: data.user.email || email,
        role,
      };
    }
    // Fall through — wrong password, unconfirmed email, or unknown user, so
    // demo and client paths get a chance.
  }

  // 2. Demo accounts (unchanged behavior).
  const demoUser = getDemoAuthUser(email, password);
  if (demoUser) return demoUser;

  // 3. Client access-code / directory lookup (unchanged behavior).
  if (!email && !accessCode) return null;

  const client = await lookupClientByCredentials(email, accessCode);
  if (client) {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      role: 'client' as UserRole,
      clientId: client.id,
      accessCode: client.portalAccessCode,
      assignedDirector: client.assignedDirector,
      clientFirm: client.firmName,
    };
  }

  return null;
}
```

- [ ] **Step 3: Make `authorize()` delegate to the helper**

Replace the entire body of `async authorize(credentials) { ... }` inside
`CredentialsProvider` with a single delegation (delete the old demo/client
inline blocks — behavior is preserved verbatim in the helper):

```ts
      async authorize(credentials) {
        return authenticateUser({
          email: typeof credentials?.email === 'string' ? credentials.email : undefined,
          password: typeof credentials?.password === 'string' ? credentials.password : undefined,
          accessCode: typeof credentials?.accessCode === 'string' ? credentials.accessCode : undefined,
        });
      },
```

NextAuth v4 types `credentials` loosely (`Record<string, unknown>`), so the
explicit `typeof` narrowing avoids type errors. `authenticateUser`'s return
type is structurally compatible with NextAuth's `User` (the extra `role`,
`clientId` etc. props are allowed on the return; the JWT callback has always
read them via `as any`). No `as any` needed in `authorize`.

- [ ] **Step 4: Add unit tests to `lib/__tests__/auth.test.ts`**

At the top of the existing file, add the mock (before any test that touches
`@/lib/auth` — `jest.mock` is hoisted; declare **one** factory):

```ts
jest.mock('@/lib/supabase', () => {
  const mock = { auth: { signInWithPassword: jest.fn() } };
  return { isSupabaseConfigured: true, supabase: mock };
});
```

Access it in tests via `const supabaseMock = (require('@/lib/supabase') as any).supabase;`.
This keeps the mock reusable across the Supabase, demo, and client cases below.

Append these describe blocks:

```ts
describe('authenticateUser — Supabase-first validation', () => {
  const supabaseMock = (require('@/lib/supabase') as any).supabase;

  beforeEach(() => {
    (supabaseMock.auth.signInWithPassword as jest.Mock).mockReset();
    // Deterministic /api/clients directory response for the client-path tests.
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        clients: [
          {
            id: 'cli_test_1',
            name: 'Test Client',
            firmName: 'Test Studio',
            email: 'client@test.com',
            portalAccessCode: 'FST-2025-VTR',
            assignedDirector: 'Alex',
            status: 'Active',
          },
        ],
      }),
    }) as unknown as typeof fetch;
  });

  it('returns the Supabase user with role normalized from user_metadata', async () => {
    (supabaseMock.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {
        user: {
          id: 'usr_supabase_1',
          email: 'real@user.com',
          user_metadata: { full_name: 'Real User', role: 'owner' },
        },
      },
      error: null,
    });

    const user = await authenticateUser({ email: 'real@user.com', password: 'pw123' });
    expect(user).toMatchObject({
      id: 'usr_supabase_1',
      email: 'real@user.com',
      name: 'Real User',
      role: 'user', // owner -> 'user' via normalizeUserRole
    });
    expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'real@user.com',
      password: 'pw123',
    });
  });

  it('falls through to demo when Supabase rejects the credentials', async () => {
    (supabaseMock.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });

    const user = await authenticateUser({ email: 'admin@viztr.com', password: 'password123' });
    expect(user).toMatchObject({ email: 'admin@viztr.com', role: 'super_admin' });
  });

  it('falls through to client lookup when Supabase says the user is unconfirmed/unknown', async () => {
    (supabaseMock.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Email not confirmed' },
    });

    const user = await authenticateUser({ email: 'client@viztr.com', password: 'password123' });
    // client@viztr.com is demo fallback too; assert we still get a user,
    // proving Supabase failure did not short-circuit the chain.
    expect(user).not.toBeNull();
  });

  it('does not call Supabase for access-code-only logins', async () => {
    const user = await authenticateUser({ accessCode: 'FST-2025-VTR', password: 'pw' });
    expect(supabaseMock.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(user).toMatchObject({ role: 'client' });
  });

  it('returns null when every path fails', async () => {
    (supabaseMock.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });

    const user = await authenticateUser({ email: 'nobody@example.com', password: 'wrongpw' });
    expect(user).toBeNull();
  });
});
```

Add `import { authenticateUser } from '@/lib/auth';` to the existing imports at
the top of the file.

Note: the "does not call Supabase for access-code-only logins" test relies on the
`/api/clients` directory lookup to resolve the access code, covered by the
`global.fetch` stub set in `beforeEach` (above). Without that stub,
`lookupClientByCredentials` swallows the fetch failure and returns `null`,
making that test fail — so keep the stub in `beforeEach`, not a single test.

- [ ] **Step 5: Run the test suite**

Run: `pnpm exec jest --runInBand lib/__tests__/auth.test.ts`
Expected: PASS (existing auth contract + demo tests, plus the five
`authenticateUser` cases). If the `access-code-only` or client-lookup cases
still fail, adjust `fetch` stubbing per the note in Step 4.

Run full suite: `pnpm exec jest --runInBand`
Expected: 27 suites / 172 tests pass (unchanged count).

- [ ] **Step 6: Typecheck (no TS2305 regressions)**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec tsc --noEmit`
Expected: no new `TS2305` from `lib/auth.ts` or `lib/__tests__/auth.test.ts`
(`supabase`, `isSupabaseConfigured` are real named exports of `./supabase`).
Pre-existing errors in untouched files (e.g. `FeatureFlagsDashboard.tsx`) are
acceptable. `authenticateUser` import must compile — if `UserRole` needs an
explicit type import, add it to `lib/auth.ts`.

- [ ] **Step 7: Build**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm build`
Expected: exit 0.

- [ ] **Step 8: Commit**

```bash
git add lib/auth.ts lib/__tests__/auth.test.ts
git commit -m "feat(auth): validate credentials against Supabase in NextAuth authorize"
```

---

### Task 2: Fix signup email-confirmation outcome handling

**Files:**
- Modify: `app/signup/page.tsx`

**Interfaces:**
- Consumes: nothing from Task 1 (independent page logic).
- Produces: correct post-signUp UX — immediate login when `data.session` exists, "check your inbox" screen when it does not.

- [ ] **Step 1: Add a `created` state flag and branch after signUp**

In `SignupContent`, add state next to the existing `notice` state:

```ts
const [created, setCreated] = useState(false);
```

Then replace the post-signUp block (currently the `if (!data.user) { ... }` through the `router.refresh()` at the end of `onSubmit`) with:

```ts
    if (!data.user) {
      setBusy(false);
      setError('Unable to create the account. Please try again.');
      return;
    }

    // Supabase has a session immediately (autoconfirm ON) -> sign in now.
    if (data.session) {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      setBusy(false);

      if (result?.error) {
        setError('Account created, but there was a session issue. Please sign in manually.');
        return;
      }

      const destination = result?.url || callbackUrl || '/admin/dashboard';
      router.push(destination);
      router.refresh();
      return;
    }

    // Email confirmation required — no session yet. Show a success screen
    // instead of a failed auto-login.
    setBusy(false);
    setCreated(true);
```

- [ ] **Step 2: Render the confirmation success screen**

The render currently is (abridged):

```tsx
        {notice && ( ... )}
        {error && ( ... )}
        <form onSubmit={onSubmit} className="space-y-3">
          ... inputs ...
        </form>

        <div className="text-center text-[11px] text-[#71717A] font-mono">
          Already have an account?{' '}
          <Link href="/login" className="text-[#3ECF8E] hover:underline">
            Sign in
          </Link>
        </div>
```

Change `{error && ( ... )}`'s closing and the `<form>` opening so the form is
conditionally rendered, and add the confirmation block as the else branch:

```tsx
        {notice && ( ... )}  {/* unchanged */}
        {error && ( ... )}   {/* unchanged */}

        {!created ? (
          <form onSubmit={onSubmit} className="space-y-3">
            ... inputs unchanged ...
          </form>
        ) : (
          <div className="text-center space-y-3 py-2">
            <div className="text-sm font-bold text-[#3ECF8E]">
              Account created
            </div>
            <p className="text-xs font-mono text-[#A1A1AA]">
              We sent a confirmation email to <span className="text-white">{email}</span>.
              Please check your inbox and click the confirmation link before signing in.
            </p>
            <Link
              href="/login"
              className="inline-block text-xs font-mono text-[#3ECF8E] hover:underline"
            >
              Go to sign in
            </Link>
          </div>
        )}

        <div className="text-center text-[11px] text-[#71717A] font-mono">
          Already have an account?{' '}
          <Link href="/login" className="text-[#3ECF8E] hover:underline">
            Sign in
          </Link>
        </div>
```

Keep the notices/error boxes above the conditional. The `{email}` string uses
the existing state from the form input.

- [ ] **Step 3: Build verification**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm build`
Expected: exit 0. Signup page compiles (`Link`, `router`, `signIn`, `createClient` all still imported and used).

Run full suite: `pnpm exec jest --runInBand`
Expected: 27/172 green.

- [ ] **Step 4: Commit**

```bash
git add app/signup/page.tsx
git commit -m "feat(auth): handle email-confirmation signup outcome instead of failed auto-login"
```

---

### Task 3: Fix no-op sign-out in VirtualTourAdminPanel

**Files:**
- Modify: `components/admin/VirtualTourAdminPanel.tsx`

**Interfaces:**
- Consumes: `signOut` from `next-auth/react` (already a dependency).
- Produces: admin panel "Sign out" button actually ends the NextAuth session and redirects to `/login`.

- [ ] **Step 1: Swap the sign-out implementation**

Replace the import line:

```ts
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
```

with:

```ts
import { signOut } from 'next-auth/react';
```

Replace the `signOut` function body:

```ts
  const signOut = async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = '/login';
  };
```

with:

```ts
  const signOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };
```

Update the button's conditional: `{isSupabaseConfigured && (` around the Sign out button must become always-rendered `(` (the panel only renders inside an authenticated admin layout, so a session is required to reach it):

```tsx
        {(
          <button
            onClick={signOut}
            className="flex items-center gap-1 text-[10px] font-mono text-[#71717A] hover:text-rose-300"
            title="Sign out"
          >
            <LogOut className="w-3 h-3" /> Sign out
          </button>
        )}
```

- [ ] **Step 2: Remove now-unused imports if any linger**

The file imports `createClient`, `isSupabaseConfigured` only for the sign-out — with the swap they are gone. Grep check:

Run: `rg -n "createClient|isSupabaseConfigured" components/admin/VirtualTourAdminPanel.tsx`
Expected: no matches. If any other usage exists, keep the import; otherwise confirm removal.

- [ ] **Step 3: Typecheck + build**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec tsc --noEmit`
Expected: no new errors in `VirtualTourAdminPanel.tsx`.

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm build`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add components/admin/VirtualTourAdminPanel.tsx
git commit -m "fix(auth): route admin sign-out through NextAuth instead of no-op supabase call"
```

---

### Task 4: Full regression + push

**Files:**
- None (verification only).

- [ ] **Step 1: Run full test suite**

Run: `pnpm exec jest --runInBand`
Expected: 27 suites / 172 tests pass.

- [ ] **Step 2: Run production build**

Run: `$env:NEXT_TELEMETRY_DISABLED="1"; pnpm build`
Expected: exit 0.

- [ ] **Step 3: Confirm git state and push**

Run: `git status --short`
Expected: only `M .data/analytics/events.jsonl` and `M tsconfig.tsbuildinfo` remain uncommitted (noise). The 3 `lib/auth.ts`, `app/signup/page.tsx`, `components/admin/VirtualTourAdminPanel.tsx` changes are committed.

```bash
git push origin main
```

- [ ] **Step 4: Report**

Summarize: Supabase-first validation in authorize, signup confirmation handling, sign-out fix; green suite + build; pushed commits.