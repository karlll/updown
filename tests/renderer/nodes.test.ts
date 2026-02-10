import { describe, expect, test } from "bun:test";
import { renderNode } from "../../src/renderer/nodes.ts";
import { FenceRegistry } from "../../src/renderer/fence.ts";
import type { RootContent } from "mdast";

const reg = new FenceRegistry();

describe("renderNode", () => {
  describe("headings", () => {
    test("h1 renders correctly", () => {
      const node: RootContent = { type: "heading", depth: 1, children: [{ type: "text", value: "Title" }] };
      expect(renderNode(node, reg)).toBe("<h1>Title</h1>");
    });

    test("h3 renders correctly", () => {
      const node: RootContent = { type: "heading", depth: 3, children: [{ type: "text", value: "Sub" }] };
      expect(renderNode(node, reg)).toBe("<h3>Sub</h3>");
    });

    test("heading with inline children", () => {
      const node: RootContent = {
        type: "heading", depth: 2, children: [
          { type: "text", value: "Hello " },
          { type: "strong", children: [{ type: "text", value: "world" }] },
        ],
      };
      expect(renderNode(node, reg)).toBe("<h2>Hello <strong>world</strong></h2>");
    });
  });

  describe("paragraph", () => {
    test("simple paragraph", () => {
      const node: RootContent = { type: "paragraph", children: [{ type: "text", value: "Hello" }] };
      expect(renderNode(node, reg)).toBe("<p>Hello</p>");
    });

    test("paragraph with inline elements", () => {
      const node: RootContent = {
        type: "paragraph", children: [
          { type: "text", value: "This is " },
          { type: "emphasis", children: [{ type: "text", value: "italic" }] },
          { type: "text", value: " and " },
          { type: "strong", children: [{ type: "text", value: "bold" }] },
        ],
      };
      expect(renderNode(node, reg)).toBe("<p>This is <em>italic</em> and <strong>bold</strong></p>");
    });
  });

  describe("inline elements", () => {
    test("emphasis", () => {
      const node: RootContent = {
        type: "paragraph", children: [
          { type: "emphasis", children: [{ type: "text", value: "italic" }] },
        ],
      };
      expect(renderNode(node, reg)).toBe("<p><em>italic</em></p>");
    });

    test("strong", () => {
      const node: RootContent = {
        type: "paragraph", children: [
          { type: "strong", children: [{ type: "text", value: "bold" }] },
        ],
      };
      expect(renderNode(node, reg)).toBe("<p><strong>bold</strong></p>");
    });

    test("delete (strikethrough)", () => {
      const node: RootContent = {
        type: "paragraph", children: [
          { type: "delete", children: [{ type: "text", value: "removed" }] },
        ],
      };
      expect(renderNode(node, reg)).toBe("<p><del>removed</del></p>");
    });

    test("inline code", () => {
      const node: RootContent = {
        type: "paragraph", children: [
          { type: "inlineCode", value: "const x = 1" },
        ],
      };
      expect(renderNode(node, reg)).toBe("<p><code>const x = 1</code></p>");
    });

    test("link", () => {
      const node: RootContent = {
        type: "paragraph", children: [
          { type: "link", url: "https://example.com", children: [{ type: "text", value: "click" }] },
        ],
      };
      expect(renderNode(node, reg)).toBe('<p><a href="https://example.com">click</a></p>');
    });

    test("image", () => {
      const node: RootContent = {
        type: "paragraph", children: [
          { type: "image", url: "img.png", alt: "A photo" },
        ],
      };
      expect(renderNode(node, reg)).toBe('<p><img src="img.png" alt="A photo"></p>');
    });

    test("break", () => {
      const node: RootContent = {
        type: "paragraph", children: [
          { type: "text", value: "line1" },
          { type: "break" },
          { type: "text", value: "line2" },
        ],
      };
      expect(renderNode(node, reg)).toBe("<p>line1<br>line2</p>");
    });
  });

  describe("lists", () => {
    test("unordered list", () => {
      const node: RootContent = {
        type: "list", ordered: false, spread: false, children: [
          { type: "listItem", spread: false, children: [{ type: "paragraph", children: [{ type: "text", value: "A" }] }] },
          { type: "listItem", spread: false, children: [{ type: "paragraph", children: [{ type: "text", value: "B" }] }] },
        ],
      };
      expect(renderNode(node, reg)).toBe("<ul><li>A</li><li>B</li></ul>");
    });

    test("ordered list", () => {
      const node: RootContent = {
        type: "list", ordered: true, spread: false, children: [
          { type: "listItem", spread: false, children: [{ type: "paragraph", children: [{ type: "text", value: "First" }] }] },
          { type: "listItem", spread: false, children: [{ type: "paragraph", children: [{ type: "text", value: "Second" }] }] },
        ],
      };
      expect(renderNode(node, reg)).toBe("<ol><li>First</li><li>Second</li></ol>");
    });

    test("list item with multiple children (no unwrap)", () => {
      const node: RootContent = {
        type: "list", ordered: false, spread: false, children: [
          {
            type: "listItem", spread: false, children: [
              { type: "paragraph", children: [{ type: "text", value: "Text" }] },
              { type: "paragraph", children: [{ type: "text", value: "More" }] },
            ],
          },
        ],
      };
      expect(renderNode(node, reg)).toBe("<ul><li><p>Text</p><p>More</p></li></ul>");
    });
  });

  describe("blockquote", () => {
    test("simple blockquote", () => {
      const node: RootContent = {
        type: "blockquote", children: [
          { type: "paragraph", children: [{ type: "text", value: "Quote" }] },
        ],
      };
      expect(renderNode(node, reg)).toBe("<blockquote><p>Quote</p></blockquote>");
    });
  });

  describe("code fences", () => {
    test("code block delegates to fence registry", () => {
      const node: RootContent = { type: "code", lang: "javascript", value: "let x = 1;" };
      expect(renderNode(node, reg)).toBe('<div class="fence javascript"><pre>let x = 1;</pre></div>');
    });

    test("code block with no language", () => {
      const node: RootContent = { type: "code", value: "plain code" };
      expect(renderNode(node, reg)).toBe('<div class="fence"><pre>plain code</pre></div>');
    });
  });

  describe("table", () => {
    test("table with thead and tbody", () => {
      const node: RootContent = {
        type: "table", children: [
          {
            type: "tableRow", children: [
              { type: "tableCell", children: [{ type: "text", value: "Name" }] },
              { type: "tableCell", children: [{ type: "text", value: "Age" }] },
            ],
          },
          {
            type: "tableRow", children: [
              { type: "tableCell", children: [{ type: "text", value: "Alice" }] },
              { type: "tableCell", children: [{ type: "text", value: "30" }] },
            ],
          },
        ],
      };
      expect(renderNode(node, reg)).toBe(
        "<table><thead><tr><th>Name</th><th>Age</th></tr></thead><tbody><tr><td>Alice</td><td>30</td></tr></tbody></table>"
      );
    });

    test("table with only header row", () => {
      const node: RootContent = {
        type: "table", children: [
          {
            type: "tableRow", children: [
              { type: "tableCell", children: [{ type: "text", value: "Col" }] },
            ],
          },
        ],
      };
      expect(renderNode(node, reg)).toBe("<table><thead><tr><th>Col</th></tr></thead></table>");
    });
  });

  describe("html passthrough", () => {
    test("raw html is not escaped", () => {
      const node: RootContent = { type: "html", value: '<div class="custom">raw</div>' };
      expect(renderNode(node, reg)).toBe('<div class="custom">raw</div>');
    });
  });

  describe("HTML escaping", () => {
    test("text content is escaped", () => {
      const node: RootContent = {
        type: "paragraph", children: [
          { type: "text", value: '<script>alert("xss")</script>' },
        ],
      };
      expect(renderNode(node, reg)).toBe("<p>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</p>");
    });

    test("inline code is escaped", () => {
      const node: RootContent = {
        type: "paragraph", children: [
          { type: "inlineCode", value: "a < b && c > d" },
        ],
      };
      expect(renderNode(node, reg)).toBe("<p><code>a &lt; b &amp;&amp; c &gt; d</code></p>");
    });
  });

  describe("meta-fence attributes", () => {
    test("heading with meta attributes", () => {
      const node: RootContent = {
        type: "heading", depth: 2,
        children: [{ type: "text", value: "Title" }],
        data: { meta: { attributes: { "data-meta-color": "red" }, cssClasses: ["highlight"] } },
      } as unknown as RootContent;
      expect(renderNode(node, reg)).toBe('<h2 class="highlight" data-meta-color="red">Title</h2>');
    });

    test("paragraph with meta class only", () => {
      const node: RootContent = {
        type: "paragraph",
        children: [{ type: "text", value: "Text" }],
        data: { meta: { attributes: {}, cssClasses: ["big", "centered"] } },
      } as unknown as RootContent;
      expect(renderNode(node, reg)).toBe('<p class="big centered">Text</p>');
    });

    test("node without meta renders normally", () => {
      const node: RootContent = { type: "paragraph", children: [{ type: "text", value: "Plain" }] };
      expect(renderNode(node, reg)).toBe("<p>Plain</p>");
    });
  });
});
