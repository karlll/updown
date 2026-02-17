import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadExternalTheme, discoverExternalThemes } from "../../src/styles/loader.ts";

let tmpDir: string;

beforeAll(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "updown-loader-test-"));
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

function makeThemeDir(name: string, files: Record<string, string>): string {
  const dir = join(tmpDir, name);
  mkdirSync(dir, { recursive: true });
  for (const [filename, content] of Object.entries(files)) {
    const filePath = join(dir, filename);
    mkdirSync(join(filePath, ".."), { recursive: true });
    writeFileSync(filePath, content);
  }
  return dir;
}

const validThemeJson = JSON.stringify({
  shikiTheme: "github-dark",
  mermaidTheme: "dark",
  variables: {
    "--bg": "#111",
    "--fg": "#eee",
  },
});

const validStyleJson = JSON.stringify({
  variables: {
    "--font-family": "monospace",
    "--font-size-base": "1.2rem",
  },
});

const validVariantThemeJson = JSON.stringify({
  variants: {
    dark: {
      shikiTheme: "github-dark",
      mermaidTheme: "dark",
      variables: { "--bg": "#111", "--fg": "#eee" },
    },
    light: {
      shikiTheme: "github-light",
      mermaidTheme: "default",
      variables: { "--bg": "#fff", "--fg": "#111" },
    },
  },
});

describe("loadExternalTheme — single theme", () => {
  test("loads a valid theme directory", async () => {
    const dir = makeThemeDir("valid-theme", {
      "theme.json": validThemeJson,
    });
    const results = await loadExternalTheme(dir);
    expect(results.length).toBe(1);
    const result = results[0]!;
    expect(result.name).toBe("valid-theme");
    expect(result.assetPrefix).toBe("valid-theme");
    expect(result.theme.shikiTheme).toBe("github-dark");
    expect(result.theme.mermaidTheme).toBe("dark");
    expect(result.theme.variables["--bg"]).toBe("#111");
    expect(result.style).toBeUndefined();
    expect(result.theme.extraCSS).toBeUndefined();
  });

  test("returns empty array when theme.json is missing", async () => {
    const dir = makeThemeDir("no-theme-json", {
      "style.json": validStyleJson,
    });
    const results = await loadExternalTheme(dir);
    expect(results).toEqual([]);
  });

  test("returns empty array when theme.json is invalid JSON", async () => {
    const dir = makeThemeDir("bad-json", {
      "theme.json": "not valid json {{{",
    });
    const results = await loadExternalTheme(dir);
    expect(results).toEqual([]);
  });

  test("returns empty array when theme.json has missing required fields", async () => {
    const dir = makeThemeDir("missing-fields", {
      "theme.json": JSON.stringify({ variables: { "--bg": "#000" } }),
    });
    const results = await loadExternalTheme(dir);
    expect(results).toEqual([]);
  });

  test("returns empty array when mermaidTheme is invalid", async () => {
    const dir = makeThemeDir("bad-mermaid", {
      "theme.json": JSON.stringify({
        shikiTheme: "github-dark",
        mermaidTheme: "neon",
        variables: {},
      }),
    });
    const results = await loadExternalTheme(dir);
    expect(results).toEqual([]);
  });

  test("loads optional style.json", async () => {
    const dir = makeThemeDir("with-style", {
      "theme.json": validThemeJson,
      "style.json": validStyleJson,
    });
    const result = (await loadExternalTheme(dir))[0]!;
    expect(result.style).toBeDefined();
    expect(result.style!.name).toBe("with-style");
    expect(result.style!.variables["--font-family"]).toBe("monospace");
  });

  test("loads optional extra.css", async () => {
    const dir = makeThemeDir("with-css", {
      "theme.json": validThemeJson,
      "extra.css": "h1 { color: red; }",
    });
    const result = (await loadExternalTheme(dir))[0]!;
    expect(result.theme.extraCSS).toBe("h1 { color: red; }");
  });

  test("detects assets directory", async () => {
    const dir = makeThemeDir("with-assets", {
      "theme.json": validThemeJson,
      "assets/font.woff2": "fake-font-data",
    });
    const result = (await loadExternalTheme(dir))[0]!;
    expect(result.assetsDir).toBe(join(dir, "assets"));
  });

  test("no assetsDir when assets/ doesn't exist", async () => {
    const dir = makeThemeDir("no-assets", {
      "theme.json": validThemeJson,
    });
    const result = (await loadExternalTheme(dir))[0]!;
    expect(result.assetsDir).toBeUndefined();
  });

  test("skips invalid style.json gracefully", async () => {
    const dir = makeThemeDir("bad-style", {
      "theme.json": validThemeJson,
      "style.json": "not json",
    });
    const result = (await loadExternalTheme(dir))[0]!;
    expect(result.style).toBeUndefined();
  });

  test("theme name and assetPrefix derived from directory name", async () => {
    const dir = makeThemeDir("my-cool-theme", {
      "theme.json": validThemeJson,
    });
    const result = (await loadExternalTheme(dir))[0]!;
    expect(result.name).toBe("my-cool-theme");
    expect(result.assetPrefix).toBe("my-cool-theme");
    expect(result.theme.name).toBe("my-cool-theme");
  });
});

describe("loadExternalTheme — variants", () => {
  test("produces one theme per variant", async () => {
    const dir = makeThemeDir("brand", {
      "theme.json": validVariantThemeJson,
    });
    const results = await loadExternalTheme(dir);
    expect(results.length).toBe(2);
    const names = results.map((r) => r.name).sort();
    expect(names).toEqual(["brand-dark", "brand-light"]);
  });

  test("variant names are {parent}-{variant}", async () => {
    const dir = makeThemeDir("acme", {
      "theme.json": validVariantThemeJson,
    });
    const results = await loadExternalTheme(dir);
    const dark = results.find((r) => r.name === "acme-dark")!;
    expect(dark.theme.name).toBe("acme-dark");
    expect(dark.theme.shikiTheme).toBe("github-dark");
    expect(dark.theme.variables["--bg"]).toBe("#111");
    const light = results.find((r) => r.name === "acme-light")!;
    expect(light.theme.name).toBe("acme-light");
    expect(light.theme.shikiTheme).toBe("github-light");
    expect(light.theme.variables["--bg"]).toBe("#fff");
  });

  test("assetPrefix is the parent directory name", async () => {
    const dir = makeThemeDir("corp", {
      "theme.json": validVariantThemeJson,
      "assets/logo.svg": "<svg/>",
    });
    const results = await loadExternalTheme(dir);
    for (const r of results) {
      expect(r.assetPrefix).toBe("corp");
      expect(r.assetsDir).toBe(join(dir, "assets"));
    }
  });

  test("shared extra.css is included in all variants", async () => {
    const dir = makeThemeDir("shared-css", {
      "theme.json": validVariantThemeJson,
      "extra.css": "@font-face { font-family: 'Test'; }",
    });
    const results = await loadExternalTheme(dir);
    for (const r of results) {
      expect(r.theme.extraCSS).toContain("@font-face");
    }
  });

  test("shared style.json is inherited by all variants", async () => {
    const dir = makeThemeDir("shared-style", {
      "theme.json": validVariantThemeJson,
      "style.json": validStyleJson,
    });
    const results = await loadExternalTheme(dir);
    for (const r of results) {
      expect(r.style).toBeDefined();
      expect(r.style!.variables["--font-family"]).toBe("monospace");
    }
  });

  test("variant-specific extra.css is appended after parent's", async () => {
    const dir = makeThemeDir("variant-css", {
      "theme.json": validVariantThemeJson,
      "extra.css": "/* parent */",
      "dark/extra.css": "/* dark-only */",
    });
    const results = await loadExternalTheme(dir);
    const dark = results.find((r) => r.name === "variant-css-dark")!;
    expect(dark.theme.extraCSS).toContain("/* parent */");
    expect(dark.theme.extraCSS).toContain("/* dark-only */");
    const parentIdx = dark.theme.extraCSS!.indexOf("/* parent */");
    const darkIdx = dark.theme.extraCSS!.indexOf("/* dark-only */");
    expect(darkIdx).toBeGreaterThan(parentIdx);

    // Light variant has only parent CSS
    const light = results.find((r) => r.name === "variant-css-light")!;
    expect(light.theme.extraCSS).toBe("/* parent */");
  });

  test("variant-specific style.json overrides parent's", async () => {
    const dir = makeThemeDir("variant-style", {
      "theme.json": validVariantThemeJson,
      "style.json": validStyleJson,
      "dark/style.json": JSON.stringify({
        variables: { "--font-family": "serif", "--font-size-base": "2rem" },
      }),
    });
    const results = await loadExternalTheme(dir);
    const dark = results.find((r) => r.name === "variant-style-dark")!;
    expect(dark.style!.variables["--font-family"]).toBe("serif");
    expect(dark.style!.name).toBe("variant-style-dark");

    // Light variant inherits parent style
    const light = results.find((r) => r.name === "variant-style-light")!;
    expect(light.style!.variables["--font-family"]).toBe("monospace");
  });

  test("skips invalid variants gracefully", async () => {
    const dir = makeThemeDir("bad-variant", {
      "theme.json": JSON.stringify({
        variants: {
          good: {
            shikiTheme: "github-dark",
            mermaidTheme: "dark",
            variables: { "--bg": "#000" },
          },
          bad: { variables: {} },
        },
      }),
    });
    const results = await loadExternalTheme(dir);
    expect(results.length).toBe(1);
    expect(results[0]!.name).toBe("bad-variant-good");
  });

  test("no extraCSS when neither parent nor variant has it", async () => {
    const dir = makeThemeDir("no-css", {
      "theme.json": validVariantThemeJson,
    });
    const results = await loadExternalTheme(dir);
    for (const r of results) {
      expect(r.theme.extraCSS).toBeUndefined();
    }
  });
});

describe("discoverExternalThemes", () => {
  test("returns empty array when themes/ doesn't exist", async () => {
    const mdPath = join(tmpDir, "no-themes-dir", "slides.md");
    mkdirSync(join(tmpDir, "no-themes-dir"), { recursive: true });
    writeFileSync(mdPath, "# Hello");
    const result = await discoverExternalThemes(mdPath);
    expect(result).toEqual([]);
  });

  test("discovers themes from themes/ directory", async () => {
    const base = join(tmpDir, "with-themes");
    mkdirSync(join(base, "themes", "alpha"), { recursive: true });
    mkdirSync(join(base, "themes", "beta"), { recursive: true });
    writeFileSync(join(base, "themes", "alpha", "theme.json"), validThemeJson);
    writeFileSync(join(base, "themes", "beta", "theme.json"), validThemeJson);
    writeFileSync(join(base, "slides.md"), "# Hello");

    const result = await discoverExternalThemes(join(base, "slides.md"));
    expect(result.length).toBe(2);
    const names = result.map((t) => t.name).sort();
    expect(names).toEqual(["alpha", "beta"]);
  });

  test("discovers variant themes from themes/ directory", async () => {
    const base = join(tmpDir, "with-variant-themes");
    mkdirSync(join(base, "themes", "mybrand"), { recursive: true });
    writeFileSync(join(base, "themes", "mybrand", "theme.json"), validVariantThemeJson);
    writeFileSync(join(base, "slides.md"), "# Hello");

    const result = await discoverExternalThemes(join(base, "slides.md"));
    expect(result.length).toBe(2);
    const names = result.map((t) => t.name).sort();
    expect(names).toEqual(["mybrand-dark", "mybrand-light"]);
  });

  test("skips invalid themes in themes/ directory", async () => {
    const base = join(tmpDir, "mixed-themes");
    mkdirSync(join(base, "themes", "good"), { recursive: true });
    mkdirSync(join(base, "themes", "bad"), { recursive: true });
    writeFileSync(join(base, "themes", "good", "theme.json"), validThemeJson);
    writeFileSync(join(base, "themes", "bad", "theme.json"), "invalid");
    writeFileSync(join(base, "slides.md"), "# Hello");

    const result = await discoverExternalThemes(join(base, "slides.md"));
    expect(result.length).toBe(1);
    expect(result[0]!.name).toBe("good");
  });

  test("loads CLI-provided theme dirs alongside auto-discovered", async () => {
    const base = join(tmpDir, "cli-themes");
    mkdirSync(join(base, "themes", "auto"), { recursive: true });
    writeFileSync(join(base, "themes", "auto", "theme.json"), validThemeJson);
    writeFileSync(join(base, "slides.md"), "# Hello");

    const cliDir = makeThemeDir("cli-provided", {
      "theme.json": validThemeJson,
    });

    const result = await discoverExternalThemes(join(base, "slides.md"), [cliDir]);
    expect(result.length).toBe(2);
    const names = result.map((t) => t.name).sort();
    expect(names).toEqual(["auto", "cli-provided"]);
  });
});
