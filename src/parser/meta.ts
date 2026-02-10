import type { RootContent } from "mdast";
import type { Slide } from "./types.ts";
import { parseYamlMetadata } from "./yaml-metadata.ts";

/**
 * Walks a slide's nodes, finds code blocks with lang "meta", parses their
 * YAML content, attaches metadata to the preceding sibling, and removes
 * the meta-fence node. Mutates the slide in place.
 */
export function processMetaFences(slide: Slide): void {
  let i = 0;
  while (i < slide.nodes.length) {
    const node = slide.nodes[i]!;

    if (node.type === "code" && node.lang === "meta") {
      // Remove the meta-fence node
      slide.nodes.splice(i, 1);

      // If there's no preceding sibling, attach to the slide itself
      if (i === 0) {
        const metadata = parseYamlMetadata(node.value, "data-meta-");
        slide.metadata.cssClasses.push(...metadata.cssClasses);
        Object.assign(slide.metadata.attributes, metadata.attributes);
        continue;
      }

      // Parse and attach metadata to the preceding sibling
      const target = slide.nodes[i - 1]! as RootContent & { data?: Record<string, unknown> };
      const metadata = parseYamlMetadata(node.value, "data-meta-");

      if (!target.data) target.data = {};
      target.data.meta = metadata;

      // Don't increment i — the splice shifted everything down
      continue;
    }

    i++;
  }
}
