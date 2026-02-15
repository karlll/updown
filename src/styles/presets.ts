export type Style = {
  name: string;
  variables: Record<string, string>;
};

const defaultStyle: Style = {
  name: "default",
  variables: {
    "--font-family": 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    "--font-family-heading": "var(--font-family)",
    "--font-family-code":
      'ui-monospace, "Cascadia Code", "JetBrains Mono", Menlo, monospace',
    "--font-size-base": "1.5rem",
    "--line-height": "1.6",
    "--line-height-heading": "1.2",
    "--h1-size": "2.5em",
    "--h2-size": "2em",
    "--h3-size": "1.5em",
    "--h4-size": "1.25em",
    "--heading-weight": "700",
    "--heading-transform": "none",
    "--heading-letter-spacing": "normal",
    "--heading-margin-bottom": "0.75em",
    "--slide-padding": "4rem 6rem",
    "--block-margin": "0.75em",
    "--border-radius": "8px",
    "--border-radius-inline": "4px",
  },
};

const modern: Style = {
  name: "modern",
  variables: {
    "--font-family":
      '"Inter", "Helvetica Neue", system-ui, -apple-system, sans-serif',
    "--font-family-heading": "var(--font-family)",
    "--font-family-code":
      'ui-monospace, "Cascadia Code", "JetBrains Mono", Menlo, monospace',
    "--font-size-base": "1.5rem",
    "--line-height": "1.7",
    "--line-height-heading": "1.1",
    "--h1-size": "3em",
    "--h2-size": "2.25em",
    "--h3-size": "1.5em",
    "--h4-size": "1.25em",
    "--heading-weight": "800",
    "--heading-transform": "uppercase",
    "--heading-letter-spacing": "0.04em",
    "--heading-margin-bottom": "0.8em",
    "--slide-padding": "5rem 8rem",
    "--block-margin": "0.85em",
    "--border-radius": "12px",
    "--border-radius-inline": "6px",
  },
};

const classic: Style = {
  name: "classic",
  variables: {
    "--font-family": 'Georgia, "Times New Roman", serif',
    "--font-family-heading": 'Georgia, "Times New Roman", serif',
    "--font-family-code":
      'ui-monospace, "Cascadia Code", "JetBrains Mono", Menlo, monospace',
    "--font-size-base": "1.4rem",
    "--line-height": "1.7",
    "--line-height-heading": "1.25",
    "--h1-size": "2.5em",
    "--h2-size": "1.9em",
    "--h3-size": "1.4em",
    "--h4-size": "1.2em",
    "--heading-weight": "600",
    "--heading-transform": "none",
    "--heading-letter-spacing": "normal",
    "--heading-margin-bottom": "0.6em",
    "--slide-padding": "4rem 7rem",
    "--block-margin": "0.7em",
    "--border-radius": "4px",
    "--border-radius-inline": "3px",
  },
};

const smooth: Style = {
  name: "smooth",
  variables: {
    "--font-family":
      '"Inter", "Helvetica Neue", "Arial", system-ui, sans-serif',
    "--font-family-heading":
      '"Roboto Slab", "Rockwell", "Courier New", serif',
    "--font-family-code":
      '"SF Mono", "Fira Code", ui-monospace, "Cascadia Code", monospace',
    "--font-size-base": "1.45rem",
    "--line-height": "1.75",
    "--line-height-heading": "1.15",
    "--h1-size": "2.8em",
    "--h2-size": "2.1em",
    "--h3-size": "1.45em",
    "--h4-size": "1.2em",
    "--heading-weight": "700",
    "--heading-transform": "none",
    "--heading-letter-spacing": "0.02em",
    "--heading-margin-bottom": "0.9em",
    "--slide-padding": "5rem 8rem",
    "--block-margin": "0.9em",
    "--border-radius": "2px",
    "--border-radius-inline": "2px",
  },
};

const terminal: Style = {
  name: "terminal",
  variables: {
    "--font-family":
      'ui-monospace, "Cascadia Code", "JetBrains Mono", "Fira Code", "IBM Plex Mono", Menlo, monospace',
    "--font-family-heading": "var(--font-family)",
    "--font-family-code": "var(--font-family)",
    "--font-size-base": "1.25rem",
    "--line-height": "1.5",
    "--line-height-heading": "1.3",
    "--h1-size": "2em",
    "--h2-size": "1.6em",
    "--h3-size": "1.3em",
    "--h4-size": "1.1em",
    "--heading-weight": "700",
    "--heading-transform": "uppercase",
    "--heading-letter-spacing": "0.08em",
    "--heading-margin-bottom": "0.5em",
    "--slide-padding": "3rem 4rem",
    "--block-margin": "0.6em",
    "--border-radius": "0px",
    "--border-radius-inline": "0px",
  },
};

export const styles: Record<string, Style> = {
  default: defaultStyle,
  modern,
  classic,
  smooth,
  terminal,
};

export const defaultStyleName = "default";

export function generateStyleVars(style: Style): string {
  return Object.entries(style.variables)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join("\n");
}
