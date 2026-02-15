import { parse } from "./parser/index.ts";
import { render, FenceRegistry } from "./renderer/index.ts";
import { generateNavigationScript } from "./navigation/index.ts";
import { generateStylesheet, themes, defaultTheme, styles } from "./styles/index.ts";
import { renderExcalidraw } from "./excalidraw/index.ts";
import { generateMermaidScript } from "./mermaid/index.ts";
import { startPlantUMLServer } from "./plantuml/server.ts";
import { generatePlantUMLScript } from "./plantuml/client.ts";
import type { PlantUMLServer } from "./plantuml/server.ts";
import { createHighlighter, bundledLanguages } from "shiki";
import type { RootContent, PhrasingContent } from "mdast";
import type { RenderedSlideShow } from "./renderer/index.ts";
import type { Highlighter } from "./renderer/fence.ts";
import type { BundledLanguage } from "shiki";
import { resolve, dirname } from "node:path";
// @ts-ignore — Bun text import
import mermaidClientJs from "mermaid/dist/mermaid.min.js" with { type: "text" };

const filePath = Bun.argv[2];

if (!filePath) {
  console.error("Usage: bun src/index.ts <path-to-markdown-file>");
  process.exit(1);
}

let plantumlServer: PlantUMLServer | null = null;

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

  // Resolve style: built-in name or external CSS file
  const styleValue = slideshow.frontMatter.attributes["data-fm-style"];
  delete slideshow.frontMatter.attributes["data-fm-style"];
  let styleName: string | undefined;
  let externalCSS: string | undefined;
  if (styleValue && (styleValue.includes("/") || styleValue.includes("."))) {
    const cssPath = resolve(mdDir, styleValue);
    const cssFile = Bun.file(cssPath);
    if (await cssFile.exists()) {
      externalCSS = await cssFile.text();
    } else {
      console.warn(`Style file not found: ${cssPath}, using default style`);
    }
  } else if (styleValue) {
    if (styleValue in styles) {
      styleName = styleValue;
    } else {
      console.warn(`Unknown style "${styleValue}", using default style`);
    }
  }

  // Detect mermaid and plantuml code blocks
  let hasMermaid = false;
  let hasPlantUML = false;
  for (const slide of slideshow.slides) {
    for (const node of slide.nodes) {
      if (node.type === "code" && node.lang === "mermaid") hasMermaid = true;
      if (node.type === "code" && node.lang === "plantuml") hasPlantUML = true;
      if (hasMermaid && hasPlantUML) break;
    }
    if (hasMermaid && hasPlantUML) break;
  }

  const fenceRegistry = new FenceRegistry();
  fenceRegistry.setHighlighter(highlighter, theme.shikiTheme);
  if (hasMermaid) {
    fenceRegistry.register({
      lang: "mermaid",
      render(content) {
        return `<div class="fence fence-mermaid"><pre class="mermaid">${content}</pre></div>`;
      },
    });
  }
  if (hasPlantUML) {
    if (!plantumlServer) {
      plantumlServer = await startPlantUMLServer();
    }
    fenceRegistry.register({
      lang: "plantuml",
      render(content) {
        return `<div class="fence fence-plantuml"><pre class="plantuml">${content}</pre></div>`;
      },
    });
  }
  const mermaidScript = hasMermaid ? generateMermaidScript(theme.mermaidTheme) : undefined;
  const plantumlScript = hasPlantUML ? generatePlantUMLScript() : undefined;
  const stylesheet = generateStylesheet(themeName, styleName, externalCSS);
  return render(slideshow, fenceRegistry, generateNavigationScript(), stylesheet, excalidrawSvgs, mermaidScript, plantumlScript);
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
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      return new Response(rendered.fullDocument, { headers: htmlHeaders });
    }

    if (url.pathname === "/assets/mermaid.min.js") {
      return new Response(mermaidClientJs, {
        headers: { "Content-Type": "application/javascript" },
      });
    }

    if (url.pathname === "/plantuml/render" && req.method === "POST" && plantumlServer) {
      const body = await req.json();
      const res = await fetch(`http://127.0.0.1:${plantumlServer.port}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return new Response(await res.text(), {
        status: res.status,
        headers: { "Content-Type": res.headers.get("Content-Type") ?? "image/svg+xml" },
      });
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

process.on("exit", () => plantumlServer?.stop());

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
      plantumlServer?.stop();
      server.stop();
      process.exit(0);
    }
  });
}
