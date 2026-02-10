import { describe, expect, test } from "bun:test";
import { parse } from "../../src/parser/index.ts";

describe("parse", () => {
  test("returns empty slideshow for empty markdown", () => {
    const result = parse("");
    expect(result.frontMatter).toEqual({ attributes: {}, cssClasses: [] });
    expect(result.slides).toHaveLength(0);
  });

  test("extracts front matter", () => {
    const md = `---
theme: dark
class: intro
---

# Hello`;
    const result = parse(md);
    expect(result.frontMatter.attributes).toEqual({ "data-fm-theme": "dark" });
    expect(result.frontMatter.cssClasses).toEqual(["intro"]);
  });

  test("front matter is not present in any slide", () => {
    const md = `---
foo: bar
---

# Slide 1`;
    const result = parse(md);
    for (const slide of result.slides) {
      for (const node of slide.nodes) {
        expect(node.type).not.toBe("yaml");
      }
    }
  });

  test("splits slides on h1 and h2", () => {
    const md = `# Slide 1

Content

## Slide 2

More content`;
    const result = parse(md);
    expect(result.slides).toHaveLength(2);
    expect(result.slides[0]!.index).toBe(1);
    expect(result.slides[1]!.index).toBe(2);
  });

  test("splits slides on ---", () => {
    const md = `Content A

---

Content B`;
    const result = parse(md);
    expect(result.slides).toHaveLength(2);
  });

  test("--- followed by h1 produces one transition", () => {
    const md = `Intro

---

# Title`;
    const result = parse(md);
    expect(result.slides).toHaveLength(2);
    expect(result.slides[1]!.nodes[0]!.type).toBe("heading");
  });

  test("meta-fences are processed and removed", () => {
    const md = `## Heading

\`\`\`meta
color: red
\`\`\`

Some text`;
    const result = parse(md);
    expect(result.slides).toHaveLength(1);
    // Meta-fence should be removed
    for (const node of result.slides[0]!.nodes) {
      if (node.type === "code") {
        expect(node.lang).not.toBe("meta");
      }
    }
    // Heading should have metadata
    const heading = result.slides[0]!.nodes[0]! as { type: string; data?: Record<string, unknown> };
    expect(heading.data?.meta).toEqual({
      attributes: { "data-meta-color": "red" },
      cssClasses: [],
    });
  });

  test("slide-level metadata from meta-fence after ---", () => {
    const md = `# Slide 1

---

\`\`\`meta
class: dark
bg: hero
\`\`\`

Content`;
    const result = parse(md);
    expect(result.slides).toHaveLength(2);
    expect(result.slides[1]!.metadata).toEqual({
      attributes: { "data-meta-bg": "hero" },
      cssClasses: ["dark"],
    });
  });

  test("--- + meta-fence + heading produces one slide with metadata", () => {
    const md = `Intro

---

\`\`\`meta
class: special
\`\`\`

# Title

Body`;
    const result = parse(md);
    expect(result.slides).toHaveLength(2);
    expect(result.slides[1]!.metadata.cssClasses).toEqual(["special"]);
    expect(result.slides[1]!.nodes[0]!.type).toBe("heading");
  });

  test("non-meta code fences are preserved", () => {
    const md = `# Code Example

\`\`\`javascript
console.log("hello");
\`\`\``;
    const result = parse(md);
    const codeNode = result.slides[0]!.nodes.find((n) => n.type === "code");
    expect(codeNode).toBeDefined();
    expect((codeNode as { lang: string }).lang).toBe("javascript");
  });

  test("full round-trip: front matter + slides + meta-fences", () => {
    const md = `---
theme: corporate
class:
  - wide
  - dark
---

# Welcome

Introduction paragraph.

---

\`\`\`meta
class: highlight
\`\`\`

## Features

- Item one
- Item two

\`\`\`meta
data: features-list
\`\`\`

## Summary

Final thoughts.`;
    const result = parse(md);

    // Front matter
    expect(result.frontMatter.attributes).toEqual({ "data-fm-theme": "corporate" });
    expect(result.frontMatter.cssClasses).toEqual(["wide", "dark"]);

    // 3 slides: Welcome, Features, Summary
    expect(result.slides).toHaveLength(3);
    expect(result.slides[0]!.index).toBe(1);
    expect(result.slides[1]!.index).toBe(2);
    expect(result.slides[2]!.index).toBe(3);

    // Slide 2 has slide-level metadata from --- + meta-fence + heading
    expect(result.slides[1]!.metadata.cssClasses).toEqual(["highlight"]);

    // The list in slide 2 should have node-level metadata
    const listNode = result.slides[1]!.nodes.find((n) => n.type === "list") as {
      type: string;
      data?: Record<string, unknown>;
    } | undefined;
    expect(listNode).toBeDefined();
    expect(listNode!.data?.meta).toEqual({
      attributes: { "data-meta-data": "features-list" },
      cssClasses: [],
    });

    // No meta code nodes remain
    for (const slide of result.slides) {
      for (const node of slide.nodes) {
        if (node.type === "code") {
          expect((node as { lang: string | null }).lang).not.toBe("meta");
        }
      }
    }
  });
});
