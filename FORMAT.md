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
| `catppuccin-mocha` | Catppuccin dark variant |
| `catppuccin-latte` | Catppuccin light variant |

```markdown
---
theme: catppuccin-mocha
---
```

Each theme applies matching colors to both the slide layout and syntax-highlighted code blocks. If the `theme` key is omitted or unrecognized, `light` is used.

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
