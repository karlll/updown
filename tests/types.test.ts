import { describe, expect, test } from "bun:test";
import type { NodeMetadata, Slide, SlideShow } from "../src/parser/types.ts";
import type { FencePlugin, RenderedSlideShow } from "../src/renderer/types.ts";

describe("type definitions", () => {
  test("parser types are importable and structurally correct", () => {
    const meta: NodeMetadata = { attributes: { theme: "dark" }, cssClasses: ["intro"] };
    expect(meta.attributes["theme"]).toBe("dark");

    const slide: Slide = { index: 1, nodes: [] };
    expect(slide.index).toBe(1);

    const show: SlideShow = { frontMatter: meta, slides: [slide] };
    expect(show.slides).toHaveLength(1);
  });

  test("renderer types are importable and structurally correct", () => {
    const plugin: FencePlugin = { lang: "mermaid", render: (c) => `<div>${c}</div>` };
    expect(plugin.lang).toBe("mermaid");
    expect(plugin.render("graph LR")).toContain("graph LR");

    const rendered: RenderedSlideShow = {
      fullDocument: "<html></html>",
      slideFragments: new Map([[1, "<div>slide 1</div>"]]),
    };
    expect(rendered.slideFragments.get(1)).toContain("slide 1");
  });
});
