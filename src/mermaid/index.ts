/**
 * Generates the client-side inline script that initializes MermaidJS.
 * The mermaid library itself is served as a static asset at /assets/mermaid.min.js.
 * Returns raw script body (no <script> tags).
 */
export function generateMermaidScript(theme: "default" | "dark"): string {
  return `
mermaid.initialize({ startOnLoad: false, theme: "${theme}" });
var afterMermaidRender = function() {
  document.querySelectorAll('.mermaid svg').forEach(function(svg) {
    var mw = parseFloat(svg.style.maxWidth);
    if (!isNaN(mw) && svg.getAttribute('width') === '100%') {
      svg.setAttribute('width', mw + 'px');
    }
    svg.classList.add('svg-nav-enabled');
  });
  if (window.svgNavInit) window.svgNavInit();
};
mermaid.run().then(afterMermaidRender).catch(afterMermaidRender);
`.trim();
}
