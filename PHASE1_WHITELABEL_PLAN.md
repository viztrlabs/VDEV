# Phase 1: White-Labeling Plan
## PlayCanvas Engine & Editor Forks — VizTR Platform

**Generated:** 2026-09-19
**Status:** READY FOR EXECUTION

---

## Discovery Summary

| Fork | Location | Type | Current Branding |
|---|---|---|---|
| **Engine** | `forks/engine/` | Build output only (no source) | Partial VizTR (author, homepage, keywords) — still references PlayCanvas upstream |
| **Editor Server** | `forks/editor/server/` | Node.js Express server | VizTR branded ("VizTR Editor", "VizTR Custom Engine") |
| **Editor Frontend Source** | `forks/editor-src/` | Full TypeScript source | **PlayCanvas** (@playcanvas/editor, author PlayCanvas, repo playcanvas/editor) |
| **Editor Frontend Build** | `forks/editor/dist/` | Pre-built Vite output | VizTR logos present (viztr-*.svg), but JS bundle may contain PlayCanvas strings |

---

## Phase 1A: Engine White-Labeling (`forks/engine/`)

### Target Files

| File | Action | Details |
|---|---|---|
| `package.json` | **MODIFY** | Update `repository`, `bugs`, `homepage` to VizTR; ensure `@viztr/playcanvas-engine` name |
| `build/playcanvas.d.ts` | **AUDIT** | Check for PlayCanvas copyright headers in type definitions |
| `build/playcanvas.js` / `.mjs` | **AUDIT** | Search for "PlayCanvas" strings in bundle (engine name, version banner) |
| `build/scripts/` | **AUDIT** | Check for branding in any bundled scripts |

### Specific Changes

1. **`package.json`** (lines 72-77):
   ```json
   "repository": {
     "type": "git",
     "url": "https://github.com/viztrlabs/VDEV.git"
   },
   "bugs": {
     "url": "https://github.com/viztrlabs/VDEV/issues"
   },
   "homepage": "https://viztr.io"
   ```

2. **Package name**: Consider `@viztr/playcanvas-engine` (currently `playcanvas`) — but this may break downstream imports. **Decision: Keep `playcanvas` for compatibility; only update metadata.**

3. **Build output audit**: Search bundles for:
   - `"PlayCanvas Engine"` version banner
   - `playcanvas.com` URLs
   - Copyright headers

---

## Phase 1B: Editor Frontend Source White-Labeling (`forks/editor-src/`)

### Target Files

| File | Action | Details |
|---|---|---|
| `package.json` | **MODIFY** | Update `name`, `author`, `homepage`, `repository`, `bugs`, `description` |
| `README.md` | **MODIFY** | Replace PlayCanvas references with VizTR |
| `src/editor/index.ts` | **AUDIT** | Check for hardcoded PlayCanvas strings in bootstrap |
| `src/common/editor.ts` | **AUDIT** | Check for branding constants |
| `sass/` | **AUDIT** | Check for PlayCanvas color variables, logo references |
| `static/` | **AUDIT** | Check for PlayCanvas favicon, logos |
| `vite.config.mjs` | **AUDIT** | Check for hardcoded PlayCanvas URLs |

### Specific Changes

1. **`package.json`** (lines 1-22):
   ```json
   {
     "name": "@viztr/editor",
     "version": "2.31.4-viztr.1",
     "description": "The VizTR Editor Frontend",
     "keywords": ["editor", "html5", "javascript", "pcui", "viztr", "webgl", "webgpu", "webxr"],
     "homepage": "https://viztr.io",
     "bugs": { "url": "https://github.com/viztrlabs/VDEV/issues" },
     "repository": { "type": "git", "url": "https://github.com/viztrlabs/VDEV.git" },
     "author": "VizTR <support@viztr.io>",
     "license": "MIT"
   }
   ```

2. **`README.md`**: Replace all "PlayCanvas Editor" → "VizTR Editor", update links to VizTR docs.

3. **Source code audit**: Search for:
   - `playcanvas.com` URLs
   - "PlayCanvas" string literals (not in comments referencing upstream)
   - Hardcoded PlayCanvas color scheme (purple `#4A3FFF`)

---

## Phase 1C: Editor Server & Templates White-Labeling (`forks/editor/server/`)

### Current State: Already mostly VizTR-branded

| Component | Status | Notes |
|---|---|---|
| `index.js` line 278 | ✅ | Logs "VizTR Editor running at..." |
| `config.js` lines 115-118 | ✅ | "VizTR Custom Engine" |
| `config.js` line 164 | ✅ | "VizTR XR Studio Project" |
| `templates/editor.html` | ✅ | Title "VizTR Editor", runtime branding injection |

### Target Files — Remaining Work

| File | Action | Details |
|---|---|---|
| `templates/editor.html` | **AUDIT** | Ensure no PlayCanvas CDN references in fallback paths |
| `templates/launch.html` | **AUDIT** | Check for PlayCanvas branding |
| `templates/blank.html` | **AUDIT** | Check for branding |
| `routes/mock/index.js` | **AUDIT** | Mock API responses may contain PlayCanvas data |
| `routes/real-api/*.js` | **AUDIT** | Ensure Supabase schema uses VizTR terminology |

### Specific Checks

1. **`launch.html`**: Verify title, favicon, any PlayCanvas references
2. **`blank.html`**: Verify title, any PlayCanvas references
3. **Mock routes**: May return fake PlayCanvas project data — update to VizTR

---

## Phase 1D: Editor Build Output White-Labeling (`forks/editor/dist/`)

### Current State

| Asset | Status |
|---|---|
| `dist/images/viztr-*.svg` | ✅ VizTR logos present |
| `dist/js/editor.js` | ⚠️ **NEEDS AUDIT** — 5.8MB bundle may contain PlayCanvas strings |
| `dist/css/editor.css` | ⚠️ **NEEDS AUDIT** — May contain PlayCanvas color variables |
| `dist/index.html` | ⚠️ **NEEDS AUDIT** — If exists, check title/meta |

### Required Actions

1. **Rebuild from white-labeled source**: After Phase 1B changes, run `npm run build` in `editor-src/` to produce clean `dist/`
2. **Copy to `forks/editor/dist/`**: Overwrite existing dist with white-labeled build
3. **Verify**: Search rebuilt bundles for "PlayCanvas" strings

---

## Phase 1E: Cross-Reference Updates

### Files That Reference Fork Paths

| File | Reference | Action |
|---|---|---|
| `forks/editor/server/index.js` line 68 | `forks/engine/build` | Verify path still correct |
| `forks/editor/server/index.js` line 59 | `forks/developer-site` | Entity icons — check if needed |
| Main VizTR `app/editor/[projectId]/EditorClient.tsx` | Loads from `localhost:3487` | No change needed (loads from server) |

---

## Execution Order

```
1. Phase 1B: White-label editor-src source (package.json, README, source audit)
2. Phase 1A: Update engine package.json metadata
3. Phase 1C: Audit editor server templates & mock routes
4. Phase 1D: Rebuild editor-src → copy to forks/editor/dist/
5. Phase 1E: Verify cross-references
6. Test: Start editor server (npm run dev:engine) → verify VizTR branding at :3487
```

---

## Validation Checklist

After Phase 1 complete, verify:

- [ ] `forks/engine/package.json` — VizTR metadata, no PlayCanvas repo/bugs
- [ ] `forks/editor-src/package.json` — `@viztr/editor`, VizTR author/repo
- [ ] `forks/editor-src/README.md` — VizTR branding
- [ ] `forks/editor/server/templates/*.html` — No PlayCanvas CDN fallbacks
- [ ] `forks/editor/dist/` — Rebuilt from white-labeled source
- [ ] `npm run dev:engine` → `http://localhost:3487` shows "VizTR Editor" with VizTR logos
- [ ] Main VizTR `app/editor/[projectId]` still loads editor correctly
- [ ] Engine served at `localhost:3487/engine` is the VizTR custom build

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| Breaking `@playcanvas/editor` imports in editor-src | Keep `playcanvas` engine package name; only change editor package name |
| Editor-src build fails after package.json changes | Test build immediately after package.json changes |
| Runtime branding injection conflicts with source changes | Source white-labeling should make runtime injection redundant but harmless |
| ShareDB/Supabase schema mismatch | No schema changes in Phase 1 — only branding |

---

## Dependencies for Phase 2

Phase 1 must complete before Phase 2 because:
- `PlayCanvasEngineAdapter` imports from the white-labeled engine
- Editor config injection uses VizTR-branded engine URL
- Serializer will need VizTR-typed engine classes