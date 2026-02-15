---
id: "7cf05e0d-3cb7-4671-b1be-815671d06acf"
number: 15
title: "Render Excalidraw files as inline SVG via server-side export"
createdAt: "2026-02-11T19:52:16.197845Z"
updatedAt: "2026-02-12T19:32:41.125926Z"
assignees:
- "Claude Code"
categories:
- "renderer"
- "excalidraw"
priority: "high"
order: 2
---

## Overview
Support embedding Excalidraw drawings in slides using markdown image syntax (`![](drawing.excalidraw)`). The server reads the `.excalidraw` file, converts it to SVG using `@excalidraw/utils`, and inlines the SVG in the slide HTML.

## Markdown Syntax
Standard image syntax with `.excalidraw` extension:
```markdown
![Architecture diagram](./diagrams/arch.excalidraw)
```
The alt text becomes an accessible label. The path is resolved relative to the markdown file.

## Dependencies
```
bun add @excalidraw/utils happy-dom
```
- `@excalidraw/utils` — provides `exportToSvg()` for server-side SVG conversion
- `happy-dom` — lightweight DOM implementation required by `@excalidraw/utils`

## Implementation

### 1. DOM shim module (`src/excalidraw/dom-shim.ts`)
Encapsulate the happy-dom setup so it runs once at import time and doesn't leak into the rest of the codebase:
- Create a `Window` instance from happy-dom
- Patch globals: `window`, `document`, `navigator`, `HTMLElement`, `HTMLCanvasElement`, `SVGSVGElement`, `SVGElement`, `Element`, `Node`, `DOMParser`, `XMLSerializer`, `URL`, `Blob`, `Image`, `getComputedStyle`, `devicePixelRatio`, `requestAnimationFrame`, `cancelAnimationFrame`, `ResizeObserver`, `matchMedia`, `localStorage`, `fetch`
- Add a `FontFace` shim class (happy-dom doesn't implement it):
  ```typescript
  class FontFaceShim {
    family: string; source: string;
    loaded: Promise<FontFaceShim>; status = "loaded";
    constructor(family: string, source: string, descriptors?: any) {
      this.family = family; this.source = source;
      this.loaded = Promise.resolve(this);
    }
    load() { return this.loaded; }
  }
  ```
- This module must be imported **before** `@excalidraw/utils` since the library reads globals at import time

### 2. Excalidraw renderer (`src/excalidraw/index.ts`)
Export an async function:
```typescript
export async function renderExcalidraw(filePath: string): Promise<string>
```
- Read the `.excalidraw` file (JSON) using `Bun.file()`
- Parse JSON, extract `elements` and `files` (for embedded images)
- Call `exportToSvg({ elements, files, skipInliningFonts: true })`
- Return the SVG as a string (`svg.outerHTML`)
- Handle errors gracefully (file not found, invalid JSON) — return a placeholder or error message

### 3. Detect `.excalidraw` images in the renderer (`src/renderer/nodes.ts`)
In `renderNode()` / `renderInline()`, when encountering an `image` node:
- Check if `node.url` ends with `.excalidraw`
- If so, replace the `<img>` tag with the pre-rendered SVG string
- Otherwise render as normal `<img>`

Since `renderNode` is synchronous and SVG conversion is async, the Excalidraw files need to be **pre-processed before rendering** (similar to how Shiki languages are pre-loaded).

### 4. Pre-process Excalidraw images (`src/index.ts`)
In `loadAndRender()`, after parsing the slideshow:
- Walk all slides and collect image nodes with `.excalidraw` URLs
- Resolve paths relative to the markdown file's directory
- Call `renderExcalidraw()` for each unique file
- Store results in a `Map<string, string>` (path → SVG string)
- Pass this map to `render()` so the synchronous renderer can look up pre-rendered SVGs

### 5. Update `render()` signature (`src/renderer/index.ts`)
Add an optional parameter for pre-rendered content:
```typescript
export function render(
  slideshow: SlideShow,
  fenceRegistry: FenceRegistry,
  navigationScript?: string,
  stylesheet?: string,
  excalidrawSvgs?: Map<string, string>,
): RenderedSlideShow
```
Pass the map through to `renderNode()`.

### 6. CSS for Excalidraw embeds (`src/styles/base.ts`)
Add basic styling for inlined SVGs:
```css
.excalidraw-embed svg {
  max-width: 100%;
  height: auto;
}
```

## File structure
```
src/excalidraw/
  dom-shim.ts    — happy-dom globals setup, imported before @excalidraw/utils
  index.ts       — renderExcalidraw(filePath) → SVG string
```

## Files to modify
- `package.json` — add `@excalidraw/utils`, `happy-dom`
- `src/excalidraw/dom-shim.ts` — new, DOM shim
- `src/excalidraw/index.ts` — new, Excalidraw SVG renderer
- `src/renderer/nodes.ts` — detect `.excalidraw` images, use pre-rendered SVG
- `src/renderer/index.ts` — pass excalidraw SVG map through to node renderer
- `src/index.ts` — pre-process Excalidraw files in `loadAndRender()`
- `src/styles/base.ts` — CSS for embedded SVGs

## Edge cases
- File not found → render a visible error message in the slide (not a silent failure)
- Invalid JSON → same as above
- No `.excalidraw` images → map is empty, no overhead
- Same file referenced multiple times → render once, reuse from map
- Relative paths resolved from the markdown file's directory, not CWD

## Acceptance Criteria
- [ ] `![](drawing.excalidraw)` in markdown renders the drawing as inline SVG in the slide
- [ ] Shapes, text, arrows, and hachure fills render correctly
- [ ] Paths are resolved relative to the markdown file
- [ ] Missing or invalid files show an error message in the slide
- [ ] Existing image syntax (`![](photo.png)`) continues to work unchanged
- [ ] All existing tests pass
- [ ] New tests cover Excalidraw rendering (mock SVG conversion) and path resolution