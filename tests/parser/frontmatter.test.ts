import { describe, expect, test } from "bun:test";
import { extractFrontMatter } from "../../src/parser/frontmatter.ts";
import type { Root, Yaml } from "mdast";

function makeRoot(...children: Root["children"]): Root {
  return { type: "root", children };
}

function yamlNode(value: string): Yaml {
  return { type: "yaml", value };
}

describe("extractFrontMatter", () => {
  test("returns empty result when no front matter exists", () => {
    const root = makeRoot({ type: "paragraph", children: [{ type: "text", value: "hello" }] });
    const result = extractFrontMatter(root);
    expect(result).toEqual({ attributes: {}, cssClasses: [] });
    expect(root.children).toHaveLength(1);
  });

  test("extracts string values with data-fm- prefix", () => {
    const root = makeRoot(yamlNode("foo: bar"));
    const result = extractFrontMatter(root);
    expect(result.attributes).toEqual({ "data-fm-foo": "bar" });
    expect(root.children).toHaveLength(0);
  });

  test("extracts number values as strings", () => {
    const root = makeRoot(yamlNode("count: 42"));
    const result = extractFrontMatter(root);
    expect(result.attributes).toEqual({ "data-fm-count": "42" });
  });

  test("extracts arrays as space-separated strings", () => {
    const root = makeRoot(yamlNode("tags:\n  - a\n  - b\n  - c"));
    const result = extractFrontMatter(root);
    expect(result.attributes).toEqual({ "data-fm-tags": "a b c" });
  });

  test("extracts class key into cssClasses (string)", () => {
    const root = makeRoot(yamlNode("class: my-theme"));
    const result = extractFrontMatter(root);
    expect(result.cssClasses).toEqual(["my-theme"]);
    expect(result.attributes).toEqual({});
  });

  test("extracts class key into cssClasses (array)", () => {
    const root = makeRoot(yamlNode("class:\n  - x\n  - y"));
    const result = extractFrontMatter(root);
    expect(result.cssClasses).toEqual(["x", "y"]);
    expect(result.attributes).toEqual({});
  });

  test("silently ignores object values", () => {
    const root = makeRoot(yamlNode("nested:\n  a: 1\n  b: 2\nfoo: bar"));
    const result = extractFrontMatter(root);
    expect(result.attributes).toEqual({ "data-fm-foo": "bar" });
  });

  test("filters non-string/number elements from arrays", () => {
    const root = makeRoot(yamlNode("mixed:\n  - hello\n  - nested:\n      a: 1\n  - world"));
    const result = extractFrontMatter(root);
    expect(result.attributes).toEqual({ "data-fm-mixed": "hello world" });
  });

  test("ignores arrays with only invalid elements", () => {
    const root = makeRoot(yamlNode("bad:\n  - nested:\n      a: 1"));
    const result = extractFrontMatter(root);
    expect(result.attributes).toEqual({});
  });

  test("removes the yaml node from the tree", () => {
    const para = { type: "paragraph" as const, children: [{ type: "text" as const, value: "hello" }] };
    const root = makeRoot(yamlNode("foo: bar"), para);
    extractFrontMatter(root);
    expect(root.children).toHaveLength(1);
    expect(root.children[0]!.type).toBe("paragraph");
  });

  test("ignores yaml node that is NOT the first child", () => {
    const para = { type: "paragraph" as const, children: [{ type: "text" as const, value: "hello" }] };
    const root = makeRoot(para, yamlNode("foo: bar"));
    const result = extractFrontMatter(root);
    expect(result).toEqual({ attributes: {}, cssClasses: [] });
    expect(root.children).toHaveLength(2);
  });

  test("full example from task spec", () => {
    const yaml = "foo: bar\ncount: 42\ntags:\n  - a\n  - b\nclass:\n  - x\n  - y";
    const root = makeRoot(yamlNode(yaml));
    const result = extractFrontMatter(root);
    expect(result).toEqual({
      attributes: { "data-fm-foo": "bar", "data-fm-count": "42", "data-fm-tags": "a b" },
      cssClasses: ["x", "y"],
    });
  });
});
