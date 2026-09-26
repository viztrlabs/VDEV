# Virtual Tour — Artist Workflow Guide

A practical, step-by-step guide for artists building Project VizTR virtual tours.
It covers what works today, the exact linking processes, keyboard shortcuts, and
what is still to come.

---

## 1. What works today

| Capability | Status |
| --- | --- |
| Import tour `.zip` or individual equirectangular panoramas | ✅ Works |
| Create rooms (scenes) and reorder them | ✅ Works |
| Set the featured (entry) room | ✅ Works |
| Set each room's default start view (yaw / pitch) | ✅ Works |
| Link rooms with navigation hotspots | ✅ Works (3 ways, see §4) |
| Info / metadata hotspots with text + photos | ✅ Works (multi-image grid) |
| Media hotspots (image / video / audio / 3D model) | ✅ Works |
| External link hotspots (open a URL) | ✅ Works |
| In-editor preview (R or Preview tool) | ✅ Works |
| Tour map inside the editor (click a room to jump) | ✅ Works |
| Public tour page (`/virtual-tour/<slug>`) | ✅ Works |
| Tour map on the public page (Map button) | ✅ Works |
| Room labels strip on the public page | ✅ Works |
| Live comments on the public page | ✅ Works |
| Undo / redo in the editor (Ctrl+Z / Ctrl+Y) | ✅ Works |
| Publish + set live | ✅ Works (see §6 guardrails) |
| Background / ambience audio per room | 🚧 Coming soon |
| Pinch / FOV limits per platform | 🚧 Coming soon |
| Real visit/view counters | 🚧 Coming soon |
| Export tour as `.zip` from the editor | 🚧 Coming soon |

If a feature is marked 🚧, do not rely on it for a client delivery yet.

---

## 2. Prepare your assets

**Panoramas**
- Use **equirectangular 2:1** images (e.g. 8192×4096, 4096×2048, or at least 2048×1024).
- Keep the horizon level. Marzipano handles leveling automatically, but a level
  source photo makes default views look right.
- Name files clearly (e.g. `kitchen.jpg`, `lounge.jpg`) — those names become the
  visible room names unless you rename them in the editor.

**Media library**
- Images: square or landscape `jpg/png/webp`, reachable over HTTPS.
- Video: YouTube / Vimeo links or direct `.mp4` URL.
- Audio: direct `.mp3`/`.ogg` URL.
- When adding photos to an info/metadata hotspot, pick from the media library
  (multi-select) — see §5.

---

## 3. Build the tour

1. Open the tour editor: **XR → Virtual Tours** (or `/xr-world/virtual-tour/editor`).
2. Create/select a tour slug, or **Import** a tour `.zip`.
3. The editor lists your rooms. Select each room (click its name or use the
   **Map** button in the panorama view).
4. For the room visitors should land on first, enable **Featured room**.
5. While a room is selected, look around in the preview and click
   **Set default view** to record the starting yaw/pitch.

---

## 4. Linking rooms — three equivalent processes

Links only appear on the public tour when the hotspot actually **targets a real
room** (`targetRoomId`). Any of these approaches creates a valid link:

**Process A — Portal tool + pick target**
1. Choose the **Portal** tool from the bottom bar.
2. Click a target room name in the picker at the top of the workspace.
3. Click on the panorama where the link button should live.
4. Repeat for every outbound door.

**Process B — Add hotspot, then set target in the inspector**
1. With a room selected, add a **room_link / navigation** hotspot on the image.
2. In the right-hand inspector, pick the target room from the **→ target** dropdown.
3. Use the **Direction** section if you want the visitor to arrive looking at the
   room's default view, or set a manual target yaw/pitch.

**Process C — Verify with the Tour Map**
- Open the **Map** overlay. You will see every room and a dashed green line for
  each authored link.
- Rooms with no dashed lines are **orphaned** (nothing links to/from them).
  Add those links now.

> The public viewer never auto-generates links. If a link is missing, it was
> never authored — go back to Process A or B.

---

## 5. Hotspots

| Kind | What the visitor sees |
| --- | --- |
| Info / metadata | Popup: title, description, photo grid (1 or 2 columns), optional external link |
| Image | Popup with the image |
| Video / audio | Inline player (with autoplay/mute/loop options) |
| Room link / navigation | Teleports to the target scene, honoring its default start view |
| External link | Opens the URL (tap opens a new tab by default) |
| Model3D / experience | Inline 3D viewer / embedded experience |

To give an info hotspot several photos:
1. Select the hotspot, expand **Photos (n)** in the inspector.
2. Click **+ Add photos from library**, multi-select in the gallery, confirm.
3. Remove any photo with the **×** badge on its thumbnail.

---

## 6. Publish

1. Click **Save**, then **Publish**.
2. You'll get the public URL: `/virtual-tour/<slug>`.
3. **Guardrails (built-in):**
   - Publishing **never wipes** your authored rooms and **never injects demo
     rooms** into a live tour.
   - If a tour row has no authored rooms yet, publishing stores an empty room set —
     nothing is shown until you actually add rooms (**Tour not found**).
   - Room data and publish settings live in the same row; saving settings updates
     identity, slug, live flag, and room set atomically.

---

## 7. Preview & test your work

- Press **R** (or the **Preview** tool) inside the editor to walk the current room
  exactly as a visitor would: start view, link teleports, and popup content.
- Press **Esc** to exit preview.
- After publishing, open the public URL and verify:
  - The featured room is the entry point.
  - Each room's default view is correct.
  - All door links jump to the right room.
  - Image/video/audio popups behave.

---

## 8. Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `V` | Select tool |
| `M` | Add metadata hotspot |
| `I` | Add info hotspot |
| `P` | Portal mode (add room-link hotspots) |
| `G` | Open the media gallery |
| `R` | Preview current room |
| `Esc` | Exit preview / cancel |
| `Ctrl+Z`, `Ctrl+Shift+Z`, `Ctrl+Y` | Undo / redo |
| `Ctrl+S` | Save |
| `Map` button (panorama view) | Open tour map in the editor |

---

## 9. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| A door doesn't teleport on the public tour | The hotspot has no target room. Pick a target (Process A), or set **→ target** in the inspector. |
| A room can't be reached | It's orphaned. Add a link to/from it (see §4, use the Map to spot it). |
| Tour shows "Tour not found" | No authored rooms stored yet — add rooms, save, then publish. |
| Default view is wrong per room | Re-set **Set default view** after rotating to the desired angle. |
| Photos missing on info hotspot | Photos live on the hotspot (`images`). Re-add via **+ Add photos from library**. |

---

## 10. Coming soon (do not rely on yet)

- Per-room background audio and view constraints.
- Real view/visit counters.
- One-click export of the whole tour as a `.zip`.
- Floor-plan-aware doors complete with directional arrows.