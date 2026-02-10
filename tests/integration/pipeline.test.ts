import { describe, expect, test } from "bun:test";
import { parse } from "../../src/parser/index.ts";
import { render, FenceRegistry } from "../../src/renderer/index.ts";

const reg = new FenceRegistry();

/** Strip whitespace between tags for structural comparison */
function normalize(html: string): string {
  return html.replace(/>\s+</g, "><").trim();
}

function renderSlideshow(markdown: string): string {
  const slideshow = parse(markdown);
  const result = render(slideshow, reg);
  // Extract just the slideshow div from the full document
  const match = result.fullDocument.match(/<div id="slideshow"[\s\S]*<\/div>\n/);
  return match ? normalize(match[0]) : "";
}

describe("pipeline: Example 1 — detailed", () => {
  const markdown = `---
theme: updown-catppuccin
style: dark
class:
 - foo
 - bar
---

# Slide title

## Slide 2

- foo
- bar
  - baz
  - bog

\`\`\`python
print("Hello World!")
\`\`\`

> block quote line 1
> block quote line 2

## Slide 3

Some content. This is \`inline\` code.
[a link](http://test.com)

### Subsection, slide 3

1. List item 1
2. List item 2
3. List item 3

## Slide 4

This is a paragraph

| Row1 | Row2 |
|------|------|
| foo  | bar  |
`;

  const slideshow = parse(markdown);
  const result = render(slideshow, reg);

  test("front matter attributes on slideshow div", () => {
    expect(result.fullDocument).toContain('data-fm-theme="updown-catppuccin"');
    expect(result.fullDocument).toContain('data-fm-style="dark"');
  });

  test("front matter class on slideshow div", () => {
    expect(result.fullDocument).toContain('class="foo bar"');
  });

  test("produces 4 slides", () => {
    expect(slideshow.slides).toHaveLength(4);
  });

  test("slide 1: h1 only", () => {
    const frag = result.slideFragments.get(1)!;
    expect(frag).toContain("<h1>Slide title</h1>");
  });

  test("slide 2: h2, nested list, code fence, blockquote", () => {
    const frag = result.slideFragments.get(2)!;
    expect(frag).toContain("<h2>Slide 2</h2>");
    expect(frag).toContain("<ul>");
    expect(frag).toContain("<li>foo</li>");
    // Nested list (remark wraps loose list items in <p>)
    expect(frag).toContain("<li><p>bar</p><ul><li>baz</li><li>bog</li></ul></li>");
    // Code fence
    expect(frag).toContain('class="fence python"');
    expect(frag).toContain("print(&quot;Hello World!&quot;)");
    // Blockquote
    expect(frag).toContain("<blockquote>");
  });

  test("slide 3: h2, paragraph with inline code and link, h3, ordered list", () => {
    const frag = result.slideFragments.get(3)!;
    expect(frag).toContain("<h2>Slide 3</h2>");
    expect(frag).toContain("<code>inline</code>");
    expect(frag).toContain('<a href="http://test.com">a link</a>');
    expect(frag).toContain("<h3>Subsection, slide 3</h3>");
    expect(frag).toContain("<ol>");
    expect(frag).toContain("<li>List item 1</li>");
  });

  test("slide 4: h2, paragraph, table", () => {
    const frag = result.slideFragments.get(4)!;
    expect(frag).toContain("<h2>Slide 4</h2>");
    expect(frag).toContain("<p>This is a paragraph</p>");
    expect(frag).toContain("<table>");
    expect(frag).toContain("<thead><tr><th>Row1</th><th>Row2</th></tr></thead>");
    expect(frag).toContain("<tbody><tr><td>foo</td><td>bar</td></tr></tbody>");
  });

  test("slide div classes: first and last", () => {
    expect(result.fullDocument).toContain('id="slide-1" class="slide first"');
    expect(result.fullDocument).toContain('id="slide-4" class="slide last"');
  });

  test("middle slides have only 'slide' class", () => {
    const slide2 = result.fullDocument.match(/id="slide-2" class="([^"]*)"/);
    const slide3 = result.fullDocument.match(/id="slide-3" class="([^"]*)"/);
    expect(slide2![1]).toBe("slide");
    expect(slide3![1]).toBe("slide");
  });
});

describe("pipeline: Example 2 — slide separation", () => {
  const markdown = `# Example

---

foo

---

bar

---

baz

---

## Bob

gog
`;

  const slideshow = parse(markdown);
  const result = render(slideshow, reg);

  test("produces 5 slides", () => {
    expect(slideshow.slides).toHaveLength(5);
  });

  test("slide 1: h1", () => {
    expect(result.slideFragments.get(1)).toContain("<h1>Example</h1>");
  });

  test("slide 2: paragraph 'foo'", () => {
    expect(result.slideFragments.get(2)).toContain("<p>foo</p>");
  });

  test("slide 3: paragraph 'bar'", () => {
    expect(result.slideFragments.get(3)).toContain("<p>bar</p>");
  });

  test("slide 4: paragraph 'baz'", () => {
    expect(result.slideFragments.get(4)).toContain("<p>baz</p>");
  });

  test("slide 5: h2 and paragraph", () => {
    const frag = result.slideFragments.get(5)!;
    expect(frag).toContain("<h2>Bob</h2>");
    expect(frag).toContain("<p>gog</p>");
  });

  test("--- followed by h2 produces one transition, not two", () => {
    // If it were two, we'd have 6 slides (empty slide + Bob slide)
    expect(slideshow.slides).toHaveLength(5);
    // Slide 5 starts with the heading, not an empty slide before it
    expect(slideshow.slides[4]!.nodes[0]!.type).toBe("heading");
  });
});

describe("pipeline: meta-fence integration", () => {
  const markdown = `## Heading

\`\`\`meta
color: red
class: highlight
\`\`\`

Some text.
`;

  test("meta attributes appear on correct element in HTML", () => {
    const slideshow = parse(markdown);
    const result = render(slideshow, reg);
    const frag = result.slideFragments.get(1)!;
    expect(frag).toContain('class="highlight"');
    expect(frag).toContain('data-meta-color="red"');
    expect(frag).toContain("<h2");
    // Meta code block should not appear
    expect(frag).not.toContain("fence meta");
  });
});

describe("pipeline: slide-level metadata", () => {
  const markdown = `# Slide 1

---

\`\`\`meta
class: dark
bg: hero
\`\`\`

Content here.
`;

  test("slide metadata appears on slide div", () => {
    const slideshow = parse(markdown);
    const result = render(slideshow, reg);
    // Slide 2 should have the metadata
    expect(result.fullDocument).toContain('class="slide last dark"');
    expect(result.fullDocument).toContain('data-meta-bg="hero"');
  });
});

describe("pipeline: no front matter", () => {
  const markdown = `# Just a slide

Content.
`;

  test("slideshow div has no data-fm attributes or class", () => {
    const result = render(parse(markdown), reg);
    const match = result.fullDocument.match(/<div id="slideshow"([^>]*)>/);
    expect(match).toBeTruthy();
    expect(match![1]).not.toContain("data-fm-");
    expect(match![1]).not.toContain("class=");
  });
});

describe("pipeline: empty markdown", () => {
  test("produces slideshow div with no slide children", () => {
    const result = render(parse(""), reg);
    expect(result.fullDocument).toContain('id="slideshow"');
    expect(result.slideFragments.size).toBe(0);
    // No slide divs
    expect(result.fullDocument).not.toContain('id="slide-');
  });
});
