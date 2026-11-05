# VizTR Repository Dependency Audit

Generated: 2026-09-18T20:52:43Z
Repo root: C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev

This report classifies each candidate directory using static evidence from imports, build configuration, and package dependency manifests. It does not delete or move anything.

Target directories are resolved from the repo root first, then from `forks/<name>` when the root-level directory is absent.

## Detected main app root(s)

- `.`
- `app`
- `app/app`

## Per-directory classification

| Directory | Exists | package.json name | Live imports | Build references | Workspace dependencies | Verdict |
|---|---|---|---:|---:|---:|---|
| `forks/editor` | YES | `@viztr/editor` | 0 files | 1 files | 0 files | BUILD REFERENCE |
| `forks/editor-src` | YES | `@playcanvas/editor` | 0 files | 0 files | 0 files | UNREFERENCED |
| `forks/supersplat` | YES | `@viztr/splat-editor` | 0 files | 1 files | 0 files | BUILD REFERENCE |
| `forks/supersplat-viewer` | YES | `@viztr/splat-viewer` | 0 files | 0 files | 0 files | UNREFERENCED |
| `forks/engine` | YES | `playcanvas, @viztr/engine` | 23 files | 1 files | 2 files | LIVE IMPORT |
| `forks/observer` | YES | `@viztr/observer` | 0 files | 0 files | 0 files | UNREFERENCED |
| `forks/pcui` | YES | `@playcanvas/pcui` | 0 files | 0 files | 1 files | WORKSPACE DEP |
| `forks/pcui-graph` | YES | `@playcanvas/pcui-graph` | 0 files | 0 files | 0 files | UNREFERENCED |
| `forks/developer-site` | YES | `developer.playcanvas.com` | 0 files | 0 files | 0 files | UNREFERENCED |

## Evidence

### `forks/editor`

#### Live imports

- None found.

#### Build references

- `package.json` — package.json scripts/workspaces

#### Workspace dependencies

- None found.

### `forks/editor-src`

#### Live imports

- None found.

#### Build references

- None found.

#### Workspace dependencies

- None found.

### `forks/supersplat`

#### Live imports

- None found.

#### Build references

- `package.json` — package.json scripts/workspaces

#### Workspace dependencies

- None found.

### `forks/supersplat-viewer`

#### Live imports

- None found.

#### Build references

- None found.

#### Workspace dependencies

- None found.

### `forks/engine`

#### Live imports

- `src/splat-editor/asset-loader.ts` (lines 1)
- `src/splat-editor/box-shape.ts` (lines 1)
- `src/splat-editor/camera.ts` (lines 29)
- `src/splat-editor/color-grade.ts` (lines 1)
- `src/splat-editor/controllers.ts` (lines 1)
- `src/splat-editor/data-processor.ts` (lines 1)
- `src/splat-editor/edit-ops.ts` (lines 1)
- `src/splat-editor/element.ts` (lines 1)
- `src/splat-editor/gaussian-instances.ts` (lines 6)
- `src/splat-editor/main.ts` (lines 2)
- `src/splat-editor/pc-app.ts` (lines 16)
- `src/splat-editor/picker.ts` (lines 11)
- `src/splat-editor/pivot.ts` (lines 1)
- `src/splat-editor/scene.ts` (lines 14)
- `src/splat-editor/serializer.ts` (lines 1)
- `src/splat-editor/sphere-shape.ts` (lines 1)
- `src/splat-editor/splat.ts` (lines 1)
- `src/splat-editor/transform.ts` (lines 1)
- `src/splat-editor/utils/simple-render-pass.ts` (lines 1)
- `src/splat-editor/ui/view-cube.ts` (lines 1)
- `lib/3d/xr/webxr-hands.ts` (lines 6)
- `components/xr/hooks/usePlayCameraEngine.ts` (lines 52, 257, 284)
- `components/3d/xr/XRHandVisualizer.tsx` (lines 5)

#### Build references

- `package.json` — package.json scripts/workspaces

#### Workspace dependencies

- `package.json` — dependencies.playcanvas = ^2.21.4
- `apps/xr-world/package.json` — dependencies.playcanvas = ^2.21.4

### `forks/observer`

#### Live imports

- None found.

#### Build references

- None found.

#### Workspace dependencies

- None found.

### `forks/pcui`

#### Live imports

- None found.

#### Build references

- None found.

#### Workspace dependencies

- `package.json` — dependencies.@playcanvas/pcui = ^6.1.4

### `forks/pcui-graph`

#### Live imports

- None found.

#### Build references

- None found.

#### Workspace dependencies

- None found.

### `forks/developer-site`

#### Live imports

- None found.

#### Build references

- None found.

#### Workspace dependencies

- None found.

## How to read this

- **LIVE IMPORT**: source code outside the target directory imports it by a relative path or by a package name discovered from its manifest.
- **WORKSPACE DEP**: a package manifest outside the target directory lists the target package or folder as a dependency.
- **BUILD REFERENCE**: the target appears in Next.js, Vercel, Turbo, pnpm workspace, Docker Compose, nginx, or package script/workspace configuration.
- **UNREFERENCED**: no matching static evidence was found. The directory may still be a standalone deployment or an intentionally vendored fork.
- Evidence searches exclude `node_modules`, `.git`, `.kilo`, generated build/output directories, and the target directories themselves.

## Suggested follow-up

For directories marked `UNREFERENCED`, verify external deployment configuration, DNS/subdomain routing, and Vercel project ownership before considering any removal.