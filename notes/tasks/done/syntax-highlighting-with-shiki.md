---
id: "4dc9501b-bc6a-4020-b423-fa9884ea434b"
number: 14
title: "Syntax highlighting with Shiki"
createdAt: "2026-02-11T19:09:03.718270Z"
updatedAt: "2026-02-11T19:13:45.005025Z"
assignees:
- "Claude Code"
categories:
- "renderer"
priority: "medium"
order: 2
---

## Overview
Add syntax highlighting for fenced code blocks using Shiki. Theme selection is driven by the existing front matter `theme` field, so slide colors and syntax colors stay in sync.

## Approach
Integrate Shiki into the FenceRegistry's default rendering path. When a code fence has a language tag, use Shiki's `codeToHtml()` to produce highlighted HTML instead of plain escaped text.

## Implementation

### 1. Install Shiki
```
bun add shiki
```

### 2. Map updown themes to Shiki themes
Create a mapping in `src/styles/themes.ts` (or similar) from updown theme names to Shiki built-in theme names:
- `light` → `github-light` (or similar light theme)
- `dark` → `github-dark` (or similar dark theme)  
- `catppuccin-mocha` → `catppuccin-mocha`
- `catppuccin-latte` → `catppuccin-latte`

### 3. Update FenceRegistry
- Make the default render method async (or make FenceRegistry accept an async highlighter)
- When a language is provided, call `codeToHtml(code, { lang, theme })` from Shiki
- Fall back to plain `<pre>` escaped rendering if Shiki doesn't support the language or if no language is specified
- Wrap Shiki output in the existing `<div class="fence {lang}">` structure for consistency

### 4. Update render pipeline
- The render pipeline needs to handle async fence rendering
- `renderNode()` and `render()` become async (or fence rendering is pre-computed)
- Alternative: pre-highlight all code blocks before rendering, storing highlighted HTML on the node

### 5. Theme wiring
- Pass the resolved Shiki theme name through to the FenceRegistry so it knows which syntax theme to use
- The controller already resolves the theme name from front matter — pass it through to rendering

## Files to modify
- `package.json` — add `shiki` dependency
- `src/renderer/fence.ts` — integrate Shiki into default rendering
- `src/renderer/nodes.ts` — handle async fence rendering
- `src/renderer/index.ts` — pass theme context through
- `src/styles/themes.ts` — add Shiki theme mapping
- `src/index.ts` — minor wiring changes if needed

## Acceptance Criteria
- [ ] Code fences with a language tag are syntax highlighted
- [ ] Code fences without a language tag render as plain `<pre>` (no highlighting)
- [ ] Syntax theme matches the slide theme (catppuccin-mocha slides get catppuccin-mocha syntax)
- [ ] All existing tests still pass (update as needed for async changes)
- [ ] No client-side JS added for highlighting
- [ ] Shiki is the only new dependency