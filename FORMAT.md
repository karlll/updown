# updown Slide Format

## Slides

Every markdown file produces a slideshow. Slides are created by headings and horizontal rules.

### Headings

`#` (h1) and `##` (h2) start a new slide. The heading becomes the first element of that slide. Lower-level headings (`###` through `######`) do **not** create new slides.

```markdown
# First Slide

Content here.

## Second Slide

More content.

### Still on the second slide
```

### Horizontal Rules

`---` starts a new slide below it. The rule itself is not rendered.

```markdown
Some content on slide 1.

---

This is slide 2.
```

### Combined: `---` + Heading

A `---` followed by `#` or `##` produces **one** slide transition, not two.

```markdown
Slide 1 content.

---

## This starts slide 2 (not slide 3)
```

### Content Before Any Heading

Content that appears before the first heading or `---` goes into slide 1.

---

## Front Matter

YAML front matter at the top of the document is parsed as metadata for the slideshow container. It is never rendered as slide content.

````markdown
---
theme: dark
count: 42
tags:
  - a
  - b
class:
  - wide
  - centered
---

# First Slide
````

**Rules:**

- Values can be strings, numbers, or flat arrays of strings/numbers. Objects and nested arrays are ignored.
- Array values become space-separated strings.
- Keys are added as `data-fm-` prefixed attributes on the slideshow div.
- The `class` key is special — it becomes a regular `class` attribute (no prefix).
- The `theme` key selects the color theme (see [Themes](#themes) below).

The example above produces:

```html
<div id="slideshow" class="wide centered" data-fm-theme="dark" data-fm-count="42" data-fm-tags="a b">
```

---

## Meta-Fences

A fenced code block with the language `meta` attaches metadata to a nearby element. It is never rendered.

### On Elements

Place a meta-fence directly after an element to add attributes to it:

````markdown
## My Heading

```meta
color: red
class:
  - highlight
  - large
```
````

This adds `data-meta-color="red"` and `class="highlight large"` to the `<h2>` tag. The same YAML rules as front matter apply (the `class` key has no prefix, everything else gets `data-meta-`).

### On Slides

Place a meta-fence directly after a `---` to add attributes to the slide div:

````markdown
---

```meta
class: dark-background
transition: fade
```

Content on this styled slide.
````

This adds `class="dark-background"` and `data-meta-transition="fade"` to the slide's wrapping `<div>`.

A `---` followed by a meta-fence and then a heading still produces a single slide transition:

````markdown
---

```meta
class: hero
```

# Welcome

The meta-fence styles the slide div, the heading is the first content.
````

---

## Code Fences

Fenced code blocks (other than `meta`) are rendered as HTML. If the language is recognized by Shiki, the code is syntax-highlighted with colors matching the current theme. Otherwise it falls back to plain rendering:

```html
<div class="fence {language}"><pre>{content}</pre></div>
```

The language identifier becomes a CSS class. Content is HTML-escaped in plain mode.

---

## Excalidraw Diagrams

Images referencing `.excalidraw` files are rendered as inline SVG, with Excalidraw's fonts embedded:

```markdown
![Architecture diagram](./diagrams/arch.excalidraw)
```

The path is resolved relative to the markdown file. The alt text becomes an `aria-label` on the embedding element. If the file is missing or contains invalid JSON, an error message is shown in the slide.

Regular images (`.png`, `.jpg`, etc.) continue to render as normal `<img>` tags.

---

## Mermaid Diagrams

Fenced code blocks with the language `mermaid` are rendered as diagrams in the browser:

````markdown
```mermaid
graph LR
    A[Markdown] --> B[Parser]
    B --> C[Renderer]
    C --> D[HTML]
```
````

All diagram types supported by MermaidJS work — flowcharts, sequence diagrams, class diagrams, state diagrams, etc. The diagram theme automatically matches the slideshow theme (light themes use mermaid's "default" theme, dark themes use "dark").

The mermaid library is only loaded when the document contains mermaid code fences.

---

## PlantUML Diagrams

Fenced code blocks with the language `plantuml` are rendered as diagrams via a local PlantUML server:

````markdown
```plantuml
@startuml
Alice -> Bob: Hello
Bob --> Alice: Hi there
@enduml
```
````

A PlantUML server is started automatically when the document contains plantuml code fences. The server requires Java and the PlantUML JAR file (defaults to `tools/plantuml/plantuml.jar`, overridable via `PLANTUML_JAR` env var). The server port defaults to 18123 (overridable via `PLANTUML_PORT`).

All diagram types supported by PlantUML work — sequence diagrams, class diagrams, activity diagrams, component diagrams, etc.

---

## Slide Structure

The rendered HTML follows this structure:

```html
<div id="slideshow" {front-matter-attributes}>
  <div id="slide-1" class="slide first {slide-meta-classes}" {slide-meta-attrs}>
    <!-- slide content -->
  </div>
  <div id="slide-2" class="slide" ...>...</div>
  <div id="slide-N" class="slide last" ...>...</div>
</div>
```

- The first slide div gets the class `first`, the last gets `last`.
- A single-slide deck gets both `first` and `last`.

---

## Themes

The `theme` front matter key selects the color scheme for the slideshow. Available themes:

| Theme | Description |
|---|---|
| `light` | Light background, dark text (default) |
| `dark` | Dark background, light text |
| `catppuccin-latte` | Catppuccin pastel light |
| `catppuccin-frappe` | Catppuccin mid-tone dark |
| `catppuccin-macchiato` | Catppuccin deeper dark |
| `catppuccin-mocha` | Catppuccin darkest |
| `monokai-dark` | Classic Monokai dark |
| `monokai-light` | Monokai-inspired light |
| `gruvbox-dark` | Gruvbox retro dark |
| `gruvbox-light` | Gruvbox retro light |
| `nord-dark` | Nord arctic dark |
| `nord-light` | Nord arctic light |
| `solarized-dark` | Solarized dark |
| `solarized-light` | Solarized light |

```markdown
---
theme: catppuccin-mocha
---
```

Each theme applies matching colors to both the slide layout and syntax-highlighted code blocks. If the `theme` key is omitted or unrecognized, `light` is used.

---

## Styles

The `style` front matter key controls non-color visual aspects — typography, spacing, heading decoration, and border treatments. It is independent of the color theme: any style works with any theme.

```markdown
---
theme: catppuccin-mocha
style: modern
---
```

### Built-in styles

| Style | Description |
|---|---|
| `default` | System sans-serif font, standard spacing (used when `style` is omitted) |
| `modern` | Inter/Helvetica, larger headings, uppercase h1, more whitespace, rounded corners |
| `classic` | Georgia serif font, traditional typography, tighter heading margins |

### CSS properties controlled by style

Styles set CSS custom properties that the base stylesheet references:

| Property | What it controls |
|---|---|
| `--font-family` | Body text font |
| `--font-family-heading` | Heading font |
| `--font-family-code` | Code block font |
| `--font-size-base` | Base font size |
| `--line-height` | Body line height |
| `--h1-size` .. `--h4-size` | Heading sizes |
| `--heading-weight` | Heading font weight |
| `--heading-transform` | Heading text transform (e.g. `uppercase`) |
| `--heading-letter-spacing` | Heading letter spacing |
| `--slide-padding` | Slide padding |
| `--block-margin` | Margin below paragraphs, lists, code blocks |
| `--border-radius` | Border radius for code blocks and images |
| `--border-radius-inline` | Border radius for inline code |

### External CSS file

Instead of a built-in name, `style` can reference a CSS file relative to the markdown file:

```markdown
---
style: ./my-style.css
---
```

The external CSS is appended after the base stylesheet. It can override any CSS custom property or add new rules:

```css
:root {
  --font-family: "Fira Sans", sans-serif;
  --slide-padding: 3rem 4rem;
}

.slide { background-image: url("pattern.svg"); }
```

If the file is not found, a warning is logged and the default style is used.

---

## Columns

Use `+++` to split slide content into columns. Each `+++` creates a new column boundary.

```markdown
## Comparison

Left column content.

- Item 1
- Item 2

+++

Right column content.

- Item A
- Item B
```

This produces:

```html
<div id="slide-1" class="slide first last">
  <h2>Comparison</h2>
  <div class="columns">
    <div class="column">
      <p>Left column content.</p>
      <ul><li>Item 1</li><li>Item 2</li></ul>
    </div>
    <div class="column">
      <p>Right column content.</p>
      <ul><li>Item A</li><li>Item B</li></ul>
    </div>
  </div>
</div>
```

### Rules

- `+++` is a **within-slide** separator — it does not create a new slide
- `+++` is not rendered (it is consumed, like `---`)
- Multiple `+++` produce multiple columns
- Headings (`#`/`##`) before the first `+++` span the full width (rendered above the columns)
- Non-heading content before the first `+++` goes into the first column
- Columns are laid out using CSS grid (`repeat(auto-fit, minmax(0, 1fr))`) and work with any theme
- Slides with columns get a `has-columns` class; padding moves from the slide to each column, so column backgrounds fill edge-to-edge

### Styling columns

Because each column handles its own padding, setting a background color on a `.column` fills the full grid cell from edge to edge. Use a slide-level meta-fence class to target specific columns:

````markdown
---

```meta
class: accent-last-column
```

## Comparison

Left content.

+++

Right content with accent background.
````

The built-in `accent-last-column` utility sets the last column's background to the theme's code background color (`--code-bg`). Custom classes can be styled via an external CSS file (see [Styles](#styles)).

---

## Keyboard Controls

| Key | Action |
|---|---|
| ArrowRight | Next slide |
| ArrowLeft | Previous slide |
| f | Toggle fullscreen |
| Escape | Exit fullscreen |

---

## Auto-Scaling

Slide content is automatically scaled to fit the viewport. When content would overflow the visible area, the font size is reduced until everything fits. This applies to all text, headings, code blocks, and margins proportionally. If the content fits at the default size, no scaling is applied.
