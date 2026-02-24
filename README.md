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
- 14 built-in color themes (light, dark, catppuccin, monokai, gruvbox, nord, solarized)
- 5 style presets (default, modern, classic, smooth, terminal)
- External theme directories for custom branding (fonts, logos, colors)
- External CSS file support
- Keyboard navigation and auto-scaling (text + SVG diagrams)
- Interactive reload (`r`) and quit (`q`)

## Install

```
bun install
```

## Usage

```
bun src/index.ts [--theme <theme-dir>] <path-to-markdown-file>
```

Example using the included demo:

```
bun src/index.ts tests/integration/demo.md
```

Then open `http://localhost:3000` and navigate slides with **ArrowLeft** / **ArrowRight**.

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port to serve on. Set to `0` for a randomly assigned port. |
| `PLANTUML_JAR` | — | Path to a PlantUML `.jar` file. Required for PlantUML diagram rendering. |

Example:

```
PLANTUML_JAR=/path/to/plantuml.jar PORT=8080 bun src/index.ts presentation.md
```

## Standalone Binary

Pre-built self-contained binaries are available on the [releases page](https://github.com/karlll/updown/releases). No Bun or Node.js installation required.

Each release includes platform-specific zip archives containing the binary, `FORMAT.md`, and `THEMES.md`. A separate `themes.zip` contains the built-in external themes.

**macOS / Linux**

```
unzip updown-darwin-arm64.zip   # or updown-linux-x64.zip etc.
chmod +x updown
./updown [--theme <theme-dir>] presentation.md
```

**Windows**

```
Expand-Archive updown-windows-x64.zip
.\updown.exe [--theme <theme-dir>] presentation.md
```

## Slide Format

See [FORMAT.md](FORMAT.md) for the full format reference covering slide creation, front matter, meta-fences, code blocks, columns, and diagrams.

## Themes and Styles

See [THEMES.md](THEMES.md) for built-in themes and styles, CSS custom properties, external theme directories, and theme variants.
