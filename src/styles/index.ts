import { themes, defaultTheme } from "./themes.ts";
import { styles, defaultStyleName, generateStyleVars } from "./presets.ts";
import { baseCSS } from "./base.ts";

export { themes, defaultTheme } from "./themes.ts";
export type { Theme } from "./themes.ts";
export { styles, defaultStyleName } from "./presets.ts";
export type { Style } from "./presets.ts";

/**
 * Generates a complete CSS stylesheet string for the given theme and style.
 * styleName selects a built-in style preset (falls back to default).
 * externalCSS is raw CSS appended after the base stylesheet (from an external file).
 */
export function generateStylesheet(
  themeName?: string,
  styleName?: string,
  externalCSS?: string,
): string {
  const theme = themes[themeName ?? defaultTheme] ?? themes[defaultTheme]!;
  const style = styles[styleName ?? defaultStyleName] ?? styles[defaultStyleName]!;

  const styleVars = generateStyleVars(style);
  const themeVars = Object.entries(theme.variables)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join("\n");

  const rootBlock = `:root {\n${styleVars}\n${themeVars}\n}`;

  let css = `${rootBlock}\n\n${baseCSS}`;

  if (theme.extraCSS) {
    css += `\n\n/* ${theme.name} effects */\n${theme.extraCSS}`;
  }

  if (externalCSS) {
    css += `\n\n${externalCSS}`;
  }

  return css;
}
