---
id: "7f97ade7-4bbc-408b-ab60-ca88fcf67b12"
number: 6
title: "Fence registry and plugin system"
createdAt: "2026-02-09T20:23:52.250603Z"
updatedAt: "2026-02-10T19:19:05.008449Z"
assignees:
- "Claude Code"
categories:
- "renderer"
priority: "high"
order: 6
---

## Overview
Implement `src/renderer/fence.ts` — the `FenceRegistry` class that routes fenced code blocks to registered plugins or falls back to default code rendering.

## Requirements
- Export `FenceRegistry` class with:
  - `register(plugin: FencePlugin): void` — registers a plugin by its `lang` identifier
  - `render(lang: string, content: string): string` — looks up a plugin for `lang`; if found, delegates to it; otherwise uses default rendering
- Default rendering for unregistered languages: `<div class="fence {lang}"><pre>{content}</pre></div>`
- HTML-escape the content inside `<pre>` tags
- HTML-escape/sanitize the language identifier in the class attribute
- Handle missing/empty language identifier gracefully (fence div with no language in class)
- `meta` fences never reach the renderer (handled in parser), but as a safety measure the registry should not have a default registration for `meta`

## Acceptance Criteria
- [ ] Unregistered language produces default `<div class="fence {lang}"><pre>...</pre></div>`
- [ ] Registered plugin's `render()` is called and its output used
- [ ] Content inside `<pre>` is HTML-escaped (`<`, `>`, `&`, `"`)
- [ ] Language identifier in class attribute is sanitized
- [ ] Empty/missing language produces a fence div without language class
- [ ] The plugin interface is simple enough to implement a new renderer (e.g. Mermaid) in a few lines