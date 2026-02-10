import { describe, expect, test } from "bun:test";
import { render, FenceRegistry } from "../../src/renderer/index.ts";
import type { SlideShow } from "../../src/parser/types.ts";
import type { RootContent } from "mdast";

const reg = new FenceRegistry();
import type { NodeMetadata } from "../../src/parser/types.ts";

const emptyMeta: NodeMetadata = { attributes: {}, cssClasses: [] };

function makeShow(overrides: Partial<SlideShow> = {}): SlideShow {
  return {
    frontMatter: overrides.frontMatter ?? emptyMeta,
    slides: overrides.slides ?? [],
  };
}

function textSlide(index: number, text: string, metadata = emptyMeta): SlideShow["slides"][number] {
  return {
    index,
    nodes: [{ type: "paragraph", children: [{ type: "text", value: text }] }] as RootContent[],
    metadata,
  };
}

describe("render", () => {
  describe("slideshow div", () => {
    test("has id='slideshow'", () => {
      const result = render(makeShow(), reg);
      expect(result.fullDocument).toContain('id="slideshow"');
    });

    test("front matter data-fm-* attributes appear on slideshow div", () => {
      const show = makeShow({
        frontMatter: { attributes: { "data-fm-theme": "dark" }, cssClasses: [] },
      });
      const result = render(show, reg);
      expect(result.fullDocument).toContain('data-fm-theme="dark"');
    });

    test("front matter class appears as class attribute", () => {
      const show = makeShow({
        frontMatter: { attributes: {}, cssClasses: ["wide", "dark"] },
      });
      const result = render(show, reg);
      expect(result.fullDocument).toContain('class="wide dark"');
    });

    test("no class attribute when no front matter classes", () => {
      const result = render(makeShow(), reg);
      // The slideshow div should not have a class attribute
      const match = result.fullDocument.match(/<div id="slideshow"([^>]*)>/);
      expect(match).toBeTruthy();
      expect(match![1]).not.toContain("class=");
    });
  });

  describe("slide divs", () => {
    test("sequential ids: slide-1, slide-2", () => {
      const show = makeShow({ slides: [textSlide(1, "A"), textSlide(2, "B")] });
      const result = render(show, reg);
      expect(result.fullDocument).toContain('id="slide-1"');
      expect(result.fullDocument).toContain('id="slide-2"');
    });

    test("single slide gets 'slide first' (no last)", () => {
      const show = makeShow({ slides: [textSlide(1, "Only")] });
      const result = render(show, reg);
      expect(result.fullDocument).toContain('class="slide first last"');
    });

    test("first of many gets 'slide first'", () => {
      const show = makeShow({ slides: [textSlide(1, "A"), textSlide(2, "B")] });
      const result = render(show, reg);
      expect(result.fullDocument).toMatch(/id="slide-1" class="slide first"/);
    });

    test("last of many gets 'slide last'", () => {
      const show = makeShow({ slides: [textSlide(1, "A"), textSlide(2, "B")] });
      const result = render(show, reg);
      expect(result.fullDocument).toMatch(/id="slide-2" class="slide last"/);
    });

    test("middle slide gets only 'slide'", () => {
      const show = makeShow({
        slides: [textSlide(1, "A"), textSlide(2, "B"), textSlide(3, "C")],
      });
      const result = render(show, reg);
      expect(result.fullDocument).toMatch(/id="slide-2" class="slide"/);
      // Make sure middle doesn't have first or last
      const middleDiv = result.fullDocument.match(/id="slide-2" class="([^"]*)"/);
      expect(middleDiv![1]).toBe("slide");
    });
  });

  describe("slide-level metadata", () => {
    test("slide metadata classes appear on slide div", () => {
      const meta = { attributes: {}, cssClasses: ["dark", "hero"] };
      const show = makeShow({ slides: [textSlide(1, "A", meta)] });
      const result = render(show, reg);
      expect(result.fullDocument).toContain('class="slide first last dark hero"');
    });

    test("slide metadata attributes appear on slide div", () => {
      const meta = { attributes: { "data-meta-bg": "red" }, cssClasses: [] };
      const show = makeShow({ slides: [textSlide(1, "A", meta)] });
      const result = render(show, reg);
      expect(result.fullDocument).toContain('data-meta-bg="red"');
    });
  });

  describe("fullDocument structure", () => {
    test("starts with doctype", () => {
      const result = render(makeShow(), reg);
      expect(result.fullDocument).toStartWith("<!DOCTYPE html>");
    });

    test("has html, head, body tags", () => {
      const result = render(makeShow(), reg);
      expect(result.fullDocument).toContain("<html>");
      expect(result.fullDocument).toContain("<head>");
      expect(result.fullDocument).toContain("<body>");
      expect(result.fullDocument).toContain("</html>");
    });

    test("has meta charset and title", () => {
      const result = render(makeShow(), reg);
      expect(result.fullDocument).toContain('<meta charset="utf-8">');
      expect(result.fullDocument).toContain("<title>updown</title>");
    });

    test("includes navigation script when provided", () => {
      const result = render(makeShow(), reg, "console.log('nav')");
      expect(result.fullDocument).toContain("<script>console.log('nav')</script>");
    });

    test("no script tag when navigation script not provided", () => {
      const result = render(makeShow(), reg);
      expect(result.fullDocument).not.toContain("<script>");
    });
  });

  describe("slideFragments", () => {
    test("contains each slide's inner HTML", () => {
      const show = makeShow({ slides: [textSlide(1, "Hello"), textSlide(2, "World")] });
      const result = render(show, reg);
      expect(result.slideFragments.get(1)).toBe("<p>Hello</p>");
      expect(result.slideFragments.get(2)).toBe("<p>World</p>");
    });

    test("empty for no slides", () => {
      const result = render(makeShow(), reg);
      expect(result.slideFragments.size).toBe(0);
    });
  });
});
