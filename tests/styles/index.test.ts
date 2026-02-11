import { describe, expect, test } from "bun:test";
import { generateStylesheet, themes, defaultTheme } from "../../src/styles/index.ts";

describe("generateStylesheet", () => {
  test("returns CSS with :root variables and base styles", () => {
    const css = generateStylesheet("light");
    expect(css).toContain(":root {");
    expect(css).toContain("--bg:");
    expect(css).toContain("--fg:");
    expect(css).toContain("#slideshow");
    expect(css).toContain(".slide");
  });

  test("uses light theme variables for 'light'", () => {
    const css = generateStylesheet("light");
    expect(css).toContain(themes["light"]!.variables["--bg"]!);
    expect(css).toContain(themes["light"]!.variables["--fg"]!);
  });

  test("uses dark theme variables for 'dark'", () => {
    const css = generateStylesheet("dark");
    expect(css).toContain(themes["dark"]!.variables["--bg"]!);
    expect(css).toContain(themes["dark"]!.variables["--heading"]!);
  });

  test("uses catppuccin-mocha variables", () => {
    const css = generateStylesheet("catppuccin-mocha");
    expect(css).toContain("#1e1e2e"); // mocha bg
    expect(css).toContain("#cba6f7"); // mocha heading
  });

  test("uses catppuccin-latte variables", () => {
    const css = generateStylesheet("catppuccin-latte");
    expect(css).toContain("#eff1f5"); // latte bg
    expect(css).toContain("#8839ef"); // latte heading
  });

  test("falls back to default theme for unknown name", () => {
    const css = generateStylesheet("nonexistent");
    const defaultCSS = generateStylesheet(defaultTheme);
    expect(css).toBe(defaultCSS);
  });

  test("falls back to default theme when undefined", () => {
    const css = generateStylesheet(undefined);
    const defaultCSS = generateStylesheet(defaultTheme);
    expect(css).toBe(defaultCSS);
  });

  test("falls back to default theme when no argument", () => {
    const css = generateStylesheet();
    const defaultCSS = generateStylesheet(defaultTheme);
    expect(css).toBe(defaultCSS);
  });

  test("each theme produces different CSS", () => {
    const results = Object.keys(themes).map((name) => generateStylesheet(name));
    const unique = new Set(results);
    expect(unique.size).toBe(Object.keys(themes).length);
  });
});

describe("themes", () => {
  test("all themes define the same set of variables", () => {
    const themeNames = Object.keys(themes);
    const referenceKeys = Object.keys(themes[themeNames[0]!]!.variables).sort();

    for (const name of themeNames.slice(1)) {
      const keys = Object.keys(themes[name]!.variables).sort();
      expect(keys).toEqual(referenceKeys);
    }
  });

  test("defaultTheme exists in themes", () => {
    expect(themes[defaultTheme]).toBeDefined();
  });
});
