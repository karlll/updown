---
id: "9da23df9-4e40-4aea-ac5d-546868301017"
number: 11
title: "Integration tests"
createdAt: "2026-02-09T20:24:37.734010Z"
updatedAt: "2026-02-09T20:24:37.734010Z"
assignees: []
categories:
- "testing"
priority: "medium"
order: 11
---

## Overview
Write end-to-end integration tests that verify the full pipeline (markdown → parser → renderer → HTML) against the example inputs/outputs from the requirements document, and test the HTTP server endpoints.

## Requirements

### Pipeline golden tests (`tests/integration/pipeline.test.ts`)
- **Example 1** (detailed): Parse the full Example 1 markdown from `notes/requirements.md` (with front matter, 4 slides, lists, code fence, blockquote, inline elements, ordered list, table). Verify the rendered HTML structurally matches the expected output.
- **Example 2** (slide separation): Parse Example 2 (h1, multiple `---` separators, `---` followed by h2). Verify 5 slides with correct content.
- **Meta-fence integration**: Markdown with meta-fences → verify `data-meta-*` attributes and `class` appear on correct elements in final HTML.
- **No front matter**: Markdown with no front matter → slideshow div has no `data-fm-*` attributes.
- **Empty markdown**: Produces a slideshow div with no slide children.

### Server tests (`tests/integration/server.test.ts`)
- Start the server in test setup (use `Bun.serve` directly or spawn a subprocess)
- `GET /` → 200, content-type text/html, body contains `id="slideshow"`
- `GET /slide/1` → 200, valid HTML fragment
- `GET /slide/N` (last slide) → 200
- `GET /slide/0` → 404
- `GET /slide/999` → 404
- `GET /unknown` → 404
- `GET /` body contains `<script>` with `ArrowLeft`/`ArrowRight` handlers

## Acceptance Criteria
- [ ] All golden tests pass with both requirement examples
- [ ] Server endpoint tests cover happy path and error cases
- [ ] Tests run with `bun test` and all pass
- [ ] Structural HTML comparison (normalize whitespace) rather than exact string matching