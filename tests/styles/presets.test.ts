import { describe, test, expect } from "bun:test";
import { styles, defaultStyleName, generateStyleVars } from "../../src/styles/presets.ts";

describe("styles", () => {
  test("all styles define the same set of variables", () => {
    const styleNames = Object.keys(styles);
    const referenceKeys = Object.keys(styles[styleNames[0]!]!.variables).sort();

    for (const name of styleNames.slice(1)) {
      const keys = Object.keys(styles[name]!.variables).sort();
      expect(keys).toEqual(referenceKeys);
    }
  });

  test("defaultStyleName exists in styles", () => {
    expect(styles[defaultStyleName]).toBeDefined();
  });

  test("default style matches previously hardcoded values", () => {
    const d = styles["default"]!.variables;
    expect(d["--font-size-base"]).toBe("1.5rem");
    expect(d["--line-height"]).toBe("1.6");
    expect(d["--slide-padding"]).toBe("4rem 6rem");
    expect(d["--h1-size"]).toBe("2.5em");
    expect(d["--border-radius"]).toBe("8px");
    expect(d["--border-radius-inline"]).toBe("4px");
    expect(d["--heading-weight"]).toBe("700");
    expect(d["--heading-transform"]).toBe("none");
    expect(d["--block-margin"]).toBe("0.75em");
  });

  test("modern style differs from default", () => {
    const d = styles["default"]!.variables;
    const m = styles["modern"]!.variables;
    expect(m["--heading-transform"]).toBe("uppercase");
    expect(m["--h1-size"]).not.toBe(d["--h1-size"]);
    expect(m["--slide-padding"]).not.toBe(d["--slide-padding"]);
  });

  test("classic style uses serif fonts", () => {
    const c = styles["classic"]!.variables;
    expect(c["--font-family"]).toContain("Georgia");
  });
});

describe("generateStyleVars", () => {
  test("produces CSS custom property declarations", () => {
    const css = generateStyleVars(styles["default"]!);
    expect(css).toContain("--font-family:");
    expect(css).toContain("--font-size-base:");
    expect(css).toContain("--slide-padding:");
  });

  test("each line is indented with two spaces", () => {
    const css = generateStyleVars(styles["default"]!);
    for (const line of css.split("\n")) {
      expect(line).toMatch(/^ {2}--/);
    }
  });
});
