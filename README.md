# updown

Markdown to slideshow, served in the browser.

## Features

- Slides from `#`/`##` headings and `---` horizontal rules
- YAML front matter for slideshow metadata
- Meta-fences for per-slide and per-element attributes
- Multi-column layouts with `+++` separator
- Syntax-highlighted code blocks via Shiki
- Excalidraw diagrams rendered as inline SVG
- MermaidJS diagrams (client-side)
- PlantUML diagrams (via local server)
- 15 color themes (light, dark, catppuccin, monokai, gruvbox, nord, solarized, synthwave-84)
- 5 style presets (default, modern, classic, smooth, terminal)
- External CSS file support
- Keyboard navigation and auto-scaling
- Interactive reload (`r`) and quit (`q`)

## Install

```
bun install
```

## Usage

```
bun src/index.ts <path-to-markdown-file>
```

Example using the included demo:

```
bun src/index.ts tests/integration/demo.md
```

Then open `http://localhost:3000` and navigate slides with **ArrowLeft** / **ArrowRight**.

## Slide Format

See [FORMAT.md](FORMAT.md) for the full format reference covering slide creation, front matter, meta-fences, code blocks, and Excalidraw diagrams.
