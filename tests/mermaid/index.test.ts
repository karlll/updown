import { describe, test, expect } from "bun:test";
import { generateMermaidScript } from "../../src/mermaid/index.ts";

describe("generateMermaidScript", () => {
  test("includes mermaid.initialize with default theme", () => {
    const script = generateMermaidScript("default");
    expect(script).toContain('mermaid.initialize(');
    expect(script).toContain('theme: "default"');
  });

  test("includes mermaid.initialize with dark theme", () => {
    const script = generateMermaidScript("dark");
    expect(script).toContain('theme: "dark"');
  });

  test("calls mermaid.run()", () => {
    const script = generateMermaidScript("default");
    expect(script).toContain("mermaid.run()");
  });
});
