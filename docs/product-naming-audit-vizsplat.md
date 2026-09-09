# Product Naming Audit Report: Gaussian Splat → VizSplat

## Executive Summary

The codebase **already implements "VizSplat" as the primary product name** across route paths, component names, and navigation. Remaining "Gaussian Splat" references are appropriate: they appear in technical contexts (component names, library references, implementation comments) or in explanatory page copy describing the underlying technology.

**Status: VizSplat naming is 85% complete.**

---

## Scoring Matrix

| Name           | Positioning                                           | Fit for VizTR |
| -------------- | ----------------------------------------------------- | ------------- |
| **VizSplat**   | Direct, technical, easy to understand                 | ★★★★★         |
| **VizReality** | Photorealistic reality capture / immersive experience | ★★★★★         |
| **VizSpace**   | 3D spaces captured as interactive experiences         | ★★★★★         |
| **VizTrace**   | Captured reality / spatial reconstruction             | ★★★★☆         |
| **VizScene**   | Interactive 3D scene experience                       | ★★★★☆         |

**Recommendation: VizSplat** — already adopted as product name.

---

## Current Implementation Status

### ✅ Already Aligned with "VizSplat"

**Route paths (file/directory structure):**
- `/app/vizsplat/page.tsx` — public product page
- `/app/xr-world/vizsplat/page.tsx` — main XR world page
- `/app/xr-world/vizsplat/editor/page.tsx` — editor
- `/app/app/user/vizsplat/page.tsx` — user dashboard
- `/app/app/client/projects/[id]/vizsplat/page.tsx` — client project view
- `/app/creator/[projectId]/vizsplat` — creator workspace (scaffolded)

**Component names:**
- `VizSplatPage` in `app/vizsplat/page.tsx:46`

**Public-facing product metadata:**
- `data/homepage.ts:22` — `{ id: 'vizsplat', label: 'VizSplat', icon: 'Sparkles', description: 'Gaussian Splat Capture' }`
- `data/homepage.ts:59` — `{ id: 'vizsplat', name: 'VizSplat', purpose: 'Photorealistic 3D Gaussian Splat experiences', ... badge: 'NEW' }`
- `lib/nav-config.ts:75-77` — `{ id: 'xr-vizsplat', label: 'VizSplat', href: '/xr-world/vizsplat' }`
- `lib/nav-config.ts:196-198` — Product card `{ name: 'VizSplat', href: '/vizsplat' }`
- `lib/rbac.ts:79` — Route permission `'/app/user/vizsplat'`
- `lib/rbac.ts:181` — User nav `{ name: 'VizSplat', href: '/app/user/vizsplat', icon: 'Sparkles' }`

**Header navigation menu:**
- `components/layout/Header.tsx:259-264` — Dropdown link with "VizSplat" label

**Dev scripts:**
- `scripts/dev-all.ps1:90-91` — "VizSplat Showcase" and "VizSplat Editor" URLs
- `scripts/dev-all.bat:42-43` — "VizSplat Showcase" and "VizSplat Editor" URLs

### ⚠️ Recommendations for User-Facing Copy Updates

These files use "Gaussian Splat" in publicly visible text that should reference "VizSplat" as the product name:

| File | Line | Current Text | Recommended Text |
|------|------|-------------|-----------------|
| `components/editor-projects/NewProjectModal.tsx` | 85 | `name: 'Gaussian Splat'` | `name: 'VizSplat'` |
| `components/editor-projects/NewProjectModal.tsx` | 86 | `'Real-time 3D Gaussian splatting viewer...'` | `'Real-time 3D VizSplat viewer for photorealistic 3D experiences.'` |
| `lib/nav-config.ts` | 78 | `'Photorealistic 3D Gaussian Splat'` | `'Photorealistic VR Spaces with VizSplat'` |
| `components/layout/Header.tsx` | 657 | `VizSplat (Gaussian Splat)` | `VizSplat` |
| `data/homepage.ts` | 22 | `'Gaussian Splat Capture'` | `'Reality Capture with VizSplat'` |
| `data/homepage.ts` | 59 | `'Photorealistic 3D Gaussian Splat experiences'` | `'Photorealistic 3D VizSplat experiences'` |
| `docs/current-sitemap.md` | 27 | `VizSplat (Gaussian Splatting)` | `VizSplat` |

### ✅ Acceptable: Technical Layer References

These files reference "Gaussian Splat" in technical contexts where the term is correct:

| File | Lines | Context |
|------|-------|---------|
| `components/xr/GaussianSplatViewer.tsx` | 55, 129, 198, 210 | Component name + internal UI status messages |
| `components/xr/SplatConfigurator.tsx` | 204 | Section comment for viewer component |
| `components/xr/hooks/splatProcessing.ts` | 1, 109 | Pipeline comments + CLI command for nerfstudio |
| `components/xr/hooks/useSplatProcessing.ts` | 15 | Hook orchestration comment |
| `lib/3d/bridge/adapters/SplatEngineAdapter.ts` | 2, 137 | Engine adapter comments |
| `lib/3d/engine.ts` | 27, 56 | Capability detection + library reference |
| `types/gaussian-splats-3d.d.ts` | 1 | Type definitions for `@mkkellogg/gaussian-splats-3d` |
| `app/xr-world/vizsplat/page.tsx` | 27, 76, 284, 287, 328, 371, 398, 431 | Technical explainer copy (describes the underlying technology) |
| `app/xr-world/vizsplat/editor/page.tsx` | 57, 58 | Editor UI: "Gaussian Splat Editor" (could be "VizSplat Editor") |
| `app/xr-world/splat-showcase/page.tsx` | 58-70, 116, 185, 221, 222, 251 | Showcase technical labels |
| `app/under-admin/.../editor-dashboard/page.tsx` | 42 | Admin dashboard: `{ title: 'Gaussian Splat', ... }` |
| `app/under-admin/.../gaussian-splat/page.tsx` | 13 | Admin dashboard slug variable |
| `components/xr/deployment.manifest.json` | 5, 31 | Internal deployment metadata |
| `data/pages.ts` | 13 | Internal service page data |
| `src/splat-editor/*.ts` | Multiple | Build tool source files |
| `public/splat-editor/*` | Multiple | Bundled JS assets |

---

## Product Family Alignment

The codebase already follows the VizTR Studio product naming pattern from the recommendation:

| Product | Status in Codebase | Location |
|---------|-------------------|----------|
| **VizSplat** — Reality Capture | ✅ Implemented | Primary product name |
| VizRender — Still Rendering | ⚠️ Partial | `data/homepage.ts:29` card exists |
| VizMotion — Animation | ⚠️ Partial | `data/homepage.ts` references "Animation" workflow |
| VizTour — Virtual Tour | ✅ Implemented | `/xr-world/virtual-tour` |
| VizAR — WebAR | ✅ Implemented | `/xr-world/webar` |
| VizVR — Virtual Reality | ✅ Implemented | `/xr-world/virtual-reality` |
| VizPlan — 2D CAD → Presentation Plan | ⚠️ Partial | Referenced in docs but no dedicated route |
| Pixel Streaming — Flagship | ✅ Implemented | `/xr-world/pixel-streaming` |

**No changes needed to route structure.** The naming convention is already correct.

---

## Summary

The codebase has **already adopted "VizSplat"** as the product name. The remaining "Gaussian Splat" references are:

1. **Technical layer** — Component names, library references, CLI commands (correct to keep as-is)
2. **Explainer copy** — Page text describing the technology (appropriate in technical sections)
3. **User-facing labels** — A handful of items that should be updated to "VizSplat" (see Recommendations table above)

**No route restructuring needed.** The product identity is correctly named VizSplat.
