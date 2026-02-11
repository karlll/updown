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
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 1.5rem;
  line-height: 1.6;
}

#slideshow {
  height: 100%;
}

.slide {
  min-height: 100vh;
  padding: 4rem 6rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--heading);
  line-height: 1.2;
  margin-bottom: 0.75em;
}

h1 { font-size: 2.5em; }
h2 { font-size: 2em; }
h3 { font-size: 1.5em; }
h4 { font-size: 1.25em; }

p {
  margin-bottom: 0.75em;
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
  font-family: ui-monospace, "Cascadia Code", "JetBrains Mono", Menlo, monospace;
  background: var(--code-bg);
  color: var(--code-fg);
  padding: 0.15em 0.35em;
  border-radius: 4px;
  font-size: 0.9em;
}

pre {
  background: var(--fence-bg);
  color: var(--fence-fg);
  padding: 1.25em 1.5em;
  border-radius: 8px;
  border: 1px solid var(--code-border);
  overflow-x: auto;
  margin-bottom: 0.75em;
}

pre code {
  background: none;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: 0.8em;
}

.fence {
  margin-bottom: 0.75em;
}

blockquote {
  border-left: 3px solid var(--blockquote-border);
  padding-left: 1.25em;
  color: var(--blockquote-fg);
  margin-bottom: 0.75em;
}

ul, ol {
  padding-left: 1.5em;
  margin-bottom: 0.75em;
}

li {
  margin-bottom: 0.25em;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 0.75em;
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
  border-radius: 8px;
}

em { font-style: italic; }
strong { font-weight: 700; }
`.trim();
