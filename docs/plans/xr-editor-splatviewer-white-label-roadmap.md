# XR Editor & SplatViewer White-Label Roadmap

**Scope:** XR editor framework (`app/editor/[projectId]`) and SplatViewer components (`components/xr/GaussianSplatViewer.tsx`, `SplatConfigurator.tsx`)  
**Objective:** White-label the editor and splat viewer with VizTR identity while maintaining backward compatibility for all existing projects, editor sessions, and splat viewing workflows.  
**Constraints:** No breaking changes to existing editor URLs, project data schemas, or viewer mounting contracts.

---

## Current State Summary

The XR editor is a **thin Next.js wrapper** around a legacy PlayCanvas editor server (`localhost:3487`). The actual editor runs in a separate Node.js process and is injected via iframe/script. React components in Next.js only handle project data fetching and config assembly.

The **SplatViewer** (`GaussianSplatViewer.tsx`) is a React component wrapping `@mkkellogg/gaussian-splats-3d` inside a hand-rolled Three.js scene. It supports multi-scene switching and quality presets but has no editing, measurement, annotation, or export capabilities.

**White-label readiness:** Critical. Every XR component contains hardcoded VizTR brand strings, colors (`#3ECF8E`), and localStorage keys. There is no theme context for XR components.

---

## Phase 0 — Brand Isolation Foundation (Week 1–2)

**Goal:** Extract all VizTR-specific identity into configurable brand objects before touching UI.

### Step 1: Define brand schema
- **Files to create:** `lib/branding.ts`, `types/branding.ts`
- **Implementation:**
  ```typescript
  interface BrandConfig {
    name: string;               // e.g. "VizTR Studio"
    logoUrl?: string;           // e.g. "/logo.png"
    accentColor?: string;       // e.g. "#3ECF8E"
    backgroundColor?: string;   // e.g. "#09090B"
    surfaceColor?: string;      // e.g. "#18181B"
    textColor?: string;         // e.g. "#FAFAFA"
    mutedTextColor?: string;    // e.g. "#A1A1AA"
    fontFamily?: string;        // e.g. "Inter, sans-serif"
    domain?: string;            // e.g. "viztr.com"
    supportEmail?: string;      // e.g. "hello@viztr.com"
    analyticsId?: string;       // e.g. "G-XXXXXXXXXX"
  }
  ```
- **Default:** VizTR values. No behavior change until overridden.

### Step 2: Brand provider context
- **Files to create:** `components/xr/brand/BrandProvider.tsx`, `hooks/use-brand.ts`
- **Implementation:** React context that injects CSS custom properties into a scoped container div. All XR components read `var(--xr-accent)`, `var(--xr-bg)`, etc.
- **Fallback:** If no `BrandProvider` is present, components use hardcoded VizTR defaults (preserves existing behavior).

### Step 3: Tenant-scoped storage keys
- **Files to modify:** `lib/editorStore.ts`, `lib/tourClientStore.ts`, `lib/credentials-store.ts`, `app/layout.tsx`
- **Implementation:** Prefix localStorage keys with tenant ID: `xr-editor-{tenantId}`, `xr-tour-client-{tenantId}`, `xr-credentials-{tenantId}`.
- **Default tenant:** `viztr`. Existing data migrates automatically on first read.
- **Backward compatibility:** Old `viztr-` prefixed keys are still read; new writes use tenant-prefixed keys.

---

## Phase 1 — Editor White-Label (Week 3–6)

**Goal:** Make the editor UI brandable without changing its legacy iframe architecture.

### Step 1: Parameterize editor shell
- **Files to modify:** `app/editor/[projectId]/page.tsx`, `app/editor/[projectId]/EditorClient.tsx`
- **Changes:**
  - Replace hardcoded `username: 'viztr-user'`, `description: 'VizTR Custom Engine'`, `background: '#1a1a2e'` with values from `BrandConfig`.
  - Pass brand config as props to `EditorClient` so the legacy editor iframe can consume it via `window.__BRAND_CONFIG__`.
  - **Backward compatibility:** If brand config is absent, VizTR defaults are injected.

### Step 2: Override legacy editor CSS
- **Files to create:** `app/editor/[projectId]/editor-overrides.css`
- **Implementation:** Scoped CSS that overrides PlayCanvas editor chrome colors, logo placement, and branding elements using CSS variables.
- **Injection:** `EditorClient.tsx` injects this stylesheet after the editor CSS link.
- **Backward compatibility:** Overrides are no-op if CSS variables are unset (VizTR defaults match current editor appearance).

### Step 3: Editor header/footer branding
- **Files to modify:** Add wrapper components around the editor iframe: `components/editor/EditorBrandShell.tsx`
- **Implementation:** Surround the legacy editor with a React-rendered header/footer that displays the tenant logo, name, and support links. Uses `BrandProvider` context.
- **Backward compatibility:** Shell is transparent by default (no visual change).

### Step 4: Editor URLs and API base
- **Files to modify:** `app/editor/[projectId]/page.tsx`
- **Implementation:** Read `PLAYCANVAS_EDITOR_URL` and `PLAYCANVAS_API_URL` from environment + brand config. Support per-tenant editor instances.
- **Backward compatibility:** Default to `localhost:3487` if not configured.

---

## Phase 2 — SplatViewer White-Label (Week 7–10)

**Goal:** Rebrand the GaussianSplatViewer and SplatConfigurator components.

### Step 1: Brand-aware GaussianSplatViewer
- **Files to modify:** `components/xr/GaussianSplatViewer.tsx`
- **Changes:**
  - Replace hardcoded `#3ECF8E` accent color in loading spinner, progress bar, and quality selector with `var(--xr-accent)`.
  - Parameterize `title` and `subtitle` props; default to `BrandConfig.name`.
  - Add `brandLogoUrl` prop; render logo overlay in bottom-left corner.
  - Replace CSS class `viztr-hotspot` (if present) with configurable `hotspotClassName`.

### Step 2: Brand-aware SplatConfigurator
- **Files to modify:** `components/xr/SplatConfigurator.tsx`
- **Changes:**
  - Replace all VizTR strings in dropdowns, buttons, and tooltips with i18n keys or `BrandConfig` labels.
  - Apply brand colors to the scene selector, quality preset cards, and action buttons.
  - Add logo to configurator header.

### Step 3: Brand-aware XR viewer chrome
- **Files to modify:** `components/xr/XRViewer.tsx`, `components/xr/CinematicEntry.tsx`, `components/xr/Annotation.tsx`, `components/xr/VRControls.tsx`, `components/xr/PlayCanvasXRViewer.tsx`
- **Changes:**
  - Replace `"VizTR Spatial Engine"`, `"VizTR Interactive Spatial Node"`, `"PlayCanvas Engine"`, `"The Apex Tower Spatial Showcase"` with props from `BrandConfig`.
  - Replace all `#3ECF8E` color literals with CSS variables.
  - Make `projectId`, `projectName`, `subtitle` configurable via props or URL query params.

### Step 4: PlayCanvas CDN conflict resolution
- **Files to modify:** `components/xr/PlayCanvasXRViewer.tsx`, `components/xr/PlayCameraSceneRenderer.tsx`
- **Implementation:** Namespace the CDN-injected PlayCanvas instance under a tenant-specific global (e.g., `window.__xr_playcanvas__`). Remove collision with NPM `playcanvas` package.
- **Backward compatibility:** Both paths continue to work; collision is eliminated.

---

## Phase 3 — Editor Features (Week 11–14)

**Goal:** Add missing editor capabilities while maintaining white-label consistency.

### Feature: Splat editing tools
- **Files to create:** `components/xr/splat-editor/SplatEditor.tsx`, `components/xr/splat-editor/SplatAnnotationTool.tsx`, `components/xr/splat-editor/SplatMeasurementTool.tsx`
- **Implementation:**
  - Annotation tool: click on splat to place info markers; persisted to project data.
  - Measurement tool: two-point distance measurement using splat point cloud depth.
  - Both tools use `BrandConfig` colors for UI chrome.
- **Backward compatibility:** Tools are opt-in tabs in `SplatConfigurator`; existing viewer-only mode unchanged.

### Feature: Real-time editor-viewer sync
- **Files to modify:** `lib/editorStore.ts`, `lib/tourClientStore.ts`, `components/xr/XRViewer.tsx`
- **Implementation:** Publish editor changes to a shared event bus (`BroadcastChannel` or Supabase Realtime). Viewer subscribes and hot-swaps scene/hotspot data.
- **Backward compatibility:** If sync channel is absent, editor and viewer operate independently (current behavior).

### Feature: Asset pipeline integration
- **Files to modify:** `app/editor/[projectId]/page.tsx`, `components/xr/SplatConfigurator.tsx`
- **Implementation:** Add upload buttons for `.splat`, `.ply`, `.ksplat`, `.glb` files. Show progress bar with brand colors. Store in Supabase Storage or R2.
- **Backward compatibility:** Existing manual file placement workflow unchanged.

### Feature: Undo/redo persistence across sessions
- **Files to modify:** `lib/editorStore.ts`
- **Implementation:** Persist undo history to `IndexedDB` instead of localStorage for large scenes. Scope by tenant ID.
- **Backward compatibility:** localStorage fallback for small scenes.

---

## Phase 4 — Advanced White-Label (Week 15–18)

**Goal:** Full tenant isolation and deployability.

### Per-tenant editor deployments
- **Implementation:** Support `PLAYCANVAS_EDITOR_URL_{TENANT}` env vars. Each tenant can point to a branded PlayCanvas editor instance or share a single instance with CSS overrides.
- **Files to modify:** `app/editor/[projectId]/page.tsx`

### Brand-aware SEO and metadata
- **Files to modify:** `app/xr-world/virtual-tour/[tourId]/page.tsx`, `app/editor/[projectId]/page.tsx`
- **Implementation:** Inject tenant-specific `title`, `description`, `og:image`, `favicon` from `BrandConfig`.
- **Backward compatibility:** Default to VizTR metadata if brand config is absent.

### Email templates white-label
- **Files to modify:** `lib/email-service.ts`
- **Implementation:** Accept `BrandConfig` in all email functions. Replace `"VizTR Studio"` and `hello@viztr.com` with tenant values.
- **Backward compatibility:** Default to VizTR values.

### Analytics tenant isolation
- **Files to modify:** `components/xr/analytics/analyticsEngine.ts`, `lib/analytics.ts`
- **Implementation:** Prefix all analytics events with tenant ID. Support per-tenant Google Analytics IDs.
- **Backward compatibility:** Default tenant is `viztr`; no data loss.

---

## Testing Strategy

| Phase | Test Type | Coverage |
|-------|-----------|----------|
| 0 | Unit | BrandProvider context, CSS variable injection, storage key migration |
| 1 | Integration | Editor shell branding, iframe CSS overrides, legacy editor compatibility |
| 2 | Unit + visual regression | SplatViewer brand props, color overrides, PlayCanvas namespace isolation |
| 3 | E2E | Splat annotation/measurement tools, editor-viewer sync, asset upload |
| 4 | Integration | Per-tenant deployments, SEO metadata, email templates, analytics isolation |

**Backward compatibility tests:**
- Load existing `.data/tour/local-tour.json` fixtures; verify no data loss.
- Open existing editor projects (`localhost:3487`); verify UI renders correctly with VizTR defaults.
- View existing splat scenes without brand config; verify VizTR branding appears (no visual regression).

---

## Rollback Plan

- **Feature flags:** All white-label changes gated by `TourSettings.brandingEnabled` and `XRBranding.enabled` flags. Toggle off to revert to VizTR defaults.
- **CSS variables:** Fallback values ensure components render correctly even if `BrandProvider` is missing or misconfigured.
- **Storage migration:** Old `viztr-` prefixed keys are read indefinitely; new tenant-prefixed keys are written alongside. No data deletion.
- **Editor iframe:** Legacy editor is untouched; wrapper changes are purely additive. Removing the wrapper restores original editor behavior.

---

## Dependencies to Add

| Package | Purpose | Phase |
|----------|---------|-------|
| `@mkkellogg/gaussian-splats-3d` (already installed) | Splat viewing | 0 |
| `react-colorful` (or similar) | Color picker for brand config UI | 1 |
| `uuid` | Annotation/measurement IDs | 3 |
| `dexie` (optional) | IndexedDB for undo history | 3 |

No new heavy dependencies required. All work uses existing Three.js, Zustand, and Marzipano stacks.
