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

// --- Catppuccin ---

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

const catppuccinFrappe: Theme = {
  name: "catppuccin-frappe",
  shikiTheme: "catppuccin-frappe",
  mermaidTheme: "dark",
  variables: {
    "--bg": "#303446",
    "--fg": "#c6d0f5",
    "--heading": "#ca9ee6",
    "--accent": "#8caaee",
    "--link": "#8caaee",
    "--code-bg": "#414559",
    "--code-fg": "#a6d189",
    "--code-border": "#51576d",
    "--fence-bg": "#414559",
    "--fence-fg": "#c6d0f5",
    "--blockquote-border": "#51576d",
    "--blockquote-fg": "#a5adce",
    "--table-border": "#51576d",
    "--table-header-bg": "#414559",
    "--hr-color": "#51576d",
    "--excalidraw-filter": "invert(1) hue-rotate(180deg)",
  },
};

const catppuccinMacchiato: Theme = {
  name: "catppuccin-macchiato",
  shikiTheme: "catppuccin-macchiato",
  mermaidTheme: "dark",
  variables: {
    "--bg": "#24273a",
    "--fg": "#cad3f5",
    "--heading": "#c6a0f6",
    "--accent": "#8aadf4",
    "--link": "#8aadf4",
    "--code-bg": "#363a4f",
    "--code-fg": "#a6da95",
    "--code-border": "#494d64",
    "--fence-bg": "#363a4f",
    "--fence-fg": "#cad3f5",
    "--blockquote-border": "#494d64",
    "--blockquote-fg": "#a5adcb",
    "--table-border": "#494d64",
    "--table-header-bg": "#363a4f",
    "--hr-color": "#494d64",
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

// --- Monokai ---

const monokaiDark: Theme = {
  name: "monokai-dark",
  shikiTheme: "monokai",
  mermaidTheme: "dark",
  variables: {
    "--bg": "#272822",
    "--fg": "#f8f8f2",
    "--heading": "#f92672",
    "--accent": "#66d9ef",
    "--link": "#66d9ef",
    "--code-bg": "#3e3d32",
    "--code-fg": "#a6e22e",
    "--code-border": "#49483e",
    "--fence-bg": "#3e3d32",
    "--fence-fg": "#f8f8f2",
    "--blockquote-border": "#49483e",
    "--blockquote-fg": "#75715e",
    "--table-border": "#49483e",
    "--table-header-bg": "#3e3d32",
    "--hr-color": "#49483e",
    "--excalidraw-filter": "invert(1) hue-rotate(180deg)",
  },
};

const monokaiLight: Theme = {
  name: "monokai-light",
  shikiTheme: "light-plus",
  mermaidTheme: "default",
  variables: {
    "--bg": "#fafafa",
    "--fg": "#49483e",
    "--heading": "#f92672",
    "--accent": "#0089b3",
    "--link": "#0089b3",
    "--code-bg": "#f0efe7",
    "--code-fg": "#7a8a0e",
    "--code-border": "#e0dfce",
    "--fence-bg": "#f0efe7",
    "--fence-fg": "#49483e",
    "--blockquote-border": "#e0dfce",
    "--blockquote-fg": "#75715e",
    "--table-border": "#e0dfce",
    "--table-header-bg": "#f0efe7",
    "--hr-color": "#e0dfce",
    "--excalidraw-filter": "none",
  },
};

// --- Gruvbox ---

const gruvboxDark: Theme = {
  name: "gruvbox-dark",
  shikiTheme: "gruvbox-dark-medium",
  mermaidTheme: "dark",
  variables: {
    "--bg": "#282828",
    "--fg": "#ebdbb2",
    "--heading": "#fabd2f",
    "--accent": "#83a598",
    "--link": "#83a598",
    "--code-bg": "#3c3836",
    "--code-fg": "#b8bb26",
    "--code-border": "#504945",
    "--fence-bg": "#3c3836",
    "--fence-fg": "#ebdbb2",
    "--blockquote-border": "#504945",
    "--blockquote-fg": "#a89984",
    "--table-border": "#504945",
    "--table-header-bg": "#3c3836",
    "--hr-color": "#504945",
    "--excalidraw-filter": "invert(1) hue-rotate(180deg)",
  },
};

const gruvboxLight: Theme = {
  name: "gruvbox-light",
  shikiTheme: "gruvbox-light-medium",
  mermaidTheme: "default",
  variables: {
    "--bg": "#fbf1c7",
    "--fg": "#3c3836",
    "--heading": "#b57614",
    "--accent": "#076678",
    "--link": "#076678",
    "--code-bg": "#ebdbb2",
    "--code-fg": "#79740e",
    "--code-border": "#d5c4a1",
    "--fence-bg": "#ebdbb2",
    "--fence-fg": "#3c3836",
    "--blockquote-border": "#d5c4a1",
    "--blockquote-fg": "#665c54",
    "--table-border": "#d5c4a1",
    "--table-header-bg": "#ebdbb2",
    "--hr-color": "#d5c4a1",
    "--excalidraw-filter": "none",
  },
};

// --- Nord ---

const nordDark: Theme = {
  name: "nord-dark",
  shikiTheme: "nord",
  mermaidTheme: "dark",
  variables: {
    "--bg": "#2e3440",
    "--fg": "#d8dee9",
    "--heading": "#88c0d0",
    "--accent": "#81a1c1",
    "--link": "#81a1c1",
    "--code-bg": "#3b4252",
    "--code-fg": "#a3be8c",
    "--code-border": "#434c5e",
    "--fence-bg": "#3b4252",
    "--fence-fg": "#d8dee9",
    "--blockquote-border": "#434c5e",
    "--blockquote-fg": "#9da7ba",
    "--table-border": "#434c5e",
    "--table-header-bg": "#3b4252",
    "--hr-color": "#434c5e",
    "--excalidraw-filter": "invert(1) hue-rotate(180deg)",
  },
};

const nordLight: Theme = {
  name: "nord-light",
  shikiTheme: "min-light",
  mermaidTheme: "default",
  variables: {
    "--bg": "#eceff4",
    "--fg": "#2e3440",
    "--heading": "#5e81ac",
    "--accent": "#81a1c1",
    "--link": "#5e81ac",
    "--code-bg": "#e5e9f0",
    "--code-fg": "#a3be8c",
    "--code-border": "#d8dee9",
    "--fence-bg": "#e5e9f0",
    "--fence-fg": "#2e3440",
    "--blockquote-border": "#d8dee9",
    "--blockquote-fg": "#4c566a",
    "--table-border": "#d8dee9",
    "--table-header-bg": "#e5e9f0",
    "--hr-color": "#d8dee9",
    "--excalidraw-filter": "none",
  },
};

// --- Solarized ---

const solarizedDark: Theme = {
  name: "solarized-dark",
  shikiTheme: "solarized-dark",
  mermaidTheme: "dark",
  variables: {
    "--bg": "#002b36",
    "--fg": "#839496",
    "--heading": "#268bd2",
    "--accent": "#2aa198",
    "--link": "#268bd2",
    "--code-bg": "#073642",
    "--code-fg": "#859900",
    "--code-border": "#586e75",
    "--fence-bg": "#073642",
    "--fence-fg": "#839496",
    "--blockquote-border": "#586e75",
    "--blockquote-fg": "#657b83",
    "--table-border": "#586e75",
    "--table-header-bg": "#073642",
    "--hr-color": "#586e75",
    "--excalidraw-filter": "invert(1) hue-rotate(180deg)",
  },
};

const solarizedLight: Theme = {
  name: "solarized-light",
  shikiTheme: "solarized-light",
  mermaidTheme: "default",
  variables: {
    "--bg": "#fdf6e3",
    "--fg": "#657b83",
    "--heading": "#268bd2",
    "--accent": "#2aa198",
    "--link": "#268bd2",
    "--code-bg": "#eee8d5",
    "--code-fg": "#859900",
    "--code-border": "#93a1a1",
    "--fence-bg": "#eee8d5",
    "--fence-fg": "#657b83",
    "--blockquote-border": "#93a1a1",
    "--blockquote-fg": "#586e75",
    "--table-border": "#93a1a1",
    "--table-header-bg": "#eee8d5",
    "--hr-color": "#93a1a1",
    "--excalidraw-filter": "none",
  },
};

export const themes: Record<string, Theme> = {
  light,
  dark,
  "catppuccin-latte": catppuccinLatte,
  "catppuccin-frappe": catppuccinFrappe,
  "catppuccin-macchiato": catppuccinMacchiato,
  "catppuccin-mocha": catppuccinMocha,
  "monokai-dark": monokaiDark,
  "monokai-light": monokaiLight,
  "gruvbox-dark": gruvboxDark,
  "gruvbox-light": gruvboxLight,
  "nord-dark": nordDark,
  "nord-light": nordLight,
  "solarized-dark": solarizedDark,
  "solarized-light": solarizedLight,
};

export const defaultTheme = "light";
