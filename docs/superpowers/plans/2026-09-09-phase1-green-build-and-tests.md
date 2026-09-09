# Phase 1 — Green Build & Green Tests (Option A)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `pnpm run build` (StrictMode: `next build`) pass, make `pnpm test` (jest) fully green, and restore `tsc --noEmit` to a sane local signal by excluding vendored/out-of-scope directories from `tsconfig.json`. This re-establishes a compilable, testable baseline before feature work.

**Architecture:** The user chose **Option A**: the production gate is `next build` (which type-checks only the bundled module graph), NOT a blanket `tsc`. A blanket `tsc --noEmit` over the whole repo is not a valid gate because `tsconfig.json`'s `include: ["**/*.ts","**/*.tsx"]` pulls in the vendored `forks/editor-src/**` PlayCanvas editor fork (1500+ files), `scripts/**`, and other code never intended for app type-checking (a full clean run reports ~12,439 error lines). So the plan (1) fixes the real compile blockers until `next build` is green, (2) restores a usable `tsc` signal by excluding out-of-scope dirs, and (3) fixes the two failing test suites. No features are built.

**Tech Stack:** Next.js 15.5 (App Router), TypeScript (strict), Jest 29 (`next/jest`), ESLint (`next lint`), pnpm.

## Global Constraints

- **Package manager is `pnpm`** (user-selected). Use `pnpm build`, `pnpm test`, `pnpm lint`. All compile/type commands still work, but the plan uses pnpm.
- **Windows / PowerShell:** commands must not use `&&`; chain with `;` and `if ($?) { ... }`.
- Worktree root: `C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev`.
- Do **not** commit unless the user asks. Commit steps are optional and named "Commit (if requested)".
- Do **not** add code comments unless they already exist and are being fixed.
- Preserve the lowercase role contract: `UserRole = 'super_admin' | 'admin' | 'user' | 'client'` (see `lib/rbac.ts`). Uppercase roles do NOT exist.
- The production gate is `next build` succeeding. A blanket `tsc` zero-error over vendored `forks/` is intentionally NOT a goal; we instead fix tsconfig so `tsc` is a *sane signal* (zero errors on the app's own included files).
- Run long commands with `$env:NEXT_TELEMETRY_DISABLED="1"`.

---

## Verified Baseline (2026-09-09)

**Compile — `pnpm build`:** After 3 fixes (below) it now **passes** and emits the full route table. The 3 fixes already applied to the working tree:
1. `app/admin/security/page.tsx:29` — malformed arrow function body (missing `{}`) → `onClick={() => { setLoading(true); setTimeout(...) }}`.
2. `app/admin/security/page.tsx:5` — `Beaker` was referenced but not imported from `lucide-react` → added; and `app/admin/security/page.tsx:398` — duplicate `export default AdminSecurityPage;` (already a default-exported function at line 16) → removed.
3. `components/admin/FeatureFlagsDashboard.tsx:4` — imported `./feature-flags` which does not exist → corrected to `@/lib/feature-flags` (that module lives at `lib/feature-flags.ts` and exports `FeatureFlag, featureFlags, isFeatureEnabled, isEnabledServer`).

**Tests — `pnpm test` (jest --runInBand):** 2 suites failed, 21 passed; 1 test failed, 146 passed:
1. `lib/__tests__/auth.test.ts` — asserts `role: 'SUPER_ADMIN'` / `'ADMIN'` (uppercase) but `getDemoAuthUser()` returns lowercase. Test is stale.
2. `__tests__/integration/test-final-cross-module-integration.ts` — imports 4 phantom modules (`lib/3d/splat/splat-loader`, `splat-renderer`, `splat-streaming-manager`, `lib/3d/ar/enhanced-placement-system`) that don't exist and are referenced by zero active code. Dead test.

**tsc signal — broken by design:** `tsconfig.json` `include` is `["next-env.d.ts","types/**/*.ts","types/**/*.tsx","**/*.ts","**/*.tsx",".next/types/**/*.ts"]`. The `**/*.ts(x)` globs pull in `forks/editor-src/**` (vendored), `scripts/`, and more, giving ~12,439 lines of errors. `src/splat-editor` and `src/services` are already excluded.

---

### Task 1: Fix the compile-blocking syntax error

**Files:**
- Modify: `app/admin/security/page.tsx:29`

**Status: DONE** — already applied to the working tree (verified by `pnpm build` passing).

- [x] **Step 1: Fix the arrow-function body** (line 29).
- [x] **Step 2: Verify** `pnpm build` no longer fails on this file.

---

### Task 1b: Fix the remaining build blockers (app/admin/security + FeatureFlagsDashboard)

**Files:**
- Modify: `app/admin/security/page.tsx:5,398`
- Modify: `components/admin/FeatureFlagsDashboard.tsx:4`

**Status: DONE** — already applied; `pnpm build` now passes and prints the complete route table.

- [x] **Step 1:** Add `Beaker` to the `lucide-react` import; delete the duplicate trailing `export default AdminSecurityPage;`.
- [x] **Step 2:** Fix the `FeatureFlagsDashboard` import to `@/lib/feature-flags`.
- [x] **Step 3: Verify** `pnpm build` completes successfully (exit 0).

---

### Task 2: Reconcile the stale auth test to the lowercase role contract

**Files:**
- Modify: `lib/__tests__/auth.test.ts:26-40`

**Interfaces:**
- Consumes: `getDemoAuthUser` from `@/lib/auth` (returns `role: 'super_admin'` / `'admin'`).
- Produces: a passing test asserting the real lowercase contract.

- [ ] **Step 1: Update assertions** — in `lib/__tests__/auth.test.ts:30` change `role: 'SUPER_ADMIN'` → `role: 'super_admin'`; at line 35 change `role: 'ADMIN'` → `role: 'admin'`.

- [ ] **Step 2: Verify**
  ```
  $env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest lib/__tests__/auth.test.ts --runInBand
  ```
  Expected: 3 tests pass.

- [ ] **Step 3: Commit (if requested)**
  ```
  git add lib/__tests__/auth.test.ts; if ($?) { git commit -m "test: align demo auth expectations with lowercase role contract" }
  ```

---

### Task 3: Remove the dead integration test that imports phantom modules

**Files:**
- Delete: `__tests__/integration/test-final-cross-module-integration.ts`

- [ ] **Step 1: Confirm isolation** — no active `app/`,`components/`,`lib/` source references `splat-loader|splat-renderer|splat-streaming|enhanced-placement|ARPlacementSystem|SplatStreamingManager` (verified earlier: zero matches). Do not touch `lib/3d/ar/enhanced-ar-session-manager.ts`.

- [ ] **Step 2: Delete the file**
  ```
  Remove-Item -LiteralPath "__tests__/integration/test-final-cross-module-integration.ts"
  ```

- [ ] **Step 3: Verify integration dir**
  ```
  $env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest __tests__/integration --runInBand
  ```
  Expected: all remaining suites pass; no "Cannot find module".

- [ ] **Step 4: Commit (if requested)**
  ```
  git add -A "__tests__/integration"; if ($?) { git commit -m "test: remove dead integration suite referencing unimplemented splat/AR modules" }
  ```

---

### Task 1c: Restore a sane `tsc` signal (exclude vendored/out-of-scope dirs)

**Files:**
- Modify: `tsconfig.json` (`exclude` array)

**Interfaces:**
- Consumes: nothing new.
- Produces: `npx tsc --noEmit` reports only the app's own errors (zero after Tasks 1/1b), without pulling in vendored `forks/**`, `scripts/**`, and other out-of-scope dirs.

**Why:** The current `include: ["**/*.ts","**/*.tsx"]` causes `tsc` to type-check the vendored PlayCanvas editor fork (`forks/**`) and scripts, yielding thousands of errors that are NOT app build blockers and were never meant to be type-checked. Excluding them restores `tsc` as a useful local check that agrees with `next build`.

- [ ] **Step 1: Check current excluded dirs**

Read `tsconfig.json`. The current `exclude` is:
```json
"exclude": ["node_modules", "packages", "src/splat-editor", "tests", "src/services"]
```

- [ ] **Step 2: Add the out-of-scope dirs to `exclude`**

Append `forks`, `scripts`, and `src/splat-editor` aliases if not already present. Recommended new `exclude` (keep existing entries):
```json
"exclude": [
  "node_modules",
  "packages",
  "src/splat-editor",
  "tests",
  "src/services",
  "forks",
  "scripts"
]
```
Do NOT remove `next-env.d.ts` from `include`. Do NOT remove any existing exclude entries. If removing `forks`/`scripts` from the type graph causes other app files that legitimately import from them to break, STOP and report (do not force-exclude a dir that app code imports).

- [ ] **Step 3: Re-run tsc to see only real app errors**
  ```
  $env:NEXT_TELEMETRY_DISABLED="1"; npx tsc --noEmit --pretty false
  ```
  Expected: the vendored-fork torrent is gone. A smaller set of genuine app errors (e.g. `app/under-admin/**/editor-dashboard/*`, `app/layout.tsx` globals.css, `lib/security.ts`) will now surface. **Record them in your report** — Task 4 decides which, if any, are true `next build` blockers.

- [ ] **Step 4: Confirm `pnpm build` still passes**
  ```
  $env:NEXT_TELEMETRY_DISABLED="1"; pnpm build
  ```
  Expected: still exit 0 (route table printed).

- [ ] **Step 5: Commit (if requested)**
  ```
  git add tsconfig.json; if ($?) { git commit -m "chore(tsconfig): exclude vendored forks/scripts from type-check signal" }
  ```

---

### Task 4: Final verification — green build + green tests + sane tsc

**Files:** Verify only.

- [ ] **Step 1: Full build**
  ```
  $env:NEXT_TELEMETRY_DISABLED="1"; pnpm build
  ```
  Expected: exit 0, full route table.

- [ ] **Step 2: Full test suite**
  ```
  $env:NEXT_TELEMETRY_DISABLED="1"; pnpm exec jest --runInBand
  ```
  Expected: 22 suites pass, 0 failed; 147 tests pass, 0 failed. (The deleted suite never passed; the fixed auth test now passes.)

- [ ] **Step 3: tsc signal (sane, not zero-over-forks)**
  ```
  $env:NEXT_TELEMETRY_DISABLED="1"; npx tsc --noEmit --pretty false
  ```
  Report the exact remaining error count and the distinct files. If Task 1c surfaced genuine app errors that ALSO break `next build`, they must be fixed (return to Task 1b loop). If they are only `tsc`-surface errors that `next build` tolerates, document them as deferred debt (they do not gate the build).

- [ ] **Step 4: Report the green baseline**

Paste the actual `pnpm build` exit and `jest` summary. Do **not** claim success from intent.

---

## Self-Review

- **Spec coverage (Option A):** Task 1/1b = make `next build` green (DONE, verified). Task 2 + 3 = make `jest` green. Task 1c = sane `tsc` signal + still-green build. Task 4 = final verify. The user's explicitly chosen gate (build + tests) is fully covered.
- **Placeholder scan:** No TBD/"add error handling" steps. Every step has exact commands and expected output.
- **Type consistency:** All role strings in Task 2 match `lib/rbac.ts` lowercase contract. Import symbol names in Task 1b match `lib/feature-flags.ts` exports verbatim.
- **Scope boundary:** The vendor-fork type debt is intentionally NOT a target (Option A). It is surfaced in Task 4 Step 3 and deferred, not silently ignored.
