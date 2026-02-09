---
id: "be499cc7-248f-4d87-bff5-92cbd7f9d93e"
number: 7
title: "Node-to-HTML renderer"
createdAt: "2026-02-09T20:24:02.952230Z"
updatedAt: "2026-02-09T20:24:02.952230Z"
assignees: []
categories:
- "renderer"
priority: "high"
order: 7
---

## Overview
Implement `src/renderer/nodes.ts` — the recursive function that converts individual mdast nodes to HTML strings, handling all standard markdown node types.

## Requirements
- Export function `renderNode(node: RootContent, fenceRegistry: FenceRegistry): string`
- Node type → HTML mapping:
  - `heading` → `<h{depth}>...</h{depth}>` (render children recursively)
  - `paragraph` → `<p>...</p>`
  - `text` → HTML-escaped text content
  - `emphasis` → `<em>...</em>`
  - `strong` → `<strong>...</strong>`
  - `delete` → `<del>...</del>` (GFM strikethrough)
  - `inlineCode` → `<code>{escaped content}</code>`
  - `link` → `<a href="{url}">{children}</a>`
  - `image` → `<img src="{url}" alt="{alt}">`
  - `list` (ordered) → `<ol>...</ol>`, (unordered) → `<ul>...</ul>`
  - `listItem` → `<li>...</li>` (unwrap single-paragraph children so `<li>` doesn't contain `<p>`)
  - `blockquote` → `<blockquote>...</blockquote>`
  - `code` → delegate to `fenceRegistry.render(lang, content)`
  - `table` → `<table>` with `<thead>` (first row) and `<tbody>` (remaining rows)
  - `tableRow` → `<tr>...</tr>`
  - `tableCell` → `<th>` in thead context, `<td>` in tbody context
  - `html` → raw passthrough (no escaping)
  - `break` → `<br>`
- When a node has `data.meta` (from meta-fence processing), add `NodeMetadata` attributes and CSS classes to the node's opening HTML tag
- All text content and attribute values must be HTML-escaped

## Acceptance Criteria
- [ ] Each node type listed above renders to correct HTML
- [ ] Nested structures render correctly (e.g. list inside list, emphasis inside paragraph)
- [ ] Meta-fence attributes (`data-meta-*` and `class`) appear on target node's HTML tag
- [ ] HTML special characters in text content are escaped
- [ ] `code` nodes are routed through the fence registry
- [ ] `html` nodes pass through unescaped
- [ ] Tables produce correct `thead`/`tbody` with `th`/`td` cells