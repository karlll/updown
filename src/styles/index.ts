import { themes, defaultTheme } from "./themes.ts";
import { baseCSS } from "./base.ts";

export { themes, defaultTheme } from "./themes.ts";
export type { Theme } from "./themes.ts";

/**
 * Generates a complete CSS stylesheet string for the given theme name.
 * Falls back to the default theme if the name is not recognized.
 */
export function generateStylesheet(themeName?: string): string {
  const theme = themes[themeName ?? defaultTheme] ?? themes[defaultTheme]!;

  const vars = Object.entries(theme.variables)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join("\n");

  return `:root {\n${vars}\n}\n\n${baseCSS}`;
}
