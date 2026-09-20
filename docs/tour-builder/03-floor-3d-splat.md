# Part 3 — Floor Navigation and 3D/Splat Integration

## 23. Floor Navigation

Create a dedicated FLOOR command. Allow: Ground Floor, First Floor, Second Floor, Terrace, Basement, Landscape.

The public tour should optionally expose a floor selector.

## 24. 3D Model Integration

Provide 3D MODEL as a first-class experience/content type. Supported inputs: GLB, GLTF.

Workflow: Upload/Select Model, Place Model, Position, Rotate, Scale, Configure interaction, Save. Do not require coding.

## 25. 3D Model Hotspot

Example: Living Room -> [3D Model] -> Furniture/Product/Architectural Object.

Possible uses: furniture, kitchen equipment, product model, architectural detail, sculpture, building component.

Inspector: Model, Position, Rotation, Scale, Initial View, Interaction.

## 26. Gaussian Splat Integration

Treat Gaussian Splat as a specialized experience. Do not confuse Splat Asset with Splat Experience.

Workflow: Select Splat Experience, Select published/available Splat Asset, Configure viewer, Configure spatial alignment, Save.

## 27. Tour-Splat Connection

Provide a visual action: CONNECT EXPERIENCE.

Example: Virtual Tour <-> Gaussian Splat.

The user should not need to understand the underlying data model. Possible public controls: [ TOUR ] [ SPLAT ] or [ Explore 360 ] [ Explore 3D ].

## 28. Spatial Alignment

When Tour and Splat are connected, ALIGN opens Alignment Mode. Provide: Manual Alignment, Landmark Alignment, Auto Calibration.

## 29. Landmark Workflow

Shortcut: A. Open Alignment Mode. Then: Add Landmark.

Place corresponding points in Panorama <-> Splat / 3D scene. Examples: Column Corner, Door Corner, Window Corner, Building Edge, Furniture Anchor, Pool Corner.

Show: Landmark 01, Landmark 02, Landmark 03. Minimum recommended: 3+ reliable landmarks.

## 30. Manual Alignment Controls

Provide visual controls: Move, Rotate, Scale, Reset, Fit, Center, Auto Align.

Do not force numerical editing. Advanced mode may expose: Position X/Y/Z, Rotation X/Y/Z, Scale.

## 31. Camera Synchronization

When multiple experiences support shared spatial context: Tour <-> Shared Experience Context <-> Splat <-> PlayCanvas.

The user should be able to switch experiences without feeling they entered an unrelated application.

Public controls: Tour | Splat | 3D | XR. The transition should preserve relevant camera context where supported.
