# updown — Design Document

## 1. Architecture Overview

### Data Flow

```
                        ┌──────────┐
   slides.md ──────────►│  Parser  │
   (CLI arg)            └────┬─────┘
                             │ SlideShow (intermediate format)
                             ▼
                        ┌──────────┐
                        │ Renderer │
                        └────┬─────┘
                             │ HTML strings
                             ▼
                       ┌────────────┐        HTTP          ┌─────────┐
                       │ Controller │◄─────────────────────│ Browser │
                       │ Bun.serve  │──────────────────────►         │
                       └────────────┘                      └─────────┘
```

The application is a pipeline with three stages: **parse**, **render**, **serve**. The markdown file is read once at startup (path provided as a CLI argument), parsed into an intermediate `SlideShow` structure, and then rendered into HTML. The controller holds the rendered output in memory and serves it over HTTP.

### Component Responsibilities

**Parser** — Stateless, pure transformation. Takes a markdown string, returns a `SlideShow`. Internally it:

1. Produces an mdast AST from the raw markdown
2. Extracts front matter
3. Splits the AST into slides
4. Processes meta-fences

**Renderer** — Stateless, pure transformation. Takes a `SlideShow`, returns HTML strings. Internally it:

1. Renders each slide's mdast nodes to HTML
2. Wraps slides in the required div structure
3. Delegates fenced code blocks to a pluggable fence registry

**Controller** — The runtime shell. Reads the file, wires parser to renderer, and serves the results over HTTP. It also injects client-side navigation JavaScript into the served HTML.

### Intermediate Format: `SlideShow`

The intermediate format is the contract between parser and renderer. It represents the fully analyzed markdown: front matter extracted, slides split, meta-fences resolved. The renderer never needs to reason about slide-splitting rules or YAML — it just walks the structure and emits HTML.

```
SlideShow
├── frontMatter: Record<string, string>   (resolved to final attribute strings)
├── cssClasses: string[]                  (the special "class" key, separated out)
└── slides: Slide[]
    └── Slide
        ├── index: number                 (1-based)
        ├── metadata: NodeMetadata        (slide-level metadata from meta-fences after ---)
        └── nodes: MdastNode[]            (mdast content nodes, meta-fences already removed,
                                           metadata already attached to target nodes)
```

### Fence Plugin System

Fenced code blocks are routed through a registry keyed by the fence language identifier. Three categories:

| Identifier | Behavior |
|---|---|
| `meta` | Parsed as YAML metadata, never rendered (handled in parser) |
| Registered plugin (e.g. `mermaid`) | Delegated to plugin's render function |
| Anything else (e.g. `python`) | Default: `<div class="fence {lang}"><pre>...</pre></div>` |

The registry is a simple `Map<string, FencePlugin>`. Plugins are registered at startup. For now, only the default renderer exists; Mermaid/PlantUML plugins will be added later by implementing the `FencePlugin` interface and registering them.

### HTTP Interface

| Route | Response |
|---|---|
| `GET /` | Full HTML document with all slides, navigation JS, and styles |
| `GET /slide/:n` | HTML fragment for slide `n` (the inner content of the slide div) |

The root route serves a complete, self-contained page. The `/slide/:n` endpoint is a supplementary API for programmatic access — the browser's initial load does not depend on it.

---

## 2. Technical Implementation

### 2.1 Project Structure

```
src/
├── index.ts                  # Entry point (controller)
├── parser/
│   ├── index.ts              # parse(markdown: string): SlideShow
│   ├── frontmatter.ts        # Front matter extraction and YAML parsing
│   ├── slides.ts             # Slide-splitting algorithm
│   ├── meta.ts               # Meta-fence processing
│   └── types.ts              # SlideShow, Slide, NodeMetadata types
├── renderer/
│   ├── index.ts              # render(slideshow: SlideShow): RenderedSlideShow
│   ├── nodes.ts              # mdast node → HTML conversion
│   ├── fence.ts              # FencePlugin interface, registry, default renderer
│   └── types.ts              # RenderedSlideShow, FencePlugin types
└── navigation/
    └── index.ts              # Generates the client-side navigation <script>
```

### 2.2 Dependencies

| Package | Purpose |
|---|---|
| `unified` | Text processing pipeline framework |
| `remark-parse` | Markdown → mdast parser |
| `remark-frontmatter` | Adds `yaml` node type to mdast for front matter blocks |
| `remark-gfm` | GitHub Flavored Markdown support (tables, strikethrough) |
| `yaml` | YAML string → JS object parsing (for front matter and meta-fences) |

All installed via `bun install`. No runtime HTTP framework — `Bun.serve()` handles that directly.

### 2.3 Types

```typescript
// --- parser/types.ts ---

import type { RootContent } from "mdast";

/** Metadata that can be attached to any mdast node via meta-fence */
export interface NodeMetadata {
  attributes: Record<string, string>;  // data-meta-* attributes (already prefixed)
  cssClasses: string[];                // class values from the "class" key
}

/** A single slide: a numbered group of mdast nodes */
export interface Slide {
  index: number;                       // 1-based slide number
  nodes: RootContent[];                // mdast content nodes
  metadata: NodeMetadata;              // slide-level metadata (from meta-fences after ---)
}

/** The intermediate format passed from parser to renderer */
export interface SlideShow {
  frontMatter: {
    attributes: Record<string, string>; // data-fm-* attributes (already prefixed)
    cssClasses: string[];               // class values from the "class" key
  };
  slides: Slide[];
}

// --- renderer/types.ts ---

export interface FencePlugin {
  /** The fence language identifier this plugin handles */
  lang: string;
  /** Render the code block content to an HTML string */
  render(content: string): string;
}

export interface RenderedSlideShow {
  /** The complete HTML document for GET / */
  fullDocument: string;
  /** Individual slide fragments, indexed 1..N, for GET /slide/:n */
  slideFragments: Map<number, string>;
}
```

### 2.4 Parser Implementation

#### 2.4.1 Entry Point: `parser/index.ts`

```typescript
export function parse(markdown: string): SlideShow
```

Orchestrates the three sub-steps in sequence:

1. `unified().use(remarkParse).use(remarkFrontmatter, ["yaml"]).use(remarkGfm).parse(markdown)` → mdast `Root`
2. `extractFrontMatter(root)` → removes the `yaml` node, returns parsed front matter
3. `splitIntoSlides(root.children)` → returns `Slide[]`
4. For each slide: `processMetaFences(slide)` → mutates nodes (attaches metadata, removes meta code blocks)

#### 2.4.2 Front Matter: `parser/frontmatter.ts`

```typescript
export function extractFrontMatter(root: Root): {
  attributes: Record<string, string>;
  cssClasses: string[];
}
```

- Finds the first child of type `yaml` in the root. If none exists, returns empty attributes and classes.
- Parses the YAML content string using the `yaml` package.
- Iterates over the parsed key-value pairs, applying validation and transformation:

```
For each key-value pair:
  - If value is a string or number → stringify it
  - If value is an array:
      - Filter to only string/number elements
      - Join with space separator
  - If value is an object or nested array → skip (ignore invalid types)

  - If key is "class" → add to cssClasses
  - Otherwise → add to attributes with "data-fm-" prefix
```

- Removes the `yaml` node from the root's children so it doesn't interfere with slide splitting.

#### 2.4.3 Slide Splitting: `parser/slides.ts`

```typescript
export function splitIntoSlides(nodes: RootContent[]): Slide[]
```

Algorithm — walks `nodes` (the root's children after front matter removal) maintaining a "current slide" accumulator:

```
slideIndex = 1
currentSlide = new Slide(index: slideIndex, nodes: [])
slides = []

for i = 0 to nodes.length - 1:
  node = nodes[i]

  if node is heading with depth 1 or 2:
    // h1/h2 always starts a new slide
    if currentSlide has nodes:
      push currentSlide to slides
    slideIndex++
    currentSlide = new Slide(index: slideIndex, nodes: [node])

  else if node is thematicBreak:
    // --- means "new slide begins below"
    push currentSlide to slides (if it has nodes)
    slideIndex++

    // Look ahead: peek past any meta-fence code blocks to find the next content node
    peekIndex = i + 1
    while peekIndex < nodes.length and nodes[peekIndex] is code with lang "meta":
      peekIndex++

    nextNode = nodes[peekIndex]
    if nextNode is heading with depth 1 or 2:
      // --- (+ optional meta-fences) + heading = one slide transition
      // New slide starts with meta-fences (if any) then the heading
      currentSlide = new Slide(index: slideIndex, nodes: nodes[i+1..peekIndex])
      i = peekIndex  // skip past consumed nodes
    else:
      currentSlide = new Slide(index: slideIndex, nodes: [])

  else:
    // Regular content — append to current slide
    currentSlide.nodes.push(node)

// Don't forget the last slide
if currentSlide has nodes:
  push currentSlide to slides
```

After assembly, re-number all slides sequentially (1, 2, 3, ...) to clean up any counter drift from the `---` + heading lookahead logic.

**Edge case**: content that appears before any heading or `---` goes into slide 1. If the markdown starts with a heading, slide 1 begins with that heading.

#### 2.4.4 Meta-Fence Processing: `parser/meta.ts`

```typescript
export function processMetaFences(slide: Slide): void
```

Walks the slide's `nodes` array. When a `code` node with `lang === "meta"` is found:

1. Parse its `value` as YAML using the same logic as front matter (validate types, handle `class` separately).
2. Find the "preceding sibling" — the node at the previous index in the `nodes` array.
3. Attach a `NodeMetadata` object to that preceding node. Since mdast nodes are plain objects, we store metadata in a `data` property: `node.data = { meta: { attributes, cssClasses } }`. The `data` field is part of the mdast spec for storing extra information.
4. Remove the `code` node from the array (splice it out).
5. Adjust the iteration index to account for the removal.

**Slide-level metadata**: a meta-fence with no preceding sibling (first node in a slide) attaches its metadata to the slide itself via `slide.metadata`. This is the mechanism for styling individual slide divs — place a meta-fence directly after a `---` divider:

```markdown
---
```meta
class: dark-theme
bg: hero.jpg
```

# Welcome
```

The `---` creates a new slide. The meta-fence is the first node in that slide, so its parsed attributes (`data-meta-bg: "hero.jpg"`) and CSS classes (`dark-theme`) are stored in `slide.metadata`. The renderer applies them to the slide's wrapping `<div>`. If `---` is followed by meta-fences and then an `h1`/`h2`, only one slide transition occurs (the splitter peeks past meta-fences when detecting this pattern).

### 2.5 Renderer Implementation

#### 2.5.1 Entry Point: `renderer/index.ts`

```typescript
export function render(slideshow: SlideShow): RenderedSlideShow
```

Produces both the full document and the per-slide fragments in a single pass.

**Full document structure:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>updown</title>
</head>
<body>
  <div id="slideshow" {frontMatter attributes} {class}>
    <div id="slide-1" class="slide first">...</div>
    <div id="slide-2" class="slide">...</div>
    ...
    <div id="slide-N" class="slide last">...</div>
  </div>
  <script>{navigation JS}</script>
</body>
</html>
```

**Slide div class rules:**

| Condition | Classes |
|---|---|
| Only one slide | `slide first` |
| First of many | `slide first` |
| Last of many | `slide last` |
| Middle | `slide` |

#### 2.5.2 Node Rendering: `renderer/nodes.ts`

```typescript
export function renderNode(node: RootContent, fenceRegistry: FenceRegistry): string
```

A recursive function that pattern-matches on `node.type` and emits HTML. Each node type maps directly:

| mdast type | HTML output |
|---|---|
| `heading` | `<h{depth} {meta attrs}>...</h{depth}>` |
| `paragraph` | `<p>...</p>` (recurse into inline children) |
| `text` | HTML-escaped text content |
| `emphasis` | `<em>...</em>` |
| `strong` | `<strong>...</strong>` |
| `delete` | `<del>...</del>` (GFM strikethrough) |
| `inlineCode` | `<code>...</code>` |
| `link` | `<a href="{url}">{children}</a>` |
| `image` | `<img src="{url}" alt="{alt}">` |
| `list` (ordered) | `<ol><li>...</li></ol>` |
| `list` (unordered) | `<ul><li>...</li></ul>` |
| `listItem` | `<li>...</li>` (recurse; unwrap single-paragraph children) |
| `blockquote` | `<blockquote>...</blockquote>` |
| `code` | Route through fence registry (see §2.5.3) |
| `table` | `<table><thead>...<tbody>...</table>` |
| `tableRow` | `<tr>...</tr>` |
| `tableCell` | `<th>` in thead, `<td>` in tbody |
| `thematicBreak` | Should not appear (consumed by slide splitter) |
| `html` | Raw passthrough |
| `break` | `<br>` |

**Metadata rendering**: when a node has `data.meta` (attached by the meta-fence processor), the renderer adds the `NodeMetadata` attributes and CSS classes to that node's opening HTML tag.

**HTML escaping**: all text content and attribute values are escaped (`<`, `>`, `&`, `"`, `'`) to prevent injection. Raw `html` nodes are the sole exception — they pass through unescaped by design.

#### 2.5.3 Fence Registry: `renderer/fence.ts`

```typescript
export class FenceRegistry {
  private plugins: Map<string, FencePlugin> = new Map();

  register(plugin: FencePlugin): void {
    this.plugins.set(plugin.lang, plugin);
  }

  render(lang: string, content: string): string {
    const plugin = this.plugins.get(lang);
    if (plugin) {
      return plugin.render(content);
    }
    // Default: code display
    return `<div class="fence ${escapeAttr(lang)}"><pre>${escapeHtml(content)}</pre></div>`;
  }
}
```

`meta` fences never reach the renderer — they are removed during parsing. Any unrecognized fence language falls through to the default code block rendering.

**Adding a plugin later** (e.g. Mermaid) would look like:

```typescript
registry.register({
  lang: "mermaid",
  render(content: string): string {
    // Return HTML that loads the Mermaid library and renders the diagram
    return `<div class="fence mermaid"><pre class="mermaid">${escapeHtml(content)}</pre></div>`;
  },
});
```

The controller instantiates the `FenceRegistry`, registers any plugins, and passes it to the renderer.

### 2.6 Controller Implementation: `src/index.ts`

#### Startup sequence

1. Read CLI argument: `const filePath = Bun.argv[2]`; exit with usage message if missing.
2. Read the markdown file: `const markdown = await Bun.file(filePath).text()`
3. Parse: `const slideshow = parse(markdown)`
4. Set up fence registry (register any plugins).
5. Render: `const rendered = render(slideshow, fenceRegistry)`
6. Start server.

#### HTTP server

```typescript
Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      return new Response(rendered.fullDocument, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const slideMatch = url.pathname.match(/^\/slide\/(\d+)$/);
    if (slideMatch) {
      const n = parseInt(slideMatch[1], 10);
      const fragment = rendered.slideFragments.get(n);
      if (fragment) {
        return new Response(fragment, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
      return new Response("Slide not found", { status: 404 });
    }

    return new Response("Not found", { status: 404 });
  },
});
```

### 2.7 Navigation: `navigation/index.ts`

```typescript
export function generateNavigationScript(): string
```

Returns a `<script>` block that is injected into the full HTML document. The script:

1. On `DOMContentLoaded`, collects all `.slide` elements.
2. Hides all slides except slide 1 (via `display: none`).
3. Maintains a `currentIndex` variable (0-based).
4. Listens for `keydown` events:
   - **ArrowRight**: if not on the last slide, hide current slide, increment index, show next slide.
   - **ArrowLeft**: if not on the first slide, hide current slide, decrement index, show previous slide.

The script is minimal and self-contained — no external dependencies.

---

## 3. Testing Strategy

All tests use `bun:test`. Tests are colocated alongside source files or in a top-level `tests/` directory mirroring `src/`.

```
tests/
├── parser/
│   ├── frontmatter.test.ts
│   ├── slides.test.ts
│   └── meta.test.ts
├── renderer/
│   ├── nodes.test.ts
│   └── fence.test.ts
└── integration/
    ├── pipeline.test.ts
    └── server.test.ts
```

### 3.1 Parser Tests

#### Front Matter (`tests/parser/frontmatter.test.ts`)

| Test case | Input | Expected |
|---|---|---|
| String values | `foo: bar` | `{ attributes: { "data-fm-foo": "bar" }, cssClasses: [] }` |
| Number values | `count: 42` | `{ attributes: { "data-fm-count": "42" }, cssClasses: [] }` |
| Array values | `tags:\n - a\n - b` | `{ attributes: { "data-fm-tags": "a b" }, cssClasses: [] }` |
| Mixed array | `mix:\n - hello\n - 99` | `{ attributes: { "data-fm-mix": "hello 99" }, cssClasses: [] }` |
| Class handling | `class:\n - x\n - y` | `{ attributes: {}, cssClasses: ["x", "y"] }` |
| Class as string | `class: single` | `{ attributes: {}, cssClasses: ["single"] }` |
| Invalid: object value | `obj:\n key: val` | Key `obj` is ignored |
| Invalid: nested array | `nested:\n - [1, 2]` | Nested array elements are ignored |
| No front matter | `# Just a heading` | Empty attributes, empty classes |
| Multiple keys | (full example from requirements) | Matches expected output from requirements |

#### Slide Splitting (`tests/parser/slides.test.ts`)

| Test case | Input (simplified) | Expected slides |
|---|---|---|
| Single h1 | `# Title` | 1 slide: [h1] |
| h1 then h2 | `# A\n## B` | 2 slides: [h1], [h2] |
| h2 with content | `## S\nfoo\nbar` | 1 slide: [h2, p, p] |
| `---` separator | `text\n---\nmore` | 2 slides: [p], [p] |
| `---` then h2 | `text\n---\n## Next` | 2 slides: [p], [h2] (not 3) |
| `---` then h1 | `text\n---\n# Next` | 2 slides: [p], [h1] (not 3) |
| Multiple `---` | Example 2 from requirements | 5 slides matching expected output |
| Content before first heading | `intro\n# Title` | 2 slides: [p], [h1] |
| h3 does NOT split | `## A\n### Sub\ntext` | 1 slide containing h2, h3, p |
| Empty markdown | `` | 0 slides |
| Only front matter | `---\nfoo: bar\n---` | 0 slides |
| Full Example 1 | (from requirements) | 4 slides matching expected structure |

#### Meta-Fence (`tests/parser/meta.test.ts`)

| Test case | Input | Expected |
|---|---|---|
| Basic meta on heading | `## Foo` + meta block `foo: bar` | h2 node gets `data-meta-foo="bar"`, meta node removed |
| Class via meta | meta block `class:\n - a\n - b` | Target node gets `class="a b"` |
| Combined attributes and class | meta with both | Target gets both `data-meta-*` and `class` |
| Meta as first node | Meta block with no preceding sibling | Meta block is discarded |
| Meta on paragraph | `Some text` + meta block | Paragraph gets metadata |
| Multiple meta blocks | Two meta blocks targeting different nodes | Each target gets its own metadata |

### 3.2 Renderer Tests

#### Node Rendering (`tests/renderer/nodes.test.ts`)

One test per mdast node type, verifying correct HTML output:

- `heading` depths 1–6, including with meta attributes
- `paragraph` with inline children (text, emphasis, strong, code, links)
- `list` — ordered and unordered, nested lists
- `listItem` — with single paragraph (unwrap) and multiple children
- `blockquote` — with nested paragraphs
- `table` — thead/tbody structure, correct th vs td
- `code` fence — default rendering as `<div class="fence {lang}"><pre>...</pre></div>`
- `code` fence — no language specified (fence div with no language class)
- `inlineCode` — HTML escaping of special characters
- `link` — href attribute, child text
- `image` — src and alt attributes
- `emphasis`, `strong`, `delete` — correct wrapping tags
- `break` — `<br>` output
- `html` — raw passthrough, no escaping
- HTML escaping — verify `<`, `>`, `&`, `"` in text content are escaped

#### Fence Registry (`tests/renderer/fence.test.ts`)

| Test case | Expected |
|---|---|
| Unregistered language falls through to default | `<div class="fence foo"><pre>...</pre></div>` |
| Registered plugin is called | Plugin's render function is invoked, output used |
| Language with special characters is escaped in class attr | No XSS via crafted language identifier |

#### Slideshow Structure (`tests/renderer/nodes.test.ts` or separate file)

| Test case | Expected |
|---|---|
| Outer div has `id="slideshow"` | Always present |
| Front matter attributes rendered | `data-fm-*` attributes on slideshow div |
| Front matter class rendered | `class` attribute on slideshow div |
| Slide divs have `id="slide-{n}"` | Sequential numbering |
| Single slide | Classes: `slide first` |
| First of many | Classes: `slide first` |
| Last of many | Classes: `slide last` |
| Middle slide | Classes: `slide` |

### 3.3 Integration Tests

#### Full Pipeline (`tests/integration/pipeline.test.ts`)

End-to-end tests that take raw markdown and verify the final HTML output. Use the two examples from the requirements document as golden tests:

- **Example 1** (detailed): 4 slides with front matter, lists, code fence, blockquote, inline elements, ordered list, table. Compare the rendered output against the expected HTML from the requirements (structurally — normalize whitespace).
- **Example 2** (slide separation): 5 slides with `---` separators and a `---` followed by `## heading`. Verify correct slide count and content.

Additional integration cases:
- Markdown with meta-fences: verify attributes appear on correct elements in final HTML.
- Markdown with no front matter: slideshow div has no `data-fm-*` attributes, no class.
- Empty markdown: produces a slideshow div with no slide children.

#### Server (`tests/integration/server.test.ts`)

Use `fetch` against a running server (started in test setup via `Bun.serve`):

| Test case | Expected |
|---|---|
| `GET /` returns 200 | Content-Type is `text/html`, body contains `id="slideshow"` |
| `GET /slide/1` returns 200 | Body is the first slide's HTML fragment |
| `GET /slide/N` (last slide) returns 200 | Body is the last slide's fragment |
| `GET /slide/0` returns 404 | No slide 0 |
| `GET /slide/999` returns 404 | Out of range |
| `GET /slide/abc` returns 404 | Non-numeric |
| `GET /unknown` returns 404 | Unknown route |
| Navigation script is present in `GET /` response | Body contains `<script>` with `ArrowLeft`/`ArrowRight` handlers |

### 3.4 What Not to Test

- The actual Mermaid/PlantUML rendering — plugins are not yet implemented, and external library behavior is out of scope.
- Browser-level navigation behavior — the injected script is simple DOM manipulation; testing it would require a browser environment. The integration tests verify that the script is present in the response. Manual testing covers that it works.
- mdast parsing correctness — that's the responsibility of `remark-parse`. We test our transformation of the AST, not the AST production itself.
