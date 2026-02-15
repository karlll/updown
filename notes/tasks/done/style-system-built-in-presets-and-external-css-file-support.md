---
id: "6b90a94e-a484-4480-9f11-fe007f79e0e7"
number: 19
title: "Style system: built-in presets and external CSS file support"
createdAt: "2026-02-14T17:34:46.971263Z"
updatedAt: "2026-02-14T17:50:30.626477Z"
assignees:
- "Claude Code"
categories:
- "styles"
- "parser"
- "renderer"
priority: "medium"
order: 3
---

## Overview

Add a `style` front matter key, orthogonal to `theme`, that controls non-color visual aspects: typography, spacing, heading decoration, border treatments, and slide layout defaults. Supports built-in named presets and external CSS file references.

```yaml
---
theme: catppuccin-mocha   # colors
style: modern             # layout, fonts, decoration
---
```

## Design

### Separation of concerns

| Aspect | `theme` (existing) | `style` (new) |
|---|---|---|
| Background / foreground | Yes | No |
| Syntax highlight colors | Yes | No |
| Link / blockquote colors | Yes | No |
| Font families | No | Yes |
| Font sizes / scale | No | Yes |
| Spacing / padding | No | Yes |
| Heading decoration | No | Yes |
| Border radius | No | Yes |
| Content max-width | No | Yes |
| Line height | No | Yes |

### CSS custom properties controlled by style

The base CSS (`base.ts`) currently hardcodes typography and spacing values. These should be replaced with CSS custom properties that styles set:

```css
/* Typography */
--font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
--font-family-heading: var(--font-family);
--font-family-code: ui-monospace, "Cascadia Code", "JetBrains Mono", Menlo, monospace;
--font-size-base: 1.5rem;
--line-height: 1.6;
--line-height-heading: 1.2;

/* Heading scale (relative to font-size-base via em) */
--h1-size: 2.5em;
--h2-size: 2em;
--h3-size: 1.5em;
--h4-size: 1.25em;

/* Heading decoration */
--heading-weight: 700;
--heading-transform: none;        /* none | uppercase */
--heading-letter-spacing: normal;
--heading-margin-bottom: 0.75em;

/* Layout */
--slide-padding: 4rem 6rem;
--content-max-width: none;        /* none | 800px | 60ch etc. */
--block-margin: 0.75em;           /* margin-bottom for p, pre, ul, ol, table, blockquote */

/* Decoration */
--border-radius: 8px;             /* code blocks, images */
--border-radius-inline: 4px;      /* inline code */
```

### Built-in styles

#### `default`
Current look — system-ui font stack, standard spacing. This is what you get when `style` is omitted.

#### `modern`
Clean, geometric, spacious:
- Font: `"Inter", "Helvetica Neue", sans-serif` (system fallbacks, no web font loading)
- Larger headings: h1 3em, h2 2.25em
- Uppercase h1 with letter-spacing
- More slide padding: `5rem 8rem`
- Tighter line height for headings: 1.1
- Larger border-radius: 12px
- Content max-width for readability

#### `classic`
Traditional, editorial:
- Font: `Georgia, "Times New Roman", serif`
- Heading font: `Georgia, serif` with normal weight (600 instead of 700)
- Italic h3/h4
- Smaller base font: 1.4rem
- Standard heading sizes but tighter margin
- Smaller border-radius: 4px
- Narrower content max-width

### External CSS file support

When `style` contains a `/` or `.`, treat it as a file path resolved relative to the markdown file:

```yaml
---
style: ./styles/my-company.css
---
```

The file is read at render time (in `loadAndRender()`), and its contents are injected as a second `<style>` block after the base+theme stylesheet. This lets users:
- Override any CSS custom property
- Add entirely new CSS rules (e.g., custom slide layouts, background images)
- Build on top of the base CSS rather than replacing it

If the file doesn't exist, log a warning and continue with default style.

### Resolution rules

1. No `style` key → use `default` built-in style
2. `style: modern` → look up in built-in styles map
3. `style: ./path/to/file.css` → read file relative to markdown
4. Unknown bare name → warn, fall back to `default`

## Requirements

### New file: `src/styles/styles.ts`

- Define `Style` type with CSS custom property values
- Export built-in styles map: `Record<string, Style>`
- Export `defaultStyle` constant
- Export function to generate CSS custom property declarations from a Style object

### Modify: `src/styles/base.ts`

- Replace hardcoded font families, sizes, spacing, border-radius with `var(--prop)` references
- All existing visual behavior should be unchanged when using the `default` style (the default style's values match current hardcoded values)

### Modify: `src/styles/index.ts`

- `generateStylesheet()` accepts style name/CSS in addition to theme name
- Output order: style custom properties → theme custom properties → base CSS rules
- Style properties go on `:root` alongside theme properties

### Modify: `src/index.ts`

- Read `style` from front matter (from `data-fm-style` attribute)
- If it's a file path: read the file relative to markdown dir (async, in `loadAndRender()`)
- Pass style info to `generateStylesheet()`
- Remove `data-fm-style` from the slideshow div attributes (like `theme` is consumed, not rendered)

### Modify: `src/parser/frontmatter.ts`

- `style` key should be consumed like `theme` — not rendered as `data-fm-style` on the div

## Acceptance Criteria

- [ ] `style: modern` applies different typography and spacing
- [ ] `style: classic` applies serif fonts and editorial look
- [ ] No `style` key produces identical output to current behavior
- [ ] `style: ./custom.css` loads and injects external CSS
- [ ] Missing external CSS file logs warning, falls back to default
- [ ] Unknown style name logs warning, falls back to default
- [ ] Style and theme are independent — any combination works
- [ ] All existing tests pass unchanged (default style matches current output)
- [ ] External CSS can override custom properties and add new rules