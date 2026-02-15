---
id: "c8cf0a6f-6f3d-4111-857f-da07c6beb72f"
number: 9
title: "Navigation script"
createdAt: "2026-02-09T20:24:19.480916Z"
updatedAt: "2026-02-10T19:33:19.196113Z"
assignees:
- "Claude Code"
categories:
- "navigation"
priority: "medium"
order: 9
---

## Overview
Implement `src/navigation/index.ts` — generates the client-side JavaScript that enables keyboard navigation between slides using arrow keys.

## Requirements
- Export function `generateNavigationScript(): string`
- Returns a `<script>` block (including the `<script>` tags) to be injected into the HTML document
- The script should:
  1. On `DOMContentLoaded`, collect all elements with class `slide`
  2. Hide all slides except the first one (set `display: none`)
  3. Maintain a `currentIndex` variable (0-based)
  4. Listen for `keydown` events:
     - **ArrowRight**: if not on the last slide, hide current slide, increment index, show next slide
     - **ArrowLeft**: if not on the first slide, hide current slide, decrement index, show previous slide
- The script must be self-contained with no external dependencies
- The script should be minimal and not interfere with other page behavior

## Acceptance Criteria
- [ ] Returns a string containing `<script>...</script>`
- [ ] Script listens for ArrowLeft and ArrowRight keydown events
- [ ] Only one slide is visible at a time
- [ ] First slide is visible on initial load
- [ ] ArrowRight on last slide does nothing
- [ ] ArrowLeft on first slide does nothing
- [ ] Script has no external dependencies