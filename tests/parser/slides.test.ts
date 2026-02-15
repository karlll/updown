import { describe, expect, test } from "bun:test";
import { splitIntoSlides } from "../../src/parser/slides.ts";
import type { RootContent, Code, Heading, Paragraph, ThematicBreak } from "mdast";

function h(depth: 1 | 2 | 3 | 4 | 5 | 6, text: string): Heading {
  return { type: "heading", depth, children: [{ type: "text", value: text }] };
}

function p(text: string): Paragraph {
  return { type: "paragraph", children: [{ type: "text", value: text }] };
}

const hr: ThematicBreak = { type: "thematicBreak" };

function metaCode(value: string): Code {
  return { type: "code", lang: "meta", value };
}

describe("splitIntoSlides", () => {
  test("empty input returns empty array", () => {
    expect(splitIntoSlides([])).toEqual([]);
  });

  test("h1 starts a new slide", () => {
    const slides = splitIntoSlides([h(1, "Title"), p("body")]);
    expect(slides).toHaveLength(1);
    expect(slides[0]!.index).toBe(1);
    expect(slides[0]!.nodes).toEqual([h(1, "Title"), p("body")]);
  });

  test("h2 starts a new slide", () => {
    const slides = splitIntoSlides([p("intro"), h(2, "Section")]);
    expect(slides).toHaveLength(2);
    expect(slides[0]!.nodes).toEqual([p("intro")]);
    expect(slides[1]!.nodes).toEqual([h(2, "Section")]);
  });

  test("h3 does NOT start a new slide", () => {
    const slides = splitIntoSlides([h(1, "Title"), h(3, "Sub"), p("body")]);
    expect(slides).toHaveLength(1);
    expect(slides[0]!.nodes).toEqual([h(1, "Title"), h(3, "Sub"), p("body")]);
  });

  test("h4, h5, h6 do NOT start new slides", () => {
    const slides = splitIntoSlides([p("a"), h(4, "h4"), h(5, "h5"), h(6, "h6"), p("b")]);
    expect(slides).toHaveLength(1);
    expect(slides[0]!.nodes).toHaveLength(5);
  });

  test("thematic break starts a new slide below it", () => {
    const slides = splitIntoSlides([p("above"), hr, p("below")]);
    expect(slides).toHaveLength(2);
    expect(slides[0]!.nodes).toEqual([p("above")]);
    expect(slides[1]!.nodes).toEqual([p("below")]);
  });

  test("thematic break is consumed (not in any slide)", () => {
    const slides = splitIntoSlides([p("a"), hr, p("b")]);
    for (const slide of slides) {
      for (const node of slide.nodes) {
        expect(node.type).not.toBe("thematicBreak");
      }
    }
  });

  test("--- followed by h1 produces only one slide transition", () => {
    const slides = splitIntoSlides([p("intro"), hr, h(1, "Title"), p("body")]);
    expect(slides).toHaveLength(2);
    expect(slides[0]!.nodes).toEqual([p("intro")]);
    expect(slides[1]!.nodes).toEqual([h(1, "Title"), p("body")]);
  });

  test("--- followed by h2 produces only one slide transition", () => {
    const slides = splitIntoSlides([p("intro"), hr, h(2, "Section"), p("body")]);
    expect(slides).toHaveLength(2);
    expect(slides[0]!.nodes).toEqual([p("intro")]);
    expect(slides[1]!.nodes).toEqual([h(2, "Section"), p("body")]);
  });

  test("content before first heading goes into slide 1", () => {
    const slides = splitIntoSlides([p("orphan"), h(1, "Title")]);
    expect(slides).toHaveLength(2);
    expect(slides[0]!.index).toBe(1);
    expect(slides[0]!.nodes).toEqual([p("orphan")]);
    expect(slides[1]!.index).toBe(2);
  });

  test("slides are numbered sequentially starting from 1", () => {
    const slides = splitIntoSlides([h(1, "A"), h(2, "B"), h(1, "C")]);
    expect(slides.map((s) => s.index)).toEqual([1, 2, 3]);
  });

  test("task spec example: 5 slides with mixed --- and headings", () => {
    const nodes: RootContent[] = [
      h(1, "Example"),
      hr,
      p("foo"),
      hr,
      p("bar"),
      hr,
      p("baz"),
      hr,
      h(2, "Bob"),
      p("gog"),
    ];
    const slides = splitIntoSlides(nodes);
    expect(slides).toHaveLength(5);
    expect(slides[0]!.nodes).toEqual([h(1, "Example")]);
    expect(slides[1]!.nodes).toEqual([p("foo")]);
    expect(slides[2]!.nodes).toEqual([p("bar")]);
    expect(slides[3]!.nodes).toEqual([p("baz")]);
    expect(slides[4]!.nodes).toEqual([h(2, "Bob"), p("gog")]);
  });

  test("multiple consecutive thematic breaks", () => {
    const slides = splitIntoSlides([p("a"), hr, hr, p("b")]);
    expect(slides).toHaveLength(2);
    expect(slides[0]!.nodes).toEqual([p("a")]);
    expect(slides[1]!.nodes).toEqual([p("b")]);
  });

  test("thematic break at very start with content after", () => {
    const slides = splitIntoSlides([hr, p("content")]);
    expect(slides).toHaveLength(1);
    expect(slides[0]!.nodes).toEqual([p("content")]);
  });

  test("thematic break at the end is consumed", () => {
    const slides = splitIntoSlides([p("content"), hr]);
    expect(slides).toHaveLength(1);
    expect(slides[0]!.nodes).toEqual([p("content")]);
  });

  test("--- + meta-fence + h1 produces one slide transition with meta-fence in new slide", () => {
    const meta = metaCode("bg: red");
    const slides = splitIntoSlides([p("intro"), hr, meta, h(1, "Title"), p("body")]);
    expect(slides).toHaveLength(2);
    expect(slides[0]!.nodes).toEqual([p("intro")]);
    expect(slides[1]!.nodes).toEqual([meta, h(1, "Title"), p("body")]);
  });

  test("--- + meta-fence + h2 produces one slide transition", () => {
    const meta = metaCode("class: fancy");
    const slides = splitIntoSlides([p("intro"), hr, meta, h(2, "Section"), p("body")]);
    expect(slides).toHaveLength(2);
    expect(slides[0]!.nodes).toEqual([p("intro")]);
    expect(slides[1]!.nodes).toEqual([meta, h(2, "Section"), p("body")]);
  });

  test("--- + multiple meta-fences + heading produces one slide transition", () => {
    const meta1 = metaCode("a: 1");
    const meta2 = metaCode("b: 2");
    const slides = splitIntoSlides([p("intro"), hr, meta1, meta2, h(1, "Title")]);
    expect(slides).toHaveLength(2);
    expect(slides[1]!.nodes).toEqual([meta1, meta2, h(1, "Title")]);
  });

  test("--- + meta-fence without heading is a regular break (meta in new slide)", () => {
    const meta = metaCode("bg: blue");
    const slides = splitIntoSlides([p("above"), hr, meta, p("below")]);
    // meta-fence is not a heading, so --- is a regular break
    // meta-fence and p("below") end up in the new slide
    expect(slides).toHaveLength(2);
    expect(slides[0]!.nodes).toEqual([p("above")]);
    expect(slides[1]!.nodes).toEqual([meta, p("below")]);
  });

  test("all slides have empty metadata by default", () => {
    const slides = splitIntoSlides([h(1, "A"), hr, p("B")]);
    for (const slide of slides) {
      expect(slide.metadata).toEqual({ attributes: {}, cssClasses: [] });
    }
  });

  test("paragraph with text '+++' is not treated as a slide break", () => {
    const slides = splitIntoSlides([h(2, "Title"), p("+++"), p("after")]);
    expect(slides).toHaveLength(1);
    expect(slides[0]!.nodes).toHaveLength(3);
  });
});
