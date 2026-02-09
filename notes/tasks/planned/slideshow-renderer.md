---
id: "474bfde7-94d9-4dfc-9d7e-2b86a204f4ff"
number: 8
title: "Slideshow renderer"
createdAt: "2026-02-09T20:24:13.034881Z"
updatedAt: "2026-02-09T20:24:13.034881Z"
assignees: []
categories:
- "renderer"
priority: "high"
order: 8
---

## Overview
Implement `src/renderer/index.ts` — takes a `SlideShow` and produces the complete HTML structure: the outer slideshow div with front matter attributes, individual slide divs with correct IDs and classes, and the full HTML document wrapper.

## Requirements
- Export function `render(slideshow: SlideShow, fenceRegistry: FenceRegistry): RenderedSlideShow`
- Returns `RenderedSlideShow` with:
  - `fullDocument`: complete HTML document (doctype, html, head, body) with navigation script injected
  - `slideFragments`: `Map<number, string>` of individual slide HTML fragments keyed by slide index
- Outer div: `<div id="slideshow" {data-fm-* attributes} {class="..."}>`
- Front matter `attributes` rendered as HTML attributes on the slideshow div
- Front matter `cssClasses` rendered as a `class` attribute on the slideshow div
- Each slide: `<div id="slide-{n}" class="slide {first?} {last?}">`
- Class rules:
  - Single slide → `slide first`
  - First of many → `slide first`
  - Last of many → `slide last`
  - Middle slides → `slide`
- Render each slide's nodes using `renderNode()` from `nodes.ts`
- The slide fragment (for `GET /slide/:n`) is the inner HTML of the slide div (not the div itself)

## Acceptance Criteria
- [ ] Slideshow div has `id="slideshow"`
- [ ] Front matter `data-fm-*` attributes appear on slideshow div
- [ ] Front matter `class` appears as `class` attribute on slideshow div
- [ ] Slide divs have sequential `id="slide-1"`, `id="slide-2"`, etc.
- [ ] `first` and `last` classes applied correctly for 1, 2, and many slides
- [ ] `fullDocument` is a valid HTML document with doctype, head, body
- [ ] `slideFragments` map contains each slide's inner HTML
- [ ] Navigation script is included in the full document