import { parse } from "./parser/index.ts";
import { render, FenceRegistry } from "./renderer/index.ts";
import { generateNavigationScript } from "./navigation/index.ts";
import { generateStylesheet, themes, defaultTheme } from "./styles/index.ts";
import { renderExcalidraw } from "./excalidraw/index.ts";
import { createHighlighter, bundledLanguages } from "shiki";
import type { RootContent, PhrasingContent } from "mdast";
import type { RenderedSlideShow } from "./renderer/index.ts";
import type { Highlighter } from "./renderer/fence.ts";
import type { BundledLanguage } from "shiki";
import { resolve, dirname } from "node:path";

const filePath = Bun.argv[2];

if (!filePath) {
  console.error("Usage: bun src/index.ts <path-to-markdown-file>");
  process.exit(1);
}

const shikiThemes = Object.values(themes).map((t) => t.shikiTheme);
const highlighter = await createHighlighter({
  themes: shikiThemes,
  langs: [],
});

async function loadAndRender(path: string): Promise<RenderedSlideShow> {
  const markdown = await Bun.file(path).text();
  const slideshow = parse(markdown);

  // Collect code fence languages and load any missing ones into Shiki
  const loaded = new Set(highlighter.getLoadedLanguages());
  const needed = new Set<string>();
  for (const slide of slideshow.slides) {
    for (const node of slide.nodes) {
      if (node.type === "code" && node.lang && !loaded.has(node.lang)) {
        if (node.lang in bundledLanguages) {
          needed.add(node.lang);
        }
      }
    }
  }
  if (needed.size > 0) {
    await highlighter.loadLanguage(...[...needed] as BundledLanguage[]);
  }

  // Collect .excalidraw image URLs and render them to SVG
  const mdDir = dirname(resolve(path));
  const excalidrawUrls = new Set<string>();
  for (const slide of slideshow.slides) {
    for (const node of slide.nodes) {
      collectExcalidrawUrls(node, excalidrawUrls);
    }
  }
  const excalidrawSvgs = new Map<string, string>();
  for (const url of excalidrawUrls) {
    const absPath = resolve(mdDir, url);
    excalidrawSvgs.set(url, await renderExcalidraw(absPath));
  }

  const themeName = slideshow.frontMatter.attributes["data-fm-theme"];
  const theme = themes[themeName ?? defaultTheme] ?? themes[defaultTheme]!;
  const fenceRegistry = new FenceRegistry();
  fenceRegistry.setHighlighter(highlighter, theme.shikiTheme);
  const stylesheet = generateStylesheet(themeName);
  return render(slideshow, fenceRegistry, generateNavigationScript(), stylesheet, excalidrawSvgs);
}

function collectExcalidrawUrls(node: RootContent | PhrasingContent, urls: Set<string>): void {
  if (node.type === "image" && node.url.endsWith(".excalidraw")) {
    urls.add(node.url);
    return;
  }
  if ("children" in node) {
    for (const child of node.children as (RootContent | PhrasingContent)[]) {
      collectExcalidrawUrls(child, urls);
    }
  }
}

let rendered = await loadAndRender(filePath);

const htmlHeaders = { "Content-Type": "text/html; charset=utf-8" };

const port = parseInt(process.env.PORT ?? "3000", 10);

const server = Bun.serve({
  port,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      return new Response(rendered.fullDocument, { headers: htmlHeaders });
    }

    const slideMatch = url.pathname.match(/^\/slide\/(\d+)$/);
    if (slideMatch) {
      const n = parseInt(slideMatch[1]!, 10);
      const fragment = rendered.slideFragments.get(n);
      if (fragment !== undefined) {
        return new Response(fragment, { headers: htmlHeaders });
      }
      return new Response("Slide not found", { status: 404 });
    }

    return new Response("Not found", { status: 404 });
  },
});

const fileName = filePath.split("/").pop() ?? filePath;
console.log(`updown listening on ${server.url}`);

if (process.stdin.isTTY) {
  console.log(`(r)eload ${fileName}, (q)uit`);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("data", async (data: Buffer) => {
    const key = data.toString();
    if (key === "r") {
      rendered = await loadAndRender(filePath);
      console.log(`reloaded ${fileName}`);
    } else if (key === "q" || key === "\x03") {
      server.stop();
      process.exit(0);
    }
  });
}
