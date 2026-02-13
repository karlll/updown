export type Theme = {
  name: string;
  shikiTheme: string;
  mermaidTheme: "default" | "dark";
  variables: Record<string, string>;
};

const light: Theme = {
  name: "light",
  shikiTheme: "github-light",
  mermaidTheme: "default",
  variables: {
    "--bg": "#ffffff",
    "--fg": "#1a1a2e",
    "--heading": "#16213e",
    "--accent": "#0f3460",
    "--link": "#0f3460",
    "--code-bg": "#f0f0f5",
    "--code-fg": "#1a1a2e",
    "--code-border": "#d0d0da",
    "--fence-bg": "#f0f0f5",
    "--fence-fg": "#1a1a2e",
    "--blockquote-border": "#d0d0da",
    "--blockquote-fg": "#555570",
    "--table-border": "#d0d0da",
    "--table-header-bg": "#f0f0f5",
    "--hr-color": "#d0d0da",
    "--excalidraw-filter": "none",
  },
};

const dark: Theme = {
  name: "dark",
  shikiTheme: "github-dark",
  mermaidTheme: "dark",
  variables: {
    "--bg": "#1a1a2e",
    "--fg": "#e0e0e8",
    "--heading": "#e0e0e8",
    "--accent": "#7aa2f7",
    "--link": "#7aa2f7",
    "--code-bg": "#24243e",
    "--code-fg": "#c0caf5",
    "--code-border": "#3b3b5c",
    "--fence-bg": "#24243e",
    "--fence-fg": "#c0caf5",
    "--blockquote-border": "#3b3b5c",
    "--blockquote-fg": "#9898b0",
    "--table-border": "#3b3b5c",
    "--table-header-bg": "#24243e",
    "--hr-color": "#3b3b5c",
    "--excalidraw-filter": "invert(1) hue-rotate(180deg)",
  },
};

const catppuccinMocha: Theme = {
  name: "catppuccin-mocha",
  shikiTheme: "catppuccin-mocha",
  mermaidTheme: "dark",
  variables: {
    "--bg": "#1e1e2e",
    "--fg": "#cdd6f4",
    "--heading": "#cba6f7",
    "--accent": "#89b4fa",
    "--link": "#89b4fa",
    "--code-bg": "#313244",
    "--code-fg": "#a6e3a1",
    "--code-border": "#45475a",
    "--fence-bg": "#313244",
    "--fence-fg": "#cdd6f4",
    "--blockquote-border": "#45475a",
    "--blockquote-fg": "#a6adc8",
    "--table-border": "#45475a",
    "--table-header-bg": "#313244",
    "--hr-color": "#45475a",
    "--excalidraw-filter": "invert(1) hue-rotate(180deg)",
  },
};

const catppuccinLatte: Theme = {
  name: "catppuccin-latte",
  shikiTheme: "catppuccin-latte",
  mermaidTheme: "default",
  variables: {
    "--bg": "#eff1f5",
    "--fg": "#4c4f69",
    "--heading": "#8839ef",
    "--accent": "#1e66f5",
    "--link": "#1e66f5",
    "--code-bg": "#e6e9ef",
    "--code-fg": "#40a02b",
    "--code-border": "#ccd0da",
    "--fence-bg": "#e6e9ef",
    "--fence-fg": "#4c4f69",
    "--blockquote-border": "#ccd0da",
    "--blockquote-fg": "#6c6f85",
    "--table-border": "#ccd0da",
    "--table-header-bg": "#e6e9ef",
    "--hr-color": "#ccd0da",
    "--excalidraw-filter": "none",
  },
};

export const themes: Record<string, Theme> = {
  light,
  dark,
  "catppuccin-mocha": catppuccinMocha,
  "catppuccin-latte": catppuccinLatte,
};

export const defaultTheme = "light";
