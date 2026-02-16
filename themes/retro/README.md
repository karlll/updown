# Retro Theme

A neon-glow dark theme inspired by [Synthwave '84](https://github.com/robb0wen/synthwave-vscode) by Robb Owen. Combines the synthwave color palette with a monospace terminal-style layout.

## Features

- Synthwave '84 color scheme (neon pink, cyan, green on deep purple)
- Custom [TopazNG](https://codeberg.org/ideasman42) fonts by Campbell Barton
- Neon glow text-shadow effects on headings, links, and bold text
- CRT scanline overlay
- Watermark logo on the first slide

## Usage

Place this directory where updown can find it, then select it in your markdown front matter:

```markdown
---
theme: retro
style: retro
---
```

Or load it explicitly via the CLI:

```
bun src/index.ts --theme /path/to/retro slides.md
```

## Attributions

- Color scheme based on [Synthwave '84](https://github.com/robb0wen/synthwave-vscode) by Robb Owen, licensed under MIT
- [TopazNG](https://codeberg.org/ideasman42) fonts by Campbell Barton
- Shiki syntax highlighting uses the `synthwave-84` theme
