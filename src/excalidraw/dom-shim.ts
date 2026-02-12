import { Window } from "happy-dom";

const window = new Window();

const globals: Record<string, unknown> = {
  window,
  document: window.document,
  navigator: window.navigator,
  HTMLElement: window.HTMLElement,
  SVGSVGElement: window.SVGSVGElement,
  SVGElement: window.SVGElement,
  Element: window.Element,
  Node: window.Node,
  DOMParser: window.DOMParser,
  XMLSerializer: window.XMLSerializer,
  URL: window.URL,
  Image: window.Image,
  getComputedStyle: window.getComputedStyle.bind(window),
  devicePixelRatio: 1,
  requestAnimationFrame: (cb: () => void) => setTimeout(cb, 0),
  cancelAnimationFrame: clearTimeout,
  matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
  fetch: globalThis.fetch,
};

class FontFaceShim {
  family: string;
  source: string;
  loaded: Promise<FontFaceShim>;
  status = "loaded";
  style: string;
  weight: string;
  display: string;
  unicodeRange: string;

  constructor(family: string, source: string, descriptors?: Record<string, string>) {
    this.family = family;
    this.source = source;
    this.style = descriptors?.style ?? "normal";
    this.weight = descriptors?.weight ?? "400";
    this.display = descriptors?.display ?? "swap";
    this.unicodeRange = descriptors?.unicodeRange ?? "U+0-10FFFF";
    this.loaded = Promise.resolve(this);
  }

  load() {
    return this.loaded;
  }
}

globals.FontFace = FontFaceShim;

// Minimal FontFaceSet shim for document.fonts
const fontFaceSet = new Set<FontFaceShim>();
const fontsShim = {
  has: (f: FontFaceShim) => fontFaceSet.has(f),
  add: (f: FontFaceShim) => { fontFaceSet.add(f); return fontsShim; },
  delete: (f: FontFaceShim) => fontFaceSet.delete(f),
  check: () => true,
  load: async () => [],
  forEach: fontFaceSet.forEach.bind(fontFaceSet),
  [Symbol.iterator]: fontFaceSet[Symbol.iterator].bind(fontFaceSet),
};
Object.defineProperty(window.document, "fonts", { value: fontsShim, configurable: true });

for (const [key, value] of Object.entries(globals)) {
  if (!(key in globalThis)) {
    (globalThis as Record<string, unknown>)[key] = value;
  }
}
