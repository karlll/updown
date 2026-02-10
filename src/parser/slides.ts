import type { RootContent } from "mdast";
import type { Slide } from "./types.ts";

function isSlideHeading(node: RootContent): boolean {
  return node.type === "heading" && (node.depth === 1 || node.depth === 2);
}

/**
 * Splits a list of mdast root children into slides based on heading
 * and thematic break rules.
 */
export function splitIntoSlides(nodes: RootContent[]): Slide[] {
  const slides: Slide[] = [];
  let current: RootContent[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;

    if (node.type === "thematicBreak") {
      // Check if next node is an h1/h2 — if so, let the heading handle the split
      const next = nodes[i + 1];
      if (next && isSlideHeading(next)) {
        // Push current slide if it has content, then let the next iteration handle the heading
        if (current.length > 0) {
          slides.push({ index: slides.length + 1, nodes: current });
          current = [];
        }
        continue;
      }

      // Regular thematic break: push current slide, start a new one
      if (current.length > 0) {
        slides.push({ index: slides.length + 1, nodes: current });
        current = [];
      }
      // The thematicBreak itself is consumed (not included in any slide)
      continue;
    }

    if (isSlideHeading(node)) {
      // Push current slide if it has content, start new slide with this heading
      if (current.length > 0) {
        slides.push({ index: slides.length + 1, nodes: current });
      }
      current = [node];
      continue;
    }

    current.push(node);
  }

  // Push the final slide if it has content
  if (current.length > 0) {
    slides.push({ index: slides.length + 1, nodes: current });
  }

  return slides;
}
