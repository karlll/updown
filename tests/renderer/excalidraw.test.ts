import { describe, expect, test } from "bun:test";
import { renderExcalidraw } from "../../src/excalidraw/index.ts";
import { renderNode } from "../../src/renderer/nodes.ts";
import { FenceRegistry } from "../../src/renderer/fence.ts";
import { resolve } from "node:path";
import type { RootContent } from "mdast";

const reg = new FenceRegistry();
const testFile = resolve(import.meta.dir, "excalidraw/test.excalidraw");

describe("renderExcalidraw", () => {
  test("renders .excalidraw file to SVG string", async () => {
    const svg = await renderExcalidraw(testFile);
    expect(svg).toStartWith("<svg");
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toEndWith("</svg>");
  });

  test("SVG contains expected elements from test file", async () => {
    const svg = await renderExcalidraw(testFile);
    // Test file has rectangles, ellipses, arrows, text
    expect(svg).toContain("This is a test");
  });

  test("returns error div for missing file", async () => {
    const result = await renderExcalidraw("/nonexistent/file.excalidraw");
    expect(result).toContain("excalidraw-error");
    expect(result).toContain("not found");
  });

  test("returns error div for invalid JSON", async () => {
    const tmpPath = resolve(import.meta.dir, "excalidraw/invalid.excalidraw");
    await Bun.write(tmpPath, "not json{{{");
    try {
      const result = await renderExcalidraw(tmpPath);
      expect(result).toContain("excalidraw-error");
      expect(result).toContain("Invalid");
    } finally {
      const { unlinkSync } = await import("node:fs");
      unlinkSync(tmpPath);
    }
  });
});

describe("renderNode with excalidraw SVG map", () => {
  const fakeSvg = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';

  test("image with .excalidraw URL uses SVG from map", () => {
    const svgMap = new Map([["diagram.excalidraw", fakeSvg]]);
    const node: RootContent = {
      type: "paragraph",
      children: [{ type: "image", url: "diagram.excalidraw", alt: "My diagram" }],
    };
    const html = renderNode(node, reg, svgMap);
    expect(html).toContain("excalidraw-embed");
    expect(html).toContain(fakeSvg);
    expect(html).toContain('aria-label="My diagram"');
    expect(html).not.toContain("<img");
  });

  test("image with .excalidraw URL but no alt omits aria-label", () => {
    const svgMap = new Map([["diagram.excalidraw", fakeSvg]]);
    const node: RootContent = {
      type: "paragraph",
      children: [{ type: "image", url: "diagram.excalidraw", alt: "" }],
    };
    const html = renderNode(node, reg, svgMap);
    expect(html).toContain("excalidraw-embed");
    expect(html).not.toContain("aria-label");
  });

  test("image with .excalidraw URL not in map renders as img", () => {
    const svgMap = new Map<string, string>();
    const node: RootContent = {
      type: "paragraph",
      children: [{ type: "image", url: "missing.excalidraw", alt: "Missing" }],
    };
    const html = renderNode(node, reg, svgMap);
    expect(html).toContain("<img");
    expect(html).not.toContain("excalidraw-embed");
  });

  test("non-excalidraw image renders normally with SVG map present", () => {
    const svgMap = new Map([["diagram.excalidraw", fakeSvg]]);
    const node: RootContent = {
      type: "paragraph",
      children: [{ type: "image", url: "photo.png", alt: "A photo" }],
    };
    const html = renderNode(node, reg, svgMap);
    expect(html).toBe('<p><img src="photo.png" alt="A photo"></p>');
  });

  test("image renders normally without SVG map", () => {
    const node: RootContent = {
      type: "paragraph",
      children: [{ type: "image", url: "photo.png", alt: "A photo" }],
    };
    const html = renderNode(node, reg);
    expect(html).toBe('<p><img src="photo.png" alt="A photo"></p>');
  });

  test("excalidraw image renders as span (inline) inside paragraph", () => {
    const svgMap = new Map([["diagram.excalidraw", fakeSvg]]);
    const node: RootContent = {
      type: "paragraph",
      children: [{ type: "image", url: "diagram.excalidraw", alt: "" }],
    };
    const html = renderNode(node, reg, svgMap);
    expect(html).toStartWith("<p>");
    expect(html).toContain("<span class");
    expect(html).toEndWith("</p>");
  });
});
