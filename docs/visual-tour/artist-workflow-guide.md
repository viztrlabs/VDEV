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
| Manage the media library in the left panel (upload / add / delete / dedupe) | ✅ Works |
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
- The **Media Library** panel in the left sidebar is a mini file manager:
  - **Upload** — add new 360° panoramas straight from the panel.
  - **+** on an asset — insert it as a new scene (or click its thumbnail).
  - **🗑** on an asset — delete it from the library (you will be asked to confirm;
    this also removes its cached tiles).
  - **⟳** — refresh the list after uploading elsewhere.
  - Duplicate files are collapsed automatically ("N duplicates hidden") — delete
    the extras you don't need.

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

**Process A — Connect Rooms tool + pick target**
1. Choose the **Connect Rooms** tool (press **C**) from the toolbar.
2. Click on the panorama where the door should live.
3. In the dialog, pick the target room — tick **Create reverse link** if the
   return door should be created too.
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

### 4.1 Hub example — link one scene (00) to many scenes (01, 02, 03, 04)

This is the standard "hub" pattern: the visitor stands in scene **00** and sees
one door/arrow per neighbouring scene.

1. Click scene **00** in the left panel (its panorama opens in the middle).
2. Press **L** (or click **Link Hotspot** in the toolbar).
3. Click on the panorama exactly where the arrow to 01 should sit — usually the
   real doorway / corridor that leads there. The hotspot appears.
4. In the right-hand inspector, pick the target room from the **→ target**
   dropdown — choose **01**.
5. **Stay in link mode.** Click the right spot for the next hotspot, set its
   target to **02**. Repeat for **03** and **04**.
6. You now have 4 separate link hotspots in scene 00 — one per destination.
   There is no limit: one scene can link to every other scene in the tour.
7. Drag any hotspot to fine-tune its position; rename it (e.g. "Kitchen") and
   pick icon/colour in the right-hand inspector.
8. Press **Esc** or click **Cancel** when you are done placing links.

> Hotspots are **glued to the scene**: as you look around in the editor, the
> markers move with the image and stay on the wall/door you pinned them to —
> exactly where visitors will see them on the published tour.

### 4.2 Set the view the visitor lands on (per target)

Every scene has its own **Starting View** — the exact angle the visitor sees
when they arrive through any door (and when the tour opens, for the featured room).

1. Click scene **01** in the left panel.
2. Rotate the panorama to the angle you want people to see first — for example
   the view back towards the door they "came from", or the room's best feature.
3. Press **S** (or right-click the panorama → **Set Starting View**).
   The toast confirms the saved angle, e.g. `Starting view saved: 135° / -5°`.
4. Repeat for **02**, **03**, **04** — each scene remembers its own angle.

That is all "set the view according to the images" means: link from 00 → each
target (§4.1), and give each target its own landing angle (this section).
Verify with **P** (preview): click your links and check where you land.

---

## 5. Hotspots

| Kind | What the visitor sees |
| --- | --- |
| Info / metadata | Popup: title, description, photo grid (1 or 2 columns), optional external link |
| Image | Popup with the image |
| Gallery | Popup with the photo set |
| Video / audio | Popup with title, description and photos (inline player is on the roadmap) |
| Room link / navigation | Teleports to the target scene, honoring its default start view |
| External link | Opens the URL (tap opens a new tab by default) |
| Floor | Teleports to the target floor/scene like a room link |
| Model3D | Marker in the scene; click opens the info popup (inline 3D is on the roadmap) |
| Splat | Marker in the scene; click opens the info popup |
| Experience | Marker in the scene; click opens the info popup |
| Custom | Marker with the icon you picked; click opens the info popup |

Every type gets its own **marker colour** in the visitor view (e.g. navigation
green, info sky-blue, link amber, video rose), so you can spot-check a scene at
a glance.

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

- Press **P** (or the **Preview** tool) inside the editor to walk the current
  room with the exact viewer visitors get: start view, link teleports, popup
  content, scene menu, autorotate and the share dialog all behave the same as
  the published tour.
- Press **Esc** to exit preview.
- After publishing, open the public URL and verify:
  - The featured room is the entry point.
  - Each room's default view is correct.
  - All door links jump to the right room.
  - Image/video/audio popups behave.
  - The **scene menu** (top-left) jumps between rooms, **autorotate** pauses
    when you drag, and **Share** shows a working QR code / link.

---

## 8. Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `V` | Select tool |
| `M` | Move tool |
| `H` | Add hotspot |
| `N` | Add navigation hotspot |
| `C` | Connect Rooms tool |
| `F` | Add info hotspot |
| `L` | Add link hotspot |
| `G` | Add gallery hotspot |
| `I` | Add icon hotspot |
| `3` | Add 3D model hotspot |
| `R` | Rotate view tool |
| `S` | Set the selected scene's starting view (same as right-click → Set Starting View) |
| `A` | Alignment mode |
| `P` | Preview current room |
| `Esc` | Exit preview / deselect / cancel |
| `Delete`, `Backspace` | Delete selected |
| `Ctrl+Z`, `Ctrl+Shift+Z`, `Ctrl+Y` | Undo / redo |
| `Ctrl+S` | Save |
| `?` | Show all shortcuts |
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
| Same panorama appears twice in the library | Exact duplicates (same file/URL) are hidden automatically. Different files of the same shot (e.g. `kitchen.jpg` + `kitchen-1.jpg`) — delete the extra with **🗑** in the Media Library panel. |

---

## 10. Coming soon (do not rely on yet)

- Inline video/audio playback and 3D/splat embedding inside hotspot popups
  (today those hotspots show title/description/photos).
- Per-room background audio and view constraints.
- Real view/visit counters.
- One-click export of the whole tour as a `.zip`.
- Floor-plan-aware doors complete with directional arrows.