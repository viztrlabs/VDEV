# Task 1 Brief — Fix the compile-blocking syntax error

## Context
Repo root: `C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev`. This is Phase 1 repair work to restore a green build and green test suite. Task 1 fixes the single syntax error that currently breaks `npx tsc --noEmit`.

## Requirements (use EXACTLY these values)

Modify `app/admin/security/page.tsx` at line 29.

Change line 29 FROM:
```tsx
          onClick={() => setLoading(true); setTimeout(() => setLoading(false), 1000)}
```
TO:
```tsx
          onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1000); }}
```

The bug: an arrow function with a *statement* body must be wrapped in `{ }`. The current code has a semicolon-separated expression body without braces, which is invalid JSX/TS.

## Global constraints that bind this task
- Windows / PowerShell. Commands must NOT use `&&`. Chain with `;` and `if ($?) { ... }`.
- Do **NOT** commit. The user has not requested commit/push. Leave the change as an uncommitted working-tree edit.
- Do **NOT** add code comments unless they already exist.
- Only edit `app/admin/security/page.tsx` line 29. Do not touch any other file.

## Verification commands (run and capture output)
1. Type-check:
   - `$env:NEXT_TELEMETRY_DISABLED="1"; npx tsc --noEmit --pretty false`
   - Expected: zero output, exit code 0.
2. Lint the file:
   - `$env:NEXT_TELEMETRY_DISABLED="1"; npm run lint -- --file app/admin/security/page.tsx`
   - Expected: "No ESLint warnings or errors".

## Report contract
Write a full report to the report file path given in your dispatch prompt. In the final message return ONLY: status (DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED), files changed, a one-line verification summary (exact tsc/jest output), and any concerns.
