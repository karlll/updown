import { resolve, basename, dirname } from "node:path";
import { existsSync, readdirSync, statSync } from "node:fs";
import type { Theme } from "./themes.ts";
import type { Style } from "./presets.ts";

export type LoadedExternalTheme = {
  name: string;
  theme: Theme;
  style?: Style;
  assetsDir?: string;
};

export async function loadExternalTheme(
  themeDir: string,
): Promise<LoadedExternalTheme | null> {
  const absDir = resolve(themeDir);
  const name = basename(absDir);

  // theme.json is required
  const themeFile = Bun.file(resolve(absDir, "theme.json"));
  if (!(await themeFile.exists())) {
    console.warn(`External theme "${name}": missing theme.json, skipping`);
    return null;
  }

  let themeJson: unknown;
  try {
    themeJson = JSON.parse(await themeFile.text());
  } catch {
    console.warn(`External theme "${name}": invalid theme.json, skipping`);
    return null;
  }

  const tj = themeJson as Record<string, unknown>;
  if (
    typeof tj.shikiTheme !== "string" ||
    (tj.mermaidTheme !== "default" && tj.mermaidTheme !== "dark") ||
    typeof tj.variables !== "object" ||
    tj.variables === null
  ) {
    console.warn(
      `External theme "${name}": theme.json must have shikiTheme (string), mermaidTheme ("default"|"dark"), and variables (object)`,
    );
    return null;
  }

  const theme: Theme = {
    name,
    shikiTheme: tj.shikiTheme,
    mermaidTheme: tj.mermaidTheme,
    variables: tj.variables as Record<string, string>,
  };

  // optional extra.css
  const extraFile = Bun.file(resolve(absDir, "extra.css"));
  if (await extraFile.exists()) {
    theme.extraCSS = (await extraFile.text()).trim();
  }

  // optional style.json
  let style: Style | undefined;
  const styleFile = Bun.file(resolve(absDir, "style.json"));
  if (await styleFile.exists()) {
    try {
      const styleJson = JSON.parse(await styleFile.text()) as Record<
        string,
        unknown
      >;
      if (
        typeof styleJson.variables === "object" &&
        styleJson.variables !== null
      ) {
        style = {
          name,
          variables: styleJson.variables as Record<string, string>,
        };
      }
    } catch {
      console.warn(
        `External theme "${name}": invalid style.json, using default style`,
      );
    }
  }

  // optional assets directory
  let assetsDir: string | undefined;
  const assetsDirPath = resolve(absDir, "assets");
  if (existsSync(assetsDirPath) && statSync(assetsDirPath).isDirectory()) {
    assetsDir = assetsDirPath;
  }

  return { name, theme, style, assetsDir };
}

export async function discoverExternalThemes(
  markdownPath: string,
  extraThemeDirs: string[] = [],
): Promise<LoadedExternalTheme[]> {
  const results: LoadedExternalTheme[] = [];

  // Auto-discover themes/ relative to the markdown file
  const mdDir = dirname(resolve(markdownPath));
  const themesDir = resolve(mdDir, "themes");

  if (existsSync(themesDir) && statSync(themesDir).isDirectory()) {
    const entries = readdirSync(themesDir);
    for (const entry of entries) {
      const entryPath = resolve(themesDir, entry);
      if (statSync(entryPath).isDirectory()) {
        const loaded = await loadExternalTheme(entryPath);
        if (loaded) results.push(loaded);
      }
    }
  }

  // Load explicitly provided theme directories
  for (const dir of extraThemeDirs) {
    const loaded = await loadExternalTheme(dir);
    if (loaded) results.push(loaded);
  }

  return results;
}
