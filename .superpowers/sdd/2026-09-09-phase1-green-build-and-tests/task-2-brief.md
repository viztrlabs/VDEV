# Task 2 Brief — Reconcile the stale auth test to the lowercase role contract

## Context
Repo root: `C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev`. Phase 1 repair work to restore a green test suite. Task 2 fixes a failing unit test in `lib/__tests__/auth.test.ts`.

## Requirements (use EXACTLY these values)

The failing test asserts uppercase roles that do not exist in the codebase. The legal roles are defined in `lib/rbac.ts:5` as:
```ts
export type UserRole = 'super_admin' | 'admin' | 'user' | 'client';
```
`getDemoAuthUser()` in `lib/auth.ts` returns lowercase roles (`'super_admin'`, `'admin'`, `'user'`, `'client'`). The test is stale — it asserts values that were never true.

Modify `lib/__tests__/auth.test.ts`:

1. At line 30, change:
```ts
      role: 'SUPER_ADMIN',
```
to:
```ts
      role: 'super_admin',
```

2. At line 35, change:
```ts
      role: 'ADMIN',
```
to:
```ts
      role: 'admin',
```

Do NOT change any other assertion. Do NOT change the source files (`lib/auth.ts`, `lib/rbac.ts`), the store, or any other test. The lowercase contract is correct by design.

## Global constraints that bind this task
- Windows / PowerShell. Commands must NOT use `&&`.
- Do **NOT** commit.
- Do **NOT** add code comments unless they already exist.
- Only edit `lib/__tests__/auth.test.ts`.

## Verification commands (run and capture output)
Run:
- `$env:NEXT_TELEMETRY_DISABLED="1"; npx jest lib/__tests__/auth.test.ts --runInBand`
- Expected: 3 tests pass (ClientAuthLookup contract, Demo auth contract, UserSession extension), 0 failed.

## Report contract
Write a full report to the report file path given in your dispatch prompt. In the final message return ONLY: status, files changed, one-line verification summary (exact jest output), and any concerns.
