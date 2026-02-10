import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import type { Root } from "mdast";

import { extractFrontMatter } from "./frontmatter.ts";
import { splitIntoSlides } from "./slides.ts";
import { processMetaFences } from "./meta.ts";
import type { SlideShow } from "./types.ts";

export type { SlideShow, Slide, NodeMetadata } from "./types.ts";

const processor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ["yaml"])
  .use(remarkGfm);

export function parse(markdown: string): SlideShow {
  const root = processor.parse(markdown) as Root;
  const frontMatter = extractFrontMatter(root);
  const slides = splitIntoSlides(root.children);
  for (const slide of slides) {
    processMetaFences(slide);
  }
  return { frontMatter, slides };
}
