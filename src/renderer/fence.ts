import type { FencePlugin } from "./types.ts";

function escapeHtml(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

export type Highlighter = {
  codeToHtml(code: string, options: { lang: string; theme: string }): string;
  getLoadedLanguages(): string[];
};

export class FenceRegistry {
  private plugins: Map<string, FencePlugin> = new Map();
  private highlighter: Highlighter | null = null;
  private shikiTheme: string | null = null;

  setHighlighter(highlighter: Highlighter, theme: string): void {
    this.highlighter = highlighter;
    this.shikiTheme = theme;
  }

  register(plugin: FencePlugin): void {
    this.plugins.set(plugin.lang, plugin);
  }

  render(lang: string | null | undefined, content: string): string {
    if (lang) {
      const plugin = this.plugins.get(lang);
      if (plugin) {
        return plugin.render(content);
      }
    }

    // Try Shiki highlighting for known languages
    if (lang && this.highlighter && this.shikiTheme) {
      const loaded = this.highlighter.getLoadedLanguages();
      if (loaded.includes(lang)) {
        const highlighted = this.highlighter.codeToHtml(content, {
          lang,
          theme: this.shikiTheme,
        });
        return `<div class="fence ${escapeHtml(lang)}">${highlighted}</div>`;
      }
    }

    const langClass = lang ? ` ${escapeHtml(lang)}` : "";
    return `<div class="fence${langClass}"><pre>${escapeHtml(content)}</pre></div>`;
  }
}
