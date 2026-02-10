import type { FencePlugin } from "./types.ts";

function escapeHtml(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

export class FenceRegistry {
  private plugins: Map<string, FencePlugin> = new Map();

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

    const langClass = lang ? ` ${escapeHtml(lang)}` : "";
    return `<div class="fence${langClass}"><pre>${escapeHtml(content)}</pre></div>`;
  }
}
