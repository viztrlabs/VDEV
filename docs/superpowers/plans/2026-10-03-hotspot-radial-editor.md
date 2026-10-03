# Hotspot Radial Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reference-style radial action menu (Enter / Rotate / Delete / Edit), numbered marker badges, and a marker-anchored settings popover to hotspot markers in the tour builder, replacing the InspectorPanel's hotspot section.

**Architecture:** Extract the hotspot field primitives from `InspectorPanel.tsx` into a shared `inspector-fields.tsx`, build `HotspotSettingsForm` on top of them, and mount three new viewport overlays (`HotspotRadialMenu`, `HotspotSettingsPopover`, rotate-drag mode) inside `PanoramaViewport` anchored to each marker's projected screen position. A new optional `rotation?: number` (deg) field on `TourHotspot` drives marker icon rotation in both builder and public viewer.

**Tech Stack:** Next.js / React 18, zustand store (`lib/tourClientStore.ts`), Jest + jsdom + @testing-library/react, Tailwind literal classes, lucide-react icons. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-03-hotspot-radial-editor-design.md` (commit `6820c69` + factual amendments)

## Global Constraints

- Jest baseline: exactly **15 failing tests / 11 failing suites** are pre-existing (incl. `__tests__/tour-builder/validation.test.tsx`, `.kilo/worktrees/*`, playwright e2e). NEVER fix unrelated failures; judge your work by scoped test runs, and the final full run must still show 15 failed / 11 failed suites (+ passing tests you added).
- tsc baseline: ~539 pre-existing errors repo-wide. Use scoped filter `pnpm exec tsc --noEmit 2>$null | Select-String -Pattern "<touched paths>"`. Capture the baseline BEFORE changing anything (Task 1, Step 1) and diff against it; a clean scoped run (no output) is the goal.
- NEVER run `pnpm run build`. Use `powershell -ExecutionPolicy Bypass -File scripts/safe-build.ps1` only if a production build is required (it is not for this plan).
- Git: explicit `git add <exact files>` only, NEVER `git add -A` (tree carries other work streams). `docs/superpowers/**` and `.superpowers/**` are gitignored — use `git add -f` for them. Never amend commits.
- Units: `TourHotspot.yaw/pitch` are **radians**; UI inputs display **degrees**; `rotation` is **degrees 0–360** (normalize with `((d % 360) + 360) % 360`).
- Theme: literal Tailwind classes only — `bg-[#09090B]`, `bg-[#18181B]`, `border-[#27272A]`, `#3ECF8E`, `font-mono`, `text-[10px]`/`text-[9px]`.
- Scope: `components/tour-builder/*`, one line in `components/tour-viewer/hotspotRenderers.ts`, and `lib` schema/export files. NEVER touch `components/editor`, `components/viewers`, or `components/xr`.
- No new npm dependencies. No new code comments (repo code style).
- Working directory for all commands: repo root `C:\Users\Arch_Viz\Desktop\VizTR\Dev\vdev`.

## File Structure

Create:
- `components/tour-builder/inspector-fields.tsx` — shared primitives: `Section`, `Field`, `TextInput`, `NumberInput`, `Toggle`, `SelectInput`, `uploadAsset`, `ImageInput`, `ModelInput`, `HOTSPOT_TYPES`, `TypeSpecificFields`
- `components/tour-builder/HotspotSettingsForm.tsx` — the hotspot settings sections (Type / type-specific / Content / Position / Appearance+Rotation / Direction)
- `components/tour-builder/HotspotRadialMenu.tsx` — 4-button left-arc radial menu overlay
- `components/tour-builder/HotspotSettingsPopover.tsx` — 320px anchored settings card wrapping the form
- `components/tour-builder/__tests__/HotspotSettingsForm.test.tsx`
- `components/tour-builder/__tests__/HotspotRadialMenu.test.tsx`
- `components/tour-builder/__tests__/HotspotSettingsPopover.test.tsx`
- `components/tour-builder/__tests__/PanoramaViewport-marker.test.tsx` — badge, rotation, radial/popover integration, rotate drag (built across Tasks 5, 8, 9)

Modify:
- `lib/tourClientStore.ts` — `rotation?: number` on `TourHotspot`
- `lib/marzipano/conversion.ts` — `EditorHotspot.rotation?` + `rotation: h.rotation ?? 0`
- `components/tour-builder/InspectorPanel.tsx` — import shared primitives; remove hotspot branch + `hotspotId` prop (Task 4)
- `components/tour-builder/PanoramaViewport.tsx` — badge, icon rotation, radial + popover overlays, rotate mode, `onNavigateToRoom` prop
- `components/tour-builder/TourBuilderShell.tsx` — pass `onNavigateToRoom`, drop `hotspotId` prop from InspectorPanel
- `components/tour-viewer/hotspotRenderers.ts` — apply rotation to the viewer dot
- `lib/__tests__/tour-schema-compat.test.ts`, `lib/marzipano/__tests__/exporter.test.ts`, `components/tour-viewer/__tests__/hotspotRenderers.test.tsx` — new assertions

Delete (migrated in Task 3):
- `__tests__/tour-builder/inspector-position.test.tsx`

---

### Task 1: `rotation` field — schema + legacy marzipano export

**Files:**
- Modify: `lib/tourClientStore.ts:55-66` (TourHotspot Appearance/Direction block)
- Modify: `lib/marzipano/conversion.ts` (`EditorHotspot` interface + line 235 `linkHotspots.push`)
- Test: `lib/__tests__/tour-schema-compat.test.ts` (append to `toManifestHotspot` describe), `lib/marzipano/__tests__/exporter.test.ts` (fixture + assertion)

**Interfaces:**
- Produces: `TourHotspot.rotation?: number` (degrees 0–360, optional) — consumed by every later task; `EditorHotspot.rotation?: number` + export writes `rotation: h.rotation ?? 0` to marzipano `linkHotspots`.

- [ ] **Step 0: Capture scoped tsc baseline**

Run:
```powershell
pnpm exec tsc --noEmit 2>$null | Select-String -Pattern "tour-builder|tourClientStore|hotspotRenderers|marzipano|tour-schema|InspectorPanel|PanoramaViewport|TourBuilderShell" | ForEach-Object { $_.Line } | Out-File -Encoding utf8 C:\Users\Arch_Viz\AppData\Local\Temp\opencode\tsc-scoped-baseline-hotspot.txt
Get-Content C:\Users\Arch_Viz\AppData\Local\Temp\opencode\tsc-scoped-baseline-hotspot.txt
```
Expected: a baseline file exists (content may be empty or contain pre-existing hits). Every later task's scoped tsc must match this output exactly (or be empty if it was empty).

- [ ] **Step 1: Write the failing tests**

Append to `lib/__tests__/tour-schema-compat.test.ts` inside the existing `describe('toManifestHotspot')` block (after line 123's test):

```ts
  it('passes rotation through to the manifest', () => {
    const out = toManifestHotspot(hs({ rotation: 45 })) as any;
    expect(out.rotation).toBe(45);
  });

  it('leaves rotation undefined when the hotspot has none', () => {
    const out = toManifestHotspot(hs({})) as any;
    expect(out.rotation).toBeUndefined();
  });
```

In `lib/marzipano/__tests__/exporter.test.ts`, add `rotation: 45` to the `hp-a-link` fixture (inside the `defaultHotspots` array of room `roomA`):

```ts
        rotation: 45,
```

and append this test to the existing `describe` (after the `round-trips scene IDs` test):

```ts
  it('exports hotspot rotation to marzipano linkHotspots', async () => {
    const blob = await exportTourToZip(fixture);
    const zip = await JSZip.loadAsync(blob);
    const text = await zip.file('app-data.json')!.async('string');
    const parsed = JSON.parse(text);
    const sceneA = parsed.scenes.find((s: any) => s.id === 'roomA');
    expect(sceneA.linkHotspots[0].rotation).toBe(45);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest tour-schema-compat exporter`
Expected: FAIL — `Property 'rotation' does not exist on type 'TourHotspot'` (or `expect(received).toBe(45)` with `undefined`), exporter test FAIL with `rotation` missing/`undefined`.

- [ ] **Step 3: Implement**

In `lib/tourClientStore.ts`, in the `TourHotspot` interface, after the `animation?:` line (line ~61) and before `// Direction`:

```ts
  rotation?: number;
```

In `lib/marzipano/conversion.ts`, in `interface EditorHotspot`, after `icon?: string;`:

```ts
  rotation?: number;
```

In `lib/marzipano/conversion.ts`, replace line 235:

```ts
      linkHotspots.push({ yaw, pitch, rotation: h.rotation ?? 0, target: h.targetRoomId });
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec jest tour-schema-compat exporter`
Expected: PASS (all tests in both files).

- [ ] **Step 5: Scoped tsc**

Run: `pnpm exec tsc --noEmit 2>$null | Select-String -Pattern "tour-builder|tourClientStore|hotspotRenderers|marzipano|tour-schema|InspectorPanel|PanoramaViewport|TourBuilderShell" | ForEach-Object { $_.Line }`
Expected: identical to the Step 0 baseline file (no new hits).

- [ ] **Step 6: Commit**

```powershell
git add lib/tourClientStore.ts lib/marzipano/conversion.ts lib/__tests__/tour-schema-compat.test.ts lib/marzipano/__tests__/exporter.test.ts
git commit -m "feat(tour): add hotspot rotation field (deg) to schema + marzipano export"
```

---

### Task 2: Extract shared field primitives into `inspector-fields.tsx`

**Files:**
- Create: `components/tour-builder/inspector-fields.tsx`
- Modify: `components/tour-builder/InspectorPanel.tsx` (remove moved definitions, import from `./inspector-fields`)
- Test: no new file — existing suites are the safety net

**Interfaces:**
- Consumes: nothing new.
- Produces (all exported from `components/tour-builder/inspector-fields.tsx`, exact names used by Tasks 3–4):
  - `Section({ title, icon, defaultOpen?, children })`, `Field({ label, children })`
  - `TextInput({ value, onChange, placeholder?, type? })`, `NumberInput({ value, onChange, min?, max?, step?, unit? })`
  - `Toggle({ label, value, onChange })`, `SelectInput({ value, onChange, options })`
  - `HOTSPOT_TYPES: { type: HotspotType; label: string; icon: ComponentType<any>; description: string }[]`
  - `TypeSpecificFields({ hotspot, scenes, roomId, onUpdate })`
  - `ImageInput({ onUpdate })`, `ModelInput({ onUpdate })`, `uploadAsset(file)`

- [ ] **Step 1: Create `components/tour-builder/inspector-fields.tsx`**

Move these definitions verbatim out of `InspectorPanel.tsx` into the new file (adjusting imports): `uploadAsset` (lines 35–44), `ImageInput` (46–80), `ModelInput` (82–116), `HOTSPOT_TYPES` (118–131), `Section` (138–163), `Field` (165–178), `TextInput` (180–200), `NumberInput` (202–231), `Toggle` (233–259), `SelectInput` (261–281), `TypeSpecificFields` (283–599).

New file header + exports:

```tsx
'use client';

import React, { useState, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Image,
  Video,
  Music,
  Globe,
  Layers,
  Trash2,
  Navigation,
  Info,
  Images,
  ExternalLink,
  Box,
  Eye,
  Star,
} from 'lucide-react';
import type { TourScene, TourHotspot, HotspotType } from '@/lib/tourClientStore';

async function uploadAsset(file: File): Promise<{ url: string; tileUrl?: string | null }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/tour/upload', { method: 'POST', body: form });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Upload failed');
  }
  return res.json();
}

export function ImageInput({ onUpdate }: { onUpdate: (patch: Partial<TourHotspot>) => void }) {
  /* verbatim body from InspectorPanel.tsx:46-80 */
}

export function ModelInput({ onUpdate }: { onUpdate: (patch: Partial<TourHotspot>) => void }) {
  /* verbatim body from InspectorPanel.tsx:82-116 */
}

export const HOTSPOT_TYPES: { type: HotspotType; label: string; icon: React.ComponentType<any>; description: string }[] = [
  /* verbatim entries from InspectorPanel.tsx:118-131 */
];

export function Section({ title, icon: Icon, defaultOpen = true, children }: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  /* verbatim body from InspectorPanel.tsx:138-163 */
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  /* verbatim body from InspectorPanel.tsx:165-178 */
}

export function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  /* verbatim body from InspectorPanel.tsx:180-200 */
}

export function NumberInput({ value, onChange, min, max, step = 1, unit }: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  /* verbatim body from InspectorPanel.tsx:202-231 */
}

export function Toggle({ label, value, onChange }: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  /* verbatim body from InspectorPanel.tsx:233-259 */
}

export function SelectInput({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  /* verbatim body from InspectorPanel.tsx:261-281 */
}

export function TypeSpecificFields({ hotspot, scenes, roomId, onUpdate }: {
  hotspot: TourHotspot;
  scenes: TourScene[];
  roomId: string;
  onUpdate: (patch: Partial<TourHotspot>) => void;
}) {
  /* verbatim body from InspectorPanel.tsx:283-599 (the full switch) */
}
```

IMPORTANT: the bodies must be copied verbatim from `InspectorPanel.tsx` — do not rewrite logic, styles, or strings. The comment markers above show exactly which line ranges to copy.

- [ ] **Step 2: Rewire `InspectorPanel.tsx`**

- Delete the moved definitions (same line ranges listed above) from `InspectorPanel.tsx`.
- Add import after the existing `./IconPicker` import:

```ts
import {
  Section,
  Field,
  TextInput,
  NumberInput,
  SelectInput,
  HOTSPOT_TYPES,
  TypeSpecificFields,
} from './inspector-fields';
```

- Remove imports that are no longer referenced anywhere in the file (e.g. `ChevronDown`, `ChevronRight`, `Video`, `Music`, `Globe`, `Box`, `Star`, `ExternalLink`, `Images`, `Navigation`, `Info` — keep an icon if it is still used in the room/tour sections: `Image`, `Layers`, `Eye`, `MapPin`, `Trash2`, `Copy`, `RotateCcw`, `ZoomIn`, `FileText`, `Move`, `Sliders`, `Compass`, `Settings` are still referenced by the remaining hotspot branch/room sections).
- `Section`/`Field`/`TextInput`/`NumberInput` keep `function`-local style elsewhere? No — they are now imported; ensure no duplicate local definitions remain.

- [ ] **Step 3: Run existing tests to verify the refactor**

Run: `pnpm exec jest __tests__/tour-builder/inspector-position.test.tsx components/tour-builder/__tests__`
Expected: PASS — `inspector-position` (3 tests), `PanoramaViewport-baseline` (2), `Toolbar` all green. (validation.test.tsx in `__tests__/tour-builder` is the pre-existing failing suite — it must show the SAME failure as before, not new errors.)

- [ ] **Step 4: Scoped tsc**

Run: `pnpm exec tsc --noEmit 2>$null | Select-String -Pattern "tour-builder|tourClientStore|hotspotRenderers|marzipano|tour-schema|InspectorPanel|PanoramaViewport|TourBuilderShell" | ForEach-Object { $_.Line }`
Expected: identical to baseline file (no new hits — a missing-import or duplicate-declaration error would appear here).

- [ ] **Step 5: Commit**

```powershell
git add components/tour-builder/inspector-fields.tsx components/tour-builder/InspectorPanel.tsx
git commit -m "refactor(tour-builder): extract shared inspector field primitives"
```

---

### Task 3: `HotspotSettingsForm` + migrate position tests

**Files:**
- Create: `components/tour-builder/HotspotSettingsForm.tsx`
- Create: `components/tour-builder/__tests__/HotspotSettingsForm.test.tsx`
- Delete: `__tests__/tour-builder/inspector-position.test.tsx`

**Interfaces:**
- Consumes: `Section, Field, TextInput, NumberInput, SelectInput, HOTSPOT_TYPES, TypeSpecificFields` from `./inspector-fields` (Task 2); `useTourStore`, `IconPicker`.
- Produces: `HotspotSettingsForm({ roomId, hotspot, onUpdate }: { roomId: string; hotspot: TourHotspot; onUpdate: (patch: Partial<TourHotspot>) => void })` — consumed by `HotspotSettingsPopover` (Task 7).

- [ ] **Step 1: Write the failing test**

Create `components/tour-builder/__tests__/HotspotSettingsForm.test.tsx`:

```tsx
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { HotspotSettingsForm } from '@/components/tour-builder/HotspotSettingsForm';
import { useTourStore } from '@/lib/tourClientStore';
import type { TourScene } from '@/lib/tourClientStore';

const makeScene = (): TourScene => ({
  id: 'r1', name: 'Lobby', type: '360', url: 'https://x/pano.jpg', thumbnailUrl: '',
  initialYaw: 10, initialPitch: 5, initialFov: 75,
  hotspots: [{ id: 'h1', yaw: Math.PI / 4, pitch: 0, type: 'info', title: 'Sign', description: '' }],
  viewConstraints: {
    top: -90, bottom: 90, left: -180, right: 180,
    zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false,
  },
  autorotateEnabled: false, autorotateSpeed: 1,
});

const renderForm = () => {
  useTourStore.setState({ scenes: [makeScene()] } as any);
  const hs = useTourStore.getState().scenes[0].hotspots[0];
  render(
    <HotspotSettingsForm
      roomId="r1"
      hotspot={hs}
      onUpdate={(patch) => useTourStore.getState().updateHotspot('r1', hs.id, patch)}
    />
  );
};

const storeHotspot = () => useTourStore.getState().scenes[0].hotspots[0];

const fieldInput = (label: string) =>
  screen.getByText(label).parentElement!.querySelector('input, textarea, select')!;

describe('HotspotSettingsForm', () => {
  it('shows the stored radian yaw as degrees', () => {
    renderForm();
    const yawInput = screen.getAllByRole('spinbutton')
      .find((el) => (el as HTMLInputElement).value === '45');
    expect(yawInput).toBeTruthy();
  });

  it('writes radians back to the store when editing in degrees', () => {
    renderForm();
    const yawInput = screen.getAllByRole('spinbutton')
      .find((el) => (el as HTMLInputElement).value === '45');
    fireEvent.change(yawInput!, { target: { value: '90' } });
    expect(storeHotspot().yaw).toBeCloseTo(Math.PI / 2, 5);
  });

  it('Reset Position sets yaw and pitch to 0', () => {
    renderForm();
    fireEvent.click(screen.getByText('Reset Position'));
    expect(storeHotspot().yaw).toBe(0);
    expect(storeHotspot().pitch).toBe(0);
  });

  it('edits rotation in degrees through the Appearance section', () => {
    renderForm();
    fireEvent.change(fieldInput('Rotation'), { target: { value: '45' } });
    expect(storeHotspot().rotation).toBe(45);
  });

  it('changes the hotspot type through the type grid', () => {
    renderForm();
    fireEvent.click(screen.getByTitle('Link to another room'));
    expect(storeHotspot().type).toBe('navigation');
  });

  it('keeps the Direction section (default collapsed)', () => {
    renderForm();
    expect(screen.getByText('Direction')).toBeInTheDocument();
    expect(screen.queryByText('Direction Yaw')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec jest components/tour-builder/__tests__/HotspotSettingsForm.test.tsx`
Expected: FAIL — cannot resolve `@/components/tour-builder/HotspotSettingsForm`.

- [ ] **Step 3: Implement `HotspotSettingsForm.tsx`**

Move the hotspot-branch sections from `InspectorPanel.tsx` (the `Section` blocks at lines 637–831: Type grid, `TypeSpecificFields`, Content, Position, Appearance, Direction) into the new component. The form subscribes to `scenes` itself (TypeSpecificFields needs the room list) and receives `onUpdate` from its parent.

```tsx
'use client';

import React, { useState } from 'react';
import { MapPin, FileText, Move, Sliders, Compass } from 'lucide-react';
import { useTourStore } from '@/lib/tourClientStore';
import type { TourHotspot } from '@/lib/tourClientStore';
import { IconPicker } from './IconPicker';
import {
  Section,
  Field,
  TextInput,
  NumberInput,
  SelectInput,
  HOTSPOT_TYPES,
  TypeSpecificFields,
} from './inspector-fields';

interface HotspotSettingsFormProps {
  roomId: string;
  hotspot: TourHotspot;
  onUpdate: (patch: Partial<TourHotspot>) => void;
}

export function HotspotSettingsForm({ roomId, hotspot, onUpdate }: HotspotSettingsFormProps) {
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const scenes = useTourStore((s) => s.scenes);

  return (
    <>
      <Section title="Type" icon={MapPin}>
        <div className="grid grid-cols-2 gap-1">
          {HOTSPOT_TYPES.map((t) => {
            const Icon = t.icon;
            const isActive = hotspot.type === t.type;
            return (
              <button
                key={t.type}
                onClick={() => onUpdate({ type: t.type })}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
                  isActive
                    ? 'bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E]'
                    : 'bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:bg-[#27272A]'
                }`}
                title={t.description}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span className="text-[10px] font-mono truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <TypeSpecificFields hotspot={hotspot} scenes={scenes} roomId={roomId} onUpdate={onUpdate} />

      <Section title="Content" icon={FileText} defaultOpen={false}>
        <Field label="Title">
          <TextInput value={hotspot.title} onChange={(v) => onUpdate({ title: v })} />
        </Field>
        <Field label="Description">
          <textarea
            value={hotspot.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white h-20 resize-none"
            placeholder="Optional description..."
          />
        </Field>
      </Section>

      <Section title="Position" icon={Move}>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Yaw">
            <NumberInput
              value={(hotspot.yaw * 180) / Math.PI}
              onChange={(v) => onUpdate({ yaw: (v * Math.PI) / 180 })}
              min={-360}
              max={360}
              step={0.1}
              unit="deg"
            />
          </Field>
          <Field label="Pitch">
            <NumberInput
              value={(hotspot.pitch * 180) / Math.PI}
              onChange={(v) => onUpdate({ pitch: (v * Math.PI) / 180 })}
              min={-90}
              max={90}
              step={0.1}
              unit="deg"
            />
          </Field>
        </div>
        <button
          onClick={() => onUpdate({ yaw: 0, pitch: 0 })}
          className="w-full px-2 py-1.5 rounded bg-[#27272A] text-[10px] font-mono text-[#A1A1AA] hover:bg-[#3F3F46] cursor-pointer"
        >
          Reset Position
        </button>
      </Section>

      <Section title="Appearance" icon={Sliders}>
        <Field label="Icon">
          <div className="flex items-center gap-2 relative">
            <div className="w-8 h-8 rounded bg-[#18181B] border border-[#27272A] flex items-center justify-center">
              {hotspot.icon ? (
                <span className="text-xs text-[#3ECF8E]">{hotspot.icon}</span>
              ) : (
                <span className="text-[10px] text-[#71717A]">None</span>
              )}
            </div>
            <button
              onClick={() => setIconPickerOpen(!iconPickerOpen)}
              className="px-2 py-1 rounded bg-[#18181B] border border-[#27272A] text-[10px] font-mono text-[#A1A1AA] hover:text-white"
            >
              Change
            </button>
            {iconPickerOpen && (
              <IconPicker
                value={hotspot.icon}
                onChange={(icon) => {
                  onUpdate({ icon });
                  setIconPickerOpen(false);
                }}
                onClose={() => setIconPickerOpen(false)}
              />
            )}
          </div>
        </Field>
        <Field label="Rotation">
          <NumberInput
            value={hotspot.rotation ?? 0}
            onChange={(v) => onUpdate({ rotation: ((v % 360) + 360) % 360 })}
            min={0}
            max={359}
            step={1}
            unit="deg"
          />
        </Field>
        <Field label="Size">
          <NumberInput
            value={hotspot.size ?? 1}
            onChange={(v) => onUpdate({ size: v })}
            min={0.5}
            max={3.0}
            step={0.1}
          />
        </Field>
        <Field label="Color">
          <TextInput
            value={hotspot.color || '#3ECF8E'}
            onChange={(v) => onUpdate({ color: v })}
            placeholder="#hex"
          />
        </Field>
        <Field label="Opacity">
          <NumberInput
            value={hotspot.opacity ?? 1}
            onChange={(v) => onUpdate({ opacity: v })}
            min={0}
            max={1}
            step={0.1}
          />
        </Field>
        <Field label="Label">
          <TextInput
            value={hotspot.label || ''}
            onChange={(v) => onUpdate({ label: v })}
            placeholder="Visible label text"
          />
        </Field>
        <Field label="Tooltip">
          <TextInput
            value={hotspot.tooltip || ''}
            onChange={(v) => onUpdate({ tooltip: v })}
            placeholder="Hover tooltip"
          />
        </Field>
        <Field label="Animation">
          <SelectInput
            value={hotspot.animation || 'none'}
            onChange={(v) => onUpdate({ animation: v as any })}
            options={[
              { value: 'none', label: 'None' },
              { value: 'pulse', label: 'Pulse' },
              { value: 'glow', label: 'Glow' },
              { value: 'bounce', label: 'Bounce' },
            ]}
          />
        </Field>
      </Section>

      <Section title="Direction" icon={Compass} defaultOpen={false}>
        <Field label="Mode">
          <SelectInput
            value={hotspot.directionMode || 'auto'}
            onChange={(v) => onUpdate({ directionMode: v as any })}
            options={[
              { value: 'auto', label: 'Auto' },
              { value: 'manual', label: 'Manual' },
              { value: 'look_at', label: 'Look At' },
              { value: 'target', label: 'Target' },
            ]}
          />
        </Field>
        {hotspot.directionMode === 'manual' && (
          <>
            <Field label="Direction Yaw">
              <NumberInput
                value={hotspot.directionYaw || 0}
                onChange={(v) => onUpdate({ directionYaw: v })}
                min={-3.14}
                max={3.14}
                step={0.01}
                unit="rad"
              />
            </Field>
            <Field label="Direction Pitch">
              <NumberInput
                value={hotspot.directionPitch || 0}
                onChange={(v) => onUpdate({ directionPitch: v })}
                min={-1.57}
                max={1.57}
                step={0.01}
                unit="rad"
              />
            </Field>
          </>
        )}
      </Section>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec jest components/tour-builder/__tests__/HotspotSettingsForm.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Migrate + delete the old position test**

```powershell
git rm __tests__/tour-builder/inspector-position.test.tsx
```

Run: `pnpm exec jest __tests__/tour-builder components/tour-builder`
Expected: same results as before minus inspector-position (which is replaced by the form suite); only the pre-existing `validation.test.tsx` failure remains.

- [ ] **Step 6: Scoped tsc + Commit**

```powershell
pnpm exec tsc --noEmit 2>$null | Select-String -Pattern "tour-builder|tourClientStore|hotspotRenderers|marzipano|tour-schema|InspectorPanel|PanoramaViewport|TourBuilderShell" | ForEach-Object { $_.Line }
```
Expected: identical to baseline.

```powershell
git add components/tour-builder/HotspotSettingsForm.tsx components/tour-builder/__tests__/HotspotSettingsForm.test.tsx
git commit -m "feat(tour-builder): HotspotSettingsForm with rotation field, migrated position tests"
```

---

### Task 4: InspectorPanel keeps only room/tour settings

**Files:**
- Modify: `components/tour-builder/InspectorPanel.tsx` (remove hotspot branch + `hotspotId` prop)
- Modify: `components/tour-builder/TourBuilderShell.tsx:298-305` (drop `hotspotId` prop)
- Test: create `__tests__/tour-builder/inspector-room-only.test.tsx`

**Interfaces:**
- Consumes: `HotspotSettingsForm` exists (Task 3) as the replacement surface.
- Produces: `InspectorPanel({ roomId }: { roomId: string })` — hotspot settings are now exclusively in the viewport popover (Task 7).

- [ ] **Step 1: Write the failing test**

Create `__tests__/tour-builder/inspector-room-only.test.tsx`:

```tsx
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { InspectorPanel } from '@/components/tour-builder/InspectorPanel';
import { useTourStore } from '@/lib/tourClientStore';
import type { TourScene } from '@/lib/tourClientStore';

const scene: TourScene = {
  id: 'r1', name: 'Lobby', type: '360', url: 'https://x/pano.jpg', thumbnailUrl: '',
  initialYaw: 10, initialPitch: 5, initialFov: 75,
  hotspots: [{ id: 'h1', yaw: 0, pitch: 0, type: 'info', title: 'Sign', description: '' }],
  viewConstraints: {
    top: -90, bottom: 90, left: -180, right: 180,
    zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false,
  },
  autorotateEnabled: false, autorotateSpeed: 1,
};

describe('InspectorPanel room-only (hotspot settings moved to viewport popover)', () => {
  beforeEach(() => {
    useTourStore.setState({ scenes: [scene] } as any);
  });

  it('renders the ROOM panel even when the store has hotspots', () => {
    render(<InspectorPanel roomId="r1" />);
    expect(screen.getByText('ROOM')).toBeInTheDocument();
    expect(screen.queryByText('HOTSPOT')).not.toBeInTheDocument();
    expect(screen.queryByText('Reset Position')).not.toBeInTheDocument();
    expect(screen.queryByText('Direction')).not.toBeInTheDocument();
  });

  it('still exposes room hotspot count in the Hotspots section', () => {
    render(<InspectorPanel roomId="r1" />);
    expect(screen.getByText('1 hotspots')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec jest __tests__/tour-builder/inspector-room-only.test.tsx`
Expected: FAIL — first assertion fails (`HOTSPOT` header still rendered when branch exists), or TS error on the removed-but-not-yet-removed prop (test itself compiles fine; assertion on `HOTSPOT` presence fails).

- [ ] **Step 3: Implement**

In `components/tour-builder/InspectorPanel.tsx`:

1. Change the props interface and signature:
```ts
interface InspectorPanelProps {
  roomId: string;
}
```
```tsx
export function InspectorPanel({ roomId }: InspectorPanelProps) {
```
2. Remove `const [iconPickerOpen, setIconPickerOpen] = useState(false);`, `const updateHotspot = useTourStore((s) => s.updateHotspot);`, `const hotspot = room?.hotspots?.find(...)`, and the entire `if (hotspot && room) { ... }` branch (the block that renders the `HOTSPOT` header and all six Sections — those now live in `HotspotSettingsForm`).
3. Remove now-unused imports: `IconPicker`, `updateHotspot`, `SelectInput`, and any icon only used by the removed branch (`FileText`, `Move`, `Sliders`, `Compass`, plus `HOTSPOT_TYPES`/`TypeSpecificFields` imports from Task 2). Keep everything the room/tour sections use (`MapPin`, `Image`, `Layers`, `Eye`, `Trash2`, `Copy`, `RotateCcw`, `ZoomIn`, `Settings`, `Section`, `Field`, `TextInput`, `NumberInput`, `getViewportView`).
4. The `if (room) { ... }` room branch and the tour-settings fallback stay unchanged.

In `components/tour-builder/TourBuilderShell.tsx` (lines 300–303), remove the prop:

```tsx
                    <InspectorPanel
                      roomId={selectedRoomId}
                    />
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec jest __tests__/tour-builder/inspector-room-only.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Full scoped verification**

Run: `pnpm exec jest __tests__/tour-builder components/tour-builder`
Expected: only the pre-existing `validation.test.tsx` suite fails (same as baseline).

Run: `pnpm exec tsc --noEmit 2>$null | Select-String -Pattern "tour-builder|tourClientStore|hotspotRenderers|marzipano|tour-schema|InspectorPanel|PanoramaViewport|TourBuilderShell" | ForEach-Object { $_.Line }`
Expected: identical to baseline (no `Property 'hotspotId' does not exist` error — that would mean the shell edit was missed).

- [ ] **Step 6: Commit**

```powershell
git add components/tour-builder/InspectorPanel.tsx components/tour-builder/TourBuilderShell.tsx __tests__/tour-builder/inspector-room-only.test.tsx
git commit -m "feat(tour-builder): InspectorPanel becomes room-only; hotspot settings move to viewport form"
```

---

### Task 5: Numbered badge + icon rotation on builder markers

**Files:**
- Modify: `components/tour-builder/PanoramaViewport.tsx:255-309` (marker map)
- Test: create `components/tour-builder/__tests__/PanoramaViewport-marker.test.tsx`

**Interfaces:**
- Consumes: `TourHotspot.rotation` (Task 1).
- Produces: badge + rotation rendering in the marker; the test file + marzipano mock harness reused by Tasks 8–9.

- [ ] **Step 1: Write the failing test**

Create `components/tour-builder/__tests__/PanoramaViewport-marker.test.tsx`:

```tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PanoramaViewport } from '@/components/tour-builder/PanoramaViewport';
import { useTourStore } from '@/lib/tourClientStore';

jest.mock('marzipano', () => {
  const makeScene = () => ({
    switchTo: jest.fn(),
    lookTo: jest.fn(),
    stopMovement: jest.fn(),
    view: jest.fn(() => ({
      yaw: jest.fn((v?: number) => (v == null ? 0 : v)),
      pitch: jest.fn((v?: number) => (v == null ? 0 : v)),
      fov: jest.fn((v?: number) => (v == null ? Math.PI / 2 : v)),
      setYaw: jest.fn(),
      setPitch: jest.fn(),
      setFov: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      screenToCoordinates: jest.fn(() => ({ yaw: 0.5, pitch: 0.1 })),
      coordinatesToScreen: jest.fn(() => ({ x: 10, y: 10 })),
    })),
    hotspotContainer: jest.fn(() => ({
      createHotspot: jest.fn(() => ({ destroy: jest.fn() })),
      destroyHotspot: jest.fn(),
      listHotspots: jest.fn(() => []),
      domElement: jest.fn(() => document.createElement('div')),
    })),
  });
  const viewers: any[] = [];
  class Viewer {
    __currentScene: any = null;
    constructor(el: HTMLElement) {
      el.appendChild(document.createElement('canvas'));
      viewers.push(this);
    }
    createScene = jest.fn(() => {
      const s = makeScene();
      this.__currentScene = s;
      return s;
    });
    scene = jest.fn(() => this.__currentScene);
    destroy = jest.fn();
    stopMovement = jest.fn();
    addEventListener = jest.fn();
    removeEventListener = jest.fn();
    setIdleMovement = jest.fn();
    startMovement = jest.fn();
    lookTo = jest.fn();
    controls = jest.fn(() => ({ registerMethod: jest.fn(), enableMethod: jest.fn(), disableMethod: jest.fn() }));
  }
  return {
    __viewers: viewers,
    Viewer,
    RectilinearView: class {
      static limit: { traditional: (w: number, f?: number, g?: number) => unknown } =
        { traditional: jest.fn(() => ({})) as any };
    },
    EquirectGeometry: class {},
    ImageUrlSource: { fromString: jest.fn(() => ({})) },
  };
});

const mockedMarzipano: any = jest.requireMock('marzipano');

const room = {
  id: 'r1', name: 'Lobby', url: 'https://x/pano.jpg',
  initialYaw: 0, initialPitch: 0, initialFov: 75,
  hotspots: [
    { id: 'h1', yaw: 0, pitch: 0, type: 'info', title: 'Sign', description: '', rotation: 30 },
    { id: 'h2', yaw: 0, pitch: 0, type: 'navigation', title: 'Door', description: '', targetSceneId: 'r2' },
  ],
};

describe('PanoramaViewport marker badge + rotation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedMarzipano.__viewers.length = 0;
    useTourStore.setState({ scenes: [JSON.parse(JSON.stringify(room))] } as any);
  });

  it('shows zero-padded per-room indices next to each marker', async () => {
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await waitFor(() => expect(mockedMarzipano.__viewers.length).toBeGreaterThan(0));
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
  });

  it('applies rotation to the marker icon circle', async () => {
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await waitFor(() => expect(mockedMarzipano.__viewers.length).toBeGreaterThan(0));
    const badge = screen.getByText('01');
    const circle = badge.previousElementSibling as HTMLElement;
    expect(circle.style.transform).toBe('rotate(30deg)');
  });

  it('uses rotate(0deg) when rotation is absent', async () => {
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await waitFor(() => expect(mockedMarzipano.__viewers.length).toBeGreaterThan(0));
    const badge = screen.getByText('02');
    const circle = badge.previousElementSibling as HTMLElement;
    expect(circle.style.transform).toBe('rotate(0deg)');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec jest components/tour-builder/__tests__/PanoramaViewport-marker.test.tsx`
Expected: FAIL — `Unable to find an element with the text: 01`.

- [ ] **Step 3: Implement in `PanoramaViewport.tsx`**

Change the marker map to ` {(room?.hotspots || []).map((hs, idx) => {` and replace the marker's inner circle + add the badge. The full replacement for lines 261–309 (the returned `<div>` of the map):

```tsx
        return (
          <div
            key={hs.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
              isSelected ? 'scale-125 z-10' : 'hover:scale-110'
            }`}
            style={{ left: p.x, top: p.y }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectHotspot(hs.id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              showContextMenu(e.clientX, e.clientY, [
                { label: 'Edit', icon: Eye, onClick: () => onSelectHotspot(hs.id) },
                { label: 'divider', divider: true },
                {
                  label: 'Delete',
                  icon: () => null,
                  danger: true,
                  onClick: () => {
                    if (!room) return;
                    updateScene(room.id, {
                      hotspots: room.hotspots.filter((h) => h.id !== hs.id),
                    });
                    onSelectHotspot('');
                  },
                },
              ]);
            }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                isSelected
                  ? 'bg-[#3ECF8E] text-black'
                  : hs.type === 'link' || hs.type === 'navigation'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/90 text-[#09090B]'
              }`}
              style={{ transform: `rotate(${hs.rotation ?? 0}deg)` }}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-1 px-1.5 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[9px] font-mono text-white whitespace-nowrap">
              {String(idx + 1).padStart(2, '0')}
            </span>
            {isSelected && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-0.5 rounded bg-[#09090B] text-[9px] font-mono text-white whitespace-nowrap">
                {hs.title || hs.type}
              </div>
            )}
          </div>
        );
```

(Only the map signature line and this JSX change; everything else in the file stays.)

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec jest components/tour-builder/__tests__/PanoramaViewport-marker.test.tsx components/tour-builder/__tests__/PanoramaViewport-baseline.test.tsx`
Expected: PASS (3 new + 2 baseline).

- [ ] **Step 5: Scoped tsc + Commit**

```powershell
pnpm exec tsc --noEmit 2>$null | Select-String -Pattern "tour-builder|tourClientStore|hotspotRenderers|marzipano|tour-schema|InspectorPanel|PanoramaViewport|TourBuilderShell" | ForEach-Object { $_.Line }
git add components/tour-builder/PanoramaViewport.tsx components/tour-builder/__tests__/PanoramaViewport-marker.test.tsx
git commit -m "feat(tour-builder): numbered hotspot badges + rotation on builder markers"
```
Expected tsc: identical to baseline.

---

### Task 6: `HotspotRadialMenu` component

**Files:**
- Create: `components/tour-builder/HotspotRadialMenu.tsx`
- Test: `components/tour-builder/__tests__/HotspotRadialMenu.test.tsx`

**Interfaces:**
- Consumes: `TourHotspot` (for `targetSceneId` disabled state).
- Produces: `HotspotRadialMenu({ x, y, hotspot, onEnter, onRotate, onDelete, onEdit, onClose })` where all handlers are `() => void` except positions are viewport-pixel coordinates — consumed by `PanoramaViewport` (Task 8).

- [ ] **Step 1: Write the failing test**

Create `components/tour-builder/__tests__/HotspotRadialMenu.test.tsx`:

```tsx
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { HotspotRadialMenu } from '@/components/tour-builder/HotspotRadialMenu';
import type { TourHotspot } from '@/lib/tourClientStore';

const hotspot = (over: Partial<TourHotspot> = {}): TourHotspot => ({
  id: 'h1', yaw: 0, pitch: 0, type: 'navigation', title: 'Door', description: '', ...over,
});

const setup = (over: Partial<TourHotspot> = {}, props: Partial<Parameters<typeof HotspotRadialMenu>[0]> = {}) => {
  const handlers = {
    onEnter: jest.fn(),
    onRotate: jest.fn(),
    onDelete: jest.fn(),
    onEdit: jest.fn(),
    onClose: jest.fn(),
  };
  render(
    <HotspotRadialMenu x={100} y={100} hotspot={hotspot(over)} {...handlers} {...props} />
  );
  return handlers;
};

describe('HotspotRadialMenu', () => {
  it('renders all four action buttons', () => {
    setup();
    expect(screen.getByLabelText('Enter target room')).toBeInTheDocument();
    expect(screen.getByLabelText('Rotate hotspot')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete hotspot')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit hotspot')).toBeInTheDocument();
  });

  it('disables Enter when the hotspot has no target room', () => {
    setup();
    expect(screen.getByLabelText('Enter target room')).toBeDisabled();
  });

  it('enables Enter when targetSceneId is set and fires onEnter', () => {
    const h = setup({ targetSceneId: 'r2' });
    const btn = screen.getByLabelText('Enter target room');
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(h.onEnter).toHaveBeenCalledTimes(1);
  });

  it('fires the other actions', () => {
    const h = setup();
    fireEvent.click(screen.getByLabelText('Rotate hotspot'));
    fireEvent.click(screen.getByLabelText('Delete hotspot'));
    fireEvent.click(screen.getByLabelText('Edit hotspot'));
    expect(h.onRotate).toHaveBeenCalledTimes(1);
    expect(h.onDelete).toHaveBeenCalledTimes(1);
    expect(h.onEdit).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape and on backdrop click', () => {
    const h = setup();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(h.onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId('hotspot-radial-backdrop'));
    expect(h.onClose).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec jest components/tour-builder/__tests__/HotspotRadialMenu.test.tsx`
Expected: FAIL — cannot resolve `@/components/tour-builder/HotspotRadialMenu`.

- [ ] **Step 3: Implement `HotspotRadialMenu.tsx`**

```tsx
'use client';

import React, { useEffect } from 'react';
import { DoorOpen, RotateCw, Trash2, Pencil } from 'lucide-react';
import type { TourHotspot } from '@/lib/tourClientStore';

const BTN =
  'absolute w-7 h-7 rounded-full bg-[#18181B]/95 border border-[#27272A] text-white flex items-center justify-center shadow-lg hover:bg-[#27272A] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

interface HotspotRadialMenuProps {
  x: number;
  y: number;
  hotspot: TourHotspot;
  onEnter: () => void;
  onRotate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onClose: () => void;
}

export function HotspotRadialMenu({ x, y, hotspot, onEnter, onRotate, onDelete, onEdit, onClose }: HotspotRadialMenuProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div
        data-testid="hotspot-radial-backdrop"
        className="absolute inset-0 z-20"
        onClick={onClose}
      />
      <div className="absolute z-30" style={{ left: x, top: y }}>
        <button
          aria-label="Enter target room"
          disabled={!hotspot.targetSceneId}
          onClick={onEnter}
          className={BTN}
          style={{ left: 0, top: -44, transform: 'translate(-50%, -50%)' }}
        >
          <DoorOpen className="w-3.5 h-3.5" />
        </button>
        <button
          aria-label="Rotate hotspot"
          onClick={onRotate}
          className={BTN}
          style={{ left: -31, top: -31, transform: 'translate(-50%, -50%)' }}
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
        <button
          aria-label="Delete hotspot"
          onClick={onDelete}
          className={`${BTN} hover:text-red-500`}
          style={{ left: -31, top: 31, transform: 'translate(-50%, -50%)' }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button
          aria-label="Edit hotspot"
          onClick={onEdit}
          className={BTN}
          style={{ left: 0, top: 44, transform: 'translate(-50%, -50%)' }}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec jest components/tour-builder/__tests__/HotspotRadialMenu.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```powershell
git add components/tour-builder/HotspotRadialMenu.tsx components/tour-builder/__tests__/HotspotRadialMenu.test.tsx
git commit -m "feat(tour-builder): HotspotRadialMenu (Enter/Rotate/Delete/Edit arc)"
```

---

### Task 7: `HotspotSettingsPopover` component

**Files:**
- Create: `components/tour-builder/HotspotSettingsPopover.tsx`
- Test: `components/tour-builder/__tests__/HotspotSettingsPopover.test.tsx`

**Interfaces:**
- Consumes: `HotspotSettingsForm` (Task 3): `({ roomId, hotspot, onUpdate })`.
- Produces: `HotspotSettingsPopover({ x, y, badge, roomId, hotspot, viewport, onUpdate, onClose })` where `viewport: { width: number; height: number }` — consumed by `PanoramaViewport` (Task 8).

- [ ] **Step 1: Write the failing test**

Create `components/tour-builder/__tests__/HotspotSettingsPopover.test.tsx`:

```tsx
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { HotspotSettingsPopover } from '@/components/tour-builder/HotspotSettingsPopover';
import { useTourStore } from '@/lib/tourClientStore';
import type { TourScene, TourHotspot } from '@/lib/tourClientStore';

const scene: TourScene = {
  id: 'r1', name: 'Lobby', type: '360', url: 'https://x/pano.jpg', thumbnailUrl: '',
  initialYaw: 0, initialPitch: 0, initialFov: 75,
  hotspots: [{ id: 'h1', yaw: 0, pitch: 0, type: 'info', title: 'Sign', description: '' }],
  viewConstraints: {
    top: -90, bottom: 90, left: -180, right: 180,
    zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false,
  },
  autorotateEnabled: false, autorotateSpeed: 1,
};

const hotspot = (): TourHotspot => useTourStore.getState().scenes[0].hotspots[0];

const setup = (over: Partial<Parameters<typeof HotspotSettingsPopover>[0]> = {}) => {
  useTourStore.setState({ scenes: [JSON.parse(JSON.stringify(scene))] } as any);
  const onClose = jest.fn();
  const base = {
    x: 200, y: 150, badge: '03', roomId: 'r1',
    hotspot: hotspot(),
    viewport: { width: 1200, height: 800 },
    onUpdate: (patch: Partial<TourHotspot>) =>
      useTourStore.getState().updateHotspot('r1', 'h1', patch),
    onClose,
  };
  render(<HotspotSettingsPopover {...base} {...over} />);
  return onClose;
};

describe('HotspotSettingsPopover', () => {
  it('renders the extracted hotspot form with the badge number', () => {
    setup();
    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText('Reset Position')).toBeInTheDocument();
    expect(screen.getByText('Sign')).toBeInTheDocument();
  });

  it('edits flow into the store through onUpdate', () => {
    setup();
    const yawInput = screen.getAllByRole('spinbutton')
      .find((el) => (el as HTMLInputElement).value === '0');
    fireEvent.change(yawInput!, { target: { value: '45' } });
    expect(useTourStore.getState().scenes[0].hotspots[0].yaw).toBeCloseTo(Math.PI / 4, 5);
  });

  it('closes on Escape and on backdrop click', () => {
    const onClose = setup();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId('hotspot-popover-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('flips to the left of the marker near the right viewport edge', () => {
    setup({ x: 1150, viewport: { width: 1200, height: 800 } });
    const card = screen.getByText('Reset Position').closest('div[class*="rounded-lg"]') as HTMLElement;
    expect(card.style.left).toBe(`${1150 - 16 - 320}px`);
  });

  it('hides title chip overflow by clamping below the top edge', () => {
    setup({ y: 5 });
    const card = screen.getByText('Reset Position').closest('div[class*="rounded-lg"]') as HTMLElement;
    expect(parseInt(card.style.top, 10)).toBeGreaterThanOrEqual(8);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec jest components/tour-builder/__tests__/HotspotSettingsPopover.test.tsx`
Expected: FAIL — cannot resolve `@/components/tour-builder/HotspotSettingsPopover`.

- [ ] **Step 3: Implement `HotspotSettingsPopover.tsx`**

```tsx
'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { TourHotspot } from '@/lib/tourClientStore';
import { HotspotSettingsForm } from './HotspotSettingsForm';

const CARD_WIDTH = 320;

interface HotspotSettingsPopoverProps {
  x: number;
  y: number;
  badge: string;
  roomId: string;
  hotspot: TourHotspot;
  viewport: { width: number; height: number };
  onUpdate: (patch: Partial<TourHotspot>) => void;
  onClose: () => void;
}

export function HotspotSettingsPopover({ x, y, badge, roomId, hotspot, viewport, onUpdate, onClose }: HotspotSettingsPopoverProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  let left = x + 16;
  if (left + CARD_WIDTH > viewport.width - 8) left = x - 16 - CARD_WIDTH;
  if (left < 8) left = 8;
  const top = Math.min(Math.max(8, y - 40), Math.max(8, viewport.height - 200));

  return (
    <>
      <div
        data-testid="hotspot-popover-backdrop"
        className="absolute inset-0 z-30"
        onClick={onClose}
      />
      <div
        className="absolute z-40 w-80 max-h-[70vh] overflow-y-auto bg-[#18181B] border border-[#27272A] rounded-lg shadow-2xl"
        style={{ left, top, width: CARD_WIDTH }}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#27272A] sticky top-0 bg-[#18181B]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-1.5 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[9px] font-mono text-white">
              {badge}
            </span>
            <span className="text-xs font-mono font-bold text-white truncate">
              {hotspot.title || hotspot.type}
            </span>
          </div>
          <button
            aria-label="Close hotspot settings"
            onClick={onClose}
            className="p-1 rounded hover:bg-white/5 shrink-0"
          >
            <X className="w-3.5 h-3.5 text-[#71717A]" />
          </button>
        </div>
        <HotspotSettingsForm roomId={roomId} hotspot={hotspot} onUpdate={onUpdate} />
      </div>
    </>
  );
}
```

Note: the card gets `overflow-y-auto`, and `HotspotSettingsForm`'s `Section` borders read as card separators — matches the Inspector look from the reference.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec jest components/tour-builder/__tests__/HotspotSettingsPopover.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Scoped tsc + Commit**

```powershell
pnpm exec tsc --noEmit 2>$null | Select-String -Pattern "tour-builder|tourClientStore|hotspotRenderers|marzipano|tour-schema|InspectorPanel|PanoramaViewport|TourBuilderShell" | ForEach-Object { $_.Line }
git add components/tour-builder/HotspotSettingsPopover.tsx components/tour-builder/__tests__/HotspotSettingsPopover.test.tsx
git commit -m "feat(tour-builder): HotspotSettingsPopover anchored to marker"
```
Expected tsc: identical to baseline.

---

### Task 8: Wire radial + popover into `PanoramaViewport`

**Files:**
- Modify: `components/tour-builder/PanoramaViewport.tsx` (props, state, marker handlers, overlay rendering)
- Modify: `components/tour-builder/TourBuilderShell.tsx:266-272` (pass `onNavigateToRoom`)
- Test: extend `components/tour-builder/__tests__/PanoramaViewport-marker.test.tsx`

**Interfaces:**
- Consumes: `HotspotRadialMenu` (Task 6), `HotspotSettingsPopover` (Task 7), `deleteHotspot`/`updateHotspot` store actions.
- Produces: new optional prop `onNavigateToRoom?: (roomId: string) => void` on `PanoramaViewport`; radial/popover open-close behavior.

- [ ] **Step 1: Write the failing tests**

Append to `components/tour-builder/__tests__/PanoramaViewport-marker.test.tsx` (inside a new `describe` after the existing one; reuse the same `room` fixture and mock — both are already in the file):

```tsx
describe('PanoramaViewport radial + popover integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedMarzipano.__viewers.length = 0;
    useTourStore.setState({ scenes: [JSON.parse(JSON.stringify(room))] } as any);
  });

  const ready = async () => {
    await waitFor(() => expect(mockedMarzipano.__viewers.length).toBeGreaterThan(0));
  };

  it('opens the radial menu when a marker is clicked', async () => {
    const onSelect = jest.fn();
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={onSelect} />);
    await ready();
    fireEvent.click(screen.getByText('01'));
    expect(onSelect).toHaveBeenCalledWith('h1');
    expect(screen.getByLabelText('Edit hotspot')).toBeInTheDocument();
  });

  it('Enter is disabled for h1 (no target) and navigates for h2', async () => {
    const onNav = jest.fn();
    render(
      <PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} onNavigateToRoom={onNav} />
    );
    await ready();
    fireEvent.click(screen.getByText('01'));
    expect(screen.getByLabelText('Enter target room')).toBeDisabled();
    fireEvent.click(screen.getByTestId('hotspot-radial-backdrop'));
    fireEvent.click(screen.getByText('02'));
    const enter = screen.getByLabelText('Enter target room');
    expect(enter).not.toBeDisabled();
    fireEvent.click(enter);
    expect(onNav).toHaveBeenCalledWith('r2');
  });

  it('Edit opens the settings popover with the form', async () => {
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.click(screen.getByText('01'));
    fireEvent.click(screen.getByLabelText('Edit hotspot'));
    expect(await screen.findByText('Reset Position')).toBeInTheDocument();
    expect(screen.queryByLabelText('Edit hotspot')).not.toBeInTheDocument();
  });

  it('Delete removes the hotspot and clears selection', async () => {
    const onSelect = jest.fn();
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={onSelect} />);
    await ready();
    fireEvent.click(screen.getByText('01'));
    fireEvent.click(screen.getByLabelText('Delete hotspot'));
    expect(useTourStore.getState().scenes[0].hotspots).toHaveLength(1);
    expect(onSelect).toHaveBeenLastCalledWith('');
  });

  it('backdrop click closes the radial menu', async () => {
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.click(screen.getByText('01'));
    expect(screen.getByLabelText('Edit hotspot')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('hotspot-radial-backdrop'));
    expect(screen.queryByLabelText('Edit hotspot')).not.toBeInTheDocument();
  });

  it('closes overlays when the room changes', async () => {
    const view = render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.click(screen.getByText('01'));
    expect(screen.getByLabelText('Edit hotspot')).toBeInTheDocument();
    useTourStore.setState({
      scenes: [
        JSON.parse(JSON.stringify(room)),
        { ...JSON.parse(JSON.stringify(room)), id: 'r2', name: 'Other', hotspots: [] },
      ],
    } as any);
    view.rerender(<PanoramaViewport roomId="r2" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    expect(screen.queryByLabelText('Edit hotspot')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hotspot-popover-backdrop')).not.toBeInTheDocument();
  });

  it('double-clicking a marker opens the popover directly', async () => {
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.doubleClick(screen.getByText('01'));
    expect(await screen.findByText('Reset Position')).toBeInTheDocument();
  });

  it('closes the popover when selection is cleared (keyboard-D delete path)', async () => {
    const view = render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.click(screen.getByText('01'));
    fireEvent.click(screen.getByLabelText('Edit hotspot'));
    expect(await screen.findByText('Reset Position')).toBeInTheDocument();
    view.rerender(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    expect(screen.queryByText('Reset Position')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hotspot-popover-backdrop')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest components/tour-builder/__tests__/PanoramaViewport-marker.test.tsx`
Expected: new describe block FAILS (`Edit hotspot` not found / `onNavigateToRoom` prop not recognized as used); the 3 badge tests still PASS.

- [ ] **Step 3: Implement in `PanoramaViewport.tsx`**

1. Props + imports:

```tsx
import { HotspotRadialMenu } from './HotspotRadialMenu';
import { HotspotSettingsPopover } from './HotspotSettingsPopover';
```

```ts
interface PanoramaViewportProps {
  roomId: string;
  activeTool: string;
  selectedHotspotId: string;
  onSelectHotspot: (id: string) => void;
  onViewportClick?: (yaw: number, pitch: number) => void;
  onNavigateToRoom?: (roomId: string) => void;
}
```
Destructure `onNavigateToRoom`.

2. Store subscriptions (next to existing `updateScene`):

```ts
  const updateHotspot = useTourStore((s) => s.updateHotspot);
  const deleteHotspot = useTourStore((s) => s.deleteHotspot);
```

3. Local state (next to `isDragging`):

```ts
  const [radialOpen, setRadialOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
```

4. Reset overlays on room change (after the `engine` hook):

```ts
  useEffect(() => {
    setRadialOpen(false);
    setPopoverOpen(false);
  }, [roomId]);
```

5. Marker `onClick` (replace Task 5 version):

```tsx
            onClick={(e) => {
              e.stopPropagation();
              onSelectHotspot(hs.id);
              setPopoverOpen(false);
              setRadialOpen(true);
            }}
```

6. Add `onDoubleClick` to the marker div (same element):

```tsx
            onDoubleClick={(e) => {
              e.stopPropagation();
              onSelectHotspot(hs.id);
              setRadialOpen(false);
              setPopoverOpen(true);
            }}
```

7. In the map callback, wrap the marker in a fragment and append the overlays. Change the return to:

```tsx
        return (
          <React.Fragment key={hs.id}>
            <div
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                isSelected ? 'scale-125 z-10' : 'hover:scale-110'
              }`}
              style={{ left: p.x, top: p.y }}
              onClick={...existing handler from step 5...}
              onDoubleClick={...handler from step 6...}
              onContextMenu={...unchanged context menu...}
            >
              ...circle + badge + chip (unchanged from Task 5)...
            </div>
            {isSelected && radialOpen && (
              <HotspotRadialMenu
                x={p.x}
                y={p.y}
                hotspot={hs}
                onEnter={() => {
                  if (!hs.targetSceneId) return;
                  setRadialOpen(false);
                  onSelectHotspot('');
                  onNavigateToRoom?.(hs.targetSceneId);
                }}
                onRotate={() => setRadialOpen(false)}
                onDelete={() => {
                  setRadialOpen(false);
                  deleteHotspot(roomId, hs.id);
                  onSelectHotspot('');
                }}
                onEdit={() => {
                  setRadialOpen(false);
                  setPopoverOpen(true);
                }}
                onClose={() => setRadialOpen(false)}
              />
            )}
            {isSelected && popoverOpen && (
              <HotspotSettingsPopover
                x={p.x}
                y={p.y}
                badge={String(idx + 1).padStart(2, '0')}
                roomId={roomId}
                hotspot={hs}
                viewport={{
                  width: containerRef.current?.getBoundingClientRect().width ?? 0,
                  height: containerRef.current?.getBoundingClientRect().height ?? 0,
                }}
                onUpdate={(patch) => updateHotspot(roomId, hs.id, patch)}
                onClose={() => setPopoverOpen(false)}
              />
            )}
          </React.Fragment>
        );
```

(`key` moves from the marker div to the Fragment.)

8. In `TourBuilderShell.tsx`, add the prop to `PanoramaViewport` (line ~266):

```tsx
                  <PanoramaViewport
                    roomId={selectedRoomId}
                    activeTool={activeTool}
                    selectedHotspotId={selectedHotspotId}
                    onSelectHotspot={setSelectedHotspotId}
                    onViewportClick={handleViewportClick}
                    onNavigateToRoom={setSelectedRoomId}
                  />
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec jest components/tour-builder/__tests__/PanoramaViewport-marker.test.tsx`
Expected: PASS (3 badge + 8 integration = 11 tests).

- [ ] **Step 5: Full scoped verification**

Run: `pnpm exec jest __tests__/tour-builder components/tour-builder components/xr`
Expected: only the pre-existing `validation.test.tsx` failure.

Run: `pnpm exec tsc --noEmit 2>$null | Select-String -Pattern "tour-builder|tourClientStore|hotspotRenderers|marzipano|tour-schema|InspectorPanel|PanoramaViewport|TourBuilderShell" | ForEach-Object { $_.Line }`
Expected: identical to baseline.

- [ ] **Step 6: Commit**

```powershell
git add components/tour-builder/PanoramaViewport.tsx components/tour-builder/TourBuilderShell.tsx components/tour-builder/__tests__/PanoramaViewport-marker.test.tsx
git commit -m "feat(tour-builder): wire radial menu + settings popover into viewport"
```

---

### Task 9: Rotate mode (armed drag on the marker)

**Files:**
- Modify: `components/tour-builder/PanoramaViewport.tsx`
- Test: extend `components/tour-builder/__tests__/PanoramaViewport-marker.test.tsx`

**Interfaces:**
- Consumes: radial `onRotate` (Task 8 currently sets it to `setRadialOpen(false)` — replaced here), `updateHotspot`, `TourHotspot.rotation`.
- Produces: rotate-drag behavior; `onRotate` opens rotate mode instead of only closing the menu.

- [ ] **Step 1: Write the failing test**

Append to `components/tour-builder/__tests__/PanoramaViewport-marker.test.tsx`:

```tsx
describe('PanoramaViewport rotate mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedMarzipano.__viewers.length = 0;
    useTourStore.setState({ scenes: [JSON.parse(JSON.stringify(room))] } as any);
  });

  const ready = async () => {
    await waitFor(() => expect(mockedMarzipano.__viewers.length).toBeGreaterThan(0));
  };

  const storeHotspot = (id: string) =>
    useTourStore.getState().scenes[0].hotspots.find((h) => h.id === id)!;

  it('arming Rotate shows the degree readout chip', async () => {
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.click(screen.getByText('01'));
    fireEvent.click(screen.getByLabelText('Rotate hotspot'));
    expect(screen.getByText('30°')).toBeInTheDocument();
    expect(screen.queryByLabelText('Rotate hotspot')).not.toBeInTheDocument();
  });

  it('dragging the marker horizontally updates rotation (start + dx * 0.75)', async () => {
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.click(screen.getByText('01'));
    fireEvent.click(screen.getByLabelText('Rotate hotspot'));
    fireEvent.mouseDown(screen.getByText('01'), { clientX: 100 });
    fireEvent.mouseMove(window, { clientX: 180 });
    expect(storeHotspot('h1').rotation).toBe(90);
    fireEvent.mouseUp(window);
  });

  it('normalizes rotation into 0-360', async () => {
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.click(screen.getByText('01'));
    fireEvent.click(screen.getByLabelText('Rotate hotspot'));
    fireEvent.mouseDown(screen.getByText('01'), { clientX: 100 });
    fireEvent.mouseMove(window, { clientX: -400 });
    expect(storeHotspot('h1').rotation).toBeGreaterThanOrEqual(0);
    expect(storeHotspot('h1').rotation).toBeLessThan(360);
    fireEvent.mouseUp(window);
  });

  it('Escape exits rotate mode', async () => {
    render(<PanoramaViewport roomId="r1" activeTool="select" selectedHotspotId="" onSelectHotspot={jest.fn()} />);
    await ready();
    fireEvent.click(screen.getByText('01'));
    fireEvent.click(screen.getByLabelText('Rotate hotspot'));
    expect(screen.getByText('30°')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText('30°')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec jest components/tour-builder/__tests__/PanoramaViewport-marker.test.tsx`
Expected: new `rotate mode` describe FAILS (currently `onRotate` only closes the radial — no chip, no drag).

- [ ] **Step 3: Implement in `PanoramaViewport.tsx`**

1. Add module-scope helper above the component:

```ts
const normalizeDeg = (d: number) => ((d % 360) + 360) % 360;
```

2. Add state + ref inside the component:

```ts
  const [rotateModeId, setRotateModeId] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; startX: number; startRotation: number; preview: number } | null>(null);
  const dragMovedRef = useRef(false);
```

3. Reset on room change — extend the Task 8 effect:

```ts
  useEffect(() => {
    setRadialOpen(false);
    setPopoverOpen(false);
    setRotateModeId(null);
    setDrag(null);
  }, [roomId]);
```

4. Window listeners (add near the other effects):

```ts
  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - drag.startX;
      if (Math.abs(dx) > 2) dragMovedRef.current = true;
      const preview = normalizeDeg(drag.startRotation + dx * 0.75);
      setDrag({ ...drag, preview });
      updateHotspot(roomId, drag.id, { rotation: preview });
    };
    const onUp = () => setDrag(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [drag, roomId, updateHotspot]);

  useEffect(() => {
    if (!rotateModeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRotateModeId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rotateModeId]);
```

5. Replace Task 8's `onRotate`:

```tsx
                onRotate={() => {
                  setRadialOpen(false);
                  setRotateModeId(hs.id);
                }}
```

6. Marker additions — `onMouseDown`, rotation preview, degree chip, cursor. In the marker div:

```tsx
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                isSelected ? 'scale-125 z-10' : 'hover:scale-110'
              }${rotateModeId === hs.id ? ' cursor-ew-resize' : ''}`}
```

```tsx
              onMouseDown={(e) => {
                if (rotateModeId !== hs.id) return;
                e.stopPropagation();
                dragMovedRef.current = false;
                setDrag({
                  id: hs.id,
                  startX: e.clientX,
                  startRotation: hs.rotation ?? 0,
                  preview: hs.rotation ?? 0,
                });
              }}
```

Update `onClick` (guard the post-drag click and cancel-on-reclick):

```tsx
              onClick={(e) => {
                e.stopPropagation();
                if (dragMovedRef.current) {
                  dragMovedRef.current = false;
                  return;
                }
                if (rotateModeId === hs.id) {
                  setRotateModeId(null);
                  return;
                }
                setRotateModeId(null);
                onSelectHotspot(hs.id);
                setPopoverOpen(false);
                setRadialOpen(true);
              }}
```

Circle rotation becomes preview-aware — replace Task 5's style line:

```tsx
              style={{ transform: `rotate(${drag && drag.id === hs.id ? drag.preview : hs.rotation ?? 0}deg)` }}
```

Add the degree chip after the title chip (inside the marker div):

```tsx
            {rotateModeId === hs.id && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-6 px-2 py-0.5 rounded bg-[#3ECF8E] text-[9px] font-mono text-black whitespace-nowrap">
                {Math.round(drag && drag.id === hs.id ? drag.preview : hs.rotation ?? 0)}°
              </div>
            )}
```

7. Exit on background click — at the top of `handleClick`:

```ts
    if (rotateModeId && !drag) {
      setRotateModeId(null);
      return;
    }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec jest components/tour-builder/__tests__/PanoramaViewport-marker.test.tsx`
Expected: PASS (all describes in the file: 3 + 8 + 4 = 15 tests).

- [ ] **Step 5: Full scoped verification + Commit**

Run: `pnpm exec jest __tests__/tour-builder components/tour-builder`
Expected: only the pre-existing `validation.test.tsx` failure.

Run: `pnpm exec tsc --noEmit 2>$null | Select-String -Pattern "tour-builder|tourClientStore|hotspotRenderers|marzipano|tour-schema|InspectorPanel|PanoramaViewport|TourBuilderShell" | ForEach-Object { $_.Line }`
Expected: identical to baseline.

```powershell
git add components/tour-builder/PanoramaViewport.tsx components/tour-builder/__tests__/PanoramaViewport-marker.test.tsx
git commit -m "feat(tour-builder): rotate mode — drag marker to set hotspot rotation"
```

---

### Task 10: Public viewer rotation + full verification sweep

**Files:**
- Modify: `components/tour-viewer/hotspotRenderers.ts` (`applyAppearance`)
- Test: `components/tour-viewer/__tests__/hotspotRenderers.test.tsx` (append)

**Interfaces:**
- Consumes: `TourHotspot.rotation` (Task 1).
- Produces: WYSIWYG rotation in the public viewer; final green baseline.

- [ ] **Step 1: Write the failing test**

Append to `components/tour-viewer/__tests__/hotspotRenderers.test.tsx` (use the file's existing base-hotspot helper for the fixture — every test in that file builds a hotspot the same way):

```tsx
  it('applies rotation to the dot only when non-zero', () => {
    const base = makeHotspot();
    const rotated = renderViewerHotspot({ ...base, rotation: 45 });
    const dot = rotated.firstElementChild as HTMLElement;
    expect(dot.style.transform).toBe('rotate(45deg)');
    const plain = renderViewerHotspot(base);
    expect((plain.firstElementChild as HTMLElement).style.transform).toBe('');
  });
```

If the file's helper is named differently, adapt the fixture construction to match the file's existing pattern exactly (read the file first — do not invent a new helper if one exists).

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec jest components/tour-viewer/__tests__/hotspotRenderers.test.tsx`
Expected: FAIL — `Expected: "rotate(45deg)", Received: ""`.

- [ ] **Step 3: Implement**

In `components/tour-viewer/hotspotRenderers.ts`, at the end of `applyAppearance(dot, hs)`:

```ts
  if (hs.rotation) dot.style.transform = `rotate(${hs.rotation}deg)`;
```

(Gate on truthy so hotspots without rotation keep the Tailwind `hover:scale-125` transform behavior untouched.)

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec jest components/tour-viewer/__tests__/hotspotRenderers.test.tsx`
Expected: PASS (all tests in the file).

- [ ] **Step 5: Full jest baseline check**

Run: `pnpm exec jest 2>&1 | Select-String -Pattern "Tests:|Test Suites:"`
Expected: `Test Suites: 11 failed` (same 11 as baseline) and `Tests: <15 failed>, N passed` where N = 740 + (all new tests added by this plan: 2 compat + 1 exporter + 6 form + 2 room-only + 3 marker + 5 radial + 5 popover + 7 integration + 4 rotate + 1 renderer ≈ 775 total passed). The failing suite NAMES must be the same pre-existing ones (validation, auth, leads, `.kilo/worktrees`, playwright) — if a new suite fails, fix it before proceeding.

- [ ] **Step 6: Scoped tsc final check**

Run:
```powershell
pnpm exec tsc --noEmit 2>$null | Select-String -Pattern "tour-builder|tourClientStore|hotspotRenderers|marzipano|tour-schema|InspectorPanel|PanoramaViewport|TourBuilderShell" | ForEach-Object { $_.Line } | Out-File -Encoding utf8 C:\Users\Arch_Viz\AppData\Local\Temp\opencode\tsc-scoped-final-hotspot.txt
Compare-Object (Get-Content C:\Users\Arch_Viz\AppData\Local\Temp\opencode\tsc-scoped-baseline-hotspot.txt) (Get-Content C:\Users\Arch_Viz\AppData\Local\Temp\opencode\tsc-scoped-final-hotspot.txt)
```
Expected: no `Compare-Object` output (final scoped tsc identical to the Task 1 baseline).

- [ ] **Step 7: Browser smoke (manual, dev server already running on :3000)**

Open `/xr-world/virtual-tour/tour-builder`, load a tour with hotspots, verify: badges `01/02/…`; click marker → radial arc (Enter disabled on targetless, Edit/Delete/Rotate enabled); Edit → popover with all sections incl. Rotation; Rotate → degree chip + horizontal drag changes icon angle; Enter → editor switches room; Delete → marker removed; Esc/backdrop closes each overlay; right-panel Inspector shows ROOM only.

- [ ] **Step 8: Commit + ledger**

```powershell
git add components/tour-viewer/hotspotRenderers.ts components/tour-viewer/__tests__/hotspotRenderers.test.tsx
git commit -m "feat(tour-viewer): apply hotspot rotation in public viewer (WYSIWYG)"
```

Create `.superpowers/sdd/2026-10-03-hotspot-radial-editor/progress.md` with one line per task (commit hash + test counts), then:

```powershell
git add -f .superpowers/sdd/2026-10-03-hotspot-radial-editor/progress.md
git commit -m "docs(sdd): ledger — hotspot radial editor complete"
```
