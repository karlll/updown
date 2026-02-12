# updown

Markdown to slideshow, served in the browser.

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
