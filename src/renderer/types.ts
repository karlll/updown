/** Interface for pluggable fence renderers. */
export type FencePlugin = {
  lang: string;
  render(content: string): string;
};

/** The renderer's output. */
export type RenderedSlideShow = {
  fullDocument: string;
  slideFragments: Map<number, string>;
};
