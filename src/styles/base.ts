export const baseCSS = `
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: var(--line-height);
}

#slideshow {
  height: 100%;
}

.slide {
  position: relative;
  min-height: 100vh;
  padding: var(--slide-padding);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.slide.has-columns {
  padding: 0;
  justify-content: flex-start;
}

.slide.has-columns > :not(.columns) {
  padding: var(--slide-padding);
  padding-bottom: 0;
}

.columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: 0;
  width: 100%;
  flex: 1;
}

.column {
  padding: var(--slide-padding);
}

.accent-last-column .column:last-child {
  background: var(--code-bg);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-family-heading);
  font-weight: var(--heading-weight);
  text-transform: var(--heading-transform);
  letter-spacing: var(--heading-letter-spacing);
  line-height: var(--line-height-heading);
  margin-bottom: var(--heading-margin-bottom);
}

h1 { font-size: var(--h1-size); color: var(--h1-color); }
h2 { font-size: var(--h2-size); color: var(--h2-color); }

.slide h1 { font-size: var(--h1-size-fixed); }
.slide h2 { font-size: var(--h2-size-fixed); }
h3 { font-size: var(--h3-size); color: var(--h3-color); }
h4 { font-size: var(--h4-size); color: var(--h3-color); }
h5, h6 { color: var(--h3-color); }

p {
  margin-bottom: var(--block-margin);
}

a {
  color: var(--link);
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

a:hover {
  color: var(--link-hover);
  text-decoration-thickness: 2px;
}

code {
  font-family: var(--font-family-code);
  background: var(--code-bg);
  color: var(--code-fg);
  padding: 0.15em 0.35em;
  border-radius: var(--border-radius-inline);
  font-size: 0.9em;
}

pre {
  background: var(--fence-bg);
  color: var(--fence-fg);
  padding: 1.25em 1.5em;
  border-radius: var(--border-radius);
  border: 1px solid var(--code-border);
  overflow-x: auto;
  margin-bottom: var(--block-margin);
}

pre code {
  background: none;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: 0.8em;
}

.fence {
  margin-bottom: var(--block-margin);
}

blockquote {
  border-left: 3px solid var(--blockquote-border);
  padding-left: 1.25em;
  color: var(--blockquote-fg);
  margin-bottom: var(--block-margin);
}

ul, ol {
  padding-left: 1.5em;
  margin-bottom: var(--block-margin);
}

li {
  margin-bottom: 0.25em;
}

li::marker {
  color: var(--list-marker);
}

table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: var(--block-margin);
}

th, td {
  border: 1px solid var(--table-border);
  padding: 0.5em 0.75em;
  text-align: left;
}

th {
  background: var(--table-header-bg);
  font-weight: 600;
}

hr {
  border: none;
  border-top: 1px solid var(--hr-color);
  margin: 1.5em 0;
}

img {
  max-width: 100%;
  height: auto;
  border-radius: var(--border-radius);
}

.fence-mermaid,
.fence-plantuml,
.excalidraw-embed {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide > p:has(> .excalidraw-embed) {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
}

.slide > p:has(> .excalidraw-embed) > .excalidraw-embed {
  width: 100%;
  height: 100%;
}

.fence-mermaid svg,
.fence-plantuml svg,
.excalidraw-embed svg {
  max-height: 100%;
  width: auto;
  max-width: 100%;
}

.excalidraw-embed svg {
  filter: var(--excalidraw-filter, none);
}

#slideshow[data-fm-svg-scaling="false"] .fence-mermaid,
#slideshow[data-fm-svg-scaling="false"] .fence-plantuml,
#slideshow[data-fm-svg-scaling="false"] .excalidraw-embed {
  flex: 0 0 auto;
  min-height: auto;
  overflow: visible;
}

#slideshow[data-fm-svg-scaling="false"] .slide > p:has(> .excalidraw-embed) {
  flex: 0 0 auto;
  min-height: auto;
  overflow: visible;
  display: block;
}

em { font-style: italic; color: var(--em); }
strong { font-weight: 700; color: var(--strong); }

.svg-nav-host {
  position: relative;
  display: inline-block;
  width: fit-content;
  max-width: 100%;
  line-height: 0;
}

.fence-mermaid .svg-nav-host,
.fence-plantuml .svg-nav-host,
.excalidraw-embed .svg-nav-host {
  width: 100%;
  height: 100%;
}

#slideshow[data-fm-svg-scaling="false"] .fence-mermaid .svg-nav-host,
#slideshow[data-fm-svg-scaling="false"] .fence-plantuml .svg-nav-host,
#slideshow[data-fm-svg-scaling="false"] .excalidraw-embed .svg-nav-host {
  width: fit-content;
}

.svg-nav-overlay {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 130ms ease;
  pointer-events: none;
  display: grid;
}

.svg-nav-host:hover > .svg-nav-overlay,
.svg-nav-host.svg-nav-hover > .svg-nav-overlay {
  opacity: 1;
  pointer-events: auto;
}

.svg-nav-controls {
  justify-self: end;
  align-self: end;
  margin: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 4px;
}

.svg-nav-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.svg-nav-btn svg {
  width: 18px;
  height: 18px;
  display: block;
}

.svg-nav-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.svg-nav-host.svg-nav-grab-ready {
  cursor: grab;
}

.svg-nav-host.svg-nav-dragging {
  cursor: grabbing;
}
`.trim();
