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
  var MIN_FONT_PX = 10;
  var PRECISION_PX = 0.5;

  function fitSlide(slide) {
    slide.style.fontSize = "";
    if (slide.scrollHeight <= window.innerHeight) return;

    var defaultSize = parseFloat(getComputedStyle(slide).fontSize);
    var lo = MIN_FONT_PX;
    var hi = defaultSize;

    while (hi - lo > PRECISION_PX) {
      var mid = (lo + hi) / 2;
      slide.style.fontSize = mid + "px";
      if (slide.scrollHeight > window.innerHeight) {
        hi = mid;
      } else {
        lo = mid;
      }
    }
    slide.style.fontSize = lo + "px";
  }

  for (var i = 1; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  fitSlide(slides[0]);

  window.fitCurrentSlide = function() {
    fitSlide(slides[currentIndex]);
  };

  document.addEventListener("keydown", function(e) {
    if (e.key === "ArrowRight" && currentIndex < slides.length - 1) {
      slides[currentIndex].style.display = "none";
      currentIndex++;
      slides[currentIndex].style.display = "";
      fitSlide(slides[currentIndex]);
    } else if (e.key === "ArrowLeft" && currentIndex > 0) {
      slides[currentIndex].style.display = "none";
      currentIndex--;
      slides[currentIndex].style.display = "";
      fitSlide(slides[currentIndex]);
    } else if (e.key === "f") {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  });

  var resizeTimer;
  window.addEventListener("resize", function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      fitSlide(slides[currentIndex]);
    }, 100);
  });
});
`.trim();
}
