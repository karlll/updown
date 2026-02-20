import type { RootContent, PhrasingContent, TableRow } from "mdast";
import type { NodeMetadata } from "../parser/types.ts";
import type { FenceRegistry } from "./fence.ts";

export function escapeHtml(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

function metaAttrs(node: { data?: Record<string, unknown> }): string {
  const meta = node.data?.meta as NodeMetadata | undefined;
  if (!meta) return "";

  const parts: string[] = [];

  if (meta.cssClasses.length > 0) {
    parts.push(`class="${escapeHtml(meta.cssClasses.join(" "))}"`);
  }

  for (const [key, value] of Object.entries(meta.attributes)) {
    parts.push(`${escapeHtml(key)}="${escapeHtml(value)}"`);
  }

  return parts.length > 0 ? ` ${parts.join(" ")}` : "";
}

function renderInline(node: PhrasingContent, reg: FenceRegistry, svgMap?: Map<string, string>): string {
  switch (node.type) {
    case "text":
      return escapeHtml(node.value);
    case "emphasis":
      return `<em>${node.children.map((c) => renderInline(c, reg, svgMap)).join("")}</em>`;
    case "strong":
      return `<strong>${node.children.map((c) => renderInline(c, reg, svgMap)).join("")}</strong>`;
    case "delete":
      return `<del>${node.children.map((c) => renderInline(c, reg, svgMap)).join("")}</del>`;
    case "inlineCode":
      return `<code>${escapeHtml(node.value)}</code>`;
    case "link":
      return `<a href="${escapeHtml(node.url)}">${node.children.map((c) => renderInline(c, reg, svgMap)).join("")}</a>`;
    case "image": {
      const svg = svgMap?.get(node.url);
      if (svg) {
        const alt = node.alt ? ` aria-label="${escapeHtml(node.alt)}"` : "";
        const navSvg = svg.replace(/^<svg\b/, '<svg class="svg-nav-enabled"');
        return `<span class="excalidraw-embed"${alt}>${navSvg}</span>`;
      }
      return `<img src="${escapeHtml(node.url)}" alt="${escapeHtml(node.alt ?? "")}">`;
    }
    case "break":
      return "<br>";
    case "html":
      return node.value;
    default:
      return "";
  }
}

function renderTableRow(row: TableRow, cellTag: "th" | "td", reg: FenceRegistry, svgMap?: Map<string, string>): string {
  const cells = row.children
    .map((cell) => {
      const content = cell.children.map((c) => renderInline(c, reg, svgMap)).join("");
      return `<${cellTag}>${content}</${cellTag}>`;
    })
    .join("");
  return `<tr>${cells}</tr>`;
}

export function renderNode(node: RootContent, reg: FenceRegistry, svgMap?: Map<string, string>): string {
  const attrs = metaAttrs(node as { data?: Record<string, unknown> });

  switch (node.type) {
    case "heading": {
      const tag = `h${node.depth}`;
      const children = node.children.map((c) => renderInline(c, reg, svgMap)).join("");
      return `<${tag}${attrs}>${children}</${tag}>`;
    }
    case "paragraph": {
      const children = node.children.map((c) => renderInline(c, reg, svgMap)).join("");
      return `<p${attrs}>${children}</p>`;
    }
    case "blockquote": {
      const children = node.children.map((c) => renderNode(c, reg, svgMap)).join("");
      return `<blockquote${attrs}>${children}</blockquote>`;
    }
    case "list": {
      const tag = node.ordered ? "ol" : "ul";
      const children = node.children.map((item) => {
        const itemAttrs = metaAttrs(item as { data?: Record<string, unknown> });
        // Unwrap single-paragraph children
        if (item.children.length === 1 && item.children[0]!.type === "paragraph") {
          const content = item.children[0]!.children.map((c) => renderInline(c, reg, svgMap)).join("");
          return `<li${itemAttrs}>${content}</li>`;
        }
        const content = item.children.map((c) => renderNode(c, reg, svgMap)).join("");
        return `<li${itemAttrs}>${content}</li>`;
      }).join("");
      return `<${tag}${attrs}>${children}</${tag}>`;
    }
    case "table": {
      const [headRow, ...bodyRows] = node.children;
      let html = `<table${attrs}>`;
      if (headRow) {
        html += `<thead>${renderTableRow(headRow, "th", reg, svgMap)}</thead>`;
      }
      if (bodyRows.length > 0) {
        html += `<tbody>${bodyRows.map((r) => renderTableRow(r, "td", reg, svgMap)).join("")}</tbody>`;
      }
      html += "</table>";
      return html;
    }
    case "code":
      return reg.render(node.lang, node.value);
    case "html":
      return node.value;
    case "thematicBreak":
      return "";
    default:
      return "";
  }
}
