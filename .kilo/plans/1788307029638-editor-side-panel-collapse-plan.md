# Plan — Collapsible Side Panels in Virtual Tour Editor

## Goal
The two side panels in the Virtual Tour Editor (`NodeListSidebar` on the left, `EditorRightSidebar` on the right) currently occupy fixed slots and cannot be hidden. Make both independently collapsible from a small toggle in the editor's top bar so users can reclaim screen space for the panorama preview when editing a single room or scrubbing hotspots.

Integration target: `app/xr-world/virtual-tour/editor/page.tsx`. No changes to other tabs (design / components / floorplan / map / canvas / cta / content / marketing / model / settings) — those use a single full-width column already.

---

## Decisions (do not re-litigate)

| Decision | Source |
|---|---|
| Scope = left (`NodeListSidebar`) + right (`EditorRightSidebar`) only; other tabs untouched | user ("both side panel") |
| Toggle location = a small chevron button rendered as the rightmost edge of each panel, not in the top header | UX consistency with the panels themselves; keeps `EditorHeader` focused on tour-level actions |
| State shape = two `boolean` flags on the page component (`leftOpen`, `rightOpen`), not a store | Per-tab UI state; `useEditorStore` is for tour data + undo, not per-view toggles |
| Default = both open (no behavior change on first load) | minimize surprise on existing tours |
| Persistence = none this round | plan can add localStorage later if requested; out of scope for v1 |
| A11y = button is `aria-pressed`, `aria-label` describes the resulting state, panel is hidden via CSS not removed from DOM | keeps focus, hotspot state, and preloaded media intact; non-Visual users still get the controls |
| Animation = simple Tailwind width transition (`w-72` ⇄ `w-0`) with `overflow-hidden` | matches existing styling; no framer-motion needed |
| Hotspot inspector (right panel) only renders when a room is selected AND the panel is open | already conditional on `selected`; add `&& rightOpen` |
| Selection / drag state preservation = none needed; no async work, no remounts, just CSS width | confirmed by code reading |

## Affected Boundaries

- `app/xr-world/virtual-tour/editor/page.tsx` — add state, toggle buttons, conditional rendering/widths.
- `components/editor/shell/NodeListSidebar.tsx` — add a single optional `onCollapse?: () => void` prop, render a chevron button in its top-right. Default no-op so other consumers (if any) aren't affected.
- `components/editor/shell/EditorRightSidebar.tsx` — add a single optional `onCollapse?: () => void` prop, render a chevron button in its top-right. Default no-op.
- No API, store, or backend changes.

## Data Flow

1. Page holds two booleans: `leftOpen: boolean`, `rightOpen: boolean` (default true).
2. Page passes `onCollapse={() => setLeftOpen(false)}` / `onCollapse={() => setRightOpen(false)}` to each panel.
3. The panel's outer wrapper is a flex item with `w-72 shrink-0 overflow-hidden` (open) or `w-0` (closed); both are reachable via the toggle button so users can re-open.
4. When `rightOpen === false`, skip rendering `<EditorRightSidebar>` (it has no useful state to preserve and is conditionally visible only when a room is selected anyway).
5. When `leftOpen === false`, keep `NodeListSidebar` mounted with `w-0` (it owns drag/drop + library upload state worth keeping alive).

## Toggle UX

- Open: button shows `ChevronLeft` (left panel) or `ChevronRight` (right panel) pointing inward.
- Closed: a 6px-wide vertical strip remains on the screen edge with a single chevron pointing outward and a hover-revealed label like "Nodes" / "Inspector". Aria-label matches.
- Button is keyboard-reachable; `Enter` and `Space` toggle via native `<button type="button">`.

## Failure Modes

- **Double-collapse race**: none — flags are sync.
- **Resize on collapse**: `flex-1` main column auto-grows; no fixed widths to recalc.
- **Inspector invisible while open if no room selected**: same as today (the right panel is gated on `selected`); the toggle works on both.
- **Mobile / narrow viewports**: the panels are already cramped below ~1024px; collapse-to-zero matches the desired mobile behavior. Out of scope to add a dedicated media query this round.

## Ordered Task List

1. Add optional `onCollapse?: () => void` to `NodeListSidebar.tsx` and render a chevron button in its top-right that calls it. No-op if the prop is absent.
2. Add the same optional `onCollapse?: () => void` to `EditorRightSidebar.tsx` with the same UI pattern.
3. In `app/xr-world/virtual-tour/editor/page.tsx`:
   - Add `const [leftOpen, setLeftOpen] = useState(true)` and `const [rightOpen, setRightOpen] = useState(true)`.
   - Wrap `NodeListSidebar` in a `<div className={leftOpen ? 'w-72 shrink-0 overflow-hidden' : 'w-0 overflow-hidden'}>` and pass `onCollapse={() => setLeftOpen(false)}`.
   - When `rightOpen` is true, render `<EditorRightSidebar ... onCollapse={() => setRightOpen(false)} />`; when false, render a 6px collapsed rail with a chevron button that re-opens it.
   - Add a re-open chevron on the left rail when `leftOpen` is false.
4. Build + lint + existing tests (`npx jest`) — should still pass with no behavior change for the default (both open) state.
5. Smoke: open editor, click left toggle, verify main column grows and the list reappears via the rail's re-open button. Repeat for right.

## Validation

- `pnpm build` green.
- `pnpm lint` clean on touched files.
- `pnpm test` — no regressions; the 30 marzipano tests and other suites still pass.
- Manual: collapse each side, re-open via the rail chevron, confirm `Add Hotspot` click and panorama drag still work (the main column's pointer handlers are not inside either panel).

## Out of Scope

- localStorage persistence of panel state across reloads.
- Per-tab (design / floorplan / etc.) panel layouts.
- Resizable splitter drag-to-resize (vs. simple open/close).
- Mobile drawer mode.

## Risks

- **Sidebar height vs. main column**: both panels already use `min-h-0` via the parent flex row. Collapsing to `w-0` will not change vertical layout. ✓
- **Focus management when collapsing**: not addressed this round; the toggle button remains focusable in both states. No focus-trap is needed.
- **Aria-pressed vs aria-expanded**: panels are not strict disclosure widgets (their content is a list, not a single summary). Use `aria-pressed` on the toggle button.
