---
id: "7c03050c-42ac-41be-b972-da7c3f16ec2d"
number: 4
title: "Meta-fence processing"
createdAt: "2026-02-09T20:23:35.866594Z"
updatedAt: "2026-02-09T20:23:35.866594Z"
assignees: []
categories:
- "parser"
priority: "high"
order: 4
---

## Overview
Implement `src/parser/meta.ts` — walks each slide's nodes, finds fenced code blocks with lang `meta`, parses their YAML content, attaches the resulting metadata to the preceding sibling node, and removes the meta-fence node.

## Requirements
- Export function `processMetaFences(slide: Slide): void` (mutates the slide in place)
- When a `code` node with `lang === "meta"` is found:
  - Parse its `value` as YAML using the same validation logic as front matter (string, number, flat arrays only; objects/nested arrays ignored)
  - Key `class` → stored as CSS classes (no prefix)
  - Other keys → prefixed with `data-meta-`
  - Attach metadata to the preceding sibling node via `node.data.meta = { attributes, cssClasses }`
  - Remove the meta-fence `code` node from the slide's nodes array
- If a meta-fence has no preceding sibling (it's the first node), discard it
- Multiple meta-fences in a single slide each target their own preceding sibling

## Acceptance Criteria
- [ ] Meta-fence attaches `data-meta-*` attributes to preceding sibling
- [ ] `class` key in meta-fence produces CSS classes on target node (no prefix)
- [ ] Meta-fence `code` node is removed from the slide
- [ ] Meta-fence with no preceding sibling is silently discarded
- [ ] Multiple meta-fences in one slide work independently
- [ ] Invalid YAML types are ignored (same rules as front matter)

## Examples
Input slide nodes: `[h2("Foo"), code(lang:"meta", value:"foo: bar\nclass:\n - f\n - g")]`

After processing: `[h2("Foo")]` where h2 has `data: { meta: { attributes: { "data-meta-foo": "bar" }, cssClasses: ["f", "g"] } }`