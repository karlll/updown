# Font Scaling for Slides

## Problem

Slides with large default fonts (for visibility during presentations) can overflow when containing lots of text or bullet points. Need automatic scaling to fit content within slide bounds while maintaining readability.

## Solution Overview

Scale the slide's `font-size` dynamically so content fits, with configurable min/max bounds. Use relative units (`em`, `rem`) for other elements (images, SVGs, icons) so they scale proportionally.

---

## Approach 1: JavaScript Dynamic Scaling (Recommended)

### Implementation

Add to `src/navigation/index.ts` or create new `src/scaling/index.ts`:

```typescript
function autoScaleSlide(slide: HTMLElement): void {
  const minFontSize = 16; // px
  const maxFontSize = 48; // px
  let fontSize = maxFontSize;
  
  slide.style.fontSize = `${fontSize}px`;
  
  // Reduce font size until content fits (both vertical and horizontal)
  while (
    (slide.scrollHeight > slide.clientHeight || 
     slide.scrollWidth > slide.clientWidth) && 
    fontSize > minFontSize
  ) {
    fontSize -= 1;
    slide.style.fontSize = `${fontSize}px`;
  }
}

function autoScaleAllSlides(): void {
  const slides = document.querySelectorAll<HTMLElement>(".slide");
  slides.forEach(autoScaleSlide);
}

// Call on load
document.addEventListener("DOMContentLoaded", autoScaleAllSlides);

// Call when changing slides (add to existing navigation logic)
```

### Pros
- Precise control over min/max font sizes
- Works with any content type
- Handles both vertical and horizontal overflow
- Browser compatibility excellent

### Cons
- Requires JavaScript
- Slight performance cost (negligible for typical slideshows)
- May need re-calculation on window resize

---

## Approach 2: CSS-Only with `clamp()` and Viewport Units

### Implementation

```css
.slide {
  font-size: clamp(1rem, 3vmin, 3rem);
  line-height: 1.4;
  overflow: hidden; /* or auto */
}
```

- `1rem` = minimum (typically 16px)
- `3vmin` = responsive size (3% of viewport's smaller dimension)
- `3rem` = maximum (typically 48px)

### Pros
- No JavaScript required
- Automatically responsive to viewport size
- Simple, declarative

### Cons
- Less precise control
- Doesn't detect actual content overflow
- May still overflow with extreme content amounts

---

## Approach 3: Container Queries (Modern Browsers)

### Implementation

```css
.slide {
  container-type: size;
  font-size: clamp(1rem, 5cqh, 3rem);
}
```

- `cqh` = container query height units
- Scales based on slide container size, not viewport

### Pros
- Modern CSS approach
- Responsive to container, not just viewport
- No JavaScript

### Cons
- Browser support (2023+: Chrome 105+, Firefox 110+, Safari 16+)
- Still doesn't detect actual overflow
- May need fallback for older browsers

---

## Approach 4: CSS Classes with Density Detection

### Implementation

```typescript
function categorizeSlideSize(slide: HTMLElement): string {
  const contentHeight = slide.scrollHeight;
  const containerHeight = slide.clientHeight;
  const ratio = contentHeight / containerHeight;
  
  if (ratio > 1.5) return 'scale-small';
  if (ratio > 1.2) return 'scale-medium';
  return 'scale-default';
}

slides.forEach(slide => {
  const sizeClass = categorizeSlideSize(slide);
  slide.classList.add(sizeClass);
});
```

```css
.slide.scale-default { font-size: 48px; }
.slide.scale-medium { font-size: 32px; }
.slide.scale-small { font-size: 20px; }
```

### Pros
- Granular control over scaling tiers
- Easy to customize per tier (not just font-size)
- Predictable rendering

### Cons
- Requires JavaScript
- Less smooth than continuous scaling
- Need to define breakpoints

---

## Scaling Images, SVGs, and Icons

### Use Relative Units

Instead of fixed pixel sizes, use `em` or `rem` units:

```css
.slide img,
.slide svg {
  max-width: 20em;  /* Scales with slide's font-size */
  height: auto;
}

.slide .icon {
  width: 2em;       /* 2× current font size */
  height: 2em;
}

.slide .logo {
  max-height: 5em;
  width: auto;
}
```

### Via Markdown Meta-Fences

```markdown
![My Image](image.png)
```meta
style: max-width: 15em; height: auto;
```
```

When JavaScript scales the slide's `font-size` from 48px → 24px:
- An element sized at `2em` scales from 96px → 48px
- An image at `max-width: 20em` scales from 960px → 480px

---

## Recommended Implementation

**Hybrid Approach:**

1. **CSS baseline** with `clamp()` for basic responsiveness
2. **JavaScript enhancement** for overflow detection and precise scaling
3. **Relative units** (`em`) for all images/icons/SVGs

```css
/* Base CSS */
.slide {
  font-size: clamp(1rem, 4vmin, 3rem);
  max-width: 100%;
  max-height: 100vh;
  overflow: hidden;
  padding: 2em;
}

.slide img,
.slide svg {
  max-width: 100%;
  max-height: 20em;
  height: auto;
}
```

```typescript
// Enhanced JavaScript (runs after CSS baseline)
function autoScaleSlide(slide: HTMLElement): void {
  const computedStyle = getComputedStyle(slide);
  const currentFontSize = parseFloat(computedStyle.fontSize);
  const minFontSize = 16;
  let fontSize = currentFontSize;
  
  while (
    (slide.scrollHeight > slide.clientHeight || 
     slide.scrollWidth > slide.clientWidth) && 
    fontSize > minFontSize
  ) {
    fontSize -= 0.5; // Smaller steps for smoother scaling
    slide.style.fontSize = `${fontSize}px`;
  }
}
```

---

## Configuration Options

### Via Front Matter

```markdown
---
fontSize: 40
minFontSize: 18
maxFontSize: 56
autoScale: true
---
```

### Via Meta-Fences (Per-Slide)

```markdown
---

```meta
data-font-size: 32
data-auto-scale: false
```

# This slide uses custom sizing
```

### Implementation in Parser

Extend `NodeMetadata` to include scaling config, pass to renderer, inject as data attributes for JavaScript to read.

---

## Browser Compatibility

| Approach | Chrome | Firefox | Safari | Edge |
|----------|--------|---------|--------|------|
| JS Dynamic Scaling | ✅ All | ✅ All | ✅ All | ✅ All |
| CSS `clamp()` | ✅ 79+ | ✅ 75+ | ✅ 13.1+ | ✅ 79+ |
| Container Queries | ✅ 105+ | ✅ 110+ | ✅ 16+ | ✅ 105+ |
| `vmin` units | ✅ All | ✅ All | ✅ All | ✅ All |

---

## Testing Strategy

1. Create test slides with varying content amounts:
   - Short slide (1 heading, 2 bullets)
   - Medium slide (1 heading, 10 bullets)
   - Long slide (1 heading, 30 bullets, images)

2. Verify scaling at different viewport sizes:
   - Desktop (1920×1080)
   - Laptop (1366×768)
   - Projector (1024×768)

3. Check element scaling:
   - Images scale proportionally
   - Icons maintain aspect ratios
   - Padding/margins stay consistent

4. Edge cases:
   - Single slide with massive text block
   - Slide with only large images
   - Mixed content (text + code blocks + images)
