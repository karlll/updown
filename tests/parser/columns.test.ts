import { describe, expect, test } from "bun:test";
import { parse } from "../../src/parser/index.ts";

describe("column breaks (+++)", () => {
  test("+++ does not create a new slide", () => {
    const { slides } = parse("## Title\n\nLeft\n\n+++\n\nRight\n");
    expect(slides).toHaveLength(1);
  });

  test("+++ splits content into two columns", () => {
    const { slides } = parse("## Title\n\nLeft\n\n+++\n\nRight\n");
    const slide = slides[0]!;
    expect(slide.columns).toHaveLength(2);
    expect(slide.columns![0]).toHaveLength(1); // p("Left")
    expect(slide.columns![1]).toHaveLength(1); // p("Right")
  });

  test("heading before first +++ goes to preamble (nodes), not columns", () => {
    const { slides } = parse("## Comparison\n\nLeft\n\n+++\n\nRight\n");
    const slide = slides[0]!;
    expect(slide.nodes).toHaveLength(1);
    expect(slide.nodes[0]!.type).toBe("heading");
    expect(slide.columns).toHaveLength(2);
  });

  test("non-heading content before first +++ goes into first column", () => {
    const { slides } = parse("## Title\n\nBefore\n\n+++\n\nAfter\n");
    const slide = slides[0]!;
    // "Before" is non-heading content before +++, goes to column 1
    expect(slide.columns![0]).toHaveLength(1);
    expect(slide.columns![0]![0]!.type).toBe("paragraph");
  });

  test("multiple +++ create multiple columns", () => {
    const { slides } = parse("## Title\n\nCol 1\n\n+++\n\nCol 2\n\n+++\n\nCol 3\n");
    const slide = slides[0]!;
    expect(slide.columns).toHaveLength(3);
  });

  test("+++ at start of slide (before any content) creates empty first column", () => {
    // --- starts a new slide, then +++ immediately
    const { slides } = parse("# Intro\n\n---\n\n+++\n\nRight\n");
    const slide = slides[1]!;
    expect(slide.columns).toBeDefined();
    expect(slide.columns![0]).toHaveLength(0); // empty first column
    expect(slide.columns![1]).toHaveLength(1); // p("Right")
  });

  test("consecutive +++ produce empty columns between them", () => {
    const { slides } = parse("## Title\n\nA\n\n+++\n\n+++\n\nB\n");
    const slide = slides[0]!;
    expect(slide.columns).toHaveLength(3);
    expect(slide.columns![0]).toHaveLength(1); // p("A")
    expect(slide.columns![1]).toHaveLength(0); // empty
    expect(slide.columns![2]).toHaveLength(1); // p("B")
  });

  test("slide without +++ has no columns property", () => {
    const { slides } = parse("## Title\n\nJust content\n");
    expect(slides[0]!.columns).toBeUndefined();
  });

  test("--- still creates slide breaks (not confused with +++)", () => {
    const { slides } = parse("Slide 1\n\n---\n\nSlide 2\n\n+++\n\nCol 2\n");
    expect(slides).toHaveLength(2);
    expect(slides[0]!.columns).toBeUndefined();
    expect(slides[1]!.columns).toHaveLength(2);
  });

  test("+++ is not rendered as an hr", () => {
    const { slides } = parse("## Title\n\nLeft\n\n+++\n\nRight\n");
    const slide = slides[0]!;
    // No thematicBreak nodes should appear anywhere
    for (const node of slide.nodes) {
      expect(node.type).not.toBe("thematicBreak");
    }
    for (const col of slide.columns!) {
      for (const node of col) {
        expect(node.type).not.toBe("thematicBreak");
      }
    }
  });

  test("+++ with list content in columns", () => {
    const md = "## Compare\n\n- A\n- B\n\n+++\n\n- X\n- Y\n";
    const { slides } = parse(md);
    const slide = slides[0]!;
    expect(slide.columns).toHaveLength(2);
    expect(slide.columns![0]![0]!.type).toBe("list");
    expect(slide.columns![1]![0]!.type).toBe("list");
  });
});
