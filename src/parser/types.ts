import type { RootContent } from "mdast";

/** Metadata attached to nodes via meta-fences or front matter. */
export type NodeMetadata = {
  attributes: Record<string, string>;
  cssClasses: string[];
};

/** A single slide with its 1-based index and mdast content nodes. */
export type Slide = {
  index: number;
  nodes: RootContent[];
  metadata: NodeMetadata;
};

/** The full intermediate format produced by the parser. */
export type SlideShow = {
  frontMatter: NodeMetadata;
  slides: Slide[];
};
