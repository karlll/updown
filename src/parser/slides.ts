import type { RootContent } from "mdast";
import type { Slide } from "./types.ts";

function isSlideHeading(node: RootContent): boolean {
  return node.type === "heading" && (node.depth === 1 || node.depth === 2);
}

function isMetaFence(node: RootContent): boolean {
  return node.type === "code" && node.lang === "meta";
}

/** Check whether a node is a `+++` column break (parsed by mdast as a paragraph with text "+++"). */
function isColumnBreak(node: RootContent): boolean {
  if (node.type !== "paragraph") return false;
  const children = node.children;
  return children.length === 1 && children[0]!.type === "text" && children[0]!.value === "+++";
}

const emptyMetadata = () => ({ attributes: {}, cssClasses: [] });

/**
 * Splits a list of mdast root children into slides based on heading
 * and thematic break rules. Column breaks (`+++`) are preserved within
 * slides rather than creating new slides.
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

    // Column breaks are kept in the slide nodes for later extraction
    current.push(node);
  }

  // Push the final slide if it has content
  if (current.length > 0) {
    slides.push({ index: slides.length + 1, nodes: current, metadata: emptyMetadata() });
  }

  return slides;
}

/**
 * If a slide contains `+++` column breaks, split into preamble (headings)
 * kept in `slide.nodes` and column groups stored in `slide.columns`.
 * Must run after processMetaFences so that meta-fences are consumed first.
 */
export function extractColumns(slide: Slide): void {
  const breakIndices: number[] = [];
  for (let i = 0; i < slide.nodes.length; i++) {
    if (isColumnBreak(slide.nodes[i]!)) {
      breakIndices.push(i);
    }
  }
  if (breakIndices.length === 0) return;

  // Collect preamble: heading nodes before the first +++
  const firstBreak = breakIndices[0]!;
  const preamble: RootContent[] = [];
  const firstColumnNodes: RootContent[] = [];
  for (let i = 0; i < firstBreak; i++) {
    const node = slide.nodes[i]!;
    if (isSlideHeading(node)) {
      preamble.push(node);
    } else {
      firstColumnNodes.push(node);
    }
  }

  // Build column groups from content between +++ markers
  const columns: RootContent[][] = [firstColumnNodes];
  for (let b = 0; b < breakIndices.length; b++) {
    const start = breakIndices[b]! + 1;
    const end = b + 1 < breakIndices.length ? breakIndices[b + 1]! : slide.nodes.length;
    const col: RootContent[] = [];
    for (let i = start; i < end; i++) {
      col.push(slide.nodes[i]!);
    }
    columns.push(col);
  }

  slide.nodes = preamble;
  slide.columns = columns;
}
