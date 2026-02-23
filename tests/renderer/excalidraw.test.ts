import { describe, expect, test } from "bun:test";
import { renderExcalidraw, parseExcalidrawMd } from "../../src/excalidraw/index.ts";
import { renderNode } from "../../src/renderer/nodes.ts";
import { FenceRegistry } from "../../src/renderer/fence.ts";
import { resolve } from "node:path";
import { compressToBase64 } from "lz-string";
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
    expect(html).toContain('class="svg-nav-enabled"');
    expect(html).toContain("<rect/></svg>");
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

// --- .excalidraw.md support ---

function makeExcalidrawMd(data: unknown): string {
  const compressed = compressToBase64(JSON.stringify(data));
  return `---

excalidraw-plugin: parsed

---
Some text elements here.

%%
## Drawing
\`\`\`compressed-json
${compressed}
\`\`\`
%%
`;
}

const minimalData = {
  elements: [
    { id: "r1", type: "rectangle", x: 0, y: 0, width: 100, height: 50, isDeleted: false },
    { id: "t1", type: "text", x: 10, y: 10, text: "Hello md", isDeleted: false },
  ],
  files: {},
  appState: {},
};

describe("parseExcalidrawMd", () => {
  test("extracts and decompresses drawing data", async () => {
    const md = makeExcalidrawMd(minimalData);
    const data = await parseExcalidrawMd(md);
    expect(data.elements).toBeArray();
    expect((data.elements as any[]).length).toBe(2);
    expect((data.elements as any[])[1].text).toBe("Hello md");
  });

  test("throws when no Obsidian block present", async () => {
    await expect(parseExcalidrawMd("# No obsidian block here")).rejects.toThrow("No Obsidian comment block");
  });

  test("throws when compressed-json fence is missing", async () => {
    const md = `%%\nno fence here\n%%`;
    await expect(parseExcalidrawMd(md)).rejects.toThrow("No compressed-json fence");
  });

  test("throws when compressed data is corrupt", async () => {
    const md = `%%\n\`\`\`compressed-json\nnot_valid_base64!!!\`\`\`\n%%`;
    await expect(parseExcalidrawMd(md)).rejects.toThrow();
  });
});

describe("renderExcalidraw with .excalidraw.md", () => {
  test("renders .excalidraw.md file to SVG string", async () => {
    const tmpPath = resolve(import.meta.dir, "excalidraw/test.excalidraw.md");
    await Bun.write(tmpPath, makeExcalidrawMd(minimalData));
    try {
      const svg = await renderExcalidraw(tmpPath);
      expect(svg).toStartWith("<svg");
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toEndWith("</svg>");
    } finally {
      const { unlinkSync } = await import("node:fs");
      unlinkSync(tmpPath);
    }
  });

  test("returns error div for missing .excalidraw.md file", async () => {
    const result = await renderExcalidraw("/nonexistent/file.excalidraw.md");
    expect(result).toContain("excalidraw-error");
    expect(result).toContain("not found");
  });

  test("returns error div for invalid .excalidraw.md content", async () => {
    const tmpPath = resolve(import.meta.dir, "excalidraw/bad.excalidraw.md");
    await Bun.write(tmpPath, "no obsidian block here");
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

describe("renderNode with .excalidraw.md SVG map", () => {
  const fakeSvg = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';

  test("image with .excalidraw.md URL uses SVG from map", () => {
    const svgMap = new Map([["diagram.excalidraw.md", fakeSvg]]);
    const node: RootContent = {
      type: "paragraph",
      children: [{ type: "image", url: "diagram.excalidraw.md", alt: "My diagram" }],
    };
    const html = renderNode(node, reg, svgMap);
    expect(html).toContain("excalidraw-embed");
    expect(html).toContain("<rect/></svg>");
  });
});
