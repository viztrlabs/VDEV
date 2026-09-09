# Task 3 Brief — Remove the dead integration test that imports phantom modules

## Context
Repo root: `C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev`. Phase 1 repair work to restore a green test suite. Task 3 deletes a stale integration test that imports modules that do not exist and are not used anywhere.

## Requirements

Delete the file:
- `__tests__/integration/test-final-cross-module-integration.ts`

**Why delete, not implement:** This test imports 4 modules that do not exist and are referenced by ZERO active source files:
- `lib/3d/splat/splat-loader`
- `lib/3d/splat/splat-renderer`
- `lib/3d/splat/splat-streaming-manager`
- `lib/3d/ar/enhanced-placement-system`

The test also imports `lib/3d/ar/enhanced-ar-session-manager` which DOES exist and must NOT be touched or deleted. Implementing the 4 phantom modules would mean inventing a whole internal 3D/AR subsystem purely to satisfy a dead test — out of scope. Deleting the stale test is the correct minimal fix.

## Steps

1. Verify the phantom modules are unreferenced in active code. Run (this is a check, do not fix anything found):
   ```
   Get-ChildItem -Recurse -File -Include *.ts,*.tsx -Path app,components,lib | Select-String -Pattern 'splat-loader|splat-renderer|splat-streaming|enhanced-placement|ARPlacementSystem|SplatStreamingManager'
   ```
   Expected: no matches in `app`, `components`, `lib`.

2. Delete the file:
   ```
   Remove-Item -LiteralPath "__tests__/integration/test-final-cross-module-integration.ts"
   ```

## Global constraints that bind this task
- Windows / PowerShell. Commands must NOT use `&&`.
- Do **NOT** commit.
- Do **NOT** touch `lib/3d/ar/enhanced-ar-session-manager.ts` or any other file.

## Verification commands (run and capture output)
Run:
- `$env:NEXT_TELEMETRY_DISABLED="1"; npx jest __tests__/integration --runInBand`
- Expected: all remaining suites in `__tests__/integration` pass; no "Cannot find module" errors.

## Report contract
Write a full report to the report file path given in your dispatch prompt. In the final message return ONLY: status, files deleted/changed, one-line verification summary (exact jest output), and any concerns.
