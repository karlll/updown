import type { RootContent } from "mdast";
import type { Slide } from "./types.ts";

function isSlideHeading(node: RootContent): boolean {
  return node.type === "heading" && (node.depth === 1 || node.depth === 2);
}

function isMetaFence(node: RootContent): boolean {
  return node.type === "code" && node.lang === "meta";
}

const emptyMetadata = () => ({ attributes: {}, cssClasses: [] });

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
      // Peek ahead past any meta-fence code blocks
      let peekIndex = i + 1;
      while (peekIndex < nodes.length && isMetaFence(nodes[peekIndex]!)) {
        peekIndex++;
      }
      const nextContent = nodes[peekIndex];

      if (nextContent && isSlideHeading(nextContent)) {
        // --- (+ optional meta-fences) + heading = one slide transition
        if (current.length > 0) {
          slides.push({ index: slides.length + 1, nodes: current, metadata: emptyMetadata() });
        }
        // Start new slide with any meta-fences between --- and heading, plus the heading
        current = [];
        for (let j = i + 1; j <= peekIndex; j++) {
          current.push(nodes[j]!);
        }
        i = peekIndex; // skip past everything we consumed
        continue;
      }

      // Regular thematic break: push current slide, start a new one
      if (current.length > 0) {
        slides.push({ index: slides.length + 1, nodes: current, metadata: emptyMetadata() });
        current = [];
      }
      // The thematicBreak itself is consumed (not included in any slide)
      continue;
    }

    if (isSlideHeading(node)) {
      // Push current slide if it has content, start new slide with this heading
      if (current.length > 0) {
        slides.push({ index: slides.length + 1, nodes: current, metadata: emptyMetadata() });
      }
      current = [node];
      continue;
    }

    current.push(node);
  }

  // Push the final slide if it has content
  if (current.length > 0) {
    slides.push({ index: slides.length + 1, nodes: current, metadata: emptyMetadata() });
  }

  return slides;
}
