"use strict";
const ENABLE_CLASS = "svg-nav-enabled";
const ZOOM_FACTOR = 1.15;
const ICON_RESET = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="1"/><path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0"/></svg>`;

class SvgNavigator {
  constructor(svg) {
    this.dragging = false;
    this.dragStart = null;
    this.svg = svg;
    this.initialViewBox = this.readViewBox();
    this.viewBox = { ...this.initialViewBox };
    this.host = document.createElement("div");
    this.host.className = "svg-nav-host";
    svg.parentElement?.insertBefore(this.host, svg);
    this.host.appendChild(svg);
    this.host.appendChild(this.createOverlay());
    this.attachEvents();
    this.applyViewBox();
  }

  readViewBox() {
    const raw = this.svg.getAttribute("viewBox");
    if (raw) {
      const [x, y, width, height] = raw.trim().split(/\s+/).map(Number);
      if ([x, y, width, height].every(Number.isFinite) && width > 0 && height > 0) {
        return { x, y, width, height };
      }
    }
    const widthAttr = Number(this.svg.getAttribute("width"));
    const heightAttr = Number(this.svg.getAttribute("height"));
    const width = Number.isFinite(widthAttr) && widthAttr > 0 ? widthAttr : this.svg.clientWidth || 100;
    const height = Number.isFinite(heightAttr) && heightAttr > 0 ? heightAttr : this.svg.clientHeight || 100;
    return { x: 0, y: 0, width, height };
  }

  createOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "svg-nav-overlay";
    const controls = document.createElement("div");
    controls.className = "svg-nav-controls";
    controls.append(this.iconButton(ICON_RESET, "Reset view", () => this.reset()));
    overlay.append(controls);
    return overlay;
  }

  iconButton(svgHtml, title, onClick) {
    const btn = document.createElement("button");
    btn.className = "svg-nav-btn";
    btn.type = "button";
    btn.title = title;
    btn.innerHTML = svgHtml;
    btn.addEventListener("pointerdown", (event) => event.stopPropagation());
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      onClick();
    });
    return btn;
  }

  attachEvents() {
    this.host.addEventListener("mouseenter", () => {
      SvgNavigator.active = this;
      this.host.classList.add("svg-nav-hover");
      this.updateCursor();
    });
    this.host.addEventListener("mouseleave", () => {
      if (SvgNavigator.active === this) SvgNavigator.active = null;
      this.host.classList.remove("svg-nav-hover");
      this.dragging = false;
      this.dragStart = null;
      this.updateCursor();
    });
    this.host.addEventListener("wheel", (event) => {
      event.preventDefault();
      const rect = this.svg.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const factor = event.deltaY < 0 ? 1 / ZOOM_FACTOR : ZOOM_FACTOR;
      this.zoomAtPoint(px, py, factor);
    }, { passive: false });
    this.host.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      this.dragging = true;
      this.dragStart = { x: event.clientX, y: event.clientY, viewBox: { ...this.viewBox } };
      this.host.setPointerCapture(event.pointerId);
      this.updateCursor();
    });
    this.host.addEventListener("pointermove", (event) => {
      if (!this.dragging || !this.dragStart) return;
      const rect = this.svg.getBoundingClientRect();
      const dxRatio = (event.clientX - this.dragStart.x) / rect.width;
      const dyRatio = (event.clientY - this.dragStart.y) / rect.height;
      this.viewBox.x = this.dragStart.viewBox.x - dxRatio * this.dragStart.viewBox.width;
      this.viewBox.y = this.dragStart.viewBox.y - dyRatio * this.dragStart.viewBox.height;
      this.applyViewBox();
    });
    this.host.addEventListener("pointerup", (event) => {
      if (this.dragging) this.host.releasePointerCapture(event.pointerId);
      this.dragging = false;
      this.dragStart = null;
      this.updateCursor();
    });
    this.host.addEventListener("pointercancel", () => {
      this.dragging = false;
      this.dragStart = null;
      this.updateCursor();
    });
  }

  zoomAtPoint(px, py, factor) {
    const nextWidth = this.viewBox.width * factor;
    const nextHeight = this.viewBox.height * factor;
    const anchorX = this.viewBox.x + this.viewBox.width * px;
    const anchorY = this.viewBox.y + this.viewBox.height * py;
    this.viewBox.x = anchorX - nextWidth * px;
    this.viewBox.y = anchorY - nextHeight * py;
    this.viewBox.width = nextWidth;
    this.viewBox.height = nextHeight;
    this.applyViewBox();
  }

  reset() {
    this.viewBox = { ...this.initialViewBox };
    this.applyViewBox();
  }

  applyViewBox() {
    const { x, y, width, height } = this.viewBox;
    this.svg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);
  }

  updateCursor() {
    this.host.classList.toggle("svg-nav-grab-ready", !this.dragging && SvgNavigator.active === this);
    this.host.classList.toggle("svg-nav-dragging", this.dragging);
  }
}

SvgNavigator.active = null;

const navigators = Array.from(document.querySelectorAll(`svg.${ENABLE_CLASS}`)).map((svg) => new SvgNavigator(svg));

window.svgNavInit = function () {
  const newSvgs = Array.from(document.querySelectorAll(`svg.${ENABLE_CLASS}`))
    .filter((svg) => !navigators.some((n) => n.svg === svg));
  newSvgs.forEach((svg) => {
    try {
      navigators.push(new SvgNavigator(svg));
    } catch (e) {
      // ignore initialization errors for individual SVGs
    }
  });
};
