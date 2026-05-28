# Implementation Plan - CAD-Grade Precision Mouse Refinements

We will implement deep systems-level mouse interaction refinements across both the **Team Timeline** (`team.tsx`) and the **TrackMap Canvas** (`TrackMap.tsx`). This shifts the application from mere visual authenticity to CAD-level **interaction authenticity**.

---

## 🏎️ Interaction Refinements & Success Criteria

1. **Precision Cursor States (`cursor: grabbing` & `cursor: crosshair`)**
   - When the user is actively panning (`e.buttons === 3`), update the canvas cursor to `grabbing` immediately.
   - When the user is in a zoomable hover zone (holding LMB), show a `crosshair` cursor to communicate focus.

2. **Hard Domain Bounds Clamping (No Elastic Drift)**
   - Lock panning coordinates on the TrackMap within strict containment limits based on current zoom:
     - `maxX = (W - vbW) / 2`
     - `maxY = (H - vbH) / 2`
     - Panning offsets `pan.x` and `pan.y` will clamp strictly within `[-maxX, maxX]` and `[-maxY, maxY]`. This prevents coordinate drift, empty space exposure, and precision floating artifacts.

3. **Inertial Scroll Dampening (Premium Easing)**
   - Add a lightweight `requestAnimationFrame` rendering loop for the TrackMap canvas.
   - Zooming and wheel scrolls will update a target coordinate, then smoothly interpolate at a responsive `0.25` rate per frame.
   - Panning/dragging actions will remain direct (`instant = true`) with zero lag to preserve pixel-perfect mouse tracking.

4. **High-Density Telemetry HUD Overlays**
   - Render instrument-grade translucent HUD panels:
     - **TrackMap HUD:** Displays current zoom multiplier (e.g. `4.20X`) and dynamic X/Y coordinate pan offsets in real-time.
     - **Team Timeline HUD:** Displays zoom level, active window time margins (e.g. `12M → 72M`), and temporal span details (e.g. `SPAN 60M`).

5. **Stable Container Pointer Captures**
   - Bind pointer captures to `e.currentTarget` (the entire SVG canvas itself) instead of the individual sub-path targets. This prevents losing panning focus when dragging rapidly outside target paths.

---

## 🛠️ Proposed Changes

### 1. TrackMap Component (`src/components/workbench/TrackMap.tsx`)

#### [MODIFY] [TrackMap.tsx](file:///c:/Dev/iRacing-Companion/src/components/workbench/TrackMap.tsx)
- Define `targetZoomRef`, `targetPanRef`, and `animRef` refs.
- Build a unified, frame-interpolated `animateTo(nz, np, instant)` update loop.
- Insert the `clampPan(p, zoom)` domain clamping function.
- Update `onPointerDown`, `onPointerMove`, `onPointerUp`, and `onPointerCancel` to bind to `e.currentTarget.setPointerCapture` and clamp panning offsets.
- Append a translucent timing-desk `<div className="absolute top-2 left-2 ...">` overlay showing zoom ratio and pan coordinates.
- Set pointer cursors dynamically depending on mouse buttons active:
  - Dragging / Pan active: `grabbing`
  - Zooming / Wheel active (LMB held): `crosshair`
  - Pan ready (Zoom > 1): `grab`

---

### 2. Team Page (`src/routes/team.tsx`)

#### [MODIFY] [team.tsx](file:///c:/Dev/iRacing-Companion/src/routes/team.tsx)
- Enforce hard bounds checking on the timeline horizontal drag pan and wheel zoom.
- Append a timing-desk style `<div className="absolute top-10 right-2 ...">` overlay showing the temporal span, bounds start/end minutes, and zoom factor whenever `timelineZoom > 1.0`.
- Update container cursors dynamically depending on drag or LMB hold states:
  - Dragging active: `cursor-grabbing`
  - Zooming active (LMB held): `cursor-crosshair`
  - Normal hover: `cursor-ew-resize`

---

## 🔍 Technical Verification Plan

- Run static compiler checks:
  ```powershell
  npx tsc --noEmit
  ```
- Verify SSR production bundle:
  ```powershell
  npm run build
  ```
