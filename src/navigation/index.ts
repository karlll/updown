/**
 * Generates the client-side JavaScript for keyboard navigation
 * between slides. Returns the raw script body (no <script> tags).
 */
export function generateNavigationScript(): string {
  return `
document.addEventListener("DOMContentLoaded", function() {
  var slides = document.querySelectorAll(".slide");
  if (slides.length === 0) return;

  var currentIndex = 0;

  for (var i = 1; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  document.addEventListener("keydown", function(e) {
    if (e.key === "ArrowRight" && currentIndex < slides.length - 1) {
      slides[currentIndex].style.display = "none";
      currentIndex++;
      slides[currentIndex].style.display = "";
    } else if (e.key === "ArrowLeft" && currentIndex > 0) {
      slides[currentIndex].style.display = "none";
      currentIndex--;
      slides[currentIndex].style.display = "";
    }
  });
});
`.trim();
}
