import type { SlideShow } from "../parser/types.ts";
import type { RenderedSlideShow } from "./types.ts";
import { FenceRegistry } from "./fence.ts";
import { renderNode, escapeHtml } from "./nodes.ts";

export type { RenderedSlideShow } from "./types.ts";
export { FenceRegistry } from "./fence.ts";

function renderAttrs(attributes: Record<string, string>): string {
  return Object.entries(attributes)
    .map(([key, value]) => ` ${escapeHtml(key)}="${escapeHtml(value)}"`)
    .join("");
}

export function render(
  slideshow: SlideShow,
  fenceRegistry: FenceRegistry,
  navigationScript?: string,
  stylesheet?: string,
  excalidrawSvgs?: Map<string, string>,
  mermaidScript?: string,
  plantumlScript?: string,
): RenderedSlideShow {
  const slideFragments = new Map<number, string>();
  const slideCount = slideshow.slides.length;
  const slideDivs: string[] = [];

  for (const slide of slideshow.slides) {
    let innerHtml: string;
    if (slide.columns) {
      const preambleHtml = slide.nodes.map((n) => renderNode(n, fenceRegistry, excalidrawSvgs)).join("");
      const columnsHtml = slide.columns
        .map((col) => `<div class="column">${col.map((n) => renderNode(n, fenceRegistry, excalidrawSvgs)).join("")}</div>`)
        .join("");
      innerHtml = `${preambleHtml}<div class="columns">${columnsHtml}</div>`;
    } else {
      innerHtml = slide.nodes.map((n) => renderNode(n, fenceRegistry, excalidrawSvgs)).join("");
    }
    slideFragments.set(slide.index, innerHtml);

    const classes: string[] = ["slide"];
    if (slide.index === 1) classes.push("first");
    if (slide.index === slideCount) classes.push("last");
    // Add slide-level metadata classes
    if (slide.metadata.cssClasses.length > 0) {
      classes.push(...slide.metadata.cssClasses);
    }

    let slideAttrs = ` id="slide-${slide.index}" class="${classes.join(" ")}"`;
    // Add slide-level metadata attributes
    slideAttrs += renderAttrs(slide.metadata.attributes);

    slideDivs.push(`<div${slideAttrs}>${innerHtml}</div>`);
  }

  // Slideshow div attributes
  const fmClasses = slideshow.frontMatter.cssClasses;
  const fmClassAttr = fmClasses.length > 0 ? ` class="${escapeHtml(fmClasses.join(" "))}"` : "";
  const fmAttrs = renderAttrs(slideshow.frontMatter.attributes);

  const slideshowHtml = `<div id="slideshow"${fmClassAttr}${fmAttrs}>${slideDivs.join("")}</div>`;
  const scriptTag = navigationScript ? `<script>${navigationScript}</script>` : "";
  const styleTag = stylesheet ? `<style>${stylesheet}</style>` : "";
  const mermaidTags = mermaidScript
    ? `<script src="/assets/mermaid.min.js"></script>\n<script>${mermaidScript}</script>`
    : "";
  const plantumlTag = plantumlScript ? `<script>${plantumlScript}</script>` : "";

  const fullDocument = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>updown</title>
${styleTag}
</head>
<body>
${slideshowHtml}
${mermaidTags}
${plantumlTag}
${scriptTag}
</body>
</html>`;

  return { fullDocument, slideFragments };
}
