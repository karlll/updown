/**
 * Generates the client-side inline script that initializes MermaidJS.
 * The mermaid library itself is served as a static asset at /assets/mermaid.min.js.
 * Returns raw script body (no <script> tags).
 */
export function generateMermaidScript(theme: "default" | "dark"): string {
  return `
mermaid.initialize({ startOnLoad: false, theme: "${theme}" });
mermaid.run();
`.trim();
}
