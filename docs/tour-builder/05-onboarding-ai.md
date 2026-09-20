# Part 5 — Onboarding, AI Assistant, and Visual Feedback

## 46. Onboarding

When a new user opens an empty tour, show:

```
Welcome to VizTR Tour Builder

1. Upload 360 images
2. Create rooms
3. Connect rooms
4. Add hotspots
5. Preview
6. Publish

[Start Building]
```

Provide a guided first-tour mode.

## 47. Empty State

If no rooms exist:

```
Your tour is empty.

Upload your 360 panoramas to begin.

[Upload 360 Images]
```

After upload:

```
Your panoramas are ready.

Create rooms automatically or manually.

[Auto Create Rooms]  [Create Manually]
```

## 48. Auto Tour Creation

Provide an optional AUTO BUILD TOUR. The system should analyze filenames and create: Rooms, Floors, Room names, Thumbnails.

It should NOT automatically create potentially incorrect navigation without user review. Instead: AI/Auto suggestion -> Artist Review -> Confirm.

## 49. AI Assistant

Add an optional Tour Assistant. The artist can ask:

- "Create navigation from Living Room to Kitchen."
- "Add an information hotspot about the marble flooring."
- "Rename these rooms according to the floor plan."
- "Find rooms that don't have a navigation connection."
- "Check my tour for broken links."

The AI must perform actions only after appropriate confirmation.

## 50. Natural-Language Commands

Support commands such as:

- "Connect Living Room to Kitchen."
- "Add an info hotspot here."
- "Change this hotspot to an arrow."
- "Point this arrow toward the kitchen."
- "Set this view as the starting view."
- "Add these three images as a gallery."
- "Create a navigation hotspot to the Master Bedroom."
- "Duplicate this hotspot."
- "Hide this hotspot."
- "Change the icon to a camera."
- "Open the Gaussian Splat experience from this location."
- "Align the tour with the splat."
- "Preview this room."
- "Check the tour for errors."
- "Publish the tour."

The natural-language system maps commands to the same underlying builder actions rather than create a separate implementation.

## 51. Visual Action Feedback

Every action should produce visible feedback. Examples:

- Navigation created
- Gallery added
- Starting view saved
- Hotspot icon changed
- Alignment saved
- Tour saved
- Tour published

Errors:

> Destination room does not exist. [Select Destination]

Never leave the artist wondering whether an action succeeded.
