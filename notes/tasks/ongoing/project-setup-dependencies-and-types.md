---
id: "feea9bf9-c118-45f9-b9fa-7291f0ff2b6b"
number: 1
title: "Project setup, dependencies, and types"
createdAt: "2026-02-09T20:23:12.530836Z"
updatedAt: "2026-02-09T20:26:11.684007Z"
assignees:
- "Claude Code"
categories:
- "setup"
- "parser"
- "renderer"
priority: "high"
order: 1
---

## Overview
Set up the project directory structure, install dependencies, and define the TypeScript types that form the contract between parser and renderer.

## Requirements
- Create directory structure: `src/parser/`, `src/renderer/`, `src/navigation/`, `tests/parser/`, `tests/renderer/`, `tests/integration/`
- Install dependencies: `unified`, `remark-parse`, `remark-frontmatter`, `remark-gfm`, `yaml`
- Install type packages as needed (e.g. `@types/mdast`)
- Create `src/parser/types.ts` with:
  - `NodeMetadata` interface: `attributes: Record<string, string>`, `cssClasses: string[]`
  - `Slide` interface: `index: number`, `nodes: RootContent[]`
  - `SlideShow` interface: `frontMatter: { attributes: Record<string, string>, cssClasses: string[] }`, `slides: Slide[]`
- Create `src/renderer/types.ts` with:
  - `FencePlugin` interface: `lang: string`, `render(content: string): string`
  - `RenderedSlideShow` interface: `fullDocument: string`, `slideFragments: Map<number, string>`

## Acceptance Criteria
- [ ] All directories exist
- [ ] `bun install` succeeds with no errors
- [ ] Type files compile with `bun build` / `tsc --noEmit`
- [ ] Types are importable from other source files