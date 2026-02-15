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
  min-height: 100vh;
  padding: var(--slide-padding);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--heading);
  font-family: var(--font-family-heading);
  font-weight: var(--heading-weight);
  text-transform: var(--heading-transform);
  letter-spacing: var(--heading-letter-spacing);
  line-height: var(--line-height-heading);
  margin-bottom: var(--heading-margin-bottom);
}

h1 { font-size: var(--h1-size); }
h2 { font-size: var(--h2-size); }
h3 { font-size: var(--h3-size); }
h4 { font-size: var(--h4-size); }

p {
  margin-bottom: var(--block-margin);
}

a {
  color: var(--link);
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

a:hover {
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

.excalidraw-embed svg {
  max-width: 100%;
  height: auto;
  filter: var(--excalidraw-filter, none);
}

.fence-mermaid svg {
  max-width: 100%;
  height: auto;
}

.fence-plantuml svg {
  max-width: 100%;
  height: auto;
}

em { font-style: italic; }
strong { font-weight: 700; }
`.trim();
