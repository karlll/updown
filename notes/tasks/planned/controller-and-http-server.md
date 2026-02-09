---
id: "6685ddbb-0cfc-43e6-8b16-1f872a483344"
number: 10
title: "Controller and HTTP server"
createdAt: "2026-02-09T20:24:27.049442Z"
updatedAt: "2026-02-09T20:24:27.049442Z"
assignees: []
categories:
- "controller"
priority: "high"
order: 10
---

## Overview
Implement `src/index.ts` — the application entry point that reads a markdown file from a CLI argument, orchestrates the parse/render pipeline, and serves the result over HTTP using `Bun.serve()`.

## Requirements
- Read the markdown file path from `Bun.argv[2]`; exit with a usage message if missing
- Read the file using `Bun.file(filePath).text()`
- Parse the markdown: `parse(markdown)` → `SlideShow`
- Create a `FenceRegistry` (register any plugins if present)
- Render the slideshow: `render(slideshow, fenceRegistry)` → `RenderedSlideShow`
- Start HTTP server with `Bun.serve()`:
  - `GET /` → respond with `fullDocument` (Content-Type: `text/html; charset=utf-8`)
  - `GET /slide/:n` → respond with `slideFragments.get(n)` (Content-Type: `text/html; charset=utf-8`), 404 if slide not found
  - All other routes → 404
- Log the server URL to console on startup
- Usage: `bun src/index.ts <path-to-markdown-file>`

## Acceptance Criteria
- [ ] Running without a file argument prints usage and exits
- [ ] Running with a valid markdown file starts the server
- [ ] `GET /` returns the full HTML slideshow with status 200
- [ ] `GET /slide/1` returns the first slide fragment with status 200
- [ ] `GET /slide/999` returns 404
- [ ] `GET /slide/abc` returns 404
- [ ] `GET /unknown-route` returns 404
- [ ] Server URL is logged to console