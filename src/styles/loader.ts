import { resolve, basename, dirname } from "node:path";
import { existsSync, readdirSync, statSync } from "node:fs";
import type { Theme } from "./themes.ts";
import type { Style } from "./presets.ts";

export type LoadedExternalTheme = {
  name: string;
  theme: Theme;
  style?: Style;
  assetsDir?: string;
  assetPrefix: string;
};

type VariantEntry = {
  shikiTheme: string;
  mermaidTheme: "default" | "dark";
  variables: Record<string, string>;
};

function isValidVariant(v: unknown): v is VariantEntry {
  const obj = v as Record<string, unknown>;
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.shikiTheme === "string" &&
    (obj.mermaidTheme === "default" || obj.mermaidTheme === "dark") &&
    typeof obj.variables === "object" &&
    obj.variables !== null
  );
}

async function loadStyle(dir: string, name: string): Promise<Style | undefined> {
  const styleFile = Bun.file(resolve(dir, "style.json"));
  if (!(await styleFile.exists())) return undefined;
  try {
    const styleJson = JSON.parse(await styleFile.text()) as Record<string, unknown>;
    if (typeof styleJson.variables === "object" && styleJson.variables !== null) {
      return { name, variables: styleJson.variables as Record<string, string> };
    }
  } catch {
    console.warn(`External theme "${name}": invalid style.json, using default style`);
  }
  return undefined;
}

async function loadExtraCSS(dir: string): Promise<string | undefined> {
  const extraFile = Bun.file(resolve(dir, "extra.css"));
  if (await extraFile.exists()) {
    return (await extraFile.text()).trim();
  }
  return undefined;
}

function detectAssetsDir(dir: string): string | undefined {
  const assetsDirPath = resolve(dir, "assets");
  if (existsSync(assetsDirPath) && statSync(assetsDirPath).isDirectory()) {
    return assetsDirPath;
  }
  return undefined;
}

export async function loadExternalTheme(
  themeDir: string,
): Promise<LoadedExternalTheme[]> {
  const absDir = resolve(themeDir);
  const name = basename(absDir);

  // theme.json is required
  const themeFile = Bun.file(resolve(absDir, "theme.json"));
  if (!(await themeFile.exists())) {
    console.warn(`External theme "${name}": missing theme.json, skipping`);
    return [];
  }

  let themeJson: unknown;
  try {
    themeJson = JSON.parse(await themeFile.text());
  } catch {
    console.warn(`External theme "${name}": invalid theme.json, skipping`);
    return [];
  }

  const tj = themeJson as Record<string, unknown>;

  // --- Variant themes ---
  if (typeof tj.variants === "object" && tj.variants !== null) {
    const variants = tj.variants as Record<string, unknown>;
    const parentExtraCSS = await loadExtraCSS(absDir);
    const parentStyle = await loadStyle(absDir, name);
    const assetsDir = detectAssetsDir(absDir);
    const results: LoadedExternalTheme[] = [];

    for (const [variantKey, variantValue] of Object.entries(variants)) {
      if (!isValidVariant(variantValue)) {
        console.warn(
          `External theme "${name}": variant "${variantKey}" must have shikiTheme, mermaidTheme, and variables`,
        );
        continue;
      }

      const variantName = `${name}-${variantKey}`;
      const variantDir = resolve(absDir, variantKey);

      // Variant-specific overrides (optional subdirectory)
      let variantExtraCSS: string | undefined;
      let variantStyle: Style | undefined;
      if (existsSync(variantDir) && statSync(variantDir).isDirectory()) {
        variantExtraCSS = await loadExtraCSS(variantDir);
        variantStyle = await loadStyle(variantDir, variantName);
      }

      // Combine extra CSS: parent first, then variant-specific
      let combinedExtraCSS: string | undefined;
      if (parentExtraCSS && variantExtraCSS) {
        combinedExtraCSS = `${parentExtraCSS}\n\n${variantExtraCSS}`;
      } else {
        combinedExtraCSS = parentExtraCSS ?? variantExtraCSS;
      }

      const theme: Theme = {
        name: variantName,
        shikiTheme: variantValue.shikiTheme,
        mermaidTheme: variantValue.mermaidTheme,
        variables: variantValue.variables,
      };
      if (combinedExtraCSS) {
        theme.extraCSS = combinedExtraCSS;
      }

      results.push({
        name: variantName,
        theme,
        style: variantStyle ?? parentStyle,
        assetsDir,
        assetPrefix: name,
      });
    }

    return results;
  }

  // --- Single theme (no variants) ---
  if (
    typeof tj.shikiTheme !== "string" ||
    (tj.mermaidTheme !== "default" && tj.mermaidTheme !== "dark") ||
    typeof tj.variables !== "object" ||
    tj.variables === null
  ) {
    console.warn(
      `External theme "${name}": theme.json must have shikiTheme (string), mermaidTheme ("default"|"dark"), and variables (object)`,
    );
    return [];
  }

  const theme: Theme = {
    name,
    shikiTheme: tj.shikiTheme,
    mermaidTheme: tj.mermaidTheme,
    variables: tj.variables as Record<string, string>,
  };

  const extraCSS = await loadExtraCSS(absDir);
  if (extraCSS) {
    theme.extraCSS = extraCSS;
  }

  const style = await loadStyle(absDir, name);
  const assetsDir = detectAssetsDir(absDir);

  return [{ name, theme, style, assetsDir, assetPrefix: name }];
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
        results.push(...loaded);
      }
    }
  }

  // Load explicitly provided theme directories
  for (const dir of extraThemeDirs) {
    const loaded = await loadExternalTheme(dir);
    results.push(...loaded);
  }

  return results;
}
