import type { NodeMetadata } from "./types.ts";
import { parse as parseYaml } from "yaml";

/**
 * Parses a YAML string into validated NodeMetadata with the given attribute prefix.
 * Handles string, number, and flat arrays; ignores objects and nested arrays.
 * The `class` key is always routed to `cssClasses` (no prefix).
 */
export function parseYamlMetadata(
  yamlString: string,
  prefix: string,
): NodeMetadata {
  const empty: NodeMetadata = { attributes: {}, cssClasses: [] };

  const parsed: unknown = parseYaml(yamlString);
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return empty;
  }

  const attributes: Record<string, string> = {};
  const cssClasses: string[] = [];

  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      const flat = value.filter(
        (v): v is string | number =>
          typeof v === "string" || typeof v === "number",
      );
      if (flat.length === 0) continue;
      const joined = flat.map(String).join(" ");

      if (key === "class") {
        cssClasses.push(...flat.map(String));
      } else {
        attributes[`${prefix}${key}`] = joined;
      }
    } else if (typeof value === "string" || typeof value === "number") {
      if (key === "class") {
        cssClasses.push(String(value));
      } else {
        attributes[`${prefix}${key}`] = String(value);
      }
    }
    // Objects and other types are silently ignored
  }

  return { attributes, cssClasses };
}
