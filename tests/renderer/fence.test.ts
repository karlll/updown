import { describe, expect, test } from "bun:test";
import { FenceRegistry } from "../../src/renderer/fence.ts";

describe("FenceRegistry", () => {
  test("unregistered language produces default rendering", () => {
    const reg = new FenceRegistry();
    const html = reg.render("python", 'print("hello")');
    expect(html).toBe('<div class="fence python"><pre>print(&quot;hello&quot;)</pre></div>');
  });

  test("registered plugin's render() is called", () => {
    const reg = new FenceRegistry();
    reg.register({
      lang: "mermaid",
      render(content) {
        return `<div class="mermaid">${content}</div>`;
      },
    });
    const html = reg.render("mermaid", "graph LR; A-->B");
    expect(html).toBe('<div class="mermaid">graph LR; A-->B</div>');
  });

  test("content inside <pre> is HTML-escaped", () => {
    const reg = new FenceRegistry();
    const html = reg.render("html", '<div class="test">&</div>');
    expect(html).toContain("&lt;div class=&quot;test&quot;&gt;&amp;&lt;/div&gt;");
  });

  test("language identifier in class is sanitized", () => {
    const reg = new FenceRegistry();
    const html = reg.render('<script>alert("xss")</script>', "code");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  test("empty language produces fence div without language class", () => {
    const reg = new FenceRegistry();
    const html = reg.render("", "some code");
    expect(html).toBe('<div class="fence"><pre>some code</pre></div>');
  });

  test("null language produces fence div without language class", () => {
    const reg = new FenceRegistry();
    const html = reg.render(null, "some code");
    expect(html).toBe('<div class="fence"><pre>some code</pre></div>');
  });

  test("undefined language produces fence div without language class", () => {
    const reg = new FenceRegistry();
    const html = reg.render(undefined, "some code");
    expect(html).toBe('<div class="fence"><pre>some code</pre></div>');
  });

  test("plugin can be registered and overrides default", () => {
    const reg = new FenceRegistry();
    const html1 = reg.render("dot", "digraph {}");
    expect(html1).toContain("class=\"fence dot\"");

    reg.register({
      lang: "dot",
      render(content) {
        return `<svg>${content}</svg>`;
      },
    });
    const html2 = reg.render("dot", "digraph {}");
    expect(html2).toBe("<svg>digraph {}</svg>");
  });

  test("single quotes in content are escaped", () => {
    const reg = new FenceRegistry();
    const html = reg.render("js", "let x = 'hello'");
    expect(html).toContain("&#x27;");
  });
});
