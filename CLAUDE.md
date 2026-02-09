# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**updown** is a markdown-to-slideshow application. It reads a markdown file, parses it into an AST, and renders it as an HTML slideshow served in the browser.

## Tech Stack

- **Runtime**: Bun (not Node.js)
- **Language**: TypeScript (strict mode, ESNext)
- **Parsing**: mdast library for markdown AST
- **No external frameworks** — uses `Bun.serve()` directly, no Express/Vite

## Commands

- `bun install` — install dependencies
- `bun src/index.ts` — run the server
- `bun --hot src/index.ts` — run with hot reload
- `bun test` — run all tests
- `bun test <file>` — run a single test file

## Architecture

Three core components:

1. **Controller** (`src/index.ts`) — Entry point. Orchestrates parsing and rendering, serves HTML via `Bun.serve()`, provides REST API to request slides by number, injects keyboard navigation into rendered HTML.

2. **Parser** — Reads markdown input, produces an mdast AST. Handles slide separation rules, front matter extraction, and meta-fence parsing.

3. **Renderer** — Converts the AST into HTML output.

## Bun-Specific Rules

- Use `Bun.serve()` for HTTP/WebSocket (not Express)
- Use `bun:sqlite` for SQLite (not better-sqlite3)
- Use `Bun.file()` over `node:fs` readFile/writeFile
- Bun auto-loads `.env` — no dotenv needed
- For frontend: use HTML imports with `Bun.serve()` (not Vite), which supports React/CSS/Tailwind bundling
- Use `Bun.$\`cmd\`` for shell commands (not execa)
- Tests use `bun:test` (not Jest/Vitest)

## Slide Conventions

- `#` (h1) and `##` (h2) start a new slide
- `---` (horizontal rule) starts a new slide below it
- `---` followed by `#`/`##` creates only one new slide, not two
- Slides are wrapped in `<div id="slide-N" class="slide">` inside `<div id="slideshow">`
- First slide div gets class `first`, last gets `last`; if only one slide, only `first`

## Front Matter

- YAML at the top of the markdown document, never rendered
- Values become attributes on the `#slideshow` div, prefixed with `data-fm-`
- Exception: `class` is passed as a regular `class` attribute (no prefix)
- Arrays become space-separated strings
- Only string, number, and flat arrays of string/number are valid types

## Meta-Fence

- Code blocks with fence identifier `meta` are parsed (not rendered) using the same logic as front matter
- Attributes are prefixed with `data-meta-` and applied to the element directly above the code block
- The `class` exception applies here too

## Pluggable Rendering

Fenced code blocks can trigger external rendering (e.g., Mermaid, PlantUML). The architecture should be extensible for new renderers based on the fence identifier. Code fences render as `<div class="fence {language}"><pre>...</pre></div>`.
