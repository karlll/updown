import { describe, expect, test } from "bun:test";
import { render, FenceRegistry } from "../../src/renderer/index.ts";
import type { SlideShow, Slide } from "../../src/parser/types.ts";
import type { RootContent } from "mdast";

const reg = new FenceRegistry();
const emptyMeta = { attributes: {}, cssClasses: [] };

function makeShow(slides: Slide[]): SlideShow {
  return { frontMatter: emptyMeta, slides };
}

function heading(depth: 1 | 2, text: string): RootContent {
  return { type: "heading", depth, children: [{ type: "text", value: text }] } as RootContent;
}

function para(text: string): RootContent {
  return { type: "paragraph", children: [{ type: "text", value: text }] } as RootContent;
}

describe("column rendering", () => {
  test("slide with columns wraps in div.columns and div.column", () => {
    const slide: Slide = {
      index: 1,
      nodes: [heading(2, "Title")],
      metadata: emptyMeta,
      columns: [[para("Left")], [para("Right")]],
    };
    const result = render(makeShow([slide]), reg);
    const html = result.slideFragments.get(1)!;
    expect(html).toContain('<div class="columns">');
    expect(html).toContain('<div class="column">');
    expect(html).toContain("<p>Left</p>");
    expect(html).toContain("<p>Right</p>");
  });

  test("preamble heading is rendered before columns", () => {
    const slide: Slide = {
      index: 1,
      nodes: [heading(2, "Title")],
      metadata: emptyMeta,
      columns: [[para("A")], [para("B")]],
    };
    const result = render(makeShow([slide]), reg);
    const html = result.slideFragments.get(1)!;
    const headingIdx = html.indexOf("<h2>Title</h2>");
    const columnsIdx = html.indexOf('<div class="columns">');
    expect(headingIdx).toBeLessThan(columnsIdx);
  });

  test("three columns produce three div.column elements", () => {
    const slide: Slide = {
      index: 1,
      nodes: [],
      metadata: emptyMeta,
      columns: [[para("A")], [para("B")], [para("C")]],
    };
    const result = render(makeShow([slide]), reg);
    const html = result.slideFragments.get(1)!;
    const matches = html.match(/<div class="column">/g);
    expect(matches).toHaveLength(3);
  });

  test("empty column produces empty div.column", () => {
    const slide: Slide = {
      index: 1,
      nodes: [],
      metadata: emptyMeta,
      columns: [[], [para("Content")]],
    };
    const result = render(makeShow([slide]), reg);
    const html = result.slideFragments.get(1)!;
    expect(html).toContain('<div class="column"></div>');
    expect(html).toContain('<div class="column"><p>Content</p></div>');
  });

  test("slide without columns renders normally (no column divs)", () => {
    const slide: Slide = {
      index: 1,
      nodes: [heading(2, "Title"), para("Body")],
      metadata: emptyMeta,
    };
    const result = render(makeShow([slide]), reg);
    const html = result.slideFragments.get(1)!;
    expect(html).not.toContain("column");
    expect(html).toContain("<h2>Title</h2>");
    expect(html).toContain("<p>Body</p>");
  });
});
