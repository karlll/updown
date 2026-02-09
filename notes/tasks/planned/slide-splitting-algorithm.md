---
id: "edc83b8c-f133-454b-9dc0-7db9c29dae54"
number: 3
title: "Slide splitting algorithm"
createdAt: "2026-02-09T20:23:27.084680Z"
updatedAt: "2026-02-09T20:23:27.084680Z"
assignees: []
categories:
- "parser"
priority: "high"
order: 3
---

## Overview
Implement `src/parser/slides.ts` — walks the mdast root children (after front matter removal) and groups them into slides based on heading and thematic break rules.

## Requirements
- Export function `splitIntoSlides(nodes: RootContent[]): Slide[]`
- `h1` (depth 1) and `h2` (depth 2) headings start a new slide; the heading is the first node of that slide
- `h3`–`h6` do NOT start new slides
- `---` (thematicBreak) starts a new slide below it; the thematicBreak itself is consumed (not included in any slide)
- `---` followed immediately by `h1` or `h2` creates only ONE new slide (not two) — the heading handles the split
- Content before the first heading/break goes into slide 1
- Slides are numbered sequentially starting from 1
- Empty input returns an empty array
- Slides with no content nodes (e.g. only front matter was present) are not emitted

## Acceptance Criteria
- [ ] h1 starts a new slide
- [ ] h2 starts a new slide
- [ ] h3 does NOT start a new slide
- [ ] `---` starts a new slide below it
- [ ] `---` followed by h1/h2 produces exactly one slide transition, not two
- [ ] Content before first heading is in slide 1
- [ ] Slides are numbered 1, 2, 3, ...
- [ ] Empty input → empty array
- [ ] Requirements Example 2 (5 slides with mixed `---` and headings) produces correct output

## Examples
Input nodes (simplified): `[h1("Example"), thematicBreak, p("foo"), thematicBreak, p("bar"), thematicBreak, p("baz"), thematicBreak, h2("Bob"), p("gog")]`

Expected: 5 slides
1. [h1("Example")]
2. [p("foo")]
3. [p("bar")]
4. [p("baz")]
5. [h2("Bob"), p("gog")]