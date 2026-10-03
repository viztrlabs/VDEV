# Hotspot Radial Editor — Design

**Date:** 2026-10-03
**Status:** Approved (brainstorming, Sections 1–4)
**Reference:** `C:\Users\Arch_Viz\Desktop\New folder\hotspot editor settigns with ui.png`
**Scope:** Tour builder viewport only (`components/tour-builder/`). Preview and public visitor viewer are unchanged except a one-line rotation application for WYSIWYG.

## Goal

Add a reference-style radial action menu + marker-anchored settings popover to hotspot markers in the tour builder:

- Left-click a marker → radial menu opens around it (4 buttons, left-side arc): **Enter**, **Rotate**, **Delete**, **Edit**.
- **Edit** opens a floating settings popover anchored to the marker — this **replaces** the InspectorPanel's hotspot section as the sole hotspot-settings surface.
- Markers gain a zero-padded per-room **numbered badge** (`01`, `02`, …) to the right, like the reference.
- Right-click dropdown (Edit/Delete) stays unchanged.

## Decisions (from clarifying questions)

| Question | Decision |
|---|---|
| Where it applies | Tour builder only |
| Menu actions | Match reference literally: Enter, Rotate, Delete, Edit |
| Rotate semantics | Rotate hotspot facing — new `rotation` field (icon orientation, deg) |
| Trigger | Left-click select; right-click dropdown kept |
| Number badge | Yes, per-room 1-based index |
| Edit destination | New popover anchored next to marker (not the Inspector) |
| Popover vs Inspector | Popover replaces Inspector's hotspot section (single source of truth) |
| Enter with no target | Always shown, disabled (greyed) when `!targetSceneId` |
| Approach | **A** — extract hotspot fields from InspectorPanel; radial + popover as viewport overlays |

## Section 1 — Marker, badge, radial menu

### Marker changes (`PanoramaViewport.tsx`, marker render ~lines 255–309)

- Center circle unchanged (type icon; amber `bg-amber-500` for link/navigation, `bg-white/90` otherwise, `bg-[#3ECF8E]` + `scale-125` when selected).
- New badge, always visible, rendered right of the marker:
  - text = per-room 1-based index, zero-padded to 2 (`01`); renumbers on add/remove (array order).
  - classes: `bg-[#18181B] border border-[#27272A] text-white text-[9px] font-mono px-1.5 py-0.5 rounded`.
- Existing selected title chip below the marker stays.

### Radial menu (new `components/tour-builder/HotspotRadialMenu.tsx`)

- 4 round buttons, 28px: `bg-[#18181B]/95 border border-[#27272A] text-white`, white Lucide icons.
- Left-side arc, radius ≈ 44px (badge sits on the right, so no collision):
  - **top** — Enter (`DoorOpen`) — `disabled` (50% opacity, no-op) when `!hotspot.targetSceneId`
  - **upper-left** — Rotate (`RotateCw`)
  - **lower-left** — Delete (`Trash2`, red on hover)
  - **bottom** — Edit (`Pencil`)
- Absolute overlay inside `PanoramaViewport` at the marker's projected `{x, y}`; no portal (viewport container is `relative`).
- Dismiss: action taken, Esc, click elsewhere (same pattern as `ContextMenu.tsx`).

## Section 2 — Edit popover + InspectorPanel extraction

### New `components/tour-builder/HotspotSettingsPopover.tsx`

- Opens from radial Edit (radial closes); also opens on marker double-click.
- Anchoring: preferred right of marker, 16px gap; flips to left within 340px of viewport right edge; clamped vertically; `max-height: 70vh`, internal scroll; width 320px.
- Re-projects each frame using the existing `projected[hs.id]` value (follows panning); unmounts when the marker is not projected (behind camera / off-screen).
- Theme: `bg-[#18181B] border border-[#27272A] rounded-lg font-mono`; header = badge number + title + close ✕.
- Close: ✕, Esc, another marker selected, empty-viewport click, Enter→room switch.

### New `components/tour-builder/HotspotSettingsForm.tsx` (extracted from InspectorPanel)

Collapsible sections reusing extracted `Section`/`Field` primitives (shared `inspector-fields.tsx`):

1. **Type** — 12-type grid (moved from Inspector: `HOTSPOT_TYPES`)
2. **Type-specific** — rendered by the moved `TypeSpecificFields` (renders its own `Section`: destination room, target yaw/pitch, URLs, uploads via moved `TypeSpecificFields`, `ImageInput`, `ModelInput`)
3. **Content** — title, description (moved, `defaultOpen={false}`)
4. **Position** — yaw/pitch numbers + "Reset Position" (moved)
5. **Appearance** — color, size, opacity, label, tooltip, animation, icon picker + **Rotation°** (new number field, 0–360)
6. **Direction** — existing `directionMode`/`directionYaw`/`directionPitch` section (moved, `defaultOpen={false}`; retained so no current setting is lost)

All field edits go through the existing `updateHotspot(sceneId, hotspotId, patch)` store action (what InspectorPanel already uses); delete goes through `deleteHotspot(sceneId, hotspotId)`. No new store logic or network paths.

### InspectorPanel after extraction

- Keeps room settings only; imports `Section`/`Field` from `inspector-fields.tsx`.
- Hotspot-specific code moves to `HotspotSettingsForm.tsx`.
- Existing room-section tests stay; hotspot-field tests migrate to the form.

## Section 3 — Rotate mode, Enter action, schema

### Schema

- Add optional `rotation?: number` (degrees, 0–360, default 0) to `TourHotspot` in `lib/tourClientStore.ts` — icon/badge orientation, independent of position `yaw`.
- `lib/marzipano/conversion.ts:235`: `rotation: h.rotation ?? 0` instead of hardcoded `0`.
- Render `transform: rotate(${rotation}deg)` on the builder marker circle and on the public viewer `.viztr-hotspot` badge (single line, WYSIWYG).
- Optional field → backward/forward compatible with existing tours.

### Rotate mode (state local to `PanoramaViewport`)

1. Radial Rotate → radial closes; marker enters rotate mode: highlighted ring, `RotateCw` cursor, live degree readout chip.
2. Horizontal drag: `rotation = normalize(start + dx * 0.75)`°, committed via `updateHotspot` during drag (the store mutates in place, so the live value during the drag is held in viewport-local state and written through to the store on each move).
3. Exit: pointer-up ends drag but keeps mode; click elsewhere / Esc / another action exits. Marker stays selected.
4. The popover's Appearance → Rotation field edits the same value as a number input.

### Enter action

- New optional prop `onNavigateToRoom(roomId: string)` on `PanoramaViewport`; `TourBuilderShell` wires it to existing `setSelectedRoomId`.
- Simulates the visitor jump: switches active room, clears selection, closes radial/popover.
- Disabled when `!hotspot.targetSceneId`.

### Delete

- Immediate delete via the store's `deleteHotspot` action + deselect — same as today's context-menu delete, no confirm dialog. (The keyboard-`D` shortcut keeps its own `confirm()` in `TourBuilderShell` — unchanged.)

## Section 4 — Testing, edge cases, error handling

### Tests

- `HotspotRadialMenu.test.tsx` — renders 4 buttons; Enter disabled without target; `onEnter/onRotate/onDelete/onEdit` fire; Esc closes.
- `HotspotSettingsPopover.test.tsx` — renders form fields; `updateScene` on edits; flip/suppress off-screen; outside-click/Esc close; unmounts when marker not projected.
- `HotspotSettingsForm.test.tsx` — migrates Inspector hotspot-field tests (type grid, destination room, mocked uploads).
- `PanoramaViewport` tests — zero-padded badge; radial opens on select; rotate drag writes normalized rotation via `updateScene`; Enter calls `onNavigateToRoom`.
- Schema/manifest tests — `rotation` round-trips save/load/export.

### Edge cases

- Marker not projected → marker + radial + popover unmount together.
- Popover open + room switch (Enter or RoomManager) → popover closes (selection cleared on room change; enforce + test).
- Keyboard `D` delete while popover open → popover closes (shell deselects; test).
- Overlapping markers → selected marker rendered last (`z-10` selection class).
- Rotate mode and popover are mutually unreachable by construction (Rotate closes radial; popover opens only from Edit).

### Error handling

- Upload inputs keep their existing error states (moved verbatim).
- No new network paths — only `updateScene`; no new failure modes.

## Out of scope

- Radial menu / numbered badges / popover in builder preview and public visitor viewer.
- Visitor-facing radial menu of any kind.
- Right-click dropdown changes (kept as-is).
- Legacy editor (`components/editor`, `components/viewers`).
