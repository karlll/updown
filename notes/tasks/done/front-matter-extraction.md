---
id: "c98b4eaa-f45b-4871-bc28-187d41cdf357"
number: 2
title: "Front matter extraction"
createdAt: "2026-02-09T20:23:17.324955Z"
updatedAt: "2026-02-10T18:36:56.078686Z"
assignees:
- "Claude Code"
categories:
- "parser"
priority: "high"
order: 2
---

## Overview
Implement `src/parser/frontmatter.ts` — extracts and parses the YAML front matter block from an mdast tree, returning validated and transformed attributes.

## Requirements
- Export function `extractFrontMatter(root: Root): { attributes: Record<string, string>, cssClasses: string[] }`
- Find the first child node of type `yaml` in the root
- Parse its YAML content using the `yaml` package
- For each key-value pair:
  - String or number values → stringify
  - Array values → filter to string/number elements only, join with space separator
  - Object or nested array values → skip entirely (ignore invalid types)
  - Key `class` → add to `cssClasses` (as array or single string)
  - All other keys → add to `attributes` with `data-fm-` prefix
- Remove the `yaml` node from the root's children after extraction
- Return empty attributes and classes if no front matter exists

## Acceptance Criteria
- [ ] String and number values are correctly stringified
- [ ] Arrays become space-separated strings
- [ ] `class` key is separated into `cssClasses`, not prefixed
- [ ] Invalid types (objects, nested arrays) are silently ignored
- [ ] The `yaml` node is removed from the tree after extraction
- [ ] No front matter returns empty result

## Examples
Input YAML:
```yaml
foo: bar
count: 42
tags:
  - a
  - b
class:
  - x
  - y
```
Expected output:
```typescript
{
  attributes: { "data-fm-foo": "bar", "data-fm-count": "42", "data-fm-tags": "a b" },
  cssClasses: ["x", "y"]
}
```