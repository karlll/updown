import { parse } from "./parser/index.ts";
import { render, FenceRegistry } from "./renderer/index.ts";
import { generateNavigationScript } from "./navigation/index.ts";
import { generateStylesheet } from "./styles/index.ts";

const filePath = Bun.argv[2];

if (!filePath) {
  console.error("Usage: bun src/index.ts <path-to-markdown-file>");
  process.exit(1);
}

const markdown = await Bun.file(filePath).text();
const slideshow = parse(markdown);
const fenceRegistry = new FenceRegistry();
const themeName = slideshow.frontMatter.attributes["data-fm-theme"];
const stylesheet = generateStylesheet(themeName);
const rendered = render(slideshow, fenceRegistry, generateNavigationScript(), stylesheet);

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

console.log(`updown listening on ${server.url}`);
