---
id: "849cd6a7-2fc9-43ad-af72-ded3b8714aa0"
number: 18
title: "Explicit column separator using +++ token"
createdAt: "2026-02-14T16:57:40.416166Z"
updatedAt: "2026-02-14T16:57:40.416166Z"
assignees: []
categories:
- "parser"
- "renderer"
- "styles"
priority: "medium"
order: 2
---

## Overview

Add support for splitting slide content into columns using `+++` as a column separator within a slide. When a slide has the `two-column` (or `multi-column`) class via meta-fence, the `+++` markers control exactly which content goes in which column.

## Usage Example

````markdown
---

```meta
class: two-column
```

## Comparison

Left column content.

- Item 1
- Item 2

+++

Right column content.

- Item A
- Item B
````

This produces:

```html
<div id="slide-2" class="slide two-column">
  <h2>Comparison</h2>
  <div class="column">
    <p>Left column content.</p>
    <ul><li>Item 1</li><li>Item 2</li></ul>
  </div>
  <div class="column">
    <p>Right column content.</p>
    <ul><li>Item A</li><li>Item B</li></ul>
  </div>
</div>
```

## Requirements

### Parser changes (`src/parser/`)

- Detect `+++` in the markdown source as a column break marker. In mdast, `+++` is parsed as a `thematicBreak` node (same as `---` and `***`). The parser needs to distinguish `+++` from `---`/`***`. Options:
  - Use remark's position data to inspect the original source and check whether the break was `+++`
  - Or add a pre-processing step that replaces `+++` with a recognizable marker (e.g. an HTML comment `<!-- column-break -->`) before parsing
- Extend the `Slide` type to support column groups. Possible approach: add an optional `columns: RootContent[][]` field to `Slide`, where each inner array is one column's nodes. If no `+++` is present, `columns` is undefined and rendering is unchanged.
- `+++` must NOT start a new slide — it is a within-slide separator only
- `+++` should not be rendered as an `<hr>` element
- Multiple `+++` in one slide should create multiple columns (not just two)
- Content before the first `+++` that is NOT a heading goes into column 1. Headings before the first `+++` span the full width (rendered outside the column wrappers).

### Renderer changes (`src/renderer/`)

- When a slide has `columns` defined, wrap each column group in `<div class="column">...</div>`
- Nodes before the first `+++` (typically the slide heading) are rendered before the column divs
- The column divs are wrapped in a `<div class="columns">` container for CSS targeting

### Style changes (`src/styles/`)

- Add CSS for `.columns` container: `display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: 2rem;`
- Add CSS for `.column`: basic styling to ensure content flows correctly
- The column layout should work regardless of theme

### Edge cases

- `+++` with no content on either side: produce empty column divs
- `+++` at the start of a slide (before any content): first column is empty
- Multiple `+++` in sequence: produce empty columns between them
- `+++` in a slide without `two-column` class: still split into columns (the CSS class is just for opting into the grid layout, but the structural split always happens when `+++` is present)

## Acceptance Criteria

- [ ] `+++` splits slide content into columns wrapped in `<div class="column">`
- [ ] `+++` does not create a new slide
- [ ] `+++` is not rendered as `<hr>`
- [ ] Multiple `+++` produce multiple columns
- [ ] Heading before first `+++` spans full width
- [ ] Column layout renders correctly with grid CSS
- [ ] Existing slides without `+++` are unaffected
- [ ] Works with all themes