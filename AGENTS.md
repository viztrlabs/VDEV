# AGENTS.md — Repo operating notes

## Dev server
- `pnpm run dev:all` runs NEXT (:3000), ENGINE (:3002), SPLAT (:3487); detached log at `.data/dev-server.log`.
- Restart: kill processes listening on 3000/3002/3487, then from repo root:
  `Start-Process cmd -ArgumentList '/c','pnpm run dev:all > .data\dev-server.log 2>&1' -WindowStyle Hidden`

## Builds (IMPORTANT)
- NEVER run `pnpm run build` while the dev server is running — `next build` and `next dev` share `.next`; a mid-flight overwrite corrupts dev chunks (`Cannot read properties of undefined (reading 'call')`).
- Use `powershell -ExecutionPolicy Bypass -File scripts/safe-build.ps1` — it stops dev, builds, restarts dev. `-KeepDevStopped` builds only.
- If dev chunks are already corrupted: stop dev, delete `.next`, restart, then hard-refresh the browser.

## Verification baselines (do not "fix" these unrelated failures)
- `pnpm exec jest`: 15 failing tests / 11 failing suites is the pre-existing baseline (auth, leads, validation, `.kilo/worktrees/*` copies, playwright e2e needing prod credentials).
- `pnpm exec tsc --noEmit`: ~800 pre-existing errors; `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so judge changes by a scoped filter (`Select-String` on the touched paths) versus this baseline, not by a clean run.

## Working-tree discipline
- The tree has many uncommitted files from other work streams (auth hardening, collab, floorplanAI, dashboard/marketing pages, `package.json`). NEVER `git add -A` or commit them.
- Scope commits with `git add <exact files>`. Before committing a modified file, read `git diff <file>` and confirm every hunk belongs to your change.
- Virtual-tour artist guide: `docs/visual-tour/artist-workflow-guide.md`.
