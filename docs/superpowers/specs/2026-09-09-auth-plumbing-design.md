# Auth Plumbing: Supabase Validation Behind NextAuth Sessions

Date: 2026-09-09
Status: Approved

## Problem

The app has two auth systems that are not connected:

- **NextAuth v4** owns sessions and RBAC. `lib/auth.ts` Credentials provider validates
  against hardcoded demo accounts (`getDemoAuthUser`) or the `/api/clients` lookup —
  it never checks Supabase.
- **Supabase Auth** is used superficially. `/signup` creates a Supabase user, then calls
  `signIn('credentials')`, which *fails* for real Supabase users (authorize doesn't
  validate them), producing the contradictory "Account created, but there was a session
  issue." message. `VirtualTourAdminPanel` calls `supabase.auth.signOut()`, a no-op
  because the actual session belongs to NextAuth.

Net effect: a user who registers via Supabase cannot log in through the app, and the
supabase.auth-based sign-out button does nothing.

## Goal

Make Supabase the credential authority while NextAuth keeps owning sessions, cookies,
and middleware RBAC. Real Supabase-registered users must be able to log in, land on a
role-appropriate dashboard, and sign out. All existing flows (demo, client access-code,
Google OAuth, RBAC route guards, rate limiting) must keep working.

## Design Decisions

1. **NextAuth keeps sessions; Supabase validates users.** No cookie changes, no
   middleware rewrite. `@supabase/ssr` clients remain for future RLS-scoped features.
2. **Role from Supabase `user.user_metadata.role`, normalized via `normalizeUserRole`.**
   New `signup` users send `role: 'owner'` → normalized to `user`. No profile table.
   Promoting a real user to `admin`/`super_admin` is a manual metadata update
   (documented, not built now).
3. **Supabase-first validation order inside the Credentials provider's `authorize()`:**
   1. Supabase `signInWithPassword` (anon client, when email+password present and
      configured) — success returns the user with mapped role.
   2. Demo accounts (unchanged, dev behavior preserved).
   3. Client access-code lookup via `/api/clients` (unchanged).
4. **Signup handles both post-signUp outcomes:**
   - `data.session` present (autoconfirm ON) → proceed to `signIn('credentials')`.
   - No session (email confirmation required) → show "Check your inbox" success screen;
     do not run the failing NextAuth sign-in.
5. **Fix the no-op sign-out** in `VirtualTourAdminPanel` → use `signOut` from
   `next-auth/react` with `callbackUrl: '/login'`.

## Architecture

```
login/signup page (client)
  → signIn('credentials', {email, password})          [Supabase first]
    → authorize()                                      lib/auth.ts
      → supabase.auth.signInWithPassword (anon key, server-side)
        → user.user_metadata.role → normalizeUserRole → returned auth user
    → jwt callback → token.role
    → session callback → session.user.<role,id,...>
    → middleware RBAC (unchanged) → default-dashboard redirect
```

## Components / Files Changed

### `lib/auth.ts`
- In CredentialsProvider `authorize()`: attempt Supabase `signInWithPassword` first.
  - Guard: only when `credentials.email` and `credentials.password` are present and
    Supabase is configured (`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
  - Use an anon client (never the service-role `supabaseAdmin`).
  - On success: return `{ id, email, name, role: normalizeUserRole(user.user_metadata?.role) }`.
  - On error: return `null` for the provider (page shows generic invalid-creds message),
    then the existing demo + client fallbacks handle non-Supabase users.
- Client lookup + demo paths unchanged.

### `app/signup/page.tsx`
- After `supabase.auth.signUp`, branch on `data.session`:
  - present → existing `signIn('credentials')` flow → dashboard.
  - absent → `setBusy(false)` and switch to a confirmation-success state:
    "Account created. Check your inbox to confirm your email before signing in."
    Show a "Back to login" link. Do not call the NextAuth sign-in.
- `password` field: keep `minLength=6` (Supabase default enforces >=6).
- Signup no longer needs `router`/`signIn` import if the confirmation branch avoids them;
  keep imports tidy.

### `components/admin/VirtualTourAdminPanel.tsx`
- Replace `supabase.auth.signOut()` + `window.location.href` with
  `signOut({ callbackUrl: '/login' })` from `next-auth/react`.
- Remove the now-unused `createClient` import (verify no other usage in file).

### `app/login/page.tsx` (error surfacing)
- No new error mapping in this iteration: the Credentials provider returns `null` on
  any failure, so `app/login` keeps its existing generic "Invalid email or password.
  Please use a valid role account or registered Supabase user." message. Surfacing
  Supabase-specific errors (email-not-confirmed, etc.) is deferred to a future
  iteration.
- Keep behavior otherwise identical.

## Out of Scope (this iteration)

- API route guards (`requireAuth` on `/api/*`) — future plan.
- Role promotion UI or an `app_profiles` table.
- Emails / password reset flows.
- Removing NextAuth entirely.

## Testing

- **Unit (`app/api/auth` / `lib` tests):**
  - `authorize()` with mocked Supabase `auth.signInWithPassword`:
    - success → user returned with normalized role from metadata;
    - invalid credentials → falls through to demo, then client lookup, then null;
    - Supabase unconfigured → demo + client paths still work;
    - client access-code-only credentials skip Supabase.
  - `normalizeUserRole('owner') === 'user'`.
- **Regression:** existing suite must stay green (27 suites / 172 tests) and
  `pnpm build` exit 0.
- Jest env: Supabase `createClient` returns mock; never hit live project in tests.
- Manual smoke (not automated): register a new user via `/signup` against the live
  project and confirm the confirmation-email path (or immediate session under
  autoconfirm), then sign in via `/login`.

## Error Handling

- Supabase error in `authorize` → demo → client → `null` (generic message).
- Email-not-confirmed surfaced on the login page.
- Supabase unconfigured → skip to demo/client (existing behavior preserved).

## Success Criteria

- A real Supabase-registered user (with metadata role) can sign in from `/login` or
  after `/signup`, is redirected to the dashboard for their normalized role, and can
  sign out from the admin panel.
- The confusing "Account created, but there was a session issue" path is gone.
- All 27 existing test suites + `pnpm build` remain green.