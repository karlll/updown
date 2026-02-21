# Themes and Styles

updown separates visual appearance into two independent concepts:

- **Theme** — color palette (backgrounds, text colors, accents, code highlighting)
- **Style** — typography and layout (fonts, sizes, spacing, border radius)

Any theme works with any style. Both are selected via front matter:

```markdown
---
theme: catppuccin-mocha
style: modern
---
```

---

## Built-in Themes

The `theme` front matter key selects the color scheme. Available themes:

| Theme | Description |
|---|---|
| `light` | Light background, dark text (default) |
| `dark` | Dark background, light text |
| `catppuccin-latte` | Catppuccin pastel light |
| `catppuccin-frappe` | Catppuccin mid-tone dark |
| `catppuccin-macchiato` | Catppuccin deeper dark |
| `catppuccin-mocha` | Catppuccin darkest |
| `monokai-dark` | Classic Monokai dark |
| `monokai-light` | Monokai-inspired light |
| `gruvbox-dark` | Gruvbox retro dark |
| `gruvbox-light` | Gruvbox retro light |
| `nord-dark` | Nord arctic dark |
| `nord-light` | Nord arctic light |
| `solarized-dark` | Solarized dark |
| `solarized-light` | Solarized light |

Several themes are inspired by well-known color schemes: [Solarized](https://ethanschoonover.com/solarized/) by Ethan Schoonover, [Monokai](https://monokai.pro/) by Wimer Hazenberg, [Gruvbox](https://github.com/morhetz/gruvbox) by Pavel Pertsev, [Nord](https://www.nordtheme.com/) by Sven Greb, and [Catppuccin](https://github.com/catppuccin/catppuccin) by Pocco81.

Each theme applies matching colors to both the slide layout and syntax-highlighted code blocks. If the `theme` key is omitted or unrecognized, `light` is used.

---

## Built-in Styles

The `style` front matter key controls non-color visual aspects — typography, spacing, heading decoration, and border treatments.

| Style | Description |
|---|---|
| `default` | System sans-serif font, standard spacing (used when `style` is omitted) |
| `modern` | Inter/Helvetica, larger headings, uppercase h1, more whitespace, rounded corners |
| `classic` | Georgia serif font, traditional typography, tighter heading margins |
| `smooth` | Cyberminimalist — slab serif headings, grotesque body, geometric edges, generous whitespace |
| `terminal` | Monospace everything, compact density, sharp edges, uppercase headings — TUI/UNIX feel |

### CSS properties controlled by style

Styles set CSS custom properties that the base stylesheet references:

| Property | What it controls |
|---|---|
| `--font-family` | Body text font |
| `--font-family-heading` | Heading font |
| `--font-family-code` | Code block font |
| `--font-size-base` | Base font size |
| `--line-height` | Body line height |
| `--h1-size` .. `--h4-size` | Heading sizes (em-based, scale with auto-fit) |
| `--h1-size-fixed`, `--h2-size-fixed` | Fixed heading sizes (rem-based, immune to auto-scaling) |
| `--heading-weight` | Heading font weight |
| `--heading-transform` | Heading text transform (e.g. `uppercase`) |
| `--heading-letter-spacing` | Heading letter spacing |
| `--slide-padding` | Slide padding |
| `--block-margin` | Margin below paragraphs, lists, code blocks |
| `--border-radius` | Border radius for code blocks and images |
| `--border-radius-inline` | Border radius for inline code |

### External CSS file

Instead of a built-in name, `style` can reference a CSS file relative to the markdown file:

```markdown
---
style: ./my-style.css
---
```

The external CSS is appended after the base stylesheet. It can override any CSS custom property or add new rules:

```css
:root {
  --font-family: "Fira Sans", sans-serif;
  --slide-padding: 3rem 4rem;
}

.slide { background-image: url("pattern.svg"); }
```

If the file is not found, a warning is logged and the default style is used.

---

## External Themes

For custom branding (corporate themes with custom typefaces, logos, and colors), you can create theme directories that are loaded alongside the built-in themes.

### Directory structure

```
my-theme/
  theme.json           # Required — colors, Shiki theme, Mermaid theme
  style.json           # Optional — typography and layout
  extra.css            # Optional — @font-face, effects, backgrounds
  assets/              # Optional — fonts, images, logos
    MyFont.woff2
    logo.svg
```

### theme.json

Defines the color palette and code highlighting theme:

```json
{
  "shikiTheme": "github-dark",
  "mermaidTheme": "dark",
  "variables": {
    "--bg": "#1a1a2e",
    "--fg": "#e0e0e8",
    "--h1-color": "#e0e0e8",
    "--h2-color": "#7aa2f7",
    "--h3-color": "#9898b0",
    "--accent": "#7aa2f7",
    "--link": "#7aa2f7",
    "--link-hover": "#a5c0ff",
    "--strong": "#e8e8f0",
    "--em": "#9898b0",
    "--list-marker": "#7aa2f7",
    "--code-bg": "#24243e",
    "--code-fg": "#c0caf5",
    "--code-border": "#3b3b5c",
    "--fence-bg": "#24243e",
    "--fence-fg": "#c0caf5",
    "--blockquote-border": "#7aa2f7",
    "--blockquote-fg": "#9898b0",
    "--table-border": "#3b3b5c",
    "--table-header-bg": "#24243e",
    "--hr-color": "#3b3b5c",
    "--excalidraw-filter": "invert(1) hue-rotate(180deg)"
  }
}
```

`shikiTheme` must be a [Shiki built-in theme](https://shiki.style/themes) name. `mermaidTheme` is either `"default"` (light) or `"dark"`.

### style.json

Optional. Defines typography, spacing, and layout. Same properties as the [built-in styles](#css-properties-controlled-by-style):

```json
{
  "variables": {
    "--font-family": "\"My Custom Font\", sans-serif",
    "--font-size-base": "1.4rem",
    "--slide-padding": "4rem 6rem"
  }
}
```

If omitted, the `default` style is used (or whichever style is set in front matter).

### extra.css

Optional. Raw CSS appended after the base stylesheet. Use this for `@font-face` declarations, glow effects, background images, logo watermarks, etc. Reference assets using `/themes/{name}/assets/...`:

```css
@font-face {
  font-family: "My Custom Font";
  src: url(/themes/my-theme/assets/MyFont.woff2) format("woff2");
}
```

### Discovery

External themes are discovered in two ways:

1. **Auto-discovery**: Place a `themes/` directory next to your markdown file. Each subdirectory with a `theme.json` becomes a selectable theme.

2. **CLI flag**: Use `--theme <path>` to load a theme from anywhere on disk:

```bash
bun src/index.ts --theme /path/to/my-theme slides.md
```

Multiple `--theme` flags can be provided. CLI themes are loaded alongside auto-discovered themes.

### Usage in front matter

Once loaded, external themes are selected exactly like built-in themes — by directory name:

```markdown
---
theme: my-theme
style: my-theme
---
```

The `theme` key selects the color palette (from `theme.json`). The `style` key selects the typography (from `style.json`). If the external theme includes a `style.json`, it is registered under the same name as the theme. You can mix external themes with built-in styles and vice versa.

---

## Theme Variants

A single theme directory can define multiple color variants (typically light and dark) that share fonts, styles, and assets. Use the `variants` key in `theme.json` instead of top-level `shikiTheme`/`mermaidTheme`/`variables`:

```json
{
  "variants": {
    "dark": {
      "shikiTheme": "github-dark",
      "mermaidTheme": "dark",
      "variables": { "--bg": "#1a1a1a", "--fg": "#f0f0f0", "..." : "..." }
    },
    "light": {
      "shikiTheme": "github-light",
      "mermaidTheme": "default",
      "variables": { "--bg": "#ffffff", "--fg": "#000000", "..." : "..." }
    }
  }
}
```

This registers two themes named `{directory}-{variant}` (e.g., `my-brand-dark` and `my-brand-light`). All variants share the parent directory's `style.json`, `extra.css`, and `assets/`.

```markdown
---
theme: my-brand-dark
style: my-brand-dark
---
```

### Variant-specific overrides

Optionally, a variant can have its own subdirectory for overrides:

```
my-brand/
  theme.json       # variants defined here
  style.json       # shared style
  extra.css        # shared CSS (@font-face, etc.)
  assets/          # shared assets
  dark/
    extra.css      # optional — appended after parent's extra.css
    style.json     # optional — overrides parent style for this variant
```

If a variant subdirectory contains `extra.css`, it is appended after the parent's `extra.css`. If it contains `style.json`, it replaces the parent's style for that variant.

### Example: corporate brand theme

```
acme-corp/
  theme.json              # light + dark variants
  style.json              # shared typography (corporate typeface)
  extra.css               # @font-face declarations
  assets/
    fonts/
      AcmeSans.woff2
      AcmeSans-Bold.woff2
    logo.svg
```

Both `acme-corp-light` and `acme-corp-dark` use the same fonts, style, and logo — only colors differ.
