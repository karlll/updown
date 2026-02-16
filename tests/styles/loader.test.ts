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

describe("loadExternalTheme", () => {
  test("loads a valid theme directory", async () => {
    const dir = makeThemeDir("valid-theme", {
      "theme.json": validThemeJson,
    });
    const result = await loadExternalTheme(dir);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("valid-theme");
    expect(result!.theme.shikiTheme).toBe("github-dark");
    expect(result!.theme.mermaidTheme).toBe("dark");
    expect(result!.theme.variables["--bg"]).toBe("#111");
    expect(result!.style).toBeUndefined();
    expect(result!.theme.extraCSS).toBeUndefined();
  });

  test("returns null when theme.json is missing", async () => {
    const dir = makeThemeDir("no-theme-json", {
      "style.json": validStyleJson,
    });
    const result = await loadExternalTheme(dir);
    expect(result).toBeNull();
  });

  test("returns null when theme.json is invalid JSON", async () => {
    const dir = makeThemeDir("bad-json", {
      "theme.json": "not valid json {{{",
    });
    const result = await loadExternalTheme(dir);
    expect(result).toBeNull();
  });

  test("returns null when theme.json has missing required fields", async () => {
    const dir = makeThemeDir("missing-fields", {
      "theme.json": JSON.stringify({ variables: { "--bg": "#000" } }),
    });
    const result = await loadExternalTheme(dir);
    expect(result).toBeNull();
  });

  test("returns null when mermaidTheme is invalid", async () => {
    const dir = makeThemeDir("bad-mermaid", {
      "theme.json": JSON.stringify({
        shikiTheme: "github-dark",
        mermaidTheme: "neon",
        variables: {},
      }),
    });
    const result = await loadExternalTheme(dir);
    expect(result).toBeNull();
  });

  test("loads optional style.json", async () => {
    const dir = makeThemeDir("with-style", {
      "theme.json": validThemeJson,
      "style.json": validStyleJson,
    });
    const result = await loadExternalTheme(dir);
    expect(result).not.toBeNull();
    expect(result!.style).toBeDefined();
    expect(result!.style!.name).toBe("with-style");
    expect(result!.style!.variables["--font-family"]).toBe("monospace");
  });

  test("loads optional extra.css", async () => {
    const dir = makeThemeDir("with-css", {
      "theme.json": validThemeJson,
      "extra.css": "h1 { color: red; }",
    });
    const result = await loadExternalTheme(dir);
    expect(result).not.toBeNull();
    expect(result!.theme.extraCSS).toBe("h1 { color: red; }");
  });

  test("detects assets directory", async () => {
    const dir = makeThemeDir("with-assets", {
      "theme.json": validThemeJson,
      "assets/font.woff2": "fake-font-data",
    });
    const result = await loadExternalTheme(dir);
    expect(result).not.toBeNull();
    expect(result!.assetsDir).toBe(join(dir, "assets"));
  });

  test("no assetsDir when assets/ doesn't exist", async () => {
    const dir = makeThemeDir("no-assets", {
      "theme.json": validThemeJson,
    });
    const result = await loadExternalTheme(dir);
    expect(result).not.toBeNull();
    expect(result!.assetsDir).toBeUndefined();
  });

  test("skips invalid style.json gracefully", async () => {
    const dir = makeThemeDir("bad-style", {
      "theme.json": validThemeJson,
      "style.json": "not json",
    });
    const result = await loadExternalTheme(dir);
    expect(result).not.toBeNull();
    expect(result!.style).toBeUndefined();
  });

  test("theme name is derived from directory name", async () => {
    const dir = makeThemeDir("my-cool-theme", {
      "theme.json": validThemeJson,
    });
    const result = await loadExternalTheme(dir);
    expect(result!.name).toBe("my-cool-theme");
    expect(result!.theme.name).toBe("my-cool-theme");
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
