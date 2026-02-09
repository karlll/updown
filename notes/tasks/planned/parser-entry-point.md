---
id: "0fe6fb87-c559-4404-8839-f0a37fd58b92"
number: 5
title: "Parser entry point"
createdAt: "2026-02-09T20:23:40.699260Z"
updatedAt: "2026-02-09T20:23:40.699260Z"
assignees: []
categories:
- "parser"
priority: "high"
order: 5
---

## Overview
Implement `src/parser/index.ts` — the top-level `parse()` function that orchestrates markdown parsing, front matter extraction, slide splitting, and meta-fence processing into a single pipeline.

## Requirements
- Export function `parse(markdown: string): SlideShow`
- Pipeline steps:
  1. Parse markdown into mdast using `unified().use(remarkParse).use(remarkFrontmatter, ["yaml"]).use(remarkGfm).parse(markdown)`
  2. Call `extractFrontMatter(root)` to get front matter and remove the yaml node
  3. Call `splitIntoSlides(root.children)` to get slides
  4. For each slide, call `processMetaFences(slide)`
  5. Return `{ frontMatter, slides }`
- Re-export the `SlideShow`, `Slide`, and `NodeMetadata` types for external consumers

## Acceptance Criteria
- [ ] `parse()` accepts a markdown string and returns a valid `SlideShow`
- [ ] Front matter is extracted and not present in any slide
- [ ] Slides are correctly split
- [ ] Meta-fences are processed and removed
- [ ] Full round-trip with Example 1 from requirements produces correct SlideShow structure