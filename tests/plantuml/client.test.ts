import { describe, test, expect } from "bun:test";
import { generatePlantUMLScript } from "../../src/plantuml/client.ts";

describe("generatePlantUMLScript", () => {
  test("selects pre.plantuml elements", () => {
    const script = generatePlantUMLScript();
    expect(script).toContain('pre.plantuml');
  });

  test("posts to /plantuml/render endpoint", () => {
    const script = generatePlantUMLScript();
    expect(script).toContain("/plantuml/render");
  });

  test("requests SVG output", () => {
    const script = generatePlantUMLScript();
    expect(script).toContain("-tsvg");
  });

  test("replaces container with SVG response", () => {
    const script = generatePlantUMLScript();
    expect(script).toContain(".fence-plantuml");
  });
});
