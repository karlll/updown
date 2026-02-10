import type { Root } from "mdast";
import type { NodeMetadata } from "./types.ts";
import { parseYamlMetadata } from "./yaml-metadata.ts";

/**
 * Extracts YAML front matter from an mdast tree, removes the yaml node,
 * and returns validated/transformed attributes and CSS classes.
 */
export function extractFrontMatter(root: Root): NodeMetadata {
  const firstChild = root.children[0];
  if (!firstChild || firstChild.type !== "yaml") {
    return { attributes: {}, cssClasses: [] };
  }

  root.children.splice(0, 1);
  return parseYamlMetadata(firstChild.value, "data-fm-");
}
