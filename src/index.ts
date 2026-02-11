import { parse } from "./parser/index.ts";
import { render, FenceRegistry } from "./renderer/index.ts";
import { generateNavigationScript } from "./navigation/index.ts";
import { generateStylesheet } from "./styles/index.ts";
import type { RenderedSlideShow } from "./renderer/index.ts";

const filePath = Bun.argv[2];

if (!filePath) {
  console.error("Usage: bun src/index.ts <path-to-markdown-file>");
  process.exit(1);
}

async function loadAndRender(path: string): Promise<RenderedSlideShow> {
  const markdown = await Bun.file(path).text();
  const slideshow = parse(markdown);
  const fenceRegistry = new FenceRegistry();
  const themeName = slideshow.frontMatter.attributes["data-fm-theme"];
  const stylesheet = generateStylesheet(themeName);
  return render(slideshow, fenceRegistry, generateNavigationScript(), stylesheet);
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
