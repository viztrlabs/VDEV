# VizTR Editor Integration — Comprehensive Audit Report

**Date:** 2026-09-15
**Scope:** `forks/editor/server/` + `app/editor/[projectId]/page.tsx`
**Methodology:** REST API probing, server log analysis, source code review, editor JS analysis

---

## Current Working State

| Subsystem | Status | Notes |
|-----------|--------|-------|
| Server startup | OK | Starts clean, Express serves on 3487 |
| ShareDB pre-population | OK | Loads scenes, assets, settings from Supabase |
| ShareDB connection | OK | `connected: true`, `authenticated: true` |
| ShareDB document loading | OK | Scene entities loaded into editor hierarchy |
| Hierarchy panel | OK | 5 entities visible: Root, Floor, Camera, Sun, Ambient |
| Inspector panel | OK | Shows entity properties on selection |
| Viewport canvas | OK | WebGL context active, gizmo renders |
| Assets panel | OK | 12 assets loaded with thumbnails |
| REST: `/api/projects/:id` | OK | Returns project data |
| REST: `/api/projects/:id/scenes` | OK | Returns scene list |
| REST: `/api/projects/:id/assets` | OK | Returns 12 assets |
| REST: `/api/projects/:id/branches` | OK | Returns branches |
| REST: `/api/scenes/:id` (GET) | OK | Returns scene with entities |
| REST: `/api/scenes/:id` (PUT) | OK | Updates scene entities |
| Mock: `/api/store` | OK | Returns empty array |
| Mock: `/api/user` | OK | Returns mock user data |
| Console errors | 35 errors | Mostly non-critical guide/bubble errors |
| Page hang | YES | After prolonged use, JS thread blocks |

---

## CRITICAL BUGS (P0) — Must Fix Before Production

### BUG-01: `sanitizeEntities()` Strips Valid Components
**File:** `websocket/sharedb.js:30-53`
**Impact:** Entity data corruption on every ShareDB round-trip

```javascript
// Lines 45-49: These deletions are WRONG
if (entity.components.transform) {
    delete entity.components.transform;  // STRIPS POSITION DATA
}
if (entity.components.material) {
    delete entity.components.material;   // STRIPS MATERIAL LINKS
}
```

- `transform` component: While PlayCanvas editor stores `position/rotation/scale` as top-level entity fields, the engine internally uses a `transform` component. Stripping it breaks engine-side operations.
- `material` component: Entities with material references lose their material assignment when loaded via ShareDB. The "New Material" asset (with full PBR data) exists in Supabase but entities referencing it get stripped.
- **Fix:** Only strip `transform` if the editor doesn't use it (verify). Never strip `material`.

### BUG-02: `sanitizeEntities()` Deletes Ambient Lights
**File:** `websocket/sharedb.js:36-42`
**Impact:** The "Ambient" entity loses its light component

```javascript
if (lightType === 'ambient' || !['directional', 'point', 'spot'].includes(lightType)) {
    delete entity.components.light;
}
```

PlayCanvas DOES support ambient lights. The editor's light component schema includes `type: 'ambient'`. This deletion means the "Ambient" entity renders with no light component.
**Fix:** Add `'ambient'` to the valid light types list.

### BUG-03: `readSnapshots` Async Callback Pattern
**File:** `websocket/sharedb.js:211`
**Impact:** Potential race condition if ShareDB doesn't support async middleware

```javascript
backend.use('readSnapshots', async (request, callback) => {
    // ... await Supabase queries ...
    callback();  // in finally block
});
```

ShareDB's `use()` middleware expects synchronous callback invocation. Using `async` means the function returns a Promise immediately, and ShareDB may proceed before `callback()` fires. In practice this works because ShareDB waits for the callback, but it's fragile and undocumented.
**Fix:** Remove `async`, use `.then()` chains, or verify ShareDB supports async middleware.

### BUG-04: HTML Template Tips Override Direction
**File:** `templates/editor.html:20-31`
**Impact:** `mainMenu` tip is always `true`, causing JS error

```javascript
config.self.flags.tips = Object.assign({
    mainMenu: true,  // default
}, config.self.flags.tips || {});
```

The `Object.assign` puts defaults as target, config as source. Config values DO override defaults. However, both `config.js` (line 69) AND `editor.html` (line 27) set `mainMenu: true`. To suppress the tip, both must be `false`. The `mainMenu: true` default causes the `guide-intro.ts` bubble to fire, which references `editor.call('mainMenu')` — this returns `undefined` because no `mainMenu` module is registered, causing the TypeError.
**Fix:** Set `mainMenu: false` in both `config.js` and `editor.html` defaults.

### BUG-05: ShareDB Initialized for Project 1 Only
**File:** `index.js:136-140`
**Impact:** Multi-project support broken

```javascript
const defaultConfig = {
    accessToken: 'local-dev-token',
    project: { id: 1 },  // HARDCODED
};
const shareDB = setupShareDB(defaultConfig);
```

The ShareDB backend is created once with `project.id: 1`. The `populateFromSupabase()` only loads scenes for project 1. Opening project 2 won't have pre-populated ShareDB data.
**Fix:** Pass the actual project ID from the request, or populate all projects on startup.

---

## HIGH PRIORITY BUGS (P1)

### BUG-06: Scenes PUT/DELETE by UUID Fails
**File:** `routes/real-api/scenes.js:74,87`
**Impact:** Scene updates/deletes silently fail

```javascript
// PUT
.eq('id', req.params.id)  // Only matches UUID format in `id` column
// The editor sends the UUID, but the route matches by `id` (UUID column in Supabase)
```

The `editor_scenes` table has both `id` (UUID) and `unique_id` (UUID) columns. The route uses `.eq('id', req.params.id)` which should work if the param is the UUID. But if the editor sends the numeric scene ID (from `config.scene.id`), it will fail.
**Fix:** Support both UUID and numeric ID lookups.

### BUG-07: `buildSceneDocData()` Default Entity Missing `children` Array
**File:** `websocket/sharedb.js:64-71`
**Impact:** Editor crash when loading empty scene

```javascript
'root-entity': {
    resource_id: 'root-entity',
    name: 'Root',
    parent: null,
    children: [],  // Missing in original code
    components: {}
}
```

Wait — checking again, `children: []` IS present. But the root entity has no children pointing to actual entities. When the scene has no entities in Supabase, the editor shows a bare Root with no children.
**Impact:** Low — only affects empty scenes.

### BUG-08: Config `engineV2` Mismatch Between Server and Next.js
**File:** `config.js` vs `app/editor/[projectId]/page.tsx`
**Impact:** Inconsistent editor behavior

Server config: `engineV2: true` (enables WebGL2)
Next.js config: `engineV2: false` (would use WebGL1)
**Fix:** Align both to `true`.

### BUG-09: Missing `config.url` Trailing Slashes Cause URL Construction Failures
**File:** `config.js` and `app/editor/[projectId]/page.tsx`
**Impact:** Worker and asset URLs break

The editor concatenates paths like `config.url.frontend + 'js/png-export.worker.js'`. If `frontend` is `http://localhost:3487` (no trailing slash), the result is `http://localhost:3487js/png-export.worker.js`.
**Current state:** Fixed in server `config.js` (trailing slashes present). Need to verify `page.tsx`.

### BUG-10: Relay Hardcodes `userId: 1`
**File:** `websocket/relay.js:58`
**Impact:** All users appear as the same person

```javascript
ws.send(JSON.stringify({ m: 'welcome', d: { userId: 1 } }));
```
**Fix:** Extract userId from auth token or connection metadata.

### BUG-11: Page Hang After Prolonged Use
**Symptoms:** Browser JS thread blocks, `browser_eval` times out
**Possible cause:** ShareDB document operations creating an infinite update loop, or WebSocket message buffer overflow from repeated `selection{...}` messages flooding the stream.
**Investigation needed:** Monitor WebSocket message count and ShareDB operation count over time.

---

## MEDIUM PRIORITY BUGS (P2)

### BUG-12: Mock Endpoints Missing for Some Editor Calls
**Missing endpoints:**
- `GET /api/export` — 404 (should be `POST /api/projects/:id/export`)
- `GET /api/users` — 404 (should be `GET /api/user`)
- `GET /api/jobs` — 404 (should be `GET /api/jobs/:id`)
- `POST /api/realtime/auth` — 404 (handled via WebSocket)

The editor likely handles 404s gracefully, but missing endpoints generate console noise.

### BUG-13: No Authentication on Any Endpoint
**File:** `index.js:31-37`
**Impact:** Any network client can read/write all projects

CORS allows `*`, no auth middleware, hardcoded `local-dev-token`. Acceptable for local dev, critical for deployment.

### BUG-14: Asset ID Collision Risk
**File:** `routes/real-api/assets.js:142`
**Impact:** Duplicate asset IDs

```javascript
const intId = Math.floor(Math.random() * 800000000) + 1000000;
```

Random generation can produce collisions. Use UUID or auto-increment.

### BUG-15: `config.self.branch` May Be Null
**File:** `config.js:75-80`
**Impact:** Editor crash if it accesses `branch.id` without null check

When `projectId` is null, `self.branch` is set to `null`. Some editor code may assume this is always an object.

### BUG-16: Silent Exception Swallowing in Config Generator
**File:** `config.js:632,640,649`
**Impact:** Database errors invisible

```javascript
catch (e) {}  // Swallows all errors including DB connection failures
```

### BUG-17: Next.js Config Missing Schema Documents
**File:** `app/editor/[projectId]/page.tsx`
**Impact:** Schema validation may fail

The Next.js page config doesn't include `schema.documents.scene` or `schema.assetData`. The server config has these, but the Next.js path may be used in production.

---

## LOW PRIORITY / INFO

### INFO-01: `selection{...}` Messages Are Benign
The editor sends selection sync messages as raw strings. ShareDB ignores non-JSON messages gracefully. No fix needed.

### INFO-02: `close:scene:{id}` Messages Are Benign
The editor sends scene close notifications as raw strings. ShareDB logs a warning but continues. No fix needed.

### INFO-03: `config.url.realtime.http` Uses `ws://` Protocol
The field name `.http` is misleading but the editor code uses it directly as `new WebSocket(url)`. Current `ws://` is correct.

### INFO-04: Messenger Only Handles Auth/Ping
The messenger WebSocket only responds to `authenticate` and `ping`. Other messages from the editor are silently dropped. This is acceptable for local dev.

### INFO-05: No Undo/Redo Persistence
ShareDB supports OT-based undo/redo, but we don't persist operation history. Undo works within a session but is lost on reload.

---

## REMEDIATION PLAN

### Phase 1: Critical Fixes (1-2 hours)
1. Fix `sanitizeEntities()` — remove `transform`/`material` stripping, add `'ambient'` to valid light types
2. Fix `mainMenu` tip — set to `false` in both config.js and editor.html
3. Fix ShareDB project initialization — support dynamic project IDs

### Phase 2: High Priority (2-4 hours)
4. Fix scenes PUT/DELETE to support both UUID and numeric ID
5. Fix relay userId to use connection metadata
6. Investigate and fix page hang issue
7. Align `engineV2` between server and Next.js configs

### Phase 3: Medium Priority (4-8 hours)
8. Add missing mock endpoints for editor calls
9. Add basic auth middleware for local dev
10. Fix asset ID generation (use UUID)
11. Add error logging to config generator catch blocks
12. Add missing schema documents to Next.js config

### Phase 4: Low Priority
13. Add undo/redo persistence
14. Add scene/asset CRUD mock endpoints
15. Clean up dead code and console.log statements
