# Brutalism Theme

A raw, unpolished external theme inspired by brutalist web design. Available in light and dark variants.

## Variants

| Theme name | Description |
|---|---|
| `brutalism-light` | White smoke background, black text, concrete grays |
| `brutalism-dark` | Near-black background, light text, heavy borders |

Both variants use Bright Red (#ff3d00) as the accent color and Steel Blue (#4682b4 / #0d47a1) for links.

## Fonts

- **Headings**: [Quantico](https://fonts.google.com/specimen/Quantico) — a sans-serif with a technical, squared feel
- **Body**: [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk) — a clean grotesque sans-serif

## Usage

```
bun src/index.ts --theme themes/brutalism themes/brutalism/demo.md
```

Or from a markdown file in a directory with a `themes/` folder containing this theme:

```markdown
---
theme: brutalism-light
style: brutalism-light
---
```

```markdown
---
theme: brutalism-dark
style: brutalism-dark
---
```

## Style characteristics

- Extra-large headlines (3.5em h1) with bottom borders
- No border radius anywhere — sharp 90-degree corners
- Thick borders on code blocks (3px), tables (2px), blockquotes (6px)
- Heavy underlines on links (3px, 5px on hover)
- No shadows, no gradients, no rounded corners
- Uppercase headings with no letter spacing
- Visible structural borders between slides and columns
- Images framed with hard borders

## Attributions

- **Quantico** by [Cadson Demak](https://cadsondemak.com/), licensed under the [SIL Open Font License 1.1](https://openfontlicense.org/)
- **Hanken Grotesk** by [Hanken Design Co.](https://hanken.co/), licensed under the [SIL Open Font License 1.1](https://openfontlicense.org/)
