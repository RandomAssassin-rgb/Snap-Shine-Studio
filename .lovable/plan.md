
## What ships

A new **Classic Film Strips** collection inside the existing Booth. Existing layouts, filters, controls and export flow stay exactly as they are — this is purely additive.

## Scope (in this pass)

1. **New renderer** — `src/lib/film-strip.ts`
   - Draws the "Dual Vertical Film Strip" on a canvas: white canvas → two vertical black strips → rounded corners → punched sprocket holes along both sides → N photo cells stacked with equal gaps → bottom branding band (event name / date / logo / QR — any hideable).
   - Fully parameterized by a `FilmStripConfig` object. Same renderer powers all 12 presets.
   - Supports 2 / 3 / 4 / 5 / 6 photos per strip; total = per-strip × 2.

2. **12 premium presets** — `src/lib/film-strip-presets.ts`
   ```
   Dual Vertical (default), Minimal White, Retro Film, Vintage Brown,
   Polaroid Strip, Wedding Strip, Birthday Strip, Luxury Gold,
   Neon Strip, Scrapbook, Magazine Cover, Instagram Grid, Passport Sheet
   ```
   Each preset is a config object (colors, radii, spacing, sprocket style, label styling). Presets appear as a new **Classic Film Strips** category in the existing Templates picker on `/booth`.

3. **Booth integration** — additive changes to `src/routes/booth.tsx`
   - When a film-strip preset is selected, capture count auto-matches `perStrip × 2`.
   - After all shots are captured, `renderFilmStrip()` is used instead of `renderStrip()`.
   - The existing strip preview / save / share / cloud upload flow is reused unchanged.

4. **Customization panel** — new `FilmStripEditor` sheet, opened from the Templates panel with an "Edit template" button. Controls:
   - Photos per strip (2–6), Background color, Film border color, Sprocket color, Border thickness, Corner radius, Shadow on/off, Inner spacing, Outer margins, Strip spacing, Logo position (top / bottom / hidden), Text position, Date format, Show/hide: event name, date, logo, QR.
   - Live preview canvas re-renders on every change (debounced).
   - Touch-friendly: sliders + segmented controls; grid stacks on mobile.

5. **Photo re-ordering** — small strip-order tray under the preview
   - Drag-and-drop reorder (`@dnd-kit/core` + `@dnd-kit/sortable`, mobile-friendly).
   - Buttons: Duplicate shot, Randomize order, Retake.

6. **Export** — `src/lib/film-strip-export.ts`
   - PNG, JPG (canvas.toBlob).
   - PDF via `jspdf` (embed the rendered canvas at 300 DPI).
   - Resolution picker: `1080×1920`, `2048×4096`, `300 DPI print` (renderer takes `width`/`height`; math scales sprocket + text proportionally so nothing looks pixelated at any size).

7. **User template library** — localStorage-backed for now
   - `src/lib/film-strip-library.ts` — save / duplicate / rename / delete / favorite / list.
   - Custom templates appear alongside presets in the Templates picker with a ★ marker; a small kebab menu exposes rename / duplicate / delete / favorite.
   - Cloud sync is out of scope for this pass (can be added later without changing the API).

## Out of scope (this pass)

- Cloud-persisted custom templates (localStorage only).
- Uploading a custom logo image (logo shown as text mark; upload can slot in later — the config already carries a `logoDataUrl?` field).
- Reworking the existing non-film-strip layouts.

## File map

```
src/lib/film-strip.ts              new — canvas renderer
src/lib/film-strip-presets.ts      new — 12 presets
src/lib/film-strip-export.ts       new — png/jpg/pdf export
src/lib/film-strip-library.ts      new — save/rename/etc.
src/components/film-strip/
  FilmStripPreview.tsx             new — live canvas preview
  FilmStripEditor.tsx              new — customization panel
  SortableShots.tsx                new — dnd-kit tray
src/routes/booth.tsx               edited — add category + wiring
src/lib/layouts.ts                 unchanged (film strips live in their own registry so existing LayoutIds don't shift)
```

## Technical notes

- Renderer signature: `renderFilmStrip(shots: HTMLCanvasElement[], cfg: FilmStripConfig, size: {w:number;h:number}) → {blob, dataUrl, canvas}`.
- Sprocket holes drawn as evenly spaced rounded rects along each strip's left and right gutters; count derived from strip height so density stays consistent across export sizes.
- All colors, radii and spacing values are stored as ratios where possible so resolution changes don't require re-tuning presets.
- New deps: `jspdf`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.

## What stays untouched

- Existing `LAYOUTS`, `renderStrip`, live filters, camera hook, gallery, event, print, AI tools routes.
- All existing capture / save / share / cloud paths.
