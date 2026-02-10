import { describe, expect, test } from "bun:test";
import { processMetaFences } from "../../src/parser/meta.ts";
import type { Slide } from "../../src/parser/types.ts";
import type { Code, Heading, Paragraph, RootContent } from "mdast";

function h(depth: 1 | 2, text: string): Heading {
  return { type: "heading", depth, children: [{ type: "text", value: text }] };
}

function p(text: string): Paragraph {
  return { type: "paragraph", children: [{ type: "text", value: text }] };
}

function metaCode(value: string): Code {
  return { type: "code", lang: "meta", value };
}

function slide(nodes: RootContent[]): Slide {
  return { index: 1, nodes, metadata: { attributes: {}, cssClasses: [] } };
}

describe("processMetaFences", () => {
  test("attaches data-meta-* attributes to preceding sibling", () => {
    const s = slide([h(2, "Foo"), metaCode("foo: bar")]);
    processMetaFences(s);
    expect(s.nodes).toHaveLength(1);
    const target = s.nodes[0]! as Heading & { data?: Record<string, unknown> };
    expect(target.data?.meta).toEqual({
      attributes: { "data-meta-foo": "bar" },
      cssClasses: [],
    });
  });

  test("class key produces CSS classes on target (no prefix)", () => {
    const s = slide([h(2, "Foo"), metaCode("class:\n  - f\n  - g")]);
    processMetaFences(s);
    const target = s.nodes[0]! as Heading & { data?: Record<string, unknown> };
    expect(target.data?.meta).toEqual({
      attributes: {},
      cssClasses: ["f", "g"],
    });
  });

  test("meta-fence code node is removed from the slide", () => {
    const s = slide([p("text"), metaCode("a: b")]);
    processMetaFences(s);
    expect(s.nodes).toHaveLength(1);
    expect(s.nodes[0]!.type).toBe("paragraph");
  });

  test("meta-fence with no preceding sibling attaches to slide metadata", () => {
    const s = slide([metaCode("a: b"), p("text")]);
    processMetaFences(s);
    expect(s.nodes).toHaveLength(1);
    expect(s.nodes[0]!.type).toBe("paragraph");
    expect(s.metadata).toEqual({
      attributes: { "data-meta-a": "b" },
      cssClasses: [],
    });
  });

  test("first-node meta-fence with class attaches cssClasses to slide", () => {
    const s = slide([metaCode("class:\n  - fancy\n  - dark"), p("text")]);
    processMetaFences(s);
    expect(s.nodes).toHaveLength(1);
    expect(s.metadata).toEqual({
      attributes: {},
      cssClasses: ["fancy", "dark"],
    });
  });

  test("first-node meta-fence with mixed attrs and class", () => {
    const s = slide([metaCode("bg: red\nclass: highlight"), h(2, "Title")]);
    processMetaFences(s);
    expect(s.nodes).toHaveLength(1);
    expect(s.metadata).toEqual({
      attributes: { "data-meta-bg": "red" },
      cssClasses: ["highlight"],
    });
  });

  test("multiple meta-fences in one slide work independently", () => {
    const s = slide([
      h(2, "First"),
      metaCode("x: 1"),
      p("body"),
      metaCode("y: 2"),
    ]);
    processMetaFences(s);
    expect(s.nodes).toHaveLength(2);

    const heading = s.nodes[0]! as Heading & { data?: Record<string, unknown> };
    expect(heading.data?.meta).toEqual({
      attributes: { "data-meta-x": "1" },
      cssClasses: [],
    });

    const para = s.nodes[1]! as Paragraph & { data?: Record<string, unknown> };
    expect(para.data?.meta).toEqual({
      attributes: { "data-meta-y": "2" },
      cssClasses: [],
    });
  });

  test("invalid YAML types are ignored", () => {
    const s = slide([p("text"), metaCode("nested:\n  a: 1\nfoo: bar")]);
    processMetaFences(s);
    const target = s.nodes[0]! as Paragraph & { data?: Record<string, unknown> };
    expect(target.data?.meta).toEqual({
      attributes: { "data-meta-foo": "bar" },
      cssClasses: [],
    });
  });

  test("non-meta code blocks are left alone", () => {
    const code: Code = { type: "code", lang: "javascript", value: "console.log('hi')" };
    const s = slide([p("text"), code]);
    processMetaFences(s);
    expect(s.nodes).toHaveLength(2);
    expect(s.nodes[1]!.type).toBe("code");
  });

  test("full example from task spec", () => {
    const s = slide([h(2, "Foo"), metaCode("foo: bar\nclass:\n  - f\n  - g")]);
    processMetaFences(s);
    expect(s.nodes).toHaveLength(1);
    const target = s.nodes[0]! as Heading & { data?: Record<string, unknown> };
    expect(target.data?.meta).toEqual({
      attributes: { "data-meta-foo": "bar" },
      cssClasses: ["f", "g"],
    });
  });
});
