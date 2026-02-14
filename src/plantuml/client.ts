/**
 * Generates the client-side inline script that renders PlantUML diagrams.
 * Finds all <pre class="plantuml"> elements, POSTs their source to
 * /plantuml/render, and replaces the parent with the returned SVG.
 * Returns raw script body (no <script> tags).
 */
export function generatePlantUMLScript(): string {
  return `
(function() {
  var els = document.querySelectorAll("pre.plantuml");
  if (!els.length) return;
  var promises = Array.from(els).map(function(el) {
    var source = el.textContent || "";
    return fetch("/plantuml/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: source, options: ["-tsvg"] })
    })
    .then(function(res) {
      if (!res.ok) throw new Error("PlantUML render failed: " + res.status);
      return res.text();
    })
    .then(function(svg) {
      var container = el.closest(".fence-plantuml");
      if (container) {
        container.innerHTML = svg;
      } else {
        el.outerHTML = svg;
      }
    })
    .catch(function(err) {
      el.textContent = "PlantUML error: " + err.message;
      el.style.color = "red";
    });
  });
  Promise.all(promises);
})();
`.trim();
}
