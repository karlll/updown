---
id: "873df406-7ec5-4d9f-a326-da0aa7be700e"
number: 13
title: "Auto-scale slide content via font-size reduction"
createdAt: "2026-02-11T18:41:05.417542Z"
updatedAt: "2026-02-11T18:45:32.848736Z"
assignees:
- "Claude Code"
categories:
- "navigation"
priority: "medium"
order: 2
---

## Overview
Automatically reduce font-size on slides whose content overflows the viewport, so all content fits on screen without scrolling. Only scales down when content actually overflows — default sizes are preserved otherwise.

## Approach
Reduce the slide's root `font-size` until `scrollHeight <= availableHeight`. Since the base CSS uses `em` units throughout (headings, margins, code blocks), reducing `font-size` on the slide div cascades proportionally to all text content. Text reflows naturally into available horizontal space as it shrinks.

Use binary search over font-size for fast convergence (~6-8 iterations) rather than linear stepping.

## Implementation

### Trigger points
- On initial slide display (DOMContentLoaded)
- On slide navigation (ArrowLeft/ArrowRight)
- On window resize

### Algorithm (per slide)
```javascript
function fitSlide(slide) {
  // Reset to default before measuring
  slide.style.fontSize = "";
  if (slide.scrollHeight <= window.innerHeight) return;

  let lo = MIN_FONT_SIZE;  // e.g. 0.5rem — floor to keep text readable
  let hi = DEFAULT_SIZE;   // the base font-size from CSS (1.5rem = 24px)

  while (hi - lo > 0.5) {
    const mid = (lo + hi) / 2;
    slide.style.fontSize = mid + "px";
    if (slide.scrollHeight > window.innerHeight) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  slide.style.fontSize = lo + "px";
}
```

### Integration
- Add `fitSlide()` to `src/navigation/index.ts` inside `generateNavigationScript()`
- Call it after showing a slide (in the ArrowLeft/ArrowRight handler and on initial load)
- Add a `resize` event listener on `window` that re-fits the current slide
- Reset `fontSize` to `""` before measuring so previously-scaled slides get re-evaluated (e.g. after window resize makes more room)

## Edge cases
- Slide with no overflow: no font-size change, default styling preserved
- Window resize making more room: reset and re-measure, font may grow back to default
- Minimum font-size floor: stop reducing at a readable minimum (~10px) to avoid illegible text
- Hidden slides: only measure/fit the currently visible slide (hidden slides have no layout dimensions)

## Files to modify
- `src/navigation/index.ts` — add `fitSlide()` function and call it on slide show, navigation, and resize

## Acceptance Criteria
- [ ] Slides with content that fits the viewport use the default font-size (no scaling)
- [ ] Slides with overflowing content are scaled down until content fits
- [ ] Font-size never goes below a readable minimum
- [ ] Scaling is recalculated on window resize
- [ ] Slide position is preserved when scaling changes
- [ ] Headings, body text, code, and margins all scale proportionally
- [ ] No flicker or visible resize loop during scaling