---
id: "7934ea3c-95bc-47c2-93bb-ea6f2698d302"
number: 12
title: "Live reload on markdown file changes via WebSocket"
createdAt: "2026-02-11T18:29:31.748845Z"
updatedAt: "2026-02-11T18:29:31.748845Z"
assignees: []
categories:
- "controller"
- "navigation"
priority: "medium"
order: 1
---

## Overview
Watch the source markdown file for changes and automatically reload the slideshow in connected browsers using WebSocket.

## Approach
Three pieces: file watcher, WebSocket endpoint, client-side reload script.

### 1. File watcher (`src/index.ts`)
- Use `fs.watch(filePath)` from `node:fs` to detect file changes
- On change: re-read the file, re-parse, re-render (theme + navigation + stylesheet)
- Update the mutable `rendered` variable so HTTP routes serve fresh content
- Broadcast `"reload"` to all connected WebSocket clients
- Debounce the watcher (editors often trigger multiple events per save)

### 2. WebSocket endpoint (`src/index.ts`)
- Upgrade requests to `/ws` using `server.upgrade(req)` in the `fetch` handler
- Track connected clients in a `Set<ServerWebSocket>`
- Add `websocket: { open, close, message }` handler to `Bun.serve()` config
- `open` → add to set, `close` → remove from set, `message` → no-op

### 3. Client-side reload (`src/navigation/index.ts`)
- Add a WebSocket client snippet to `generateNavigationScript()`
- Connect to `ws://${location.host}/ws`
- On message: preserve current slide index, fetch fresh `/`, replace `#slideshow` innerHTML via DOMParser, re-apply slide visibility to maintain position
- Reconnect on close with backoff (handles server restarts)

## Requirements
- `let rendered` instead of `const rendered` in `src/index.ts` (re-assigned on file change)
- No new dependencies — `node:fs` watch and WebSocket are built-in
- Debounce file change events (~100ms) to avoid redundant re-renders
- Hot-swap DOM content rather than full `location.reload()` to preserve current slide position

## Files to modify
- `src/index.ts` — file watcher, WebSocket upgrade, mutable rendered state
- `src/navigation/index.ts` — WebSocket client with hot-swap and reconnect

## Acceptance Criteria
- [ ] Editing and saving the markdown file triggers a re-render
- [ ] Connected browsers update within ~200ms of file save
- [ ] Current slide position is preserved across reloads
- [ ] Multiple browser tabs all receive the update
- [ ] WebSocket reconnects after server restart
- [ ] No new dependencies added